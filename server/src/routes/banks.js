const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [banks] = await pool.query(`
      SELECT 
        b.*, 
        COUNT(a.id) as total_applications,
        SUM(CASE WHEN a.status = 'Submitted to Bank' THEN 1 ELSE 0 END) as submitted_applications
      FROM banks b
      LEFT JOIN financing_applications a ON b.id = a.bank_id
      GROUP BY b.id
    `);
    res.json({ success: true, banks });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load participating banks list.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, logo_initial, submission_mode, status } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid bank name.' });
    }
    await pool.query(
      'INSERT INTO banks (name, logo_initial, submission_mode, status) VALUES (?, ?, ?, ?)',
      [name.trim(), logo_initial || name.trim().charAt(0), submission_mode || 'manual_pdf', status || 'active']
    );
    res.json({ success: true, message: 'Bank configured successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to add participating bank.' });
  }
});

module.exports = router;
