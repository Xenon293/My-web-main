import { getUrgency, splitTodayItems } from "../../services/trackerLogic";
import { usePhtClock } from "../../hooks/usePhtClock";

function PlanSection({ title, items, onComplete, isDaily = false }) {
  return <section className="tracker-today-section"><h3>{title}</h3>{items.length ? <ul className="tracker-today-list">{items.map((item) => {
    const urgency = isDaily ? null : getUrgency(item.due_date);
    const scheduled = item.start_time || item.subtasks?.find((subtask) => subtask.start_time)?.start_time || "";
    const daily = isDaily || Array.isArray(item.days_of_week);
    return <li key={`${daily ? "daily" : "assignment"}-${item.id}`} className={urgency?.key === "overdue" ? "is-overdue" : ""}>
      <button type="button" onClick={() => onComplete(item, daily)} aria-label={`Complete ${item.title}`}>Done</button>
      <div><strong>{item.title}</strong><span>{scheduled ? `${scheduled}${item.end_time ? `–${item.end_time}` : ""} · ` : ""}{daily ? "Daily" : urgency?.label}</span></div>
    </li>;
  })}</ul> : <p className="tracker-empty">Nothing due in this section.</p>}</section>;
}

export function TodayPlan({ assignments, dailies, onCompleteAssignment, onCompleteDaily }) {
  const now = usePhtClock();
  const sections = splitTodayItems(assignments, dailies, now);
  const bySchedule = (items) => [...items].sort((a, b) => (a.start_time || a.subtasks?.find((item) => item.start_time)?.start_time || "99:99").localeCompare(b.start_time || b.subtasks?.find((item) => item.start_time)?.start_time || "99:99"));
  const todayItems = bySchedule(sections.today);
  return <section className="tracker-today" aria-labelledby="tracker-today-title">
    <div className="tracker-panel__header"><div><span className="eyebrow">Your next steps · PHT</span><h2 id="tracker-today-title">Today</h2></div></div>
    <div className="tracker-today-grid">
      <PlanSection title="Overdue" items={sections.overdue} onComplete={onCompleteAssignment} now={now} />
      <PlanSection title="Due today" items={todayItems} onComplete={(item, daily) => daily ? onCompleteDaily(item) : onCompleteAssignment(item)} />
      <PlanSection title="Due tomorrow" items={sections.tomorrow} onComplete={onCompleteAssignment} now={now} />
    </div>
    {sections.overdue.length + sections.today.length + sections.tomorrow.length === 0 && <p className="tracker-empty">Nothing urgent right now. Add an assignment or daily when something needs tracking.</p>}
  </section>;
}
