const express = require('express');
const router = express.Router();
const pool = require('../config/db');

function isValidCNIC(cnic) {
  if (!cnic) return false;
  const clean = cnic.replace(/[^0-9]/g, '');
  return clean.length === 13;
}

function isValidPakMobile(mobile) {
  if (!mobile) return false;
  const clean = mobile.replace(/[^0-9]/g, '');
  return clean.length === 11 && clean.startsWith('03');
}

// List all farmers
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT f.*, u.full_name as registered_by_name 
      FROM farmers f 
      LEFT JOIN users u ON f.registered_by = u.id 
      ORDER BY f.id DESC
    `);
    res.json({ success: true, farmers: rows });
  } catch (error) {
    console.error('List farmers error:', error);
    res.status(500).json({ success: false, error: 'Unable to load farmer profiles right now. Please refresh.' });
  }
});

// Get farmer details by ID
router.get('/:id', async (req, res) => {
  try {
    const [farmers] = await pool.query('SELECT * FROM farmers WHERE id = ?', [req.params.id]);
    if (farmers.length === 0) return res.status(404).json({ success: false, error: 'Farmer profile could not be found.' });
    
    const [applications] = await pool.query('SELECT * FROM financing_applications WHERE farmer_id = ?', [req.params.id]);
    const [historical] = await pool.query('SELECT * FROM historical_yields WHERE farmer_id = ?', [req.params.id]);

    res.json({
      success: true,
      farmer: farmers[0],
      applications,
      historicalYields: historical
    });
  } catch (error) {
    console.error('Get farmer error:', error);
    res.status(500).json({ success: false, error: 'Unable to retrieve farmer details.' });
  }
});

// Register new farmer (Step 1)
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      full_name,
      cnic,
      mobile,
      date_of_birth,
      address,
      bank_id,
      crop_type,
      cultivated_area,
      initial_financing_requirement,
      initial_financing_purpose,
      cnic_file_name,
      registered_by = 1
    } = req.body;

    if (!full_name || full_name.trim().length < 3) {
      return res.status(400).json({ success: false, error: "Please enter the farmer's full name (at least 3 letters)." });
    }

    if (!isValidCNIC(cnic)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 13-digit Pakistani CNIC number (e.g. 35201-1234567-1).' });
    }

    // STRICT CNIC IMAGE ATTACHMENT VALIDATION
    if (!cnic_file_name || cnic_file_name.toString().trim() === '') {
      return res.status(400).json({ success: false, error: 'CNIC picture / document upload is STRICTLY MANDATORY for farmer registration.' });
    }

    if (!isValidPakMobile(mobile)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid 11-digit mobile number starting with 03 (e.g. 03001234567).' });
    }

    if (!address || address.trim().length < 5) {
      return res.status(400).json({ success: false, error: 'Please enter a complete address (village, tehsil, district).' });
    }

    const areaNum = parseFloat(cultivated_area);
    if (isNaN(areaNum) || areaNum <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid cultivated area in acres (greater than 0).' });
    }

    const reqAmtNum = parseFloat(initial_financing_requirement);
    if (isNaN(reqAmtNum) || reqAmtNum <= 0) {
      return res.status(400).json({ success: false, error: 'Please enter a valid financing requirement amount in PKR.' });
    }

    await connection.beginTransaction();

    const cleanCNIC = cnic.replace(/[^0-9]/g, '');
    const cleanMobile = mobile.replace(/[^0-9]/g, '');

    // Check existing farmer by CNIC or Mobile
    let farmerId;
    const [existingByCnic] = await connection.query('SELECT id FROM farmers WHERE cnic = ?', [cleanCNIC]);
    const [existingByMobile] = await connection.query('SELECT id FROM farmers WHERE mobile = ?', [cleanMobile]);

    if (existingByCnic.length > 0) {
      farmerId = existingByCnic[0].id;
    } else if (existingByMobile.length > 0) {
      farmerId = existingByMobile[0].id;
    } else {
      const [fRes] = await connection.query(
        `INSERT INTO farmers (full_name, cnic, mobile, date_of_birth, address, onboarding_status, registered_by)
         VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
        [full_name.trim(), cleanCNIC, cleanMobile, date_of_birth || '1985-01-01', address.trim(), registered_by]
      );
      farmerId = fRes.insertId;
    }

    const appCode = `APP-${Math.floor(1000 + Math.random() * 9000)}`;

    const [appRes] = await connection.query(
      `INSERT INTO financing_applications 
       (app_code, farmer_id, bank_id, status, initial_financing_requirement, initial_financing_purpose, crop_type, cultivated_area, created_by)
       VALUES (?, ?, ?, 'KYC Pending', ?, ?, ?, ?, ?)`,
      [appCode, farmerId, bank_id || 1, reqAmtNum, initial_financing_purpose || 'Crop Production', crop_type || 'Wheat', areaNum, registered_by]
    );

    const applicationId = appRes.insertId;

    await connection.query(
      `INSERT INTO audit_logs (application_id, farmer_id, actor_id, event, to_status, remarks)
       VALUES (?, ?, ?, 'Application Created', 'KYC Pending', 'Registered new farmer application')`,
      [applicationId, farmerId, registered_by]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Farmer registered and application created successfully.',
      farmer_id: farmerId,
      application_id: applicationId,
      app_code: appCode
    });
  } catch (error) {
    await connection.rollback();
    console.error('Farmer registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Could not register farmer profile. Please check information and try again.' 
    });
  } finally {
    connection.release();
  }
});

module.exports = router;
