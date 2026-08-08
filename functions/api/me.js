import { json, getClientFromSession } from "../_lib/portal.js";

export async function onRequestGet({ request, env }) {
  const client = await getClientFromSession(request, env);
  if (!client) return json({ error: "Not authenticated" }, 401);
  return json({
    id: client.id,
    username: client.username,
    business_name: client.business_name,
    email: client.email,
    progress_stage: client.progress_stage,
    created_at: client.created_at,
  });
}
