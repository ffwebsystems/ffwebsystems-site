// Shared helpers for the client portal Pages Functions
// Imported as: import { hashPassword, verifyPassword, ... } from "../_lib/portal.js"

export const SESSION_TTL_HOURS = 24 * 7; // 1 week

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const salt = saltHex
    ? new Uint8Array(saltHex.match(/.{2}/g).map((b) => parseInt(b, 16)))
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  const hashHex = [...new Uint8Array(bits)].map((b) => b.toString(16).padStart(2, "0")).join("");
  const saltHexOut = [...salt].map((b) => b.toString(16).padStart(2, "0")).join("");
  return { hashHex, saltHex: saltHexOut };
}

export async function verifyPassword(password, storedHash, storedSalt) {
  const { hashHex } = await hashPassword(password, storedSalt);
  return hashHex === storedHash;
}

export function newToken() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(new RegExp(`${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function getClientFromSession(request, env) {
  const token = getCookie(request, "session");
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT clients.* FROM sessions
     JOIN clients ON clients.id = sessions.client_id
     WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`
  )
    .bind(token)
    .first();
  return row || null;
}
