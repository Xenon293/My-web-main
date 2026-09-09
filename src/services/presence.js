import { supabase } from "../lib/supabase";
import { siteConfig } from "../config/site";

function browserIdentity() {
  return { getId() { let id = localStorage.getItem(siteConfig.presenceStorageKey); if (!id) { id = crypto.randomUUID(); localStorage.setItem(siteConfig.presenceStorageKey, id); } return id; } };
}

function supabaseRepository(client) {
  return {
    async heartbeat(id, timestamp) { const { error } = await client.from("presence").upsert({ id, last_seen: timestamp }); return !error; },
    async countSince(timestamp) { const { count, error } = await client.from("presence").select("*", { count: "exact", head: true }).gte("last_seen", timestamp); return error || typeof count !== "number" ? null : count; },
  };
}

export function createPresenceModule({ identity, repository, now = () => new Date() }) {
  return { async observe() { const timestamp = now(); const id = identity.getId(); if (!(await repository.heartbeat(id, timestamp.toISOString()))) return { status: "offline" }; const count = await repository.countSince(new Date(timestamp.getTime() - 90_000).toISOString()); return count === null ? { status: "offline" } : { status: "ready", count }; } };
}

export const presence = supabase ? createPresenceModule({ identity: browserIdentity(), repository: supabaseRepository(supabase) }) : null;
