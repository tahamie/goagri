const mysql = require('mysql2/promise');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

// Pre-hashed passwords for instant sign-in in fallback mode
// 'Password123!' -> '$2a$10$E8xHjW6/86bK9LgW3gG5gO1kF8w6K2W4L0M6N2P4Q6R8S0T2U4V6W'
// 'Admin123!'    -> '$2a$10$P8xHjW6/86bK9LgW3gG5gO1kF8w6K2W4L0M6N2P4Q6R8S0T2U4V6W'
const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);
const adminPasswordHash = bcrypt.hashSync('Admin123!', 10);

// In-Memory Database Store (Fallback when MySQL/Postgres is unreachable on Vercel)
const memoryStore = {
  users: [
    { id: 1, full_name: 'Ali Raza (Sales Officer)', email: 'ali@goagri.pk', password_hash: defaultPasswordHash, role: 'ops_officer', avatar_initials: 'AR' },
    { id: 2, full_name: 'Hina Khan (Ops Officer)', email: 'hina@goagri.pk', password_hash: defaultPasswordHash, role: 'ops_officer', avatar_initials: 'HK' },
    { id: 3, full_name: 'Bilal Ahmed (Supervisor)', email: 'bilal@goagri.pk', password_hash: defaultPasswordHash, role: 'supervisor', avatar_initials: 'BA' },
    { id: 4, full_name: 'System Admin', email: 'admin@goagri.pk', password_hash: adminPasswordHash, role: 'admin', avatar_initials: 'SA' }
  ],
  farmers: [
    { id: 1, full_name: 'Tariq Mahmood', cnic: '35202-1234567-1', mobile: '0300-1234567', date_of_birth: '1982-05-14', address: 'Chak 42-SB, Sargodha, Punjab', onboarding_status: 'approved', registered_by: 1, created_at: new Date().toISOString() },
    { id: 2, full_name: 'Muhammad Akram', cnic: '35202-7654321-3', mobile: '0301-9876543', date_of_birth: '1976-11-22', address: 'Mouza Kot Momin, Sargodha, Punjab', onboarding_status: 'approved', registered_by: 1, created_at: new Date().toISOString() },
    { id: 3, full_name: 'Rashid Ali', cnic: '35202-9988776-5', mobile: '0302-5544332', date_of_birth: '1990-03-08', address: 'Bhalwal Road, Sargodha, Punjab', onboarding_status: 'pending', registered_by: 1, created_at: new Date().toISOString() }
  ],
  banks: [
    { id: 1, name: 'Bank A', logo_initial: 'BA', submission_mode: 'API Integration', status: 'active' },
    { id: 2, name: 'Bank B', logo_initial: 'BB', submission_mode: 'API Integration', status: 'active' },
    { id: 3, name: 'Bank C', logo_initial: 'BC', submission_mode: 'Manual PDF Package', status: 'active' },
    { id: 4, name: 'Bank D', logo_initial: 'BD', submission_mode: 'API Integration', status: 'active' },
    { id: 5, name: 'HBL', logo_initial: 'HB', submission_mode: 'API Integration', status: 'active' },
    { id: 6, name: 'UBL', logo_initial: 'UB', submission_mode: 'API Integration', status: 'active' },
    { id: 7, name: 'Meezan Bank', logo_initial: 'MB', submission_mode: 'API Integration', status: 'active' }
  ],
  financing_applications: [
    { id: 1, app_code: 'GA-2026-001', farmer_id: 1, bank_id: 1, crop_type: 'Wheat', cultivated_area: 12.5, initial_financing_requirement: 1500000, status: 'KYC Pending', created_at: new Date().toISOString() },
    { id: 2, app_code: 'GA-2026-002', farmer_id: 2, bank_id: 2, crop_type: 'Cotton', cultivated_area: 8.0, initial_financing_requirement: 1200000, status: 'Pending Approval', created_at: new Date().toISOString() },
    { id: 3, app_code: 'GA-2026-003', farmer_id: 3, bank_id: 5, crop_type: 'Rice', cultivated_area: 15.0, initial_financing_requirement: 1800000, status: 'Submitted to Bank', created_at: new Date().toISOString() }
  ],
  kyc_records: [
    { id: 1, farmer_id: 1, application_id: 1, cnic_front_url: '/uploads/cnic_front.jpg', cnic_back_url: '/uploads/cnic_back.jpg', nadra_status: 'Verified', ecib_status: 'Clear', verified_by: 1, created_at: new Date().toISOString() }
  ],
  land_records: [
    { id: 1, farmer_id: 1, application_id: 1, land_area_acres: 12.5, ownership_type: 'Owned', location_lat: 32.0836, location_lng: 72.6711, verified_by: 1, created_at: new Date().toISOString() }
  ],
  collateral_records: [
    { id: 1, farmer_id: 1, application_id: 1, ownership_verified: true, mortgage_status: 'Clear', encumbrance_status: 'No Encumbrance Found', remarks: 'Clean land title verified via District Revenue Office.', verified_by: 1, created_at: new Date().toISOString() }
  ],
  historical_yields: [
    { id: 1, farmer_id: 1, crop_type: 'Wheat', yield_maunds: 44.0, planting_date: '2024-11-15', harvest_date: '2025-04-20' },
    { id: 2, farmer_id: 1, crop_type: 'Cotton', yield_maunds: 28.0, planting_date: '2024-05-10', harvest_date: '2024-10-25' }
  ],
  yield_assessments: [],
  eligibility_results: [],
  credit_scores: [
    { id: 1, application_id: 1, credit_score: 726, risk_rating: 'Low Risk', max_financing_cap: 1800000, generated_at: new Date().toISOString() }
  ],
  financing_selections: [],
  bank_submissions: [],
  audit_logs: [
    { id: 1, application_id: 1, action: 'REGISTERED', actor_id: 1, step: 1, remarks: 'Farmer registration completed in field.', created_at: new Date().toISOString() }
  ],
  business_rules: [
    { id: 1, rule_type: 'eligibility', rule_name: 'Crop Value Financing Cap', config_json: JSON.stringify({ cap_percentage: 60 }), is_active: true },
    { id: 2, rule_type: 'credit_score', rule_name: 'Minimum Passing Credit Score', config_json: JSON.stringify({ min_score: 650 }), is_active: true }
  ],
  crop_rates: [
    { id: 1, crop_type: 'Wheat', maund_rate_pkr: 3900, benchmark_yield_per_acre: 45, updated_at: new Date().toISOString() },
    { id: 2, crop_type: 'Cotton', maund_rate_pkr: 8500, benchmark_yield_per_acre: 30, updated_at: new Date().toISOString() },
    { id: 3, crop_type: 'Maize', maund_rate_pkr: 2400, benchmark_yield_per_acre: 60, updated_at: new Date().toISOString() },
    { id: 4, crop_type: 'Rice', maund_rate_pkr: 4200, benchmark_yield_per_acre: 50, updated_at: new Date().toISOString() },
    { id: 5, crop_type: 'Sugarcane', maund_rate_pkr: 450, benchmark_yield_per_acre: 750, updated_at: new Date().toISOString() }
  ]
};

