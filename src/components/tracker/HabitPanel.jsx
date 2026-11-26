import { LineIcon } from "../LineIcon";

export function HabitPanel({ habits, onLog, onAdd, onDelete, busyId }) {
  return (
    <section className="tracker-panel" aria-labelledby="tracker-habits-title">
      <div className="tracker-panel__header">
        <div>
          <span className="eyebrow">Good &amp; bad</span>
          <h3 id="tracker-habits-title">Habits</h3>
        </div>
        <button type="button" className="tracker-btn tracker-btn--sm" onClick={onAdd}>
          <LineIcon name="plus" size={14} />
          <span>Add</span>
        </button>
      </div>

      {habits.length === 0 ? (
        <p className="tracker-empty">Nothing here yet. Add a habit you want to build (or break).</p>
      ) : (
        <ul className="tracker-list">
          {habits.map((habit) => {
            const allowPos = habit.direction === "positive" || habit.direction === "both";
            const allowNeg = habit.direction === "negative" || habit.direction === "both";
            const busy = busyId === habit.id;

            return (
              <li className="tracker-item" key={habit.id}>
                <div className="tracker-habit-controls">
                  {allowPos && (
                    <button
                      type="button"
                      className="tracker-icon-btn tracker-icon-btn--pos"
                      onClick={() => onLog(habit, "positive")}
                      disabled={busy}
                      aria-label={`Log positive: ${habit.title}`}
                      title={`+${habit.xp_reward} XP, +${habit.gold_drop} Gold`}
                    >
                      <LineIcon name="plus" size={14} />
                    </button>
                  )}
                  {allowNeg && (
                    <button
                      type="button"
                      className="tracker-icon-btn tracker-icon-btn--neg"
                      onClick={() => onLog(habit, "negative")}
                      disabled={busy}
                      aria-label={`Log negative: ${habit.title}`}
                      title={`-${habit.hp_cost} HP`}
                    >
                      <LineIcon name="minus" size={14} />
                    </button>
                  )}
                </div>

                <div className="tracker-item__body">
                  <span className="tracker-item__title">{habit.title}</span>
                  <span className="tracker-item__meta">
                    {allowPos && `+${habit.xp_reward} XP · +${habit.gold_drop}g`}
                    {allowPos && allowNeg && " · "}
                    {allowNeg && `-${habit.hp_cost} HP`}
                  </span>
                </div>

                <button
                  type="button"
                  className="tracker-delete-btn"
                  onClick={() => onDelete(habit.id)}
                  disabled={busy}
                  aria-label={`Delete habit ${habit.title}`}
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
