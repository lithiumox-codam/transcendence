import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

export const db = drizzle("../../sqlite.db", { schema });
export * from "./schema.js";
export * from "drizzle-orm/better-sqlite3";
