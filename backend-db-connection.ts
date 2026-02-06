/**
 * Database Connection
 * PostgreSQL connection with error handling
 */

import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.query('SELECT NOW()', (err: Error | null, res: QueryResult) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('   Check DATABASE_URL in .env file');
  } else {
    console.log('✓ Database connected:', res.rows[0].now);
  }
});

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected database error:', err);
});

/**
 * Execute a query
 */
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed:', { text, duration: `${duration}ms`, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Query error:', { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool (for transactions)
 */
export async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;

  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to track query time
  client.query = (...args: any[]) => {
    return query.apply(client, args);
  };

  // Monkey patch the release method
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };

  return client;
}

export default pool;
