import { db, ensureSchema } from "./db";

export type Profile = {
  github: string;
  publications: string;
  press: string[];
  field: string;
  salary: string;
  resumeText: string;
};

export async function getProfile(email: string): Promise<Profile | null> {
  await ensureSchema();
  const s = db();
  const rows = await s`
    select github, publications, press, field, salary, resume_text
    from profiles where user_email = ${email}`;
  if (!rows.length) return null;
  const r = rows[0];
  return {
    github: r.github ?? "",
    publications: r.publications ?? "",
    press: (r.press as string[]) ?? [],
    field: r.field ?? "",
    salary: r.salary ?? "",
    resumeText: r.resume_text ?? "",
  };
}

export async function upsertProfile(
  email: string,
  p: Profile,
): Promise<void> {
  await ensureSchema();
  const s = db();
  await s`
    insert into profiles (user_email, github, publications, press, field, salary, resume_text, updated_at)
    values (${email}, ${p.github}, ${p.publications}, ${s.json(p.press)}, ${p.field}, ${p.salary}, ${p.resumeText}, now())
    on conflict (user_email) do update set
      github = excluded.github,
      publications = excluded.publications,
      press = excluded.press,
      field = excluded.field,
      salary = excluded.salary,
      resume_text = excluded.resume_text,
      updated_at = now()`;
}
