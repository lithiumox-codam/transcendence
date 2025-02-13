import { db } from "./index.ts";
import * as schema from "./schema.ts";

await db.delete(schema.members);
await db.delete(schema.messages);
await db.delete(schema.rooms);
await db.delete(schema.users);
