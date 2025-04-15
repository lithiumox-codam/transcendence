import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.ts";

// Initialize better-sqlite3 database connection
const sqlite = new Database("../../sqlite.db");

// Create drizzle database instance with the schema
export const db = drizzle(sqlite, { schema });