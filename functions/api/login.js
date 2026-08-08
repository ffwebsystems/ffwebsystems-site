import { json, verifyPassword, newToken, SESSION_TTL_HOURS } from "../_lib/portal.js";

export async function onRequestPost({ request, env }) {
  const { username, password } = await request.json();
  if (!username || !password) return json({ error: "Missing credentials" }, 400);

  const client = await env.DB.prepare("SELECT * FROM clients WHERE username = ?")
    .bind(username)
    .first();
  if (!client) return json({ error: "Invalid username or password" }, 401);

  const ok = await verifyPassword(password, client.password_hash, client.password_salt);
  if (!ok) return json({ error: "Invalid username or password" }, 401);

  const token = newToken();
  const expires = new Date(Date.now() + SESSION_TTL_HOURS * 3600 * 1000).toISOString();
  await env.DB.prepare("INSERT INTO sessions (token, client_id, expires_at) VALUES (?, ?, ?)")
    .bind(token, client.id, expires)
    .run();

  const resp = json({ ok: true, business_name: client.business_name });
  resp.headers.set(
    "set-cookie",
    `session=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_HOURS * 3600}`
  );
  return resp;
}
