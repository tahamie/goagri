-- GoAgri Digital Financing Platform Database Schema (Phase-1)
CREATE DATABASE IF NOT EXISTS goagri_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE goagri_db;

-- Drop tables in order of dependencies if re-initializing
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS bank_submissions;
DROP TABLE IF EXISTS financing_selections;
DROP TABLE IF EXISTS credit_scores;
DROP TABLE IF EXISTS eligibility_results;
DROP TABLE IF EXISTS historical_yields;
DROP TABLE IF EXISTS yield_assessments;
DROP TABLE IF EXISTS collateral_records;
DROP TABLE IF EXISTS land_records;
DROP TABLE IF EXISTS kyc_records;
DROP TABLE IF EXISTS financing_applications;
DROP TABLE IF EXISTS farmers;
DROP TABLE IF EXISTS banks;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS business_rules;
DROP TABLE IF EXISTS rate_table;
SET FOREIGN_KEY_CHECKS = 1;

-- Users (Staff Accounts: Admin, Operations Officer, Supervisor)
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'ops_officer', 'supervisor') NOT NULL DEFAULT 'ops_officer',
  avatar_initials VARCHAR(4) DEFAULT 'GA',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Participating Banks (Multi-bank scoped access)
CREATE TABLE banks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_initial VARCHAR(4) NOT NULL,
  submission_mode ENUM('manual_pdf', 'api') NOT NULL DEFAULT 'manual_pdf',
  status ENUM('active', 'pending') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Farmers (Central profile reused across applications)
CREATE TABLE farmers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  cnic VARCHAR(15) NOT NULL UNIQUE,
  mobile VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  onboarding_status ENUM('pending', 'active', 'rejected') NOT NULL DEFAULT 'pending',
  registered_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (registered_by) REFERENCES users(id)
);

-- Financing Applications (Application level state machine)
CREATE TABLE financing_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  app_code VARCHAR(20) NOT NULL UNIQUE,
  farmer_id INT NOT NULL,
  bank_id INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'KYC Pending',
  initial_financing_requirement DECIMAL(12,2) NOT NULL,
  initial_financing_purpose VARCHAR(255) NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  cultivated_area DECIMAL(8,2) NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (bank_id) REFERENCES banks(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- KYC Verification Records
CREATE TABLE kyc_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  application_id INT DEFAULT NULL,
  cnic_validated BOOLEAN NOT NULL DEFAULT FALSE,
  identity_check BOOLEAN NOT NULL DEFAULT FALSE,
  ecib_result VARCHAR(50) NOT NULL DEFAULT 'Clear',
  ecib_document_url VARCHAR(255) DEFAULT NULL,
  kyc_status ENUM('Verified', 'Rejected', 'Sent Back') NOT NULL DEFAULT 'Verified',
  remarks TEXT DEFAULT NULL,
  verified_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (application_id) REFERENCES financing_applications(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Land Verification Records
CREATE TABLE land_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  application_id INT DEFAULT NULL,
  land_area DECIMAL(8,2) NOT NULL,
  ownership ENUM('Owned', 'Leased') NOT NULL DEFAULT 'Owned',
  location_address TEXT DEFAULT NULL,
  location_lat DECIMAL(10,8) DEFAULT NULL,
  location_lng DECIMAL(11,8) DEFAULT NULL,
  documents_json JSON DEFAULT NULL,
  verified_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (application_id) REFERENCES financing_applications(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Collateral Verification Records
CREATE TABLE collateral_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  application_id INT DEFAULT NULL,
  ownership_verified BOOLEAN NOT NULL DEFAULT TRUE,
  mortgage_status ENUM('Clear', 'Mortgaged', 'Under Verification') NOT NULL DEFAULT 'Clear',
  encumbrance_status ENUM('No Encumbrance', 'Encumbrance Found', 'Under Verification') NOT NULL DEFAULT 'No Encumbrance',
  remarks TEXT DEFAULT NULL,
  documents_json JSON DEFAULT NULL,
  verified_by INT NOT NULL,
  verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (application_id) REFERENCES financing_applications(id),
  FOREIGN KEY (verified_by) REFERENCES users(id)
);

-- Historical Yields (Farmer level past harvest tracking)
CREATE TABLE historical_yields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  farmer_id INT NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  yield_maunds DECIMAL(10,2) NOT NULL,
  planting_date DATE DEFAULT NULL,
  harvest_date DATE DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- Yield Assessment Records (Per financing application calculation)
CREATE TABLE yield_assessments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  cultivated_area DECIMAL(8,2) NOT NULL,
  expected_yield_maunds DECIMAL(10,2) NOT NULL,
  market_rate_per_maund DECIMAL(10,2) NOT NULL,
  computed_crop_value DECIMAL(14,2) NOT NULL,
  manual_override BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Eligibility Calculation Results
CREATE TABLE eligibility_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  verified_land_area DECIMAL(8,2) NOT NULL,
  verified_yield_value DECIMAL(14,2) NOT NULL,
  collateral_value DECIMAL(14,2) DEFAULT 3500000.00,
  requested_amount DECIMAL(12,2) NOT NULL,
  crop_value_pct DECIMAL(5,2) NOT NULL DEFAULT 60.00,
  collateral_ratio DECIMAL(5,2) NOT NULL DEFAULT 1.50,
  eligible_amount DECIMAL(12,2) NOT NULL,
  rule_snapshot_json JSON DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id)
);

