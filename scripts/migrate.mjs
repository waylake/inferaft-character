import pg from "pg";
import { readdir, readFile } from "node:fs/promises";

const { Pool } = pg;
const url = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/character_poc";
const pool = new Pool({ connectionString: url });

const dir = new URL("../db/migrations/", import.meta.url);
const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();
for (const file of files) {
  await pool.query(await readFile(new URL(file, dir), "utf8"));
  console.log(`applied ${file}`);
}

await pool.end();
console.log("app migration applied");
