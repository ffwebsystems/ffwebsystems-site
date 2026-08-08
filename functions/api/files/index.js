import { json, getClientFromSession } from "../../_lib/portal.js";

export async function onRequestGet({ request, env }) {
  const client = await getClientFromSession(request, env);
  if (!client) return json({ error: "Not authenticated" }, 401);

  const { results } = await env.DB.prepare(
    "SELECT id, filename, content_type, size_bytes, uploaded_at FROM files WHERE client_id = ? ORDER BY uploaded_at DESC"
  )
    .bind(client.id)
    .all();
  return json({ files: results });
}
