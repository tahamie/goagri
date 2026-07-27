const mysql = require('mysql2/promise');
const { Pool } = require('pg');
require('dotenv').config();

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

let queryFn;

if (dbUrl) {
  // PostgreSQL / Supabase Cloud Mode
  console.log('🔌 Connecting to Supabase PostgreSQL Database...');
  const pgPool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  // Polyfill MySQL query syntax `pool.query(sql, [params])` for Postgres `$1, $2`
  queryFn = async (sql, params = []) => {
    let index = 1;
    const pgSql = sql.replace(/\?/g, () => `$${index++}`);
    const res = await pgPool.query(pgSql, params);
    return [res.rows, res.fields];
  };

  queryFn.getConnection = async () => {
    const client = await pgPool.connect();
    return {
      query: async (sql, params = []) => {
        let index = 1;
        const pgSql = sql.replace(/\?/g, () => `$${index++}`);
        const res = await client.query(pgSql, params);
        return [res.rows, res.fields];
      },
      beginTransaction: () => client.query('BEGIN'),
      commit: () => client.query('COMMIT'),
      rollback: () => client.query('ROLLBACK'),
      release: () => client.release()
    };
  };
} else {
  // MySQL Local Mode
  const mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'goagri_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  queryFn = (sql, params) => mysqlPool.query(sql, params);
  queryFn.getConnection = () => mysqlPool.getConnection();
}

module.exports = {
  query: (sql, params) => queryFn(sql, params),
  getConnection: () => queryFn.getConnection()
};
