import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.ts";

// check if its production if so use the production path
const location =
    process.env.NODE_ENV === "production"
        ? "/app/data/sqlite.db"
        : "../../sqlite.db";

// Initialize better-sqlite3 database connection
const sqlite = new Database(location);

// Create drizzle database instance with the schema
export const db = drizzle(sqlite, { schema });
