const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('../Frontend'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server working!' });
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server: http://localhost:${PORT}`);
  console.log(`Network: http://10.13.123.140:${PORT}`);
});