import { supabase } from "../lib/supabase";
import { getLateXp, normalizeAssignment, phtDateKey, phtWeekday } from "./trackerLogic";

const newSubtaskId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Today's date string in Asia/Manila time — "YYYY-MM-DD" */
function todayPHT() {
  return phtDateKey();
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
export async function getStats(ownerUserId, { throwOnError = false } = {}) {
  if (!supabase || !ownerUserId) return null;
  const { data, error } = await supabase
    .from("user_stats")
    .select("*")
    .eq("id", ownerUserId)
    .maybeSingle();
  if (error) {
    console.error("getStats:", error.message);
    if (throwOnError) throw error;
    return null;
  }
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

async function _recordEvent(userId, { type, xp_delta = 0, hp_delta = 0 }) {
  if (!supabase) return;
  const { error } = await supabase.from("tracker_events").insert({ user_id: userId, date: todayPHT(), type, xp_delta, hp_delta });
  if (error) console.error("recordTrackerEvent:", error.message);
}

/**
 * Fetch the last 52 weeks of activity for the public heatmap.
 * Returns an array of { date: "YYYY-MM-DD", count: number }.
 */
export async function getActivityLog(ownerUserId, { throwOnError = false } = {}) {
  if (!supabase || !ownerUserId) return [];
  const since = new Date(`${todayPHT()}T00:00:00Z`);
  since.setUTCDate(since.getUTCDate() - 364);
  const sinceStr = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("activity_log")
    .select("date, count")
    .eq("user_id", ownerUserId)
    .gte("date", sinceStr)
    .order("date", { ascending: true });

  if (error) {
    console.error("getActivityLog:", error.message);
    if (throwOnError) throw error;
    return [];
  }
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
    await _recordEvent(userId, { type: "habit_completed", xp_delta: habit.xp_reward });
  } else {
    await _addHp(userId, -habit.hp_cost);
    await _recordEvent(userId, { type: "habit_penalty", hp_delta: -habit.hp_cost });
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
    .insert({ user_id: userId, title, days_of_week, xp_reward, hp_penalty, schema_version: 2 })
    .select()
    .single();
  if (error) { console.error("createDaily:", error.message); return null; }
  return data;
}

export async function completeDaily(userId, daily) {
  if (!supabase || daily.completed || !(daily.days_of_week ?? []).includes(phtWeekday())) return false;
  const { data, error } = await supabase.rpc("complete_tracker_daily", { daily_id: daily.id });
  if (error) { console.error("completeDaily:", error.message); return false; }
  return Boolean(data?.ok);
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
  return (data ?? []).map(normalizeAssignment);
}

export async function createAssignment(userId, { title, subject = "", priority = "medium", due_date = null, xp_reward = 50, bonus_xp = 25, hp_penalty = 20, subtasks = [], start_time = "", end_time = "" }) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("assignments")
    .insert({ user_id: userId, title, subject: subject || null, priority, due_date: due_date || null, xp_reward, bonus_xp, hp_penalty, subtasks: subtasks.map((item) => ({ ...item, id: item.id || newSubtaskId(), completed: false, start_time: item.start_time || "", end_time: item.end_time || "" })), start_time: start_time || null, end_time: end_time || null, schema_version: 2 })
    .select()
    .single();
  if (error) { console.error("createAssignment:", error.message); return null; }
  return normalizeAssignment(data);
}

export async function updateAssignmentSubtasks(assignment, subtasks) {
  if (!supabase) return null;
  const { data, error } = await supabase.from("assignments").update({ subtasks, schema_version: 2 }).eq("id", assignment.id).select().single();
  if (error) { console.error("updateAssignmentSubtasks:", error.message); return null; }
  return normalizeAssignment(data);
}

export async function updateSubtaskTime(assignment, subtaskId, field, value) {
  if (!["start_time", "end_time"].includes(field)) return null;
  const subtasks = assignment.subtasks.map((item) => item.id === subtaskId ? { ...item, [field]: value } : item);
  return updateAssignmentSubtasks(assignment, subtasks);
}

export async function applyOverduePenalties(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.rpc("apply_overdue_assignment_penalties", { owner_id: userId });
  if (error) { console.error("applyOverduePenalties:", error.message); return []; }
  return data ?? [];
}

export async function completeAssignment(userId, assignment) {
  if (!supabase || assignment.completed) return;
  const { data, error } = await supabase.rpc("complete_tracker_assignment", { assignment_id: assignment.id });
  if (error) { console.error("completeAssignment:", error.message); return null; }
  if (!data?.ok) return null;
  const { xpGain, late } = getLateXp(assignment);
  return { xpGain: data.xp_gain ?? xpGain, bonus: Boolean(assignment.due_date && todayPHT() < assignment.due_date), late };
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
  const { data, error } = await supabase.rpc("redeem_tracker_reward", { reward_id: reward.id });
  if (error) { console.error("redeemReward:", error.message); return { ok: false, reason: "update_failed" }; }
  return data?.ok ? { ok: true, redeemed_count: data.redeemed_count } : { ok: false, reason: data?.reason || "insufficient_gold" };
}

export async function getWeeklyEvents(userId, startDate, endDate) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from("tracker_events").select("date,type,xp_delta,hp_delta,streak").eq("user_id", userId).gte("date", startDate).lte("date", endDate);
  if (error) { console.error("getWeeklyEvents:", error.message); return null; }
  return data ?? [];
}

export async function dismissWeeklyReview(userId, weekStart) {
  if (!supabase || !userId) return false;
  const { error } = await supabase.from("tracker_review_dismissals").upsert({ user_id: userId, week_start: weekStart }, { onConflict: "user_id,week_start" });
  if (error) { console.error("dismissWeeklyReview:", error.message); return false; }
  return true;
}

export async function getDismissedReviews(userId) {
  if (!supabase || !userId) return [];
  const { data, error } = await supabase.from("tracker_review_dismissals").select("week_start").eq("user_id", userId);
  if (error) { console.error("getDismissedReviews:", error.message); return null; }
  return (data ?? []).map((row) => row.week_start);
}
