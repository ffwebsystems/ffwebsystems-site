import { json, getCookie } from "../_lib/portal.js";

export async function onRequestPost({ request, env }) {
  const token = getCookie(request, "session");
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token = ?").bind(token).run();
  const resp = json({ ok: true });
  resp.headers.set("set-cookie", "session=; Path=/; HttpOnly; Max-Age=0");
  return resp;
}
