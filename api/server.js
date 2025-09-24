const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');
const { Validator } = require('jsonschema');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const validator = new Validator();

// In-memory storage (in production, use PostgreSQL)
const storage = {
  users: new Map(),
  surveys: new Map(),
  analytics: []
};

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

function rateLimitCheck(ip, action) {
  // Simple rate limiting - in production, use Redis
  const now = Date.now();
  const key = `${ip}-${action}`;
  const windowMs = 60000; // 1 minute
  const maxRequests = action === 'waitlist' ? 5 : 10;
  
  if (!storage.rateLimits) storage.rateLimits = new Map();
  
  const requests = storage.rateLimits.get(key) || [];
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return false;
  }
  
  recentRequests.push(now);
  storage.rateLimits.set(key, recentRequests);
  return true;
}

// Error handling middleware
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    users: storage.users.size,
    surveys: storage.surveys.size
  });
});

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
  let existingUser = null;
  for (const [userId, userData] of storage.users.entries()) {
    if (userData.email.toLowerCase() === email.toLowerCase()) {
      existingUser = { userId, ...userData };
      break;
    }
  }

  if (existingUser) {
    return res.status(200).json({
      message: 'Successfully joined the waitlist.',
      userId: existingUser.userId,
      alreadyExists: true
    });
  }

  // Create new user
  const userId = uuidv4();
  const userData = {
    email: email.toLowerCase(),
    role: role || null,
    createdAt: new Date().toISOString(),
    ip: clientIP
  };

  storage.users.set(userId, userData);

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
  if (!storage.users.has(userId)) {
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
  if (!storage.users.has(userId)) {
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
    submittedAt: new Date().toISOString(),
    ip: clientIP
  };

  storage.surveys.set(userId, surveyData);

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

  storage.analytics.push(event);

  // Keep only last 1000 events to prevent memory bloat
  if (storage.analytics.length > 1000) {
    storage.analytics = storage.analytics.slice(-1000);
  }

  res.status(200).json({ status: 'ok' });
}));

// Admin endpoint to view data (basic auth in production)
app.get('/api/admin/stats', (req, res) => {
  const stats = {
    totalUsers: storage.users.size,
    totalSurveys: storage.surveys.size,
    totalAnalytics: storage.analytics.length,
    recentSignups: Array.from(storage.users.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(user => ({
        email: user.email.replace(/(.{2}).*(@.*)/, '$1***$2'),
        role: user.role,
        createdAt: user.createdAt
      })),
    featurePopularity: (() => {
      const features = {};
      for (const survey of storage.surveys.values()) {
        survey.selectedFeatures.forEach(feature => {
          features[feature] = (features[feature] || 0) + 1;
        });
      }
      return Object.entries(features)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    })()
  };

  res.json(stats);
});

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
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Replit LangGraph Dev Navigator API server running on port ${PORT}`);
  console.log(`Frontend served from: ${path.join(__dirname, '../web/replit')}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;