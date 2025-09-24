const { Client } = require('pg');

class DatabaseStorage {
  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.connected = false;
  }

  async connect() {
    if (!this.connected) {
      await this.client.connect();
      this.connected = true;
      console.log('Connected to PostgreSQL database');
      
      // Initialize tables
      await this.initializeTables();
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
    const { email, role, ip } = userData;
    const query = `
      INSERT INTO users (id, email, role, ip_address)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [userId, email, role, ip];
    const result = await this.client.query(query, values);
    return result.rows[0];
  }

  async getUserByEmail(email) {
    const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
    const result = await this.client.query(query, [email]);
    return result.rows[0];
  }

  async getUserById(userId) {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.client.query(query, [userId]);
    return result.rows[0];
  }

  async createSurvey(surveyData) {
    const { userId, selectedFeatures, notes, betaOptIn, ip } = surveyData;
    const query = `
      INSERT INTO surveys (user_id, selected_features, notes, beta_opt_in, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [userId, selectedFeatures, notes, betaOptIn, ip];
    const result = await this.client.query(query, values);
    return result.rows[0];
  }

  async getAllUsers() {
    const query = `
      SELECT id, email, role, created_at, ip_address
      FROM users 
      ORDER BY created_at DESC;
    `;
    const result = await this.client.query(query);
    return result.rows;
  }

  async getAllSurveys() {
    const query = `
      SELECT s.*, u.email 
      FROM surveys s 
      JOIN users u ON s.user_id = u.id 
      ORDER BY s.submitted_at DESC;
    `;
    const result = await this.client.query(query);
    return result.rows;
  }

  async getUserStats() {
    const queries = [
      'SELECT COUNT(*) as total_users FROM users',
      'SELECT COUNT(*) as total_surveys FROM surveys',
      'SELECT COUNT(*) as beta_signups FROM surveys WHERE beta_opt_in = true',
      `SELECT COUNT(*) as recent_signups FROM users 
       WHERE created_at > NOW() - INTERVAL '7 days'`
    ];

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

  async close() {
    if (this.connected) {
      await this.client.end();
      this.connected = false;
    }
  }
}

module.exports = DatabaseStorage;