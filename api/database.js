const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');

class DatabaseStorage {
  constructor() {
    this.client = null;
    this.connected = false;
    this.connectionRetries = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000; // 1 second
  }

  createClient() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Add error handlers
    this.client.on('error', (err) => {
      console.error('Database connection error:', err);
      this.connected = false;
      this.scheduleReconnect();
    });

    this.client.on('end', () => {
      console.log('Database connection ended');
      this.connected = false;
    });
  }

  async connect() {
    if (!this.connected) {
      try {
        if (!this.client) {
          this.createClient();
        }
        
        await this.client.connect();
        this.connected = true;
        this.connectionRetries = 0;
        console.log('Connected to PostgreSQL database');
        
        // Initialize tables
        await this.initializeTables();
      } catch (error) {
        console.error('Failed to connect to database:', error);
        this.connected = false;
        this.scheduleReconnect();
        throw error;
      }
    }
  }

  scheduleReconnect() {
    if (this.connectionRetries >= this.maxRetries) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.connectionRetries++;
    const delay = this.retryDelay * this.connectionRetries;
    
    console.log(`Scheduling database reconnection attempt ${this.connectionRetries} in ${delay}ms`);
    
    setTimeout(async () => {
      try {
        console.log(`Attempting to reconnect to database (attempt ${this.connectionRetries})`);
        this.client = null; // Force new client creation
        await this.connect();
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
      }
    }, delay);
  }

  async ensureConnection() {
    if (!this.connected) {
      console.log('Database not connected, attempting to reconnect...');
      await this.connect();
    }
  }

  async initializeTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW(),
        ip_address INET
      );
    `;

    const createSurveySubmissionsTable = `
      CREATE TABLE IF NOT EXISTS survey_submissions (
        id UUID PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        notes TEXT,
        beta_opt_in BOOLEAN DEFAULT false,
        submitted_at TIMESTAMP DEFAULT NOW(),
        ip_address INET
      );
    `;

    const createSurveyResponsesTable = `
      CREATE TABLE IF NOT EXISTS survey_responses (
        id BIGSERIAL PRIMARY KEY,
        submission_id UUID REFERENCES survey_submissions(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        feature_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE (submission_id, feature_key),
        UNIQUE (user_id, feature_key)
      );
    `;

    const createAnalyticsTable = `
      CREATE TABLE IF NOT EXISTS analytics (
        id SERIAL PRIMARY KEY,
        event_name VARCHAR(100) NOT NULL,
        payload JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        ip_address INET
      );
    `;

    await this.client.query(createUsersTable);
    await this.client.query(createSurveySubmissionsTable);
    await this.client.query(createSurveyResponsesTable);
    await this.client.query(createAnalyticsTable);
    
    console.log('Database tables initialized');
  }

  async createUser(userId, userData) {
    await this.ensureConnection();
    const { email, role, ip } = userData;
    const query = `
      INSERT INTO users (id, email, role, ip_address)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [userId, email, role, ip];
    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating user:', error);
      // Try to reconnect and retry once
      if (!this.connected) {
        await this.connect();
        const result = await this.client.query(query, values);
        return result.rows[0];
      }
      throw error;
    }
  }

  async getUserByEmail(email) {
    await this.ensureConnection();
    const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
    try {
      const result = await this.client.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by email:', error);
      if (!this.connected) {
        await this.connect();
        const result = await this.client.query(query, [email]);
        return result.rows[0];
      }
      throw error;
    }
  }

  async getUserById(userId) {
    await this.ensureConnection();
    const query = 'SELECT * FROM users WHERE id = $1';
    try {
      const result = await this.client.query(query, [userId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      if (!this.connected) {
        await this.connect();
        const result = await this.client.query(query, [userId]);
        return result.rows[0];
      }
      throw error;
    }
  }

  async createSurvey(surveyData) {
    await this.ensureConnection();
    const {
      userId,
      selectedFeatures = [],
      notes,
      betaOptIn = false,
      ip
    } = surveyData;

    const submissionId = uuidv4();

    try {
      await this.client.query('BEGIN');

      // Remove prior submissions/responses for this user to keep data authoritative
      await this.client.query('DELETE FROM survey_responses WHERE user_id = $1', [userId]);
      await this.client.query('DELETE FROM survey_submissions WHERE user_id = $1', [userId]);

      const submissionResult = await this.client.query(
        `
          INSERT INTO survey_submissions (id, user_id, notes, beta_opt_in, ip_address)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;
        `,
        [submissionId, userId, notes || null, betaOptIn, ip]
      );

      for (const featureKey of selectedFeatures) {
        await this.client.query(
          `
            INSERT INTO survey_responses (submission_id, user_id, feature_key)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, feature_key) DO NOTHING;
          `,
          [submissionId, userId, featureKey]
        );
      }

      await this.client.query('COMMIT');

      return {
        ...submissionResult.rows[0],
        selected_features: selectedFeatures
      };
    } catch (error) {
      try {
        await this.client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Failed to rollback survey transaction:', rollbackError);
      }

      console.error('Error creating survey:', error);

      if (!this.connected) {
        await this.connect();
        return this.createSurvey(surveyData);
      }

      throw error;
    }
  }

  async getAllUsers() {
    await this.ensureConnection();
    const query = `
      SELECT id, email, role, created_at, ip_address
      FROM users 
      ORDER BY created_at DESC;
    `;
    try {
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all users:', error);
      if (!this.connected) {
        await this.connect();
        const result = await this.client.query(query);
        return result.rows;
      }
      throw error;
    }
  }

  async getAllSurveys() {
    await this.ensureConnection();
    const query = `
      SELECT
        ss.id AS submission_id,
        ss.user_id,
        ss.notes,
        ss.beta_opt_in,
        ss.submitted_at,
        ss.ip_address,
        u.email,
        u.role,
        COALESCE(array_agg(sr.feature_key ORDER BY sr.feature_key) FILTER (WHERE sr.feature_key IS NOT NULL), ARRAY[]::TEXT[]) AS selected_features
      FROM survey_submissions ss
      JOIN users u ON ss.user_id = u.id
      LEFT JOIN survey_responses sr ON sr.submission_id = ss.id
      GROUP BY ss.id, ss.user_id, ss.notes, ss.beta_opt_in, ss.submitted_at, ss.ip_address, u.email, u.role
      ORDER BY ss.submitted_at DESC;
    `;
    try {
      const result = await this.client.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error getting all surveys:', error);
      if (!this.connected) {
        await this.connect();
        const result = await this.client.query(query);
        return result.rows;
      }
      throw error;
    }
  }

  async getUserStats() {
    await this.ensureConnection();
    const queries = [
      'SELECT COUNT(*) as total_users FROM users',
      'SELECT COUNT(*) as total_surveys FROM survey_submissions',
      'SELECT COUNT(*) as beta_signups FROM survey_submissions WHERE beta_opt_in = true',
      `SELECT COUNT(*) as recent_signups FROM users 
       WHERE created_at > NOW() - INTERVAL '7 days'`
    ];

    try {
      const results = await Promise.all(
        queries.map(query => this.client.query(query))
      );

      return {
        totalUsers: parseInt(results[0].rows[0].total_users),
        totalSurveys: parseInt(results[1].rows[0].total_surveys),
        betaSignups: parseInt(results[2].rows[0].beta_signups),
        recentSignups: parseInt(results[3].rows[0].recent_signups)
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      if (!this.connected) {
        await this.connect();
        const results = await Promise.all(
          queries.map(query => this.client.query(query))
        );
        return {
          totalUsers: parseInt(results[0].rows[0].total_users),
          totalSurveys: parseInt(results[1].rows[0].total_surveys),
          betaSignups: parseInt(results[2].rows[0].beta_signups),
          recentSignups: parseInt(results[3].rows[0].recent_signups)
        };
      }
      throw error;
    }
  }

  async close() {
    if (this.client && this.connected) {
      try {
        await this.client.end();
        this.connected = false;
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
    }
  }
}

module.exports = DatabaseStorage;
