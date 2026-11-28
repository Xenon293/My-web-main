export const TRACKER_SCHEMA_VERSION = 2;
export const PHT_TIME_ZONE = "Asia/Manila";

export function phtDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PHT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function phtWeekday(date = new Date()) {
  const day = new Intl.DateTimeFormat("en-US", {
    timeZone: PHT_TIME_ZONE,
    weekday: "short",
  }).format(date);
  return ({ Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 })[day] ?? 0;
}

export function dayDistance(dueDate, today = phtDateKey()) {
  if (!dueDate) return null;
  const due = Date.parse(`${dueDate}T00:00:00Z`);
  const current = Date.parse(`${today}T00:00:00Z`);
  return Math.round((due - current) / 86_400_000);
}

export function getUrgency(dueDate, today = phtDateKey()) {
  const days = dayDistance(dueDate, today);
  if (days === null) return { key: "none", label: "No due date" };
  if (days < 0) return { key: "overdue", label: "Overdue" };
  if (days === 0) return { key: "today", label: "Due today" };
  if (days === 1) return { key: "tomorrow", label: "Due tomorrow" };
  if (days <= 3) return { key: "soon", label: `Due in ${days} days` };
  return { key: "later", label: `Due in ${days} days` };
}

export function sortAssignments(assignments, today = phtDateKey()) {
  return [...assignments].sort((a, b) => {
    if (Boolean(a.completed) !== Boolean(b.completed)) return Number(Boolean(a.completed)) - Number(Boolean(b.completed));
    const aDate = a.due_date || "9999-12-31";
    const bDate = b.due_date || "9999-12-31";
    return aDate.localeCompare(bDate) || a.title.localeCompare(b.title);
  });
}

export function splitTodayItems(assignments, dailies, now = new Date()) {
  const today = phtDateKey(now);
  const tomorrowDate = new Date(Date.parse(`${today}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  const weekday = phtWeekday(now);
  const activeAssignments = assignments.filter((item) => !item.completed);
  const dueDailies = dailies.filter((item) => !item.completed && (item.days_of_week ?? [0, 1, 2, 3, 4, 5, 6]).includes(weekday));
  return {
    overdue: activeAssignments.filter((item) => item.due_date && item.due_date < today),
    today: [
      ...activeAssignments.filter((item) => item.due_date === today),
      ...dueDailies,
    ],
    tomorrow: activeAssignments.filter((item) => item.due_date === tomorrowDate),
  };
}

export function normalizeAssignment(item) {
  const normalizeTime = (value) => typeof value === "string" && value ? value.slice(0, 5) : "";
  return {
    ...item,
    schema_version: TRACKER_SCHEMA_VERSION,
    subtasks: Array.isArray(item.subtasks) ? item.subtasks.map((subtask) => ({
      ...subtask,
      id: subtask.id || globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      completed: Boolean(subtask.completed),
      start_time: normalizeTime(subtask.start_time),
      end_time: normalizeTime(subtask.end_time),
    })) : [],
    start_time: normalizeTime(item.start_time),
    end_time: normalizeTime(item.end_time),
    penalty_applied: Boolean(item.penalty_applied ?? item.hp_charged),
  };
}

export function getLateXp(assignment, completedOn = phtDateKey()) {
  const base = Number(assignment.xp_reward) || 0;
  const late = Boolean(assignment.due_date && completedOn > assignment.due_date);
  return { xpGain: late ? Math.max(1, Math.floor(base / 2)) : base + (assignment.due_date && completedOn < assignment.due_date ? Number(assignment.bonus_xp || 0) : 0), late };
}

export function getWeeklyReview(events, startDate, endDate) {
  const weekEvents = events.filter((event) => event.date >= startDate && event.date <= endDate);
  return {
    tasksDone: weekEvents.filter((event) => event.type === "task_completed").length,
    tasksMissed: weekEvents.filter((event) => event.type === "task_missed").length,
    xpGained: weekEvents.reduce((total, event) => total + (event.xp_delta ?? 0), 0),
    hpLost: weekEvents.reduce((total, event) => total + Math.max(0, -(event.hp_delta ?? 0)), 0),
    bestStreak: Math.max(0, ...weekEvents.map((event) => event.streak ?? 0)),
  };
}

export function previousWeekRange(now = new Date()) {
  const today = phtDateKey(now);
  const weekday = phtWeekday(now);
  const end = new Date(Date.parse(`${today}T00:00:00Z`) - 7 * 86_400_000);
  const start = new Date(end.getTime() - 6 * 86_400_000);
  const dateString = (date) => date.toISOString().slice(0, 10);
  return { visible: weekday === 0, startDate: dateString(start), endDate: dateString(end) };
}

export function getBestStreak(activity, startDate, endDate) {
  const activeDates = new Set(activity.filter((item) => item.count > 0 && item.date >= startDate && item.date <= endDate).map((item) => item.date));
  let best = 0;
  let current = 0;
  for (let date = Date.parse(`${startDate}T00:00:00Z`); date <= Date.parse(`${endDate}T00:00:00Z`); date += 86_400_000) {
    if (activeDates.has(new Date(date).toISOString().slice(0, 10))) { current += 1; best = Math.max(best, current); }
    else current = 0;
  }
  return best;
}
