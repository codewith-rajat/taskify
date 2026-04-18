import pg from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'project_management',
  ssl: process.env.DB_HOST?.includes('supabase') ? { rejectUnauthorized: false } : false,
  family: 4,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
