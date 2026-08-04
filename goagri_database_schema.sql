-- ===============================================================
-- GOAGRI PLATFORM — MASTER PRODUCTION DATABASE SCHEMA & SEEDS
-- MySQL / MariaDB Compatible
-- ===============================================================

CREATE DATABASE IF NOT EXISTS goagri_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE goagri_db;

-- 1. Users Table (Staff Accounts)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ops_officer', 'supervisor', 'admin') DEFAULT 'ops_officer',
  avatar_initials VARCHAR(10) DEFAULT 'US',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Participating Banks Table
CREATE TABLE IF NOT EXISTS banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_initial VARCHAR(10) DEFAULT 'BK',
  submission_mode VARCHAR(50) DEFAULT 'api',
  status ENUM('active', 'pending', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Farmers Table
CREATE TABLE IF NOT EXISTS farmers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  cnic VARCHAR(20) UNIQUE NOT NULL,
  mobile VARCHAR(20) UNIQUE NOT NULL,
  date_of_birth DATE,
  address TEXT,
  onboarding_status ENUM('pending', 'active', 'approved', 'rejected') DEFAULT 'active',
  registered_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Financing Applications Table
CREATE TABLE IF NOT EXISTS financing_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  app_code VARCHAR(50) UNIQUE NOT NULL,
  farmer_id INT NOT NULL,
  bank_id INT NOT NULL,
  status VARCHAR(100) DEFAULT 'KYC Pending',
  initial_financing_requirement DECIMAL(12, 2) DEFAULT 0.00,
  initial_financing_purpose TEXT,
  crop_type VARCHAR(50) DEFAULT 'Wheat',
  cultivated_area DECIMAL(8, 2) DEFAULT 0.00,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. KYC Records Table
CREATE TABLE IF NOT EXISTS kyc_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  application_id INT NOT NULL,
  cnic_front_url VARCHAR(255),
  cnic_back_url VARCHAR(255),
  cnic_validated BOOLEAN DEFAULT TRUE,
  identity_check BOOLEAN DEFAULT TRUE,
  nadra_status VARCHAR(50) DEFAULT 'Verified',
  ecib_result VARCHAR(50) DEFAULT 'Clear',
  kyc_status VARCHAR(50) DEFAULT 'Verified',
  verified_by INT,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Land Records Table
CREATE TABLE IF NOT EXISTS land_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  application_id INT NOT NULL,
  land_area_acres DECIMAL(8, 2) DEFAULT 0.00,
  ownership_type VARCHAR(50) DEFAULT 'Owned',
  fard_document_url VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  verified_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Collateral Records Table
CREATE TABLE IF NOT EXISTS collateral_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  application_id INT NOT NULL,
  ownership_verified BOOLEAN DEFAULT TRUE,
  mortgage_status VARCHAR(50) DEFAULT 'Clear',
  encumbrance_status VARCHAR(100) DEFAULT 'No Encumbrance Found',
  remarks TEXT,
  verified_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Historical Yields Table
CREATE TABLE IF NOT EXISTS historical_yields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  yield_maunds DECIMAL(8, 2) NOT NULL,
  planting_date VARCHAR(50),
  harvest_date VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Yield Assessments Table
CREATE TABLE IF NOT EXISTS yield_assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  estimated_maunds DECIMAL(10, 2) DEFAULT 0.00,
  maund_rate_pkr DECIMAL(10, 2) DEFAULT 0.00,
  total_crop_value_pkr DECIMAL(12, 2) DEFAULT 0.00,
  assessed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Eligibility Results Table
CREATE TABLE IF NOT EXISTS eligibility_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  total_crop_value DECIMAL(12, 2) DEFAULT 0.00,
  cap_percentage DECIMAL(5, 2) DEFAULT 60.00,
  eligible_amount_cap DECIMAL(12, 2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Credit Scores Table
CREATE TABLE IF NOT EXISTS credit_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  credit_score INT DEFAULT 726,
  risk_rating VARCHAR(50) DEFAULT 'Approve Band',
  max_financing_cap DECIMAL(12, 2) DEFAULT 0.00,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Financing Selections Table
CREATE TABLE IF NOT EXISTS financing_selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  selected_bank_id INT NOT NULL,
  requested_amount DECIMAL(12, 2) NOT NULL,
  tenure_months INT DEFAULT 12,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (selected_bank_id) REFERENCES banks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Bank Submissions Table
CREATE TABLE IF NOT EXISTS bank_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  bank_id INT NOT NULL,
  submission_status VARCHAR(50) DEFAULT 'Submitted',
  dossier_pdf_url VARCHAR(255),
  submitted_by INT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (bank_id) REFERENCES banks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT,
  farmer_id INT,
  actor_id INT,
  action VARCHAR(100),
  event VARCHAR(100),
  step INT,
  from_status VARCHAR(50),
  to_status VARCHAR(50),
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ===============================================================
-- SEED INITIAL SYSTEM DATA & PRE-CONFIGURED ACCOUNTS
-- ===============================================================

-- Default Users (Password for all: Password123!)
INSERT INTO users (id, full_name, email, password_hash, role, avatar_initials) VALUES
(1, 'Ali Raza', 'ali@goagri.pk', '$2a$10$mcwwBAb1MG/njyMFXbxS4eqolfvPgtBeNV6wKAigmXlAvJL7u9JrK', 'ops_officer', 'AR'),
(2, 'Hina Shah', 'hina@goagri.pk', '$2a$10$mcwwBAb1MG/njyMFXbxS4eqolfvPgtBeNV6wKAigmXlAvJL7u9JrK', 'ops_officer', 'HS'),
(3, 'Bilal Ahmed', 'bilal@goagri.pk', '$2a$10$mcwwBAb1MG/njyMFXbxS4eqolfvPgtBeNV6wKAigmXlAvJL7u9JrK', 'supervisor', 'BA'),
(4, 'Admin', 'admin@goagri.pk', '$2a$10$xS1nat0IuupKiNox4a0/5.tuheoxIHfbuiU5J0wRazV5KKL5RvqRS', 'admin', 'AD')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Default Participating Banks
INSERT INTO banks (id, name, logo_initial, submission_mode, status) VALUES
(1, 'Bank A', 'BA', 'api', 'active'),
(2, 'Bank B', 'BB', 'api', 'active'),
(3, 'Bank C', 'BC', 'manual_pdf', 'active'),
(4, 'Bank D', 'BD', 'api', 'active'),
(5, 'HBL', 'HB', 'api', 'active'),
(6, 'UBL', 'UB', 'api', 'active'),
(7, 'Meezan Bank', 'MB', 'api', 'active')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Sample Farmers
INSERT INTO farmers (id, full_name, cnic, mobile, date_of_birth, address, onboarding_status, registered_by) VALUES
(1, 'Muhammad Aslam', '3520112345671', '03001234567', '1982-05-14', 'Chak 42-NB, Sargodha, Punjab', 'active', 1),
(2, 'Ghulam Fatima', '3310198765437', '03019876543', '1988-11-20', 'Bhalwal Road, Sargodha, Punjab', 'active', 1),
(3, 'Imran Khan', '3450145678903', '03334567890', '1979-03-10', 'Tehsil Multan, Punjab', 'active', 2),
(4, 'Rana Yaseen', '3630187654329', '03458765432', '1975-08-25', 'Khanewal Road, Multan, Punjab', 'active', 2),
(5, 'Sana Bibi', '3210123456785', '03122345678', '1990-12-05', 'Muzaffargarh, Punjab', 'pending', 1)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- Sample Financing Applications
INSERT INTO financing_applications (id, app_code, farmer_id, bank_id, status, initial_financing_requirement, initial_financing_purpose, crop_type, cultivated_area, created_by) VALUES
(1, 'APP-1042', 1, 1, 'KYC Pending', 800000.00, 'Wheat Seed & Fertilizer', 'Wheat', 12.00, 1),
(2, 'APP-1041', 2, 2, 'Land Verified', 1200000.00, 'Cotton Machinery & Seeds', 'Cotton', 15.00, 1),
(3, 'APP-1040', 3, 1, 'Yield Calculated', 600000.00, 'Maize Irrigation & Seeds', 'Maize', 8.00, 2),
(4, 'APP-1039', 4, 1, 'Submitted to Bank', 950000.00, 'Rice Paddy Crop Production', 'Rice', 10.00, 2),
(5, 'APP-1037', 5, 3, 'KYC Sent Back', 500000.00, 'Sugarcane Harvest Support', 'Sugarcane', 6.00, 1)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- Sample KYC Records
INSERT INTO kyc_records (id, farmer_id, application_id, cnic_validated, identity_check, nadra_status, ecib_result, kyc_status, verified_by, remarks) VALUES
(1, 1, 1, TRUE, TRUE, 'Verified', 'Clear', 'Verified', 1, 'Identity verified via NADRA manual check. eCIB clear.'),
(2, 2, 2, TRUE, TRUE, 'Verified', 'Clear', 'Verified', 1, 'All KYC checks clear.'),
(3, 3, 3, TRUE, TRUE, 'Verified', 'Clear', 'Verified', 2, 'KYC approved by desk officer.'),
(4, 4, 4, TRUE, TRUE, 'Verified', 'Clear', 'Verified', 2, 'KYC verified.'),
(5, 5, 5, FALSE, FALSE, 'Unverified', 'Flagged', 'Sent Back', 1, 'eCIB report image unclear. Resubmit scan.')
ON DUPLICATE KEY UPDATE ecib_result=VALUES(ecib_result);

-- Historical Yields
INSERT INTO historical_yields (id, farmer_id, crop_type, yield_maunds, planting_date, harvest_date) VALUES
(1, 1, 'Wheat', 44.00, 'Rabi 2024', 'Apr 2025'),
(2, 1, 'Cotton', 28.00, 'Kharif 2023', 'Oct 2023'),
(3, 2, 'Cotton', 32.00, 'Kharif 2024', 'Nov 2024')
ON DUPLICATE KEY UPDATE yield_maunds=VALUES(yield_maunds);
