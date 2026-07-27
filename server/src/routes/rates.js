const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rates] = await pool.query('SELECT * FROM rate_table ORDER BY crop_name ASC');
    res.json({ success: true, rates });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load crop rate table.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { yield_per_acre_maunds, market_rate_pkr, updated_by = 4 } = req.body;
    await pool.query(
      'UPDATE rate_table SET yield_per_acre_maunds = ?, market_rate_pkr = ?, updated_by = ? WHERE id = ?',
      [yield_per_acre_maunds, market_rate_pkr, updated_by, req.params.id]
    );
    res.json({ success: true, message: 'Crop rate table updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to update rate table.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { crop_name, yield_per_acre_maunds, market_rate_pkr, updated_by = 4 } = req.body;
    if (!crop_name || crop_name.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid crop name.' });
    }
    await pool.query(
      'INSERT INTO rate_table (crop_name, yield_per_acre_maunds, market_rate_pkr, updated_by) VALUES (?, ?, ?, ?)',
      [crop_name.trim(), yield_per_acre_maunds, market_rate_pkr, updated_by]
    );
    res.json({ success: true, message: 'New crop added to rate table.' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to add new crop to rate table.' });
  }
});

module.exports = router;