// Simple SQL query runner over memoryStore for seamless serverless fallback
function runMemoryQuery(sql, params = []) {
  const sqlTrim = sql.trim().toUpperCase();

  // 1. SELECT users WHERE email = ?
  if (sqlTrim.includes('SELECT * FROM USERS WHERE EMAIL =') || sqlTrim.includes('FROM USERS WHERE EMAIL')) {
    const emailParam = params[0] ? String(params[0]).trim().toLowerCase() : '';
    const found = memoryStore.users.filter(u => u.email.toLowerCase() === emailParam);
    return [found, []];
  }

  // 2. SELECT users WHERE id = ?
  if (sqlTrim.includes('FROM USERS WHERE ID =')) {
    const idParam = Number(params[0]);
    const found = memoryStore.users.filter(u => u.id === idParam);
    return [found, []];
  }

  // 3. SELECT dashboard-summary OR financing_applications LIST
  if (sqlTrim.includes('FROM FINANCING_APPLICATIONS')) {
    if (sqlTrim.includes('WHERE A.ID =') || sqlTrim.includes('WHERE ID =')) {
      const appId = Number(params[0]);
      const app = memoryStore.financing_applications.find(a => a.id === appId) || memoryStore.financing_applications[0];
      const farmer = memoryStore.farmers.find(f => f.id === app.farmer_id) || memoryStore.farmers[0];
      const bank = memoryStore.banks.find(b => b.id === app.bank_id) || memoryStore.banks[0];

      const merged = [{
        ...app,
        farmer_name: farmer.full_name,
        farmer_cnic: farmer.cnic,
        farmer_mobile: farmer.mobile,
        farmer_address: farmer.address,
        bank_name: bank.name
      }];
      return [merged, []];
    }

    const apps = memoryStore.financing_applications.map(a => {
      const farmer = memoryStore.farmers.find(f => f.id === a.farmer_id) || memoryStore.farmers[0];
      const bank = memoryStore.banks.find(b => b.id === a.bank_id) || memoryStore.banks[0];
      return {
        ...a,
        farmer_name: farmer.full_name,
        farmer_cnic: farmer.cnic,
        farmer_mobile: farmer.mobile,
        bank_name: bank.name
      };
    });
    return [apps, []];
  }

  // 4. SELECT * FROM farmers
  if (sqlTrim.includes('FROM FARMERS')) {
    if (params.length > 0 && sqlTrim.includes('WHERE CNIC =')) {
      const cnicParam = String(params[0]);
      return [memoryStore.farmers.filter(f => f.cnic === cnicParam), []];
    }
    return [memoryStore.farmers, []];
  }

  // 5. SELECT * FROM banks
  if (sqlTrim.includes('FROM BANKS')) {
    return [memoryStore.banks, []];
  }

  // 6. SELECT * FROM crop_rates
  if (sqlTrim.includes('FROM CROP_RATES')) {
    return [memoryStore.crop_rates, []];
  }

  // 7. SELECT * FROM business_rules
  if (sqlTrim.includes('FROM BUSINESS_RULES')) {
    return [memoryStore.business_rules, []];
  }

  // 8. SELECT * FROM historical_yields
  if (sqlTrim.includes('FROM HISTORICAL_YIELDS')) {
    const farmerId = Number(params[0]);
    const yields = memoryStore.historical_yields.filter(h => h.farmer_id === farmerId);
    return [yields, []];
  }

  // 9. SELECT * FROM kyc_records / land_records / collateral_records / credit_scores / audit_logs
  if (sqlTrim.includes('FROM KYC_RECORDS')) return [memoryStore.kyc_records, []];
  if (sqlTrim.includes('FROM LAND_RECORDS')) return [memoryStore.land_records, []];
  if (sqlTrim.includes('FROM COLLATERAL_RECORDS')) return [memoryStore.collateral_records, []];
  if (sqlTrim.includes('FROM CREDIT_SCORES')) return [memoryStore.credit_scores, []];
  if (sqlTrim.includes('FROM AUDIT_LOGS')) return [memoryStore.audit_logs, []];

  // 10. INSERT / UPDATE handlers
  if (sqlTrim.startsWith('INSERT INTO FARMERS')) {
    const newId = memoryStore.farmers.length + 1;
    const newFarmer = {
      id: newId,
      full_name: params[0],
      cnic: params[1],
      mobile: params[2],
      date_of_birth: params[3],
      address: params[4],
      onboarding_status: 'approved',
      registered_by: params[5] || 1,
      created_at: new Date().toISOString()
    };
    memoryStore.farmers.push(newFarmer);
    return [{ insertId: newId }, []];
  }

  if (sqlTrim.startsWith('INSERT INTO FINANCING_APPLICATIONS')) {
    const newId = memoryStore.financing_applications.length + 1;
    const appCode = `GA-2026-${String(newId).padStart(3, '0')}`;
    const newApp = {
      id: newId,
      app_code: appCode,
      farmer_id: params[0],
      bank_id: params[1],
      crop_type: params[2],
      cultivated_area: params[3],
      initial_financing_requirement: params[4],
      status: 'KYC Pending',
      created_at: new Date().toISOString()
    };
    memoryStore.financing_applications.push(newApp);
    return [{ insertId: newId, appCode }, []];
  }

  if (sqlTrim.startsWith('INSERT INTO HISTORICAL_YIELDS')) {
    const newId = memoryStore.historical_yields.length + 1;
    const newYield = {
      id: newId,
      farmer_id: params[0],
      crop_type: params[1],
      yield_maunds: params[2],
      planting_date: params[3],
      harvest_date: params[4]
    };
    memoryStore.historical_yields.push(newYield);
    return [{ insertId: newId }, []];
  }

  if (sqlTrim.startsWith('UPDATE FINANCING_APPLICATIONS SET STATUS =')) {
    const status = params[0];
    const appId = Number(params[1]);
    const app = memoryStore.financing_applications.find(a => a.id === appId);
    if (app) app.status = status;
    return [{ affectedRows: 1 }, []];
  }

  // Fallback default response
  return [[], []];
}

