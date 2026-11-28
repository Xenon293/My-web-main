import { useState } from "react";
import { LineIcon } from "../LineIcon";
import { getUrgency, normalizeAssignment, phtDateKey, sortAssignments } from "../../services/trackerLogic";
import { usePhtClock } from "../../hooks/usePhtClock";

export function AssignmentsPanel({ assignments, onComplete, onAdd, onDelete, onToggleSubtask, onDeleteSubtask, onUpdateSubtaskTime, onAddSubtask, busyId }) {
  const [drafts, setDrafts] = useState({});
  const now = usePhtClock();
  const today = phtDateKey(now);
  const ordered = sortAssignments(assignments.map(normalizeAssignment));

  return (
    <section className="tracker-panel" aria-labelledby="tracker-assignments-title">
      <div className="tracker-panel__header"><div><span className="eyebrow">School &amp; tasks</span><h3 id="tracker-assignments-title">Assignments</h3></div><button type="button" className="tracker-btn tracker-btn--sm" onClick={onAdd}><LineIcon name="plus" size={14} /><span>Add</span></button></div>
      {ordered.length === 0 ? <p className="tracker-empty">All clear—no assignments added yet.</p> : <ul className="tracker-list">
        {ordered.map((item) => {
          const busy = busyId === item.id;
          const urgency = getUrgency(item.due_date, today);
          const overdue = !item.completed && urgency.key === "overdue";
          const done = item.subtasks.filter((subtask) => subtask.completed).length;
          return <li className={`tracker-item ${item.completed ? "is-done" : ""} ${overdue ? "is-overdue" : ""} ${!item.completed ? `is-urgency-${urgency.key}` : ""}`} key={item.id}>
            <button type="button" className={`tracker-check-btn ${item.completed ? "is-checked" : ""}`} onClick={() => onComplete(item)} disabled={item.completed || busy} aria-label={item.completed ? `${item.title} completed` : `Complete ${item.title}`}>{item.completed && <LineIcon name="check" size={13} />}</button>
            <div className="tracker-item__body">
              <div className="tracker-item__title-row"><span className="tracker-item__title">{item.title}</span><span className={`tracker-urgency tracker-urgency--${urgency.key}`}>{urgency.label}</span></div>
              <span className="tracker-item__meta">{item.subject ? `${item.subject} · ` : ""}{item.due_date || "No due date"} · +{item.xp_reward} XP{overdue && item.penalty_applied ? " · HP penalty applied" : ""}{item.start_time ? ` · ${item.start_time}${item.end_time ? `–${item.end_time}` : ""}` : ""}</span>
              {item.subtasks.length > 0 && <>
                <span className="tracker-item__meta">Progress {done}/{item.subtasks.length}</span>
                <ul className="tracker-subtask-list">{item.subtasks.map((subtask) => <li key={subtask.id} className={subtask.completed ? "is-done" : ""}>
                  <label><input type="checkbox" checked={subtask.completed} disabled={busy || item.completed} onChange={() => onToggleSubtask(item, subtask)} /><span>{subtask.title}</span></label>
                  <div className="tracker-subtask-time"><input aria-label={`Start time for ${subtask.title}`} type="time" value={subtask.start_time} disabled={busy || item.completed} onChange={(event) => onUpdateSubtaskTime(item, subtask, "start_time", event.target.value)} /><input aria-label={`End time for ${subtask.title}`} type="time" value={subtask.end_time} disabled={busy || item.completed} onChange={(event) => onUpdateSubtaskTime(item, subtask, "end_time", event.target.value)} /></div>
                  <button type="button" className="tracker-delete-btn" aria-label={`Delete subtask ${subtask.title}`} disabled={busy || item.completed} onClick={() => onDeleteSubtask(item, subtask)}>Remove</button>
                </li>)}</ul>
              </>}
                  {!item.completed && <form className="tracker-subtask-add" onSubmit={(event) => { event.preventDefault(); const title = (drafts[item.id] || "").trim(); if (title) { onAddSubtask(item, title); setDrafts((current) => ({ ...current, [item.id]: "" })); } }}>
                    <input aria-label={`New subtask for ${item.title}`} value={drafts[item.id] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [item.id]: event.target.value }))} placeholder="Add a subtask" disabled={busy} />
                    <button type="submit" className="tracker-btn tracker-btn--sm" disabled={busy || !(drafts[item.id] || "").trim()}>Add</button>
                  </form>}
            </div>
            <button type="button" className="tracker-delete-btn" onClick={() => onDelete(item.id)} disabled={busy} aria-label={`Delete assignment ${item.title}`}><LineIcon name="trash" size={14} /></button>
          </li>;
        })}
      </ul>}
    </section>
  );
}
