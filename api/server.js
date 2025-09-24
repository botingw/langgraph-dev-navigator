const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const { Validator } = require('jsonschema');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const DatabaseStorage = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;
const validator = new Validator();

// Database storage
const db = new DatabaseStorage();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  // Only accept password from custom header to prevent logging
  const providedPassword = req.headers['x-admin-password'];
  
  if (!providedPassword) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }
  
  if (providedPassword !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }
  
  next();
};

// Serve static files from Replit frontend
app.use(express.static(path.join(__dirname, '../web/replit')));

// Request validation schemas
const joinWaitlistSchema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      format: 'email'
    },
    role: {
      type: 'string',
      maxLength: 100
    }
  },
  required: ['email'],
  additionalProperties: false
};

const submitSurveySchema = {
  type: 'object',
  properties: {
    userId: {
      type: 'string',
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    },
    selectedFeatures: {
      type: 'array',
      items: { type: 'string' },
      maxItems: 20
    },
    notes: {
      type: 'string',
      maxLength: 1000
    },
    betaOptIn: {
      type: 'boolean'
    }
  },
  required: ['userId'],
  additionalProperties: false
};

// Utility functions
function validateRequest(schema, data) {
  const result = validator.validate(data, schema);
  return {
    valid: result.errors.length === 0,
    errors: result.errors.map(e => e.stack)
  };
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Simple rate limiting with in-memory cache for performance
const rateLimitCache = new Map();

function rateLimitCheck(ip, action) {
  // Simple rate limiting - in production, use Redis
  const now = Date.now();
  const key = `${ip}-${action}`;
  const windowMs = 60000; // 1 minute
  const maxRequests = action === 'waitlist' ? 5 : 10;
  
  const requests = rateLimitCache.get(key) || [];
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimitCache.set(key, recentRequests);
  
  // Clean up old entries periodically
  if (Math.random() < 0.01) { // 1% chance on each call
    cleanupRateLimit();
  }
  
  return true;
}

function cleanupRateLimit() {
  const now = Date.now();
  const windowMs = 60000;
  
  for (const [key, requests] of rateLimitCache.entries()) {
    const recentRequests = requests.filter(time => now - time < windowMs);
    if (recentRequests.length === 0) {
      rateLimitCache.delete(key);
    } else {
      rateLimitCache.set(key, recentRequests);
    }
  }
}

// Error handling middleware
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Routes

// Health check
app.get('/api/health', asyncHandler(async (req, res) => {
  const stats = await db.getUserStats();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    users: stats.totalUsers,
    surveys: stats.totalSurveys
  });
}));

// Join waitlist endpoint
app.post('/api/join-waitlist', asyncHandler(async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Rate limiting
  if (!rateLimitCheck(clientIP, 'waitlist')) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: 'Please wait before trying again.' 
    });
  }

  // Validate request
  const validation = validateRequest(joinWaitlistSchema, req.body);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Invalid request', 
      details: validation.errors 
    });
  }

  const { email, role } = req.body;

  // Additional email validation
  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      error: 'Invalid email format' 
    });
  }

  // Check if user already exists
  const existingUser = await db.getUserByEmail(email);
  
  if (existingUser) {
    return res.status(200).json({
      message: 'Successfully joined the waitlist.',
      userId: existingUser.id,
      alreadyExists: true
    });
  }

  // Create new user
  const userId = uuidv4();
  const userData = {
    email: email.toLowerCase(),
    role: role || null,
    ip: clientIP
  };

  await db.createUser(userId, userData);

  console.log(`New waitlist signup: ${email} (${userId})`);

  res.status(201).json({
    message: 'Successfully joined the waitlist.',
    userId
  });
}));

// Verify user endpoint
app.head('/api/verify-user/:userId', asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    return res.status(400).json({ error: 'Invalid user ID format' });
  }

  // Check if user exists in waitlist
  const user = await db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found', 
      message: 'User not found in waitlist. Please join the waitlist first.' 
    });
  }

  res.status(200).end();
}));

// Submit survey endpoint
app.post('/api/submit-survey', asyncHandler(async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  // Rate limiting
  if (!rateLimitCheck(clientIP, 'survey')) {
    return res.status(429).json({ 
      error: 'Too many requests', 
      message: 'Please wait before trying again.' 
    });
  }

  // Validate request
  const validation = validateRequest(submitSurveySchema, req.body);
  if (!validation.valid) {
    return res.status(400).json({ 
      error: 'Invalid request', 
      details: validation.errors 
    });
  }

  const { userId, selectedFeatures = [], notes, betaOptIn = false } = req.body;

  // Check if user exists
  const user = await db.getUserById(userId);
  if (!user) {
    return res.status(404).json({ 
      error: 'User not found', 
      message: 'Invalid user ID. Please join the waitlist first.' 
    });
  }

  // Validate selectedFeatures
  const validFeatures = [
    'automated_debugging',
    'ai_test_generation',
    'managed_knowledge_server',
    'one_click_publishing',
    'observable_agents',
    'self_improving_agents',
    'architectural_guidance',
    'on_prem_deployment',
    'advanced_iam',
    'cicd_integration'
  ];

  const invalidFeatures = selectedFeatures.filter(f => !validFeatures.includes(f));
  if (invalidFeatures.length > 0) {
    return res.status(400).json({ 
      error: 'Invalid features', 
      invalidFeatures 
    });
  }

  // Store survey response
  const surveyData = {
    userId,
    selectedFeatures,
    notes: notes ? notes.trim() : null,
    betaOptIn,
    ip: clientIP
  };

  await db.createSurvey(surveyData);

  console.log(`Survey submitted by ${userId}: ${selectedFeatures.length} features, beta: ${betaOptIn}`);

  res.status(200).json({
    message: 'Survey preferences submitted successfully.'
  });
}));

