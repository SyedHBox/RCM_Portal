import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file with absolute path
dotenv.config({ path: join(__dirname, '../../.env') });

// Check for required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please set these variables in your .env file');
  // In production, you might want to exit the process here
  // process.exit(1);
}

// Database connection details - no hardcoded values
const DB_HOST = process.env.DB_HOST || '';
const DB_PORT = parseInt(process.env.DB_PORT || '5432');
const DB_NAME = process.env.DB_NAME || '';
const DB_USER = process.env.DB_USER || '';
const DB_PASSWORD = process.env.DB_PASSWORD || '';

// Create a single database pool for the entire application
const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: process.env.DB_SSL_ENABLED === 'false' ? false : { 
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' 
  },
  connectionTimeoutMillis: 15000,    // 15 second timeout
  idleTimeoutMillis: 30000,          // 30 second idle timeout (reduced from 5 min)
  max: 10,                           // Maximum 10 clients in the pool (increased from 3)
  allowExitOnIdle: true,             // Allow pool to clean up idle connections
  application_name: 'project-bolt'   // Identify connections in pg_stat_activity
});

// Silently track connection count with minimal logging
let connectionCount = 0;
let logThrottleTime = Date.now();
const logThrottleInterval = 60000; // Log at most once per minute

// Only log initial connection and throttle subsequent logs heavily
pool.on('connect', client => {
  connectionCount++;
  // Log only once at startup or very occasionally
  if (connectionCount === 1 || Date.now() - logThrottleTime > logThrottleInterval) {
    console.log(`DB pool connection (total: ${connectionCount})`);
    logThrottleTime = Date.now();
  }
});

// Handle connection errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

// Create a wrapper around the pool query with proper error handling
const query = async (text: string, params: any[] = []) => {
  let client;
  try {
    client = await pool.connect();
    return await client.query(text, params);
  } catch (error: any) {
    console.error('Database query error:', error.message);
    throw error;
  } finally {
    if (client) client.release();
  }
};

// Export both the pool and the optimized query function
export default pool;
export { query };