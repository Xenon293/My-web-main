import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "../components/AuthGate";
import { LineIcon } from "../components/LineIcon";
import { AssignmentsPanel } from "../components/tracker/AssignmentsPanel";
import { DailiesPanel } from "../components/tracker/DailiesPanel";
import { HabitPanel } from "../components/tracker/HabitPanel";
import { RewardsPanel } from "../components/tracker/RewardsPanel";
import { RpgStats } from "../components/tracker/RpgStats";
import { TrackerHeatmap } from "../components/tracker/TrackerHeatmap";
import { TrackerModal } from "../components/tracker/TrackerModal";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";
import {
  completeAssignment,
  completeDaily,
  createAssignment,
  createDaily,
  createHabit,
  createReward,
  deleteAssignment,
  deleteDaily,
  deleteHabit,
  deleteReward,
  ensureStats,
  getActivityLog,
  getAssignments,
  getDailies,
  getHabits,
  getRewards,
  getStats,
  logHabit,
  redeemReward,
} from "../services/tracker";

const OWNER_USER_ID = import.meta.env.VITE_OWNER_USER_ID;

export default function TrackerPage() {
  const session = useAuth();
  const userId = session?.user?.id;
  const isOwner = Boolean(userId && (!OWNER_USER_ID || userId === OWNER_USER_ID));
  const publicUserId = OWNER_USER_ID || userId;

  const [showAuth, setShowAuth] = useState(false);
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loadingPublic, setLoadingPublic] = useState(true);
  const [publicError, setPublicError] = useState("");

  const [habits, setHabits] = useState([]);
  const [dailies, setDailies] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loadingPrivate, setLoadingPrivate] = useState(false);

  const [modal, setModal] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState("");

  const notify = useCallback((message) => {
    setToast(message);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const refreshPublic = useCallback(async () => {
    if (!OWNER_USER_ID && session === undefined) return;
    if (!publicUserId) {
      setStats(null);
      setActivity([]);
      setPublicError("Public tracker data is not configured. Add VITE_OWNER_USER_ID to the site environment and rebuild.");
      setLoadingPublic(false);
      return;
    }
    if (!supabase) {
      setStats(null);
      setActivity([]);
      setPublicError("Tracker data is unavailable. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
      setLoadingPublic(false);
      return;
    }
    setLoadingPublic(true);
    setPublicError("");
    try {
      const [nextStats, nextActivity] = await Promise.all([
        getStats(publicUserId, { throwOnError: true }),
        getActivityLog(publicUserId, { throwOnError: true }),
      ]);
      setStats(nextStats);
      setActivity(nextActivity);
    } catch {
      setStats(null);
      setActivity([]);
      setPublicError("Could not load public tracker data. Check the Supabase settings and try again.");
    } finally {
      setLoadingPublic(false);
    }
  }, [publicUserId, session]);

  const refreshPrivate = useCallback(async () => {
    if (!isOwner || !userId) return;
    setLoadingPrivate(true);
    await ensureStats(userId);
    const [h, d, a, r] = await Promise.all([
      getHabits(userId),
      getDailies(userId),
      getAssignments(userId),
      getRewards(userId),
    ]);
    setHabits(h);
    setDailies(d);
    setAssignments(a);
    setRewards(r);
    setLoadingPrivate(false);
  }, [isOwner, userId]);

  useEffect(() => {
    refreshPublic();
  }, [refreshPublic]);

  useEffect(() => {
    if (isOwner) {
      setShowAuth(false);
      refreshPrivate().then(refreshPublic);
    } else {
      setHabits([]);
      setDailies([]);
      setAssignments([]);
      setRewards([]);
    }
  }, [isOwner, refreshPrivate, refreshPublic]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    notify("Signed out.");
  };

  const handleLogHabit = async (habit, direction) => {
    if (!userId || busyId) return;
    setBusyId(habit.id);
    await logHabit(userId, habit, direction);
    await refreshPublic();
    setBusyId(null);
    notify(
      direction === "positive"
        ? `Nice! +${habit.xp_reward} XP · +${habit.gold_drop}g`
        : `Ouch, -${habit.hp_cost} HP`,
    );
  };

  const handleDeleteHabit = async (id) => {
    setBusyId(id);
    await deleteHabit(id);
    setHabits((prev) => prev.filter((item) => item.id !== id));
    setBusyId(null);
  };

  const handleCreateHabit = async (payload) => {
    if (!userId) return;
    const created = await createHabit(userId, payload);
    if (created) setHabits((prev) => [...prev, created]);
  };

  const handleCompleteDaily = async (daily) => {
    if (!userId || daily.completed || busyId) return;
    setBusyId(daily.id);
    await completeDaily(userId, daily);
    setDailies((prev) => prev.map((d) => (d.id === daily.id ? { ...d, completed: true } : d)));
    await refreshPublic();
    setBusyId(null);
    notify(`Checked off! +${daily.xp_reward} XP`);
  };

  const handleDeleteDaily = async (id) => {
    setBusyId(id);
    await deleteDaily(id);
    setDailies((prev) => prev.filter((item) => item.id !== id));
    setBusyId(null);
  };

  const handleCreateDaily = async (payload) => {
    if (!userId) return;
    const created = await createDaily(userId, payload);
    if (created) setDailies((prev) => [...prev, created]);
  };

  const handleCompleteAssignment = async (assignment) => {
    if (!userId || assignment.completed || busyId) return;
    setBusyId(assignment.id);
    const result = await completeAssignment(userId, assignment);
    setAssignments((prev) =>
      prev.map((a) => (a.id === assignment.id ? { ...a, completed: true } : a)),
    );
    await refreshPublic();
    setBusyId(null);
    if (result) {
      notify(result.bonus ? `Turned in early! +${result.xpGain} XP` : `Done! +${result.xpGain} XP`);
    }
  };

  const handleDeleteAssignment = async (id) => {
    setBusyId(id);
    await deleteAssignment(id);
    setAssignments((prev) => prev.filter((item) => item.id !== id));
    setBusyId(null);
  };

  const handleCreateAssignment = async (payload) => {
    if (!userId) return;
    const created = await createAssignment(userId, payload);
    if (created) setAssignments((prev) => [...prev, created]);
  };

  const handleCreateReward = async (payload) => {
    if (!userId) return;
    const created = await createReward(userId, payload);
    if (created) setRewards((prev) => [...prev, created]);
  };

  const handleDeleteReward = async (id) => {
    setBusyId(id);
    await deleteReward(id);
    setRewards((prev) => prev.filter((item) => item.id !== id));
    setBusyId(null);
  };

  const handleRedeemReward = async (reward) => {
    if (!userId || busyId) return;
    if ((stats?.gold ?? 0) < reward.cost) {
      notify(`Need ${reward.cost - (stats?.gold ?? 0)} more Gold`);
      return;
    }

    setBusyId(reward.id);
    setStats((prev) => (prev ? { ...prev, gold: Math.max(0, prev.gold - reward.cost) } : prev));
    setRewards((prev) =>
      prev.map((item) =>
        item.id === reward.id
          ? { ...item, redeemed_count: (item.redeemed_count ?? 0) + 1 }
          : item,
      ),
    );

    const result = await redeemReward(userId, reward);
    await refreshPublic();
    setBusyId(null);

    if (result?.ok) {
      notify(`Treated yourself to "${reward.title}" (-${reward.cost}g)`);
    } else {
      await refreshPrivate();
      notify("Couldn't redeem that right now");
    }
  };

  return (
    <main className="tracker-page" id="top">
      <header className="tracker-header">
        <div>
          <span className="eyebrow">Daily grind · PHT</span>
          <h1>Habit &amp; Study Tracker</h1>
          <p>
            How I keep myself accountable with studying, daily routines, and deadlines. My stats
            and heatmap are public—my actual to-do list stays private.
          </p>
        </div>
        <div className="tracker-header__actions">
          {isOwner ? (
            <button type="button" className="tracker-btn" onClick={handleSignOut}>
              <LineIcon name="signOut" size={15} />
              <span>Sign out</span>
            </button>
          ) : (
            session !== undefined &&
            !session && (
              <button
                type="button"
                className="tracker-btn"
                onClick={() => setShowAuth((prev) => !prev)}
                aria-expanded={showAuth}
              >
                <LineIcon name="lock" size={15} />
                <span>{showAuth ? "Close" : "Admin"}</span>
              </button>
            )
          )}
        </div>
      </header>

      {showAuth && !session && (
        <section className="tracker-auth-wrap" aria-label="Owner sign in">
          <AuthGate>{() => null}</AuthGate>
        </section>
      )}

      {toast && (
        <div className="tracker-toast" role="status" aria-live="polite">
          {toast}
        </div>
      )}

      {publicError && (
        <div className="tracker-error-banner" role="alert">
          <span>{publicError}</span>
          <button type="button" className="tracker-btn tracker-btn--sm" onClick={refreshPublic}>
            Retry
          </button>
        </div>
      )}

      <RpgStats stats={stats} loading={loadingPublic} error={publicError} isOwner={isOwner} />
      <TrackerHeatmap activity={activity} loading={loadingPublic} error={publicError} />

      {isOwner ? (
        <section className="tracker-workspace" aria-label="Task workspace">
          {loadingPrivate ? (
            <div className="tracker-grid" aria-busy="true" aria-label="Loading workspace">
              <div className="tracker-panel tracker-panel--skeleton">
                <span className="tracker-skeleton tracker-skeleton--title" />
                <span className="tracker-skeleton tracker-skeleton--row" />
                <span className="tracker-skeleton tracker-skeleton--row" />
              </div>
              <div className="tracker-panel tracker-panel--skeleton">
                <span className="tracker-skeleton tracker-skeleton--title" />
                <span className="tracker-skeleton tracker-skeleton--row" />
                <span className="tracker-skeleton tracker-skeleton--row" />
              </div>
            </div>
          ) : (
            <div className="tracker-grid">
              <HabitPanel
                habits={habits}
                onLog={handleLogHabit}
                onAdd={() => setModal("habit")}
                onDelete={handleDeleteHabit}
                busyId={busyId}
              />
              <DailiesPanel
                dailies={dailies}
                onComplete={handleCompleteDaily}
                onAdd={() => setModal("daily")}
                onDelete={handleDeleteDaily}
                busyId={busyId}
              />
              <AssignmentsPanel
                assignments={assignments}
                onComplete={handleCompleteAssignment}
                onAdd={() => setModal("assignment")}
                onDelete={handleDeleteAssignment}
                busyId={busyId}
              />
              <RewardsPanel
                rewards={rewards}
                gold={stats?.gold ?? 0}
                onRedeem={handleRedeemReward}
                onAdd={() => setModal("reward")}
                onDelete={handleDeleteReward}
                busyId={busyId}
              />
            </div>
          )}
        </section>
      ) : (
        <section className="tracker-public-note" aria-label="Private workspace notice">
          <LineIcon name="lock" size={16} />
          <p>
            My actual habits, dailies, and deadlines are hidden here, but you can still see my
            live stats and consistency above.
          </p>
        </section>
      )}

      <TrackerModal
        type={modal}
        onClose={() => setModal(null)}
        onCreateHabit={handleCreateHabit}
        onCreateDaily={handleCreateDaily}
        onCreateAssignment={handleCreateAssignment}
        onCreateReward={handleCreateReward}
      />
    </main>
  );
}
