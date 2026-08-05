const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const farmerRoutes = require('./routes/farmers');
const applicationRoutes = require('./routes/applications');
const ruleRoutes = require('./routes/rules');
const rateRoutes = require('./routes/rates');
const bankRoutes = require('./routes/banks');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/banks', bankRoutes);

const path = require('path');

// Serve React Web Admin Frontend Static Assets
const clientDistPath = path.join(__dirname, '../../client-web/dist');
const rootPublicPath = path.join(__dirname, '../../');

app.use(express.static(clientDistPath));
app.use(express.static(rootPublicPath));

// Catch-all route to serve index.html for Single Page Application (SPA) routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.sendFile(path.join(rootPublicPath, 'index.html'));
    }
  });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 GoAgri API Server running on port ${PORT}`);
  });
}

module.exports = app;
