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
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/banks', bankRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'GoAgri Digital Financing API' });
});

app.listen(PORT, () => {
  console.log(`🚀 GoAgri API Server running on port ${PORT}`);
});
