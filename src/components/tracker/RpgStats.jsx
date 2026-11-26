import { LineIcon } from "../LineIcon";

export function RpgStats({ stats, loading, isOwner }) {
  if (loading) {
    return (
      <section className="tracker-stats" aria-label="Character stats">
        <div className="tracker-stats__loading">Loading stats…</div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="tracker-stats" aria-label="Character stats">
        <div className="tracker-stats__empty">
          <span className="eyebrow">Character</span>
          <p>No stats yet. Sign in to set up your character.</p>
        </div>
      </section>
    );
  }

  const hpPct = stats.hp_max > 0 ? Math.min(100, Math.round((stats.hp / stats.hp_max) * 100)) : 0;
  const xpPct = stats.xp_to_next > 0 ? Math.min(100, Math.round((stats.xp / stats.xp_to_next) * 100)) : 0;

  return (
    <section className="tracker-stats" aria-label="Character stats">
      <div className="tracker-stats__head">
        <div className="tracker-stats__identity">
          <span className="tracker-level-badge">LV {stats.level}</span>
          <div>
            <h2>Haniel</h2>
            <span className="tracker-mode-tag">
              {isOwner ? "Signed in · live" : "Public view · read-only"}
            </span>
          </div>
        </div>
        <div className="tracker-gold" aria-label={`${stats.gold} gold`}>
          <LineIcon name="star" size={16} />
          <span>{stats.gold}</span>
          <small>Gold</small>
        </div>
      </div>

      <div className="tracker-bars">
        <div className="tracker-bar-group">
          <div className="tracker-bar-label">
            <span>HP</span>
            <span>{stats.hp} / {stats.hp_max}</span>
          </div>
          <div className="tracker-bar" role="progressbar" aria-valuenow={stats.hp} aria-valuemin={0} aria-valuemax={stats.hp_max} aria-label="Health points">
            <div className="tracker-bar__fill tracker-bar__fill--hp" style={{ width: `${hpPct}%` }} />
          </div>
        </div>

        <div className="tracker-bar-group">
          <div className="tracker-bar-label">
            <span>XP</span>
            <span>{stats.xp} / {stats.xp_to_next}</span>
          </div>
          <div className="tracker-bar" role="progressbar" aria-valuenow={stats.xp} aria-valuemin={0} aria-valuemax={stats.xp_to_next} aria-label="Experience points">
            <div className="tracker-bar__fill tracker-bar__fill--xp" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
