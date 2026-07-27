const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rules] = await pool.query('SELECT * FROM business_rules');
    res.json({ success: true, rules });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to load business rules.' });
  }
});

router.put('/:type', async (req, res) => {
  try {
    const ruleType = req.params.type;
    const { config_json, updated_by = 4 } = req.body;

    await pool.query(
      `INSERT INTO business_rules (rule_type, config_json, updated_by)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE config_json = VALUES(config_json), updated_by = VALUES(updated_by)`,
      [ruleType, JSON.stringify(config_json), updated_by]
    );

    res.json({ success: true, message: `Business rule '${ruleType}' updated successfully.` });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Unable to update business rules configuration.' });
  }
});

module.exports = router;
