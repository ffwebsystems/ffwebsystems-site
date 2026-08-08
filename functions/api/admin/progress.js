import { json } from "../../_lib/portal.js";

// PATCH /api/admin/progress  { username, progress_stage }
// progress_stage: 0=Design, 1=Development, 2=Review, 3=Live
export async function onRequestPatch({ request, env }) {
  if (request.headers.get("x-admin-key") !== env.ADMIN_KEY) {
    return json({ error: "Forbidden" }, 403);
  }
  const { username, progress_stage } = await request.json();
  if (!username || progress_stage === undefined) {
    return json({ error: "Missing fields" }, 400);
  }
  if (![0, 1, 2, 3].includes(progress_stage)) {
    return json({ error: "progress_stage must be 0-3" }, 400);
  }
  const result = await env.DB.prepare(
    "UPDATE clients SET progress_stage = ? WHERE username = ?"
  )
    .bind(progress_stage, username)
    .run();

  if (result.meta.changes === 0) return json({ error: "Client not found" }, 404);
  return json({ ok: true });
}
