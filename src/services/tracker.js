import { supabase } from "../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Today's date string in Asia/Manila time — "YYYY-MM-DD" */
function todayPHT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

/** Compute level/xp after gaining `gained` XP. xp_to_next scales as level*100. */
function applyXpGain(level, xp, xpToNext, gained) {
  let lv = level;
  let pts = xp + gained;
  let next = xpToNext;
  while (pts >= next) {
    pts -= next;
    lv += 1;
    next = lv * 100;
  }
  return { level: lv, xp: pts, xp_to_next: next };
}

// ─────────────────────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch the owner's public stats.
 * ownerUserId comes from VITE_OWNER_USER_ID — works for anon visitors too.
 */
export async function getStats(ownerUserId) {
  if (!supabase || !ownerUserId) return null;
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("id", ownerUserId)
    .maybeSingle();
  if (error) { console.error("getStats:", error.message); return null; }
  return data;
}

/** Upsert a default stats row for a newly logged-in owner. */
export async function ensureStats(userId) {
  if (!supabase || !userId) return;
  await supabase
    .from("user_stats")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });
}

/** Add XP (and handle level-up). Pass negative value to deduct XP. */
async function _addXp(userId, gained) {
  const current = await getStats(userId);
  if (!current) return;
  const next = applyXpGain(current.level, current.xp, current.xp_to_next, gained);
  await supabase
    .from("user_stats")
    .update({ ...next, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

/** Add or subtract HP, clamped to [0, hp_max]. */
async function _addHp(userId, delta) {
  const current = await getStats(userId);
  if (!current) return;
  const hp = Math.max(0, Math.min(current.hp_max, current.hp + delta));
  await supabase
    .from("user_stats")
    .update({ hp, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

/** Add gold. */
async function _addGold(userId, amount) {
  const current = await getStats(userId);
  if (!current) return;
  const gold = Math.max(0, current.gold + amount);
  await supabase
    .from("user_stats")
    .update({ gold, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Activity log (drives the heatmap)
// ─────────────────────────────────────────────────────────────────────────────

/** Increment today's activity count by 1 (upsert). */
async function _incrementActivity(userId) {
  const date = todayPHT();
  const { data: existing } = await supabase
    .from("activity_log")
    .select("count")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  const newCount = (existing?.count ?? 0) + 1;
  await supabase
    .from("activity_log")
    .upsert({ user_id: userId, date, count: newCount }, { onConflict: "user_id,date" });
}

/**
 * Fetch the last 52 weeks of activity for the public heatmap.
 * Returns an array of { date: "YYYY-MM-DD", count: number }.
 */
export async function getActivityLog(ownerUserId) {
  if (!supabase || !ownerUserId) return [];
  const since = new Date();
  since.setDate(since.getDate() - 364);
  const sinceStr = since.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });

  const { data, error } = await supabase
    .from("activity_log")
    .select("date, count")
    .eq("user_id", ownerUserId)
    .gte("date", sinceStr)
    .order("date", { ascending: true });

  if (error) { console.error("getActivityLog:", error.message); return []; }
  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Habits
// ─────────────────────────────────────────────────────────────────────────────

export async function getHabits(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) { console.error("getHabits:", error.message); return []; }
  return data ?? [];
}

export async function createHabit(userId, { title, direction = "both", xp_reward = 10, hp_cost = 5, gold_drop = 2 }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, title, direction, xp_reward, hp_cost, gold_drop })
    .select()
    .single();
  if (error) { console.error("createHabit:", error.message); return null; }
  return data;
}

export async function deleteHabit(id) {
  if (!supabase) return;
  await supabase.from("habits").delete().eq("id", id);
}

/**
 * Log a habit click.
 * direction: "positive" → award XP + Gold; "negative" → deduct HP.
 */
export async function logHabit(userId, habit, direction) {
  if (!supabase) return;

  // 1. Record the log entry
  await supabase.from("habit_logs").insert({
    user_id: userId,
    habit_id: habit.id,
    direction,
    date: todayPHT(),
  });

  // 2. Apply RPG stats
  if (direction === "positive") {
    await _addXp(userId, habit.xp_reward);
    await _addGold(userId, habit.gold_drop);
  } else {
    await _addHp(userId, -habit.hp_cost);
  }

  // 3. Increment today's heatmap count
  await _incrementActivity(userId);
}

// ─────────────────────────────────────────────────────────────────────────────
// Dailies
// ─────────────────────────────────────────────────────────────────────────────

export async function getDailies(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("dailies")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) { console.error("getDailies:", error.message); return []; }
  return data ?? [];
}

export async function createDaily(userId, { title, days_of_week = [1, 2, 3, 4, 5], xp_reward = 20, hp_penalty = 10 }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("dailies")
    .insert({ user_id: userId, title, days_of_week, xp_reward, hp_penalty })
    .select()
    .single();
  if (error) { console.error("createDaily:", error.message); return null; }
  return data;
}

export async function completeDaily(userId, daily) {
  if (!supabase || daily.completed) return;
  await supabase.from("dailies").update({ completed: true }).eq("id", daily.id);
  await _addXp(userId, daily.xp_reward);
  await _incrementActivity(userId);
}

export async function deleteDaily(id) {
  if (!supabase) return;
  await supabase.from("dailies").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Assignments
// ─────────────────────────────────────────────────────────────────────────────

export async function getAssignments(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false });
  if (error) { console.error("getAssignments:", error.message); return []; }
  return data ?? [];
}

export async function createAssignment(userId, { title, subject = "", priority = "medium", due_date = null, xp_reward = 50, bonus_xp = 25, hp_penalty = 20 }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("assignments")
    .insert({ user_id: userId, title, subject: subject || null, priority, due_date: due_date || null, xp_reward, bonus_xp, hp_penalty })
    .select()
    .single();
  if (error) { console.error("createAssignment:", error.message); return null; }
  return data;
}

export async function completeAssignment(userId, assignment) {
  if (!supabase || assignment.completed) return;
  const now = new Date().toISOString();
  await supabase
    .from("assignments")
    .update({ completed: true, completed_at: now })
    .eq("id", assignment.id);

  // Award XP: base + bonus if completed before due_date
  const today = todayPHT();
  const isEarly = assignment.due_date && today <= assignment.due_date;
  const xpGain = assignment.xp_reward + (isEarly ? assignment.bonus_xp : 0);
  await _addXp(userId, xpGain);
  await _incrementActivity(userId);

  return { xpGain, bonus: isEarly };
}

export async function deleteAssignment(id) {
  if (!supabase) return;
  await supabase.from("assignments").delete().eq("id", id);
}

// ─────────────────────────────────────────────────────────────────────────────
// Rewards
// ─────────────────────────────────────────────────────────────────────────────

export async function getRewards(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) { console.error("getRewards:", error.message); return []; }
  return data ?? [];
}

export async function createReward(userId, { title, cost = 25 }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("rewards")
    .insert({ user_id: userId, title, cost })
    .select()
    .single();
  if (error) { console.error("createReward:", error.message); return null; }
  return data;
}

export async function deleteReward(rewardId) {
  if (!supabase) return;
  await supabase.from("rewards").delete().eq("id", rewardId);
}

export async function redeemReward(userId, reward) {
  if (!supabase || !userId || !reward) return { ok: false, reason: "unavailable" };

  const current = await getStats(userId);
  if (!current || current.gold < reward.cost) {
    return { ok: false, reason: "insufficient_gold" };
  }

  await _addGold(userId, -reward.cost);

  const nextCount = (reward.redeemed_count ?? 0) + 1;
  const { error } = await supabase
    .from("rewards")
    .update({ redeemed_count: nextCount })
    .eq("id", reward.id);

  if (error) {
    console.error("redeemReward:", error.message);
    return { ok: false, reason: "update_failed" };
  }

  await _incrementActivity(userId);
  return { ok: true, redeemed_count: nextCount };
}
