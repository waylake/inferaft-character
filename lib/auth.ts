import { betterAuth } from "better-auth";
import { Pool } from "pg";

const database = new Pool({ connectionString: process.env.DATABASE_URL });

export const auth = betterAuth({
  database,
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  advanced: { database: { joins: true } },
  user: { changeEmail: { enabled: true } },
});
