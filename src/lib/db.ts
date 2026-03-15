import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const env = process.env.PROJECT_ENVIRONMENT || "development";
const connectionString = (env === "production" 
  ? process.env.DB_PRODUCTION_URL 
  : process.env.DATABASE_URL)?.trim();

console.log(`[Database] Mode: ${env}`);

if (!connectionString || connectionString.includes("your-supabase-connection-string-here")) {
  console.error(`ERROR: connection string for ${env} is not configured in .env`);
} else {
  try {
    const url = new URL(connectionString);
    console.log(`[Database] Hostname: ${url.hostname}`);
  } catch (e) {
    console.error("[Database] Invalid DATABASE_URL format");
  }
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Successfully connected to PostgreSQL');
  release();
});

// Helper for simple queries
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Close pool on process termination
process.on("SIGTERM", () => {
  pool.end();
});
