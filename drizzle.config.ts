import { defineConfig } from "drizzle-kit";
import { envs } from "./src/envs";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: envs.DATABASE_URL,
  },
});
