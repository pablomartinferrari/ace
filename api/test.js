export default function handler(req, res) {
  // Set CORS headers to allow frontend to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    res.status(200).json({
      message: 'Hello from the API!',
      timestamp: new Date().toISOString(),
      success: true,
      data: {
        frontend: 'connected',
        backend: 'working'
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}