-- Credit Scoring Engine & Manual Review
CREATE TABLE credit_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  score INT NOT NULL,
  score_band ENUM('Approve', 'Review', 'Reject') NOT NULL DEFAULT 'Approve',
  rule_snapshot_json JSON DEFAULT NULL,
  reviewer_decision ENUM('Confirmed', 'Overridden', 'Pending') NOT NULL DEFAULT 'Confirmed',
  reviewer_remarks TEXT DEFAULT NULL,
  reviewed_by INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id),
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

-- Financing Requirement Selection (Final figures)
CREATE TABLE financing_selections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  financing_type ENUM('Seasonal', 'Term', 'Equipment') NOT NULL DEFAULT 'Seasonal',
  purpose VARCHAR(255) NOT NULL,
  final_requested_amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id)
);

-- Submission to Bank (Dossier & JSON payload export)
CREATE TABLE bank_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT NOT NULL,
  bank_id INT NOT NULL,
  submission_mode ENUM('manual_pdf', 'api') NOT NULL DEFAULT 'manual_pdf',
  dossier_pdf_path VARCHAR(255) DEFAULT NULL,
  structured_json JSON DEFAULT NULL,
  submitted_by INT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id),
  FOREIGN KEY (bank_id) REFERENCES banks(id),
  FOREIGN KEY (submitted_by) REFERENCES users(id)
);

-- Admin Configurable Rate Table (Per crop yield & market price)
CREATE TABLE rate_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  crop_name VARCHAR(50) NOT NULL UNIQUE,
  yield_per_acre_maunds DECIMAL(8,2) NOT NULL,
  market_rate_pkr DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'maund',
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Admin Configurable Business Rules (Yield, Eligibility, Credit Scoring policies)
CREATE TABLE business_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rule_type ENUM('yield', 'eligibility', 'credit_scoring') NOT NULL UNIQUE,
  config_json JSON NOT NULL,
  updated_by INT DEFAULT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Immutable Audit Log
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  application_id INT DEFAULT NULL,
  farmer_id INT DEFAULT NULL,
  actor_id INT NOT NULL,
  event VARCHAR(100) NOT NULL,
  from_status VARCHAR(50) DEFAULT NULL,
  to_status VARCHAR(50) DEFAULT NULL,
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES financing_applications(id),
  FOREIGN KEY (farmer_id) REFERENCES farmers(id),
  FOREIGN KEY (actor_id) REFERENCES users(id)
);
