const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Import API handlers
const postsHandler = require('./posts/index').default;

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