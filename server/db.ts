import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Clean up DATABASE_URL - remove quotes, URL decoding, and psql prefix if present
let databaseUrl = process.env.DATABASE_URL;
// Remove surrounding quotes
databaseUrl = databaseUrl.replace(/^["']|["']$/g, '');
// URL decode
databaseUrl = decodeURIComponent(databaseUrl);
// Remove "psql " prefix if present
databaseUrl = databaseUrl.replace(/^psql\s+/, '');

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle({ client: pool, schema });
