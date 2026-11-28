import { dayDistance, getBestStreak, getLateXp, getUrgency, normalizeAssignment, phtDateKey, previousWeekRange, sortAssignments, splitTodayItems } from "./trackerLogic";

test("uses PHT calendar dates across the UTC midnight boundary", () => {
  expect(phtDateKey(new Date("2026-11-28T15:59:00.000Z"))).toBe("2026-11-28");
  expect(phtDateKey(new Date("2026-11-28T16:00:00.000Z"))).toBe("2026-11-29");
});

test("calculates urgency by calendar day", () => {
  expect(dayDistance("2026-11-27", "2026-11-28")).toBe(-1);
  expect(getUrgency("2026-11-28", "2026-11-28").key).toBe("today");
  expect(getUrgency("2026-12-01", "2026-11-28").key).toBe("soon");
});

test("groups assignments and due dailies without including completed work", () => {
  const now = new Date("2026-11-28T08:00:00.000Z"); // Saturday in PHT
  const groups = splitTodayItems([
    { id: "late", due_date: "2026-11-27" },
    { id: "today", due_date: "2026-11-28" },
    { id: "tomorrow", due_date: "2026-11-29" },
    { id: "done", due_date: "2026-11-28", completed: true },
  ], [{ id: "daily", days_of_week: [6], completed: false }], now);
  expect(groups.overdue.map((item) => item.id)).toEqual(["late"]);
  expect(groups.today.map((item) => item.id)).toEqual(["today", "daily"]);
  expect(groups.tomorrow.map((item) => item.id)).toEqual(["tomorrow"]);
});

test("sorts unfinished assignments by deadline and completed work last", () => {
  const sorted = sortAssignments([
    { id: "done", due_date: "2026-01-01", completed: true, title: "Done" },
    { id: "late", due_date: "2026-11-27", title: "Late" },
    { id: "early", due_date: "2026-11-29", title: "Early" },
  ], "2026-11-28");
  expect(sorted.map((item) => item.id)).toEqual(["late", "early", "done"]);
});

test("normalizes old saved assignments and awards reduced late XP", () => {
  expect(normalizeAssignment({ title: "Old" })).toMatchObject({ subtasks: [], start_time: "", end_time: "", penalty_applied: false, schema_version: 2 });
  expect(getLateXp({ due_date: "2026-11-27", xp_reward: 50, bonus_xp: 25 }, "2026-11-28")).toEqual({ xpGain: 25, late: true });
  expect(getLateXp({ due_date: "2026-11-29", xp_reward: 50, bonus_xp: 25 }, "2026-11-28")).toEqual({ xpGain: 75, late: false });
});

test("builds the previous PHT week range and finds its best streak", () => {
  expect(previousWeekRange(new Date("2026-11-29T04:00:00Z"))).toMatchObject({ visible: true, startDate: "2026-11-16", endDate: "2026-11-22" });
  expect(getBestStreak([{ date: "2026-11-16", count: 1 }, { date: "2026-11-17", count: 1 }, { date: "2026-11-19", count: 1 }], "2026-11-16", "2026-11-22")).toBe(2);
});
