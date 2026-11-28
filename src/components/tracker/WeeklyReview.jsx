export function WeeklyReview({ review, onDismiss }) {
  if (!review) return null;
  return <section className="tracker-review" aria-labelledby="tracker-review-title">
    <div className="tracker-review__head"><div><span className="eyebrow">Weekly review · PHT</span><h2 id="tracker-review-title">Last week</h2></div><button type="button" className="tracker-btn tracker-btn--sm" onClick={onDismiss}>Dismiss</button></div>
    <ul className="tracker-review__stats"><li>{review.tasksDone} tasks done</li><li>{review.tasksMissed} tasks missed</li><li>+{review.xpGained} XP</li><li>−{review.hpLost} HP</li><li>{review.bestStreak} day best streak</li></ul>
  </section>;
}
