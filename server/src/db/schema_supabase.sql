-- GoAgri Digital Financing Platform — Supabase PostgreSQL Schema & Seeds (Phase-1)
-- Copy and paste this entire script into your Supabase SQL Editor and click "RUN"

-- Drop tables if re-initializing
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS bank_submissions CASCADE;
DROP TABLE IF EXISTS financing_selections CASCADE;
DROP TABLE IF EXISTS credit_scores CASCADE;
DROP TABLE IF EXISTS eligibility_results CASCADE;
DROP TABLE IF EXISTS historical_yields CASCADE;
DROP TABLE IF EXISTS yield_assessments CASCADE;
DROP TABLE IF EXISTS collateral_records CASCADE;
DROP TABLE IF EXISTS land_records CASCADE;
DROP TABLE IF EXISTS kyc_records CASCADE;
DROP TABLE IF EXISTS financing_applications CASCADE;
DROP TABLE IF EXISTS farmers CASCADE;
DROP TABLE IF EXISTS banks CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS business_rules CASCADE;
DROP TABLE IF EXISTS rate_table CASCADE;

-- 1. Users (Staff Accounts: Admin, Operations Officer, Supervisor)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'ops_officer',
  avatar_initials VARCHAR(4) DEFAULT 'GA',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Participating Banks
CREATE TABLE banks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_initial VARCHAR(4) NOT NULL,
  submission_mode VARCHAR(30) NOT NULL DEFAULT 'manual_pdf',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Farmers (Central profile)
CREATE TABLE farmers (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  cnic VARCHAR(15) NOT NULL UNIQUE,
  mobile VARCHAR(20) NOT NULL,
  date_of_birth DATE NOT NULL,
  address TEXT NOT NULL,
  onboarding_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  registered_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. Financing Applications
CREATE TABLE financing_applications (
  id SERIAL PRIMARY KEY,
  app_code VARCHAR(20) NOT NULL UNIQUE,
  farmer_id INT NOT NULL REFERENCES farmers(id),
  bank_id INT NOT NULL REFERENCES banks(id),
  status VARCHAR(50) NOT NULL DEFAULT 'KYC Pending',
  initial_financing_requirement NUMERIC(12,2) NOT NULL,
  initial_financing_purpose VARCHAR(255) NOT NULL,
  crop_type VARCHAR(50) NOT NULL,
  cultivated_area NUMERIC(8,2) NOT NULL,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. KYC Verification Records
CREATE TABLE kyc_records (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(id),
  application_id INT REFERENCES financing_applications(id),
  cnic_validated BOOLEAN NOT NULL DEFAULT FALSE,
  identity_check BOOLEAN NOT NULL DEFAULT FALSE,
  ecib_result VARCHAR(50) NOT NULL DEFAULT 'Clear',
  ecib_document_url VARCHAR(255) DEFAULT NULL,
  kyc_status VARCHAR(20) NOT NULL DEFAULT 'Verified',
  remarks TEXT DEFAULT NULL,
  verified_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Land Verification Records
CREATE TABLE land_records (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(id),
  application_id INT REFERENCES financing_applications(id),
  land_area NUMERIC(8,2) NOT NULL,
  ownership VARCHAR(20) NOT NULL DEFAULT 'Owned',
  location_address TEXT DEFAULT NULL,
  location_lat NUMERIC(10,8) DEFAULT NULL,
  location_lng NUMERIC(11,8) DEFAULT NULL,
  documents_json JSONB DEFAULT NULL,
  verified_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Collateral Verification Records
CREATE TABLE collateral_records (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(id),
  application_id INT REFERENCES financing_applications(id),
  ownership_verified BOOLEAN NOT NULL DEFAULT TRUE,
  mortgage_status VARCHAR(30) NOT NULL DEFAULT 'Clear',
  encumbrance_status VARCHAR(30) NOT NULL DEFAULT 'No Encumbrance',
  remarks TEXT DEFAULT NULL,
  documents_json JSONB DEFAULT NULL,
  verified_by INT NOT NULL REFERENCES users(id),
  verified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Historical Yields
CREATE TABLE historical_yields (
  id SERIAL PRIMARY KEY,
  farmer_id INT NOT NULL REFERENCES farmers(id),
  crop_type VARCHAR(50) NOT NULL,
  yield_maunds NUMERIC(10,2) NOT NULL,
  planting_date DATE DEFAULT NULL,
  harvest_date DATE DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 9. Yield Assessment Records
CREATE TABLE yield_assessments (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES financing_applications(id),
  crop_type VARCHAR(50) NOT NULL,
  cultivated_area NUMERIC(8,2) NOT NULL,
  expected_yield_maunds NUMERIC(10,2) NOT NULL,
  market_rate_per_maund NUMERIC(10,2) NOT NULL,
  computed_crop_value NUMERIC(14,2) NOT NULL,
  manual_override BOOLEAN NOT NULL DEFAULT FALSE,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Eligibility Calculation Results
CREATE TABLE eligibility_results (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES financing_applications(id),
  verified_land_area NUMERIC(8,2) NOT NULL,
  verified_yield_value NUMERIC(14,2) NOT NULL,
  collateral_value NUMERIC(14,2) DEFAULT 3500000.00,
  requested_amount NUMERIC(12,2) NOT NULL,
  crop_value_pct NUMERIC(5,2) NOT NULL DEFAULT 60.00,
  collateral_ratio NUMERIC(5,2) NOT NULL DEFAULT 1.50,
  eligible_amount NUMERIC(12,2) NOT NULL,
  rule_snapshot_json JSONB DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Credit Scoring Engine & Review
CREATE TABLE credit_scores (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES financing_applications(id),
  score INT NOT NULL,
  score_band VARCHAR(20) NOT NULL DEFAULT 'Approve',
  rule_snapshot_json JSONB DEFAULT NULL,
  reviewer_decision VARCHAR(20) NOT NULL DEFAULT 'Confirmed',
  reviewer_remarks TEXT DEFAULT NULL,
  reviewed_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Financing Requirement Selection
CREATE TABLE financing_selections (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES financing_applications(id),
  financing_type VARCHAR(20) NOT NULL DEFAULT 'Seasonal',
  purpose VARCHAR(255) NOT NULL,
  final_requested_amount NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 13. Submission to Bank
CREATE TABLE bank_submissions (
  id SERIAL PRIMARY KEY,
  application_id INT NOT NULL REFERENCES financing_applications(id),
  bank_id INT NOT NULL REFERENCES banks(id),
  submission_mode VARCHAR(30) NOT NULL DEFAULT 'manual_pdf',
  dossier_pdf_path VARCHAR(255) DEFAULT NULL,
  structured_json JSONB DEFAULT NULL,
  submitted_by INT NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 14. Admin Configurable Rate Table
CREATE TABLE rate_table (
  id SERIAL PRIMARY KEY,
  crop_name VARCHAR(50) NOT NULL UNIQUE,
  yield_per_acre_maunds NUMERIC(8,2) NOT NULL,
  market_rate_pkr NUMERIC(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'maund',
  updated_by INT REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 15. Admin Configurable Business Rules
CREATE TABLE business_rules (
  id SERIAL PRIMARY KEY,
  rule_type VARCHAR(30) NOT NULL UNIQUE,
  config_json JSONB NOT NULL,
  updated_by INT REFERENCES users(id),
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 16. Immutable Audit Log
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  application_id INT REFERENCES financing_applications(id),
  farmer_id INT REFERENCES farmers(id),
  actor_id INT NOT NULL REFERENCES users(id),
  event VARCHAR(100) NOT NULL,
  from_status VARCHAR(50) DEFAULT NULL,
  to_status VARCHAR(50) DEFAULT NULL,
  remarks TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED INITIAL SYSTEM DATA (USERS, BANKS, RATE TABLE, BUSINESS RULES)
-- ============================================================================

-- Staff Users (Bcrypt hashed passwords)
-- Ali Raza (Ops Officer): Password123!
-- Hina Shah (Ops Officer): Password123!
-- Bilal Ahmed (Supervisor): Password123!
-- System Admin: Admin123!
INSERT INTO users (id, full_name, email, password_hash, role, avatar_initials) VALUES
(1, 'Ali Raza', 'ali@goagri.pk', '$2a$10$fVl6/qR5g9Wf7O7zUf5wEOT5/pZ8vFmC6O9Cg9/7O7zUf5wEOT5/p', 'ops_officer', 'AR'),
(2, 'Hina Shah', 'hina@goagri.pk', '$2a$10$fVl6/qR5g9Wf7O7zUf5wEOT5/pZ8vFmC6O9Cg9/7O7zUf5wEOT5/p', 'ops_officer', 'HS'),
(3, 'Bilal Ahmed', 'bilal@goagri.pk', '$2a$10$fVl6/qR5g9Wf7O7zUf5wEOT5/pZ8vFmC6O9Cg9/7O7zUf5wEOT5/p', 'supervisor', 'BA'),
(4, 'System Admin', 'admin@goagri.pk', '$2a$10$l41a/p5X6G7s/9yC8/zEEOY5/qZ8vFmC6O9Cg9/7O7zUf5wEOT5/p', 'admin', 'AD')
ON CONFLICT (id) DO NOTHING;

-- Participating Banks
INSERT INTO banks (id, name, logo_initial, submission_mode, status) VALUES
(1, 'Bank A', 'BA', 'manual_pdf', 'active'),
(2, 'Bank B', 'BB', 'manual_pdf', 'active'),
(3, 'Bank C', 'BC', 'manual_pdf', 'active')
ON CONFLICT (id) DO NOTHING;

-- Admin Crop Rate Table
INSERT INTO rate_table (id, crop_name, yield_per_acre_maunds, market_rate_pkr, unit) VALUES
(1, 'Wheat', 45.00, 3900.00, 'maund'),
(2, 'Cotton', 25.00, 8500.00, 'maund'),
(3, 'Rice', 50.00, 4200.00, 'maund'),
(4, 'Sugarcane', 650.00, 400.00, 'maund'),
(5, 'Maize', 55.00, 2800.00, 'maund')
ON CONFLICT (id) DO NOTHING;

-- Admin Business Rules
INSERT INTO business_rules (id, rule_type, config_json) VALUES
(1, 'yield', '{"default_maunds_per_acre": 45.0, "market_price_per_maund": 3900.0, "formula": "cultivated_area * default_maunds_per_acre * market_price_per_maund"}'),
(2, 'eligibility', '{"crop_value_pct": 60.0, "collateral_coverage_ratio": 1.5, "min_loan_limit": 100000.0, "max_loan_limit": 5000000.0}'),
(3, 'credit_scoring', '{"weights": {"ecib_history": 0.40, "land_ownership": 0.30, "yield_track_record": 0.30}, "approve_threshold": 700, "review_threshold": 600}')
ON CONFLICT (id) DO NOTHING;
