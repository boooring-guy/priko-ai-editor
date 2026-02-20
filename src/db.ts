// Make sure to install the 'pg' package
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./db/schema";
import { envs } from "./envs";

const pool = new Pool({
  connectionString: envs.DATABASE_URL,
});

export const db = drizzle({ client: pool, schema });