// Analytics endpoint (optional)
app.post('/api/analytics', asyncHandler(async (req, res) => {
  const clientIP = req.ip || req.connection.remoteAddress;

  // Simple validation
  if (!req.body.name || typeof req.body.name !== 'string') {
    return res.status(400).json({ error: 'Invalid event' });
  }

  // Store analytics event
  const event = {
    name: req.body.name,
    payload: req.body.payload || {},
    timestamp: new Date().toISOString(),
    ip: clientIP,
    userAgent: req.get('User-Agent')
  };

  // Store analytics in database
  try {
    // Simple analytics storage - in a real app, you might use a separate analytics service
    await db.ensureConnection();
    const query = `
      INSERT INTO analytics (event_name, payload, ip_address)
      VALUES ($1, $2, $3)
    `;
    await db.client.query(query, [event.name, JSON.stringify(event.payload), clientIP]);
  } catch (error) {
    console.error('Analytics storage error:', error);
    // Don't fail the request if analytics fails
  }

  res.status(200).json({ status: 'ok' });
}));

// Admin endpoints for data access
app.get('/api/admin/stats', adminAuth, asyncHandler(async (req, res) => {
  const stats = await db.getUserStats();
  const users = await db.getAllUsers();
  const surveys = await db.getAllSurveys();

  // Calculate feature popularity
  const features = {};
  surveys.forEach(survey => {
    if (survey.selected_features) {
      survey.selected_features.forEach(feature => {
        features[feature] = (features[feature] || 0) + 1;
      });
    }
  });

  const response = {
    ...stats,
    recentSignupsCount: stats.recentSignups, // Send count for dashboard stat card
    recentSignups: users
      .slice(0, 10)
      .map(user => ({
        id: user.id,
        email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        role: user.role,
        createdAt: user.created_at
      })),
    featurePopularity: Object.entries(features)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
  };

  res.json(response);
}));

// Get all waitlist users
app.get('/api/admin/waitlist', adminAuth, asyncHandler(async (req, res) => {
  const users = await db.getAllUsers();
  res.json(users);
}));

// Get all survey responses  
app.get('/api/admin/surveys', adminAuth, asyncHandler(async (req, res) => {
  const surveys = await db.getAllSurveys();
  res.json(surveys);
}));

// Export data as CSV
app.get('/api/admin/export', adminAuth, asyncHandler(async (req, res) => {
  const users = await db.getAllUsers();
  const surveys = await db.getAllSurveys();
  
  // Create combined data for CSV
  const csvData = users.map(user => {
    const userSurvey = surveys.find(s => s.user_id === user.id);
    return {
      userId: user.id,
      email: user.email,
      role: user.role || 'Not specified',
      joinedAt: user.created_at,
      completedSurvey: userSurvey ? 'Yes' : 'No',
      selectedFeatures: userSurvey ? userSurvey.selected_features.join(', ') : '',
      betaOptIn: userSurvey ? (userSurvey.beta_opt_in ? 'Yes' : 'No') : '',
      notes: userSurvey ? userSurvey.notes || '' : '',
      surveySubmittedAt: userSurvey ? userSurvey.submitted_at : ''
    };
  });

  // Set CSV headers
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="waitlist-export.csv"');
  
  // Create CSV writer
  const csvWriter = createCsvWriter({
    path: '/tmp/temp-export.csv',
    header: [
      { id: 'userId', title: 'User ID' },
      { id: 'email', title: 'Email' },
      { id: 'role', title: 'Role' },
      { id: 'joinedAt', title: 'Joined At' },
      { id: 'completedSurvey', title: 'Completed Survey' },
      { id: 'selectedFeatures', title: 'Selected Features' },
      { id: 'betaOptIn', title: 'Beta Opt-in' },
      { id: 'notes', title: 'Notes' },
      { id: 'surveySubmittedAt', title: 'Survey Submitted At' }
    ]
  });

  await csvWriter.writeRecords(csvData);
  
  // Stream the CSV file
  const fs = require('fs');
  const csvContent = fs.readFileSync('/tmp/temp-export.csv');
  fs.unlinkSync('/tmp/temp-export.csv'); // Clean up temp file
  
  res.send(csvContent);
}));

// Serve frontend index.html for non-API routes (SPA fallback)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next(); // Let API routes handle themselves
  }
  
  // For non-API routes, check if file exists, otherwise serve index.html
  if (req.method === 'GET' && !req.path.includes('.')) {
    res.sendFile(path.join(__dirname, '../web/replit/index.html'));
  } else {
    next();
  }
});

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ 
      error: 'Invalid JSON', 
      message: 'Request body must be valid JSON' 
    });
  }

  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found', 
    message: `Route ${req.method} ${req.path} not found` 
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.close();
  process.exit(0);
});

// Initialize database and start server
async function startServer() {
  try {
    await db.connect();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Replit LangGraph Dev Navigator API server running on port ${PORT}`);
      console.log(`Frontend served from: ${path.join(__dirname, '../web/replit')}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;