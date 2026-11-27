import { useMemo } from "react";

function todayPHT() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Manila" });
}

function addDays(dateStr, delta) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + delta));
  return dt.toISOString().slice(0, 10);
}

function dayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function countToLevel(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function TrackerHeatmap({ activity, loading }) {
  const { cells, totalActions, streak } = useMemo(() => {
    const map = new Map((activity ?? []).map((row) => [row.date, row.count]));
    const today = todayPHT();
    const start = addDays(today, -363);
    const leadingEmpty = dayOfWeek(start);

    const items = [];
    for (let i = 0; i < leadingEmpty; i += 1) {
      items.push({ placeholder: true, key: `empty-${i}` });
    }

    let total = 0;
    for (let i = 0; i < 364; i += 1) {
      const date = addDays(start, i);
      const count = map.get(date) ?? 0;
      total += count;
      items.push({ date, count, level: countToLevel(count), key: date });
    }

    let currentStreak = 0;
    let cursor = today;
    if ((map.get(cursor) ?? 0) === 0) {
      cursor = addDays(cursor, -1);
    }
    while ((map.get(cursor) ?? 0) > 0) {
      currentStreak += 1;
      cursor = addDays(cursor, -1);
    }

    return { cells: items, totalActions: total, streak: currentStreak };
  }, [activity]);

  return (
    <section className="tracker-heatmap" aria-labelledby="tracker-heatmap-title">
      <div className="tracker-heatmap__header">
        <div>
          <span className="eyebrow">Last 52 weeks · PHT</span>
          <h2 id="tracker-heatmap-title">Consistency</h2>
        </div>
        <div className="tracker-heatmap__meta">
          <span><strong>{totalActions}</strong> actions</span>
          <span><strong>{streak}d</strong> streak</span>
        </div>
      </div>

      {loading ? (
        <div className="tracker-heatmap__skeleton" aria-busy="true" aria-label="Loading heatmap">
          <span className="tracker-skeleton tracker-skeleton--heatmap" />
        </div>
      ) : (
        <div className="tracker-calendar-scroll" role="img" aria-label={`${totalActions} tracked actions in the last 52 weeks`}>
          <div className="tracker-calendar" aria-hidden="true">
            {cells.map((cell) =>
              cell.placeholder ? (
                <span className="tracker-day is-empty" key={cell.key} />
              ) : (
                <span
                  className="tracker-day"
                  data-level={cell.level}
                  key={cell.key}
                  title={`${cell.count} action${cell.count === 1 ? "" : "s"} on ${cell.date}`}
                />
              ),
            )}
          </div>
        </div>
      )}

      <div className="tracker-heatmap__legend" aria-hidden="true">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <span className="tracker-day" data-level={lvl} key={lvl} />
        ))}
        <span>More</span>
      </div>
    </section>
  );
}
