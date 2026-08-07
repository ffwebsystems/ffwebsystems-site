import { json, getClientFromSession } from "../_lib/portal.js";

export async function onRequestPost({ request, env }) {
  const client = await getClientFromSession(request, env);
  if (!client) return json({ error: "Not authenticated" }, 401);

  const form = await request.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") return json({ error: "No file provided" }, 400);

  const key = `client-${client.id}/${Date.now()}-${file.name}`;
  await env.FILES.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  await env.DB.prepare(
    `INSERT INTO files (client_id, r2_key, filename, content_type, size_bytes)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(client.id, key, file.name, file.type, file.size)
    .run();

  return json({ ok: true, filename: file.name });
}
