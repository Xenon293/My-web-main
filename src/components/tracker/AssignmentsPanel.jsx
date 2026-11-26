import { LineIcon } from "../LineIcon";

function todayPHT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

export function AssignmentsPanel({ assignments, onComplete, onAdd, onDelete, busyId }) {
  const today = todayPHT();
  const active = assignments.filter((a) => !a.completed);
  const done = assignments.filter((a) => a.completed);
  const ordered = [...active, ...done];

  return (
    <section className="tracker-panel" aria-labelledby="tracker-assignments-title">
      <div className="tracker-panel__header">
        <div>
          <span className="eyebrow">School &amp; tasks</span>
          <h3 id="tracker-assignments-title">Assignments</h3>
        </div>
        <button type="button" className="tracker-btn tracker-btn--sm" onClick={onAdd}>
          <LineIcon name="plus" size={14} />
          <span>Add</span>
        </button>
      </div>

      {ordered.length === 0 ? (
        <p className="tracker-empty">All clear—no assignments added yet.</p>
      ) : (
        <ul className="tracker-list">
          {ordered.map((item) => {
            const busy = busyId === item.id;
            const overdue = !item.completed && item.due_date && item.due_date < today;

            return (
              <li
                className={`tracker-item ${item.completed ? "is-done" : ""} ${overdue ? "is-overdue" : ""}`}
                key={item.id}
              >
                <button
                  type="button"
                  className={`tracker-check-btn ${item.completed ? "is-checked" : ""}`}
                  onClick={() => onComplete(item)}
                  disabled={item.completed || busy}
                  aria-label={item.completed ? `${item.title} completed` : `Complete ${item.title}`}
                >
                  {item.completed && <LineIcon name="check" size={13} />}
                </button>

                <div className="tracker-item__body">
                  <div className="tracker-item__title-row">
                    <span className="tracker-item__title">{item.title}</span>
                    <span className={`tracker-priority tracker-priority--${item.priority}`}>
                      {item.priority}
                    </span>
                  </div>
                  <span className="tracker-item__meta">
                    {item.subject ? `${item.subject} · ` : ""}
                    {item.due_date ? (overdue ? `Overdue (${item.due_date})` : `Due ${item.due_date}`) : "No due date"}
                    {" · "}
                    +{item.xp_reward} XP
                    {item.due_date && !item.completed ? ` (+${item.bonus_xp} early)` : ""}
                  </span>
                </div>

                <button
                  type="button"
                  className="tracker-delete-btn"
                  onClick={() => onDelete(item.id)}
                  disabled={busy}
                  aria-label={`Delete assignment ${item.title}`}
                >
                  <LineIcon name="trash" size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