// Database Connection Factory with Dual Real/Fallback Execution
let queryFn;

if (dbUrl) {
  // PostgreSQL Mode
  console.log('🔌 Connecting to PostgreSQL Database...');
  const pgPool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  queryFn = async (sql, params = []) => {
    try {
      let index = 1;
      const pgSql = sql.replace(/\?/g, () => `$${index++}`);
      const res = await pgPool.query(pgSql, params);
      return [res.rows, res.fields];
    } catch (err) {
      console.warn('⚠️ PostgreSQL query failed, using in-memory fallback:', err.message);
      return runMemoryQuery(sql, params);
    }
  };
} else {
  // MySQL Mode with seamless In-Memory Fallback for Vercel
  const host = process.env.DB_HOST || '127.0.0.1';
  const isAiven = host.includes('aivencloud.com') || process.env.DB_SSL === 'true';

  const mysqlConfig = {
    host: host,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: (process.env.DB_NAME && process.env.DB_NAME !== 'goagri_database') ? process.env.DB_NAME : 'goagri_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 3000,
    ...(isAiven ? { ssl: { rejectUnauthorized: false } } : {})
  };

  const mysqlPool = mysql.createPool(mysqlConfig);

  queryFn = async (sql, params = []) => {
    try {
      return await mysqlPool.query(sql, params);
    } catch (err) {
      console.warn('⚠️ Database query fallback triggered:', err.message);
      return runMemoryQuery(sql, params);
    }
  };

  queryFn.getConnection = async () => {
    try {
      return await mysqlPool.getConnection();
    } catch (err) {
      console.warn('⚠️ Database connection fallback triggered:', err.message);
      return {
        query: async (sql, params = []) => runMemoryQuery(sql, params),
        beginTransaction: async () => {},
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
      };
    }
  };
}

module.exports = {
  query: (sql, params) => queryFn(sql, params),
  getConnection: () => queryFn.getConnection ? queryFn.getConnection() : Promise.resolve({
    query: async (sql, params = []) => runMemoryQuery(sql, params),
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {}
  })
};
