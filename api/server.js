const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('ts-node/register');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Import API handlers
const postsHandler = require('./posts/index').default;
const loginHandler = require('./auth/login').default;
const registerHandler = require('./auth/register').default;
// Import users handler only if MONGODB_URI is available
let usersHandler;
try {
  if (process.env.MONGODB_URI) {
    usersHandler = require('./users/[userId]').default;
  }
} catch (error) {
  console.warn('Users handler not loaded - MONGODB_URI not configured');
}

// API routes
app.use('/api/posts', (req, res) => {
  // Convert Express req/res to Vercel format
  const vercelReq = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
  };

  const vercelRes = {
    status: (code) => ({
      json: (data) => res.status(code).json(data),
      end: () => res.status(code).end()
    }),
    setHeader: (name, value) => res.setHeader(name, value)
  };

  postsHandler(vercelReq, vercelRes);
});

app.use('/api/auth/login', (req, res) => {
  const vercelReq = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
  };

  const vercelRes = {
    status: (code) => ({
      json: (data) => res.status(code).json(data),
      end: () => res.status(code).end()
    }),
    setHeader: (name, value) => res.setHeader(name, value)
  };

  loginHandler(vercelReq, vercelRes);
});

app.use('/api/auth/register', (req, res) => {
  const vercelReq = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: req.query
  };

  const vercelRes = {
    status: (code) => ({
      json: (data) => res.status(code).json(data),
      end: () => res.status(code).end()
    }),
    setHeader: (name, value) => res.setHeader(name, value)
  };

  registerHandler(vercelReq, vercelRes);
});

app.use('/api/users/:userId', (req, res) => {
  if (!usersHandler) {
    return res.status(503).json({ error: 'Users API not available - database not configured' });
  }

  const vercelReq = {
    method: req.method,
    headers: req.headers,
    body: req.body,
    query: { ...req.query, userId: req.params.userId }
  };

  const vercelRes = {
    status: (code) => ({
      json: (data) => res.status(code).json(data),
      end: () => res.status(code).end()
    }),
    setHeader: (name, value) => res.setHeader(name, value)
  };

  usersHandler(vercelReq, vercelRes);
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Hello from the API!',
    timestamp: new Date().toISOString(),
    success: true,
    data: {
      frontend: 'connected',
      backend: 'working'
    }
  });
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = app;