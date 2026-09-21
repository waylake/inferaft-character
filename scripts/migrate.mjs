import pg from "pg";
import { readFile } from "node:fs/promises";

const { Pool } = pg;
const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/character_poc";
const pool = new Pool({ connectionString: url });
const sql = await readFile(new URL("../db/migrations/001-app.sql", import.meta.url), "utf8");
await pool.query(sql);
await pool.end();
console.log("app migration applied");
