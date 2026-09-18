import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "../config/site";
import { LineIcon } from "./LineIcon";

const CONTRIBUTIONS_URL = "https://github-contributions-api.jogruber.de/v4/Xenon293?y=last";

function normalizeContributions(items) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const firstDay = new Date(`${items[0].date}T00:00:00`).getDay();
  return [
    ...Array.from({ length: firstDay }, (_, index) => ({ placeholder: true, key: `empty-${index}` })),
    ...items.map((item) => ({ ...item, key: item.date })),
  ];
}

export function GitHubActivity() {
  const [state, setState] = useState({ status: "loading", contributions: [], total: 0 });

  useEffect(() => {
    if (typeof fetch !== "function") {
      setState((current) => ({ ...current, status: "error" }));
      return undefined;
    }

    const controller = new AbortController();

    fetch(CONTRIBUTIONS_URL, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub activity is unavailable");
        return response.json();
      })
      .then((data) => {
        setState({
          status: "ready",
          contributions: data.contributions ?? [],
          total: data.total?.lastYear ?? 0,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState((current) => ({ ...current, status: "error" }));
      });

    return () => controller.abort();
  }, []);

  const calendarDays = useMemo(
    () => normalizeContributions(state.contributions),
    [state.contributions],
  );

  return (
    <section className="home-proof-section github-activity" aria-labelledby="github-activity-title">
      <div className="home-section-heading">
        <span className="eyebrow">01 / GitHub</span>
        <div>
          <h2 id="github-activity-title">Learning in public.</h2>
          <p>Small experiments, coursework, and practical projects—one commit at a time.</p>
        </div>
      </div>

      <div className="github-panel">
        <div className="github-panel__header">
          <div>
            <strong>@Xenon293</strong>
            <span aria-live="polite">
              {state.status === "ready" ? `${state.total} contributions in the last year` : "Public GitHub activity"}
            </span>
          </div>
          <a href={siteConfig.github} target="_blank" rel="noopener noreferrer">
            View profile <LineIcon name="arrowUpRight" size={15} />
          </a>
        </div>

        {state.status === "loading" && <div className="github-calendar-state">Loading contribution activity…</div>}
        {state.status === "error" && (
          <div className="github-calendar-state">The live contribution calendar is unavailable right now. My GitHub profile is still available above.</div>
        )}
        {state.status === "ready" && (
          <div className="github-calendar-scroll" role="img" aria-label={`${state.total} GitHub contributions in the last year`}>
            <div className="github-calendar" aria-hidden="true">
              {calendarDays.map((day) => day.placeholder ? (
                <span className="github-day is-empty" key={day.key} />
              ) : (
                <span
                  className="github-day"
                  data-level={day.level}
                  key={day.key}
                  title={`${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
