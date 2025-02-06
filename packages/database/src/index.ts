import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

export const client = createClient({ url: "./sqlite.db" });

export const db = drizzle(client, { schema });

export { schema };
