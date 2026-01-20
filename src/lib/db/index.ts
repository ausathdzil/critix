import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';

config({ path: '.env.local' });

type DB = ReturnType<typeof drizzle>;

let cachedDb: DB | null = null;

function getDb(): DB {
  if (cachedDb) return cachedDb;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Create a .env.local with DATABASE_URL (see .env.local.example).'
    );
  }

  const sql = neon(connectionString);
  cachedDb = drizzle({ client: sql });
  return cachedDb;
}

// Lazy proxy so importing this module doesn't require env vars at build time.
export const db: DB = new Proxy({} as DB, {
  get(_target, prop) {
    return (getDb() as unknown as Record<PropertyKey, unknown>)[prop];
  },
}) as DB;
