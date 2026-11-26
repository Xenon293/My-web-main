import { LineIcon } from "../LineIcon";

export function RewardsPanel({ rewards, gold = 0, onRedeem, onAdd, onDelete, busyId }) {
  return (
    <section className="tracker-panel" aria-labelledby="tracker-rewards-title">
      <div className="tracker-panel__header">
        <div>
          <span className="eyebrow">Treat yourself</span>
          <h3 id="tracker-rewards-title">Rewards</h3>
        </div>
        <button type="button" className="tracker-btn tracker-btn--sm" onClick={onAdd}>
          <LineIcon name="plus" size={14} />
          <span>Add</span>
        </button>
      </div>

      {rewards.length === 0 ? (
        <p className="tracker-empty">No rewards yet. Add something fun to spend your Gold on.</p>
      ) : (
        <ul className="tracker-list">
          {rewards.map((reward) => {
            const busy = busyId === reward.id;
            const canAfford = gold >= reward.cost;

            return (
              <li className="tracker-item" key={reward.id}>
                <div className="tracker-item__body">
                  <div className="tracker-item__title-row">
                    <span className="tracker-item__title">{reward.title}</span>
                    <span className="tracker-reward-cost" aria-label={`${reward.cost} gold`}>
                      <LineIcon name="star" size={12} />
                      <span>{reward.cost}</span>
                    </span>
                  </div>
                  <span className="tracker-item__meta">
                    Redeemed {reward.redeemed_count ?? 0}×
                  </span>
                </div>

                <button
                  type="button"
                  className="tracker-btn tracker-btn--sm tracker-redeem-btn"
                  onClick={() => onRedeem(reward)}
                  disabled={busy || !canAfford}
                  title={canAfford ? `Redeem for ${reward.cost} Gold` : `Need ${reward.cost - gold} more Gold`}
                >
                  Redeem
                </button>

                <button
                  type="button"
                  className="tracker-delete-btn"
                  onClick={() => onDelete(reward.id)}
                  disabled={busy}
                  aria-label={`Delete reward ${reward.title}`}
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
