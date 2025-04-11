import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// ~ ======= schema imports  -->

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Failed to get database URL. Check env variables.");
}
// const client = postgres(databaseUrl, {prepare: false});
// const index = drizzle(client);

declare global {
  var _db: PostgresJsDatabase | undefined;
}

// ~ =============================================>
// ~ ======= Create db instance   -->
// ~ =============================================>
const createDb = (() => {
  return () => {
    if (!global._db) {
      const client = postgres(databaseUrl, { prepare: false });
      global._db = drizzle(client);
    }
    return global._db;
  };
})();

// ~ =============================================>
// ~ ======= Export db instance   -->
// ~ =============================================>
const db = createDb();
export default db;
