import postgres from "postgres";

let sql: ReturnType<typeof postgres> | null = null;

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL not set — create a free Postgres DB (Neon or Supabase) and add it to .env.local",
    );
  }
  sql ??= postgres(process.env.DATABASE_URL, { ssl: "require" });
  return sql;
}

let schemaReady: Promise<void> | null = null;

// Lazily create tables on first use — no migration step needed for a demo.
export function ensureSchema(): Promise<void> {
  schemaReady ??= (async () => {
    const s = db();
    await s`create table if not exists profiles (
      user_email text primary key,
      github text,
      publications text,
      press jsonb default '[]'::jsonb,
      field text,
      salary text,
      resume_text text,
      updated_at timestamptz default now()
    )`;
  })();
  return schemaReady;
}
