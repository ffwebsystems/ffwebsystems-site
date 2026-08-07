import { json, hashPassword } from "../../_lib/portal.js";

export async function onRequestPost({ request, env }) {
  if (request.headers.get("x-admin-key") !== env.ADMIN_KEY) {
    return json({ error: "Forbidden" }, 403);
  }
  const { username, password, business_name, email } = await request.json();
  if (!username || !password || !business_name) {
    return json({ error: "Missing fields" }, 400);
  }
  const { hashHex, saltHex } = await hashPassword(password);
  await env.DB.prepare(
    `INSERT INTO clients (username, password_hash, password_salt, business_name, email)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(username, hashHex, saltHex, business_name, email || null)
    .run();
  return json({ ok: true });
}
