const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

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
});

module.exports = app;