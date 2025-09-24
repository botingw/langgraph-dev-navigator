const { Client } = require('pg');

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

    const createSurveysTable = `
      CREATE TABLE IF NOT EXISTS surveys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        selected_features TEXT[],
        notes TEXT,
        beta_opt_in BOOLEAN DEFAULT false,
        submitted_at TIMESTAMP DEFAULT NOW(),
        ip_address INET
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
    await this.client.query(createSurveysTable);
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
    const { userId, selectedFeatures, notes, betaOptIn, ip } = surveyData;
    const query = `
      INSERT INTO surveys (user_id, selected_features, notes, beta_opt_in, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [userId, selectedFeatures, notes, betaOptIn, ip];
    try {
      const result = await this.client.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating survey:', error);
      if (!this.connected) {
        await this.connect();
        const result = await this.client.query(query, values);
        return result.rows[0];
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
      SELECT s.*, u.email 
      FROM surveys s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.submitted_at DESC;
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
      'SELECT COUNT(*) as total_surveys FROM surveys',
      'SELECT COUNT(*) as beta_signups FROM surveys WHERE beta_opt_in = true',
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