-- Seed Data for GoAgri Digital Financing Platform
USE goagri_db;

-- 1. Insert Initial Staff Users
INSERT INTO users (id, full_name, email, password_hash, role, avatar_initials) VALUES
(1, 'Ali Raza', 'ali@goagri.pk', '$2a$10$mcwwBAb1MG/njyMFXbxS4eqolfvPgtBeNV6wKAigmXlAvJL7u9JrK', 'ops_officer', 'AR'),
(2, 'Hina Shah', 'hina@goagri.pk', '$2a$10$mcwwBAb1MG/njyMFXbxS4eqolfvPgtBeNV6wKAigmXlAvJL7u9JrK', 'ops_officer', 'HS'),
(3, 'Bilal Ahmed', 'bilal@goagri.pk', '$2a$10$mcwwBAb1MG/njyMFXbxS4eqolfvPgtBeNV6wKAigmXlAvJL7u9JrK', 'supervisor', 'BA'),
(4, 'Admin', 'admin@goagri.pk', '$2a$10$xS1nat0IuupKiNox4a0/5.tuheoxIHfbuiU5J0wRazV5KKL5RvqRS', 'admin', 'AD')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 2. Insert Participating Banks
INSERT INTO banks (id, name, logo_initial, submission_mode, status) VALUES
(1, 'Bank A', 'A', 'manual_pdf', 'active'),
(2, 'Bank B', 'B', 'api', 'active'),
(3, 'Bank C', 'C', 'manual_pdf', 'pending')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Rate Table Defaults
INSERT INTO rate_table (id, crop_name, yield_per_acre_maunds, market_rate_pkr, unit, updated_by) VALUES
(1, 'Wheat', 45.00, 3900.00, 'maund', 4),
(2, 'Cotton', 30.00, 8500.00, 'maund', 4),
(3, 'Rice', 60.00, 4200.00, 'maund', 4),
(4, 'Sugarcane', 600.00, 425.00, 'maund', 4)
ON DUPLICATE KEY UPDATE yield_per_acre_maunds=VALUES(yield_per_acre_maunds);

-- 4. Insert Business Rules Engine Defaults
INSERT INTO business_rules (id, rule_type, config_json, updated_by) VALUES
(1, 'yield', '{"crop_value_formula": "cultivated_area * yield_per_acre * market_rate", "source": "rate_table", "allow_manual_override": true}', 4),
(2, 'eligibility', '{"crop_value_percentage": 60.0, "collateral_ratio": 1.5, "min_cap_pkr": 100000, "max_cap_pkr": 5000000}', 4),
(3, 'credit_scoring', '{"weights": {"kyc_ecib": 30, "yield_vs_requested": 40, "collateral_coverage": 30}, "bands": {"approve": [700, 900], "review": [550, 699], "reject": [0, 549]}}', 4)
ON DUPLICATE KEY UPDATE config_json=VALUES(config_json);

-- 5. Insert Sample Farmers
INSERT INTO farmers (id, full_name, cnic, mobile, date_of_birth, address, onboarding_status, registered_by) VALUES
(1, 'Muhammad Aslam', '3520112345671', '03001234567', '1982-05-14', 'Chak 42-NB, Sargodha, Punjab', 'active', 1),
(2, 'Ghulam Fatima', '3310198765437', '03019876543', '1988-11-20', 'Bhalwal Road, Sargodha, Punjab', 'active', 1),
(3, 'Imran Khan', '3450145678903', '03334567890', '1979-03-10', 'Tehsil Multan, Punjab', 'active', 2),
(4, 'Rana Yaseen', '3630187654329', '03458765432', '1975-08-25', 'Khanewal Road, Multan, Punjab', 'active', 2),
(5, 'Sana Bibi', '3210123456785', '03122345678', '1990-12-05', 'Muzaffargarh, Punjab', 'pending', 1)
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

-- 6. Insert Sample Applications matching UI v2 & v4 prototypes
INSERT INTO financing_applications (id, app_code, farmer_id, bank_id, status, initial_financing_requirement, initial_financing_purpose, crop_type, cultivated_area, created_by) VALUES
(1, 'APP-1042', 1, 1, 'KYC Pending', 800000.00, 'Wheat Seed & Fertilizer', 'Wheat', 12.00, 1),
(2, 'APP-1041', 2, 2, 'Land Verified', 1200000.00, 'Cotton Machinery & Seeds', 'Cotton', 15.00, 1),
(3, 'APP-1040', 3, 1, 'Yield Calculated', 600000.00, 'Maize Irrigation & Seeds', 'Maize', 8.00, 2),
(4, 'APP-1039', 4, 1, 'Submitted to Bank', 950000.00, 'Rice Paddy Crop Production', 'Rice', 10.00, 2),
(5, 'APP-1037', 5, 3, 'KYC Sent Back', 500000.00, 'Sugarcane Harvest Support', 'Sugarcane', 6.00, 1)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- 7. KYC Records for sample apps
INSERT INTO kyc_records (id, farmer_id, application_id, cnic_validated, identity_check, ecib_result, kyc_status, verified_by, remarks) VALUES
(1, 1, 1, TRUE, TRUE, 'Clear', 'Verified', 1, 'Identity verified via NADRA manual check. eCIB clear.'),
(2, 2, 2, TRUE, TRUE, 'Clear', 'Verified', 1, 'All KYC checks clear.'),
(3, 3, 3, TRUE, TRUE, 'Clear', 'Verified', 2, 'KYC approved by desk officer.'),
(4, 4, 4, TRUE, TRUE, 'Clear', 'Verified', 2, 'KYC verified.'),
(5, 5, 5, FALSE, FALSE, 'Flagged', 'Sent Back', 1, 'eCIB report image unclear. Resubmit scan.')
ON DUPLICATE KEY UPDATE ecib_result=VALUES(ecib_result);

-- 8. Historical Yields
INSERT INTO historical_yields (farmer_id, crop_type, yield_maunds, planting_date, harvest_date) VALUES
(1, 'Wheat', 44.00, '2024-11-05', '2025-04-20'),
(1, 'Cotton', 28.00, '2023-05-12', '2023-10-28'),
(2, 'Cotton', 32.00, '2024-05-10', '2024-11-02');

-- 9. Initial Audit Logs
INSERT INTO audit_logs (application_id, farmer_id, actor_id, event, from_status, to_status, remarks) VALUES
(1, 1, 1, 'Application Created', NULL, 'KYC Pending', 'Registered farmer Muhammad Aslam'),
(2, 2, 1, 'Land Verification Completed', 'Farmer Active', 'Land Verified', 'Land 15 acres verified'),
(4, 4, 3, 'Submitted to Bank', 'Requirement Selected', 'Submitted to Bank', 'Dossier generated and submitted to Bank A');
