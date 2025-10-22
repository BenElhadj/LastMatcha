const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Pool } = require('pg');

(async () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not set. Please set it in backend/.env or your environment.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

  try {
    const res = await pool.query('SELECT NOW() as now');
    console.log('✅ Database connection successful. Server time:', res.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message || err);
    process.exit(1);
  } finally {
    try { await pool.end(); } catch (_) {}
  }
})();
