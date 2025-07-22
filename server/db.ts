import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// For development, create a mock database if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not set, using mock database for development");
}

// Create mock database for development
const mockPool = {
  query: async (sql: string, params?: any[]) => {
    console.log("Mock query:", sql, params);
    return { rows: [] };
  },
  end: async () => {}
};

const mockDb = {
  select: () => ({ from: () => [] }),
  insert: () => ({ values: () => [] }),
  update: () => ({ set: () => ({ where: () => [] }) }),
  delete: () => ({ where: () => [] })
};

export const pool = process.env.DATABASE_URL 
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : mockPool;

export const db = process.env.DATABASE_URL 
  ? drizzle(pool as Pool, { schema })
  : mockDb;