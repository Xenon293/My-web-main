import { useEffect, useState } from "react";

const DAY_NAMES = [
  { idx: 0, label: "Sun" },
  { idx: 1, label: "Mon" },
  { idx: 2, label: "Tue" },
  { idx: 3, label: "Wed" },
  { idx: 4, label: "Thu" },
  { idx: 5, label: "Fri" },
  { idx: 6, label: "Sat" },
];

export function TrackerModal({
  type,
  onClose,
  onCreateHabit,
  onCreateDaily,
  onCreateAssignment,
  onCreateReward,
}) {
  const [title, setTitle] = useState("");
  const [direction, setDirection] = useState("both");
  const [xpReward, setXpReward] = useState(10);
  const [hpCost, setHpCost] = useState(5);
  const [goldDrop, setGoldDrop] = useState(2);

  const [daysOfWeek, setDaysOfWeek] = useState([1, 2, 3, 4, 5]);
  const [hpPenalty, setHpPenalty] = useState(10);

  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [bonusXp, setBonusXp] = useState(25);
  const [cost, setCost] = useState(25);
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!type) return undefined;
    setTitle("");
    setSubject("");
    setDueDate("");
    setSubtasks([]);
    setStartTime("");
    setEndTime("");
    setSubmitting(false);

    if (type === "habit") {
      setDirection("both");
      setXpReward(10);
      setHpCost(5);
      setGoldDrop(2);
    } else if (type === "daily") {
      setDaysOfWeek([1, 2, 3, 4, 5]);
      setXpReward(20);
      setHpPenalty(10);
    } else if (type === "assignment") {
      setPriority("medium");
      setXpReward(50);
      setBonusXp(25);
      setHpPenalty(20);
    } else if (type === "reward") {
      setCost(25);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [type, onClose]);

  if (!type) return null;

  const toggleDay = (idx) => {
    setDaysOfWeek((prev) =>
      prev.includes(idx) ? prev.filter((d) => d !== idx) : [...prev, idx].sort((a, b) => a - b),
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;
    setSubmitting(true);

    if (type === "habit") {
      await onCreateHabit({
        title: title.trim(),
        direction,
        xp_reward: Number(xpReward) || 10,
        hp_cost: Number(hpCost) || 5,
        gold_drop: Number(goldDrop) || 2,
      });
    } else if (type === "daily") {
      await onCreateDaily({
        title: title.trim(),
        days_of_week: daysOfWeek.length ? daysOfWeek : [1, 2, 3, 4, 5],
        xp_reward: Number(xpReward) || 20,
        hp_penalty: Number(hpPenalty) || 10,
      });
    } else if (type === "assignment") {
      await onCreateAssignment({
        title: title.trim(),
        subject: subject.trim(),
        priority,
        due_date: dueDate || null,
        xp_reward: Number(xpReward) || 50,
        bonus_xp: Number(bonusXp) || 25,
        hp_penalty: Number(hpPenalty) || 20,
        subtasks,
        start_time: startTime,
        end_time: endTime,
      });
    } else if (type === "reward") {
      await onCreateReward({
        title: title.trim(),
        cost: Math.max(1, Number(cost) || 25),
      });
    }

    setSubmitting(false);
    onClose();
  };

  const headings = {
    habit: "Add a habit",
    daily: "Add a daily",
    assignment: "Add an assignment",
    reward: "Add a reward",
  };

  return (
    <div className="tracker-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="tracker-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tracker-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="tracker-modal__head">
          <h2 id="tracker-modal-title">{headings[type]}</h2>
          <button type="button" className="tracker-btn tracker-btn--sm" onClick={onClose} aria-label="Close modal">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="tracker-modal__form">
          <label className="tracker-field">
            <span>Title</span>
            <input
              type="text"
              className="tracker-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === "habit"
                  ? "e.g., 30 mins coding practice"
                  : type === "daily"
                    ? "e.g., Review today's notes"
                    : type === "reward"
                      ? "e.g., Iced coffee"
                      : "e.g., Discrete Math Problem Set 4"
              }
              autoFocus
              required
            />
          </label>

          {type === "habit" && (
            <>
              <label className="tracker-field">
                <span>Direction</span>
                <select className="tracker-input" value={direction} onChange={(e) => setDirection(e.target.value)}>
                  <option value="both">Positive &amp; Negative (+ / −)</option>
                  <option value="positive">Positive only (+)</option>
                  <option value="negative">Negative only (−)</option>
                </select>
              </label>
              <div className="tracker-field-row">
                <label className="tracker-field">
                  <span>XP reward</span>
                  <input type="number" min="1" className="tracker-input" value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
                </label>
                <label className="tracker-field">
                  <span>Gold drop</span>
                  <input type="number" min="0" className="tracker-input" value={goldDrop} onChange={(e) => setGoldDrop(e.target.value)} />
                </label>
                <label className="tracker-field">
                  <span>HP cost</span>
                  <input type="number" min="1" className="tracker-input" value={hpCost} onChange={(e) => setHpCost(e.target.value)} />
                </label>
              </div>
            </>
          )}

          {type === "daily" && (
            <>
              <div className="tracker-field">
                <span>Days of week</span>
                <div className="tracker-days-picker">
                  {DAY_NAMES.map((day) => (
                    <button
                      type="button"
                      key={day.idx}
                      className={`tracker-day-toggle ${daysOfWeek.includes(day.idx) ? "is-selected" : ""}`}
                      onClick={() => toggleDay(day.idx)}
                      aria-pressed={daysOfWeek.includes(day.idx)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="tracker-field-row">
                <label className="tracker-field">
                  <span>XP reward</span>
                  <input type="number" min="1" className="tracker-input" value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
                </label>
                <label className="tracker-field">
                  <span>HP penalty</span>
                  <input type="number" min="1" className="tracker-input" value={hpPenalty} onChange={(e) => setHpPenalty(e.target.value)} />
                </label>
              </div>
            </>
          )}

          {type === "assignment" && (
            <>
              <div className="tracker-field">
                <span>Task time (optional)</span>
                <div className="tracker-field-row">
                  <label className="tracker-field"><span>Start</span><input aria-label="Start time" type="time" className="tracker-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></label>
                  <label className="tracker-field"><span>End</span><input aria-label="End time" type="time" className="tracker-input" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></label>
                </div>
              </div>
              <label className="tracker-field">
                <span>Subtasks (optional)</span>
                <div className="tracker-field-row">
                  <input className="tracker-input" value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="e.g., Read chapters 1–2" />
                  <button type="button" className="tracker-btn tracker-btn--sm" disabled={!subtaskTitle.trim()} onClick={() => { setSubtasks((items) => [...items, { title: subtaskTitle.trim(), completed: false }]); setSubtaskTitle(""); }}>Add subtask</button>
                </div>
                {subtasks.length > 0 && <ul className="tracker-subtask-draft">{subtasks.map((item, index) => <li key={`${item.title}-${index}`}>{item.title}<button type="button" className="tracker-delete-btn" aria-label={`Remove ${item.title}`} onClick={() => setSubtasks((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></li>)}</ul>}
              </label>
              <div className="tracker-field-row">
                <label className="tracker-field">
                  <span>Subject</span>
                  <input
                    type="text"
                    className="tracker-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., CS 101"
                  />
                </label>
              </div>
              <label className="tracker-field">
                <span>Due date</span>
                <input type="date" className="tracker-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </label>
              <div className="tracker-field-row">
                <label className="tracker-field">
                  <span>Base XP</span>
                  <input type="number" min="1" className="tracker-input" value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
                </label>
                <label className="tracker-field">
                  <span>Early bonus XP</span>
                  <input type="number" min="0" className="tracker-input" value={bonusXp} onChange={(e) => setBonusXp(e.target.value)} />
                </label>
                <label className="tracker-field">
                  <span>HP penalty</span>
                  <input type="number" min="1" className="tracker-input" value={hpPenalty} onChange={(e) => setHpPenalty(e.target.value)} />
                </label>
              </div>
            </>
          )}

          {type === "reward" && (
            <label className="tracker-field">
              <span>Gold cost</span>
              <input
                type="number"
                min="1"
                className="tracker-input"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                required
              />
            </label>
          )}

          <div className="tracker-modal__actions">
            <button type="button" className="tracker-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="tracker-btn tracker-btn--primary" disabled={submitting || !title.trim()}>
              {submitting ? "Saving…" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
