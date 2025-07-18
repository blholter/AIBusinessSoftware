import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Check if we're in development mode and have a placeholder database URL
const isDevelopment = process.env.NODE_ENV === 'development';
const hasPlaceholderDB = process.env.DATABASE_URL?.includes('placeholder');

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// In development with placeholder DB, create a mock database
let pool: any;
let db: any;

if (isDevelopment && hasPlaceholderDB) {
  console.log('⚠️  Using mock database for development. Some features may not work.');
  
  // Create mock database objects
  pool = {
    query: async () => ({ rows: [] }),
    end: async () => {},
  };
  
  // Create a more comprehensive mock database
  const createMockQueryBuilder = (mockData: any[] = []) => {
    return {
      from: () => ({
        orderBy: () => Promise.resolve(mockData),
        where: () => ({
          limit: () => Promise.resolve(mockData),
          eq: () => Promise.resolve(mockData)
        }),
        limit: () => Promise.resolve(mockData)
      }),
      where: () => ({
        limit: () => Promise.resolve(mockData),
        eq: () => Promise.resolve(mockData)
      }),
      values: () => Promise.resolve({ rows: mockData }),
      set: () => ({
        where: () => Promise.resolve({ rows: mockData })
      })
    };
  };

  db = {
    select: () => createMockQueryBuilder(),
    insert: () => createMockQueryBuilder(),
    update: () => createMockQueryBuilder(),
    delete: () => createMockQueryBuilder(),
  };
} else {
  pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
}

export { pool, db };