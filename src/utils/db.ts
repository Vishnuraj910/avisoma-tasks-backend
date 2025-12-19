import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.DB_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected PG client error", err);
  process.exit(1);
});

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<{ rows: T[] }> {
  const res = await pool.query(text, params);
  return { rows: res.rows as T[] };
}
