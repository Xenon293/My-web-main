import { LineIcon } from "../LineIcon";
import { phtWeekday } from "../../services/trackerLogic";
import { usePhtClock } from "../../hooks/usePhtClock";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function DailiesPanel({ dailies, onComplete, onAdd, onDelete, busyId }) {
  const now = usePhtClock();
  const todayDow = phtWeekday(now);

  const sorted = [...dailies].sort((a, b) => {
    const aDue = a.days_of_week?.includes(todayDow) ? 0 : 1;
    const bDue = b.days_of_week?.includes(todayDow) ? 0 : 1;
    if (aDue !== bDue) return aDue - bDue;
    return Number(a.completed) - Number(b.completed);
  });

  return (
    <section className="tracker-panel" aria-labelledby="tracker-dailies-title">
      <div className="tracker-panel__header">
        <div>
          <span className="eyebrow">Resets midnight PHT</span>
          <h3 id="tracker-dailies-title">Dailies</h3>
        </div>
        <button type="button" className="tracker-btn tracker-btn--sm" onClick={onAdd}>
          <LineIcon name="plus" size={14} />
          <span>Add</span>
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="tracker-empty">No dailies yet. Add things you want to stay on top of every week.</p>
      ) : (
        <ul className="tracker-list">
          {sorted.map((daily) => {
            const dueToday = daily.days_of_week?.includes(todayDow);
            const busy = busyId === daily.id;

            return (
              <li
                className={`tracker-item ${daily.completed ? "is-done" : ""} ${!dueToday ? "is-offday" : ""}`}
                key={daily.id}
              >
                <button
                  type="button"
                  className={`tracker-check-btn ${daily.completed ? "is-checked" : ""}`}
                  onClick={() => onComplete(daily)}
                  disabled={daily.completed || !dueToday || busy}
                  aria-label={daily.completed ? `${daily.title} completed` : `Complete ${daily.title}`}
                >
                  {daily.completed && <LineIcon name="check" size={13} />}
                </button>

                <div className="tracker-item__body">
                  <span className="tracker-item__title">{daily.title}</span>
                  <div className="tracker-item__meta-row">
                    <span className="tracker-item__meta">
                      +{daily.xp_reward} XP · -{daily.hp_penalty} HP if missed
                    </span>
                    <span className="tracker-days-mini" aria-hidden="true">
                      {DAY_LABELS.map((label, idx) => (
                        <span
                          key={idx}
                          className={`tracker-day-pill ${daily.days_of_week?.includes(idx) ? "is-active" : ""} ${idx === todayDow ? "is-today" : ""}`}
                        >
                          {label}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="tracker-delete-btn"
                  onClick={() => onDelete(daily.id)}
                  disabled={busy}
                  aria-label={`Delete daily ${daily.title}`}
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
