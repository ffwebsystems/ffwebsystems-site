import { json, getClientFromSession } from "../../_lib/portal.js";

export async function onRequestGet({ request, env, params }) {
  const client = await getClientFromSession(request, env);
  if (!client) return json({ error: "Not authenticated" }, 401);

  const fileRow = await env.DB.prepare("SELECT * FROM files WHERE id = ? AND client_id = ?")
    .bind(params.id, client.id)
    .first();
  if (!fileRow) return json({ error: "File not found" }, 404);

  const object = await env.FILES.get(fileRow.r2_key);
  if (!object) return json({ error: "File missing from storage" }, 404);

  return new Response(object.body, {
    headers: {
      "content-type": fileRow.content_type || "application/octet-stream",
      "content-disposition": `attachment; filename="${fileRow.filename}"`,
    },
  });
}
