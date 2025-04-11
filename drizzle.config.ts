import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("Failed to get database URL. Check env variables.");
}

export default defineConfig({
  schema: "./src/services/db/schema/*",
  dialect: "postgresql",
  out: "./src/services/db/migrations",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: false,
  strict: true,
});
