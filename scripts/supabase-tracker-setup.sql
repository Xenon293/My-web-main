-- =============================================================================
--  TRACKER SETUP — Run this once in your Supabase SQL Editor
--  (Dashboard → SQL Editor → New query → paste → Run)
--
--  Sections:
--    1. Extensions
--    2. Tables
--    3. Row Level Security policies
--    4. pg_cron scheduled jobs
-- =============================================================================


-- =============================================================================
-- 1. Extensions
-- =============================================================================

-- pg_cron: for midnight reset jobs (may already be enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;


-- =============================================================================
-- 2. Tables
-- =============================================================================

-- ---------------------------------------------------------------------------
-- user_stats
-- One row per user. Stores RPG character state.
-- PUBLIC readable (anon can read), only owner can write.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_stats (
  id          uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  level       integer     NOT NULL DEFAULT 1,
  xp          integer     NOT NULL DEFAULT 0,
  xp_to_next  integer     NOT NULL DEFAULT 100,
  hp          integer     NOT NULL DEFAULT 100,
  hp_max      integer     NOT NULL DEFAULT 100,
  gold        integer     NOT NULL DEFAULT 0,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- habits
-- Repeatable positive / negative actions.
-- PRIVATE — owner only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title       text        NOT NULL,
  -- 'positive' | 'negative' | 'both'
  direction   text        NOT NULL DEFAULT 'both'
                          CHECK (direction IN ('positive', 'negative', 'both')),
  xp_reward   integer     NOT NULL DEFAULT 10,
  hp_cost     integer     NOT NULL DEFAULT 5,
  gold_drop   integer     NOT NULL DEFAULT 2,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- habit_logs
-- One row for every time the owner clicks +/- on a habit.
-- Drives the heatmap count. PRIVATE — owner only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  habit_id    uuid        REFERENCES public.habits (id) ON DELETE SET NULL,
  -- 'positive' | 'negative'
  direction   text        NOT NULL CHECK (direction IN ('positive', 'negative')),
  logged_at   timestamptz NOT NULL DEFAULT now(),
  -- Date stored in Asia/Manila time so the heatmap aligns with local midnight
  date        date        NOT NULL
                          DEFAULT (now() AT TIME ZONE 'Asia/Manila')::date
);

-- ---------------------------------------------------------------------------
-- dailies
-- Recurring tasks tied to specific days of the week.
-- PRIVATE — owner only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dailies (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title        text        NOT NULL,
  -- Array of ISO weekday integers: 0 = Sunday … 6 = Saturday
  days_of_week integer[]   NOT NULL DEFAULT '{1,2,3,4,5}',
  completed    boolean     NOT NULL DEFAULT false,
  xp_reward    integer     NOT NULL DEFAULT 20,
  -- HP deducted at midnight if the daily was due today but not completed
  hp_penalty   integer     NOT NULL DEFAULT 10,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- assignments
-- One-off tasks with optional due dates and priority levels.
-- PRIVATE — owner only.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  title         text        NOT NULL,
  subject       text,
  -- 'low' | 'medium' | 'high'
  priority      text        NOT NULL DEFAULT 'medium'
                            CHECK (priority IN ('low', 'medium', 'high')),
  due_date      date,
  completed     boolean     NOT NULL DEFAULT false,
  completed_at  timestamptz,
  xp_reward     integer     NOT NULL DEFAULT 50,
  -- Bonus XP when completed before due_date
  bonus_xp      integer     NOT NULL DEFAULT 25,
  -- HP deducted at midnight if due_date has passed and still incomplete
  hp_penalty    integer     NOT NULL DEFAULT 20,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- activity_log
-- One row per (user, local date). Stores completion count for the heatmap.
-- PUBLIC readable — visitors can see the heatmap.
-- Only owner can write.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.activity_log (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  -- Date in Asia/Manila time
  date        date        NOT NULL,
  count       integer     NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);


-- =============================================================================
-- 3. Row Level Security Policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- user_stats  → PUBLIC read, owner write
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read the owner's stats for the public showcase
CREATE POLICY "stats_public_read"
  ON public.user_stats
  FOR SELECT
  USING (true);

-- Only the authenticated owner may insert their own row
CREATE POLICY "stats_owner_insert"
  ON public.user_stats
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Only the authenticated owner may update their own row
CREATE POLICY "stats_owner_update"
  ON public.user_stats
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Only the authenticated owner may delete their own row
CREATE POLICY "stats_owner_delete"
  ON public.user_stats
  FOR DELETE
  USING (id = auth.uid());

-- ---------------------------------------------------------------------------
-- habits  → PRIVATE, owner only
-- ---------------------------------------------------------------------------
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habits_owner_all"
  ON public.habits
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- habit_logs  → PRIVATE, owner only
-- ---------------------------------------------------------------------------
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "habit_logs_owner_all"
  ON public.habit_logs
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- dailies  → PRIVATE, owner only
-- ---------------------------------------------------------------------------
ALTER TABLE public.dailies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dailies_owner_all"
  ON public.dailies
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- assignments  → PRIVATE, owner only
-- ---------------------------------------------------------------------------
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assignments_owner_all"
  ON public.assignments
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- activity_log  → PUBLIC read, owner write
-- ---------------------------------------------------------------------------
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Anyone can read the heatmap data
CREATE POLICY "activity_public_read"
  ON public.activity_log
  FOR SELECT
  USING (true);

CREATE POLICY "activity_owner_insert"
  ON public.activity_log
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "activity_owner_update"
  ON public.activity_log
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "activity_owner_delete"
  ON public.activity_log
  FOR DELETE
  USING (user_id = auth.uid());


-- =============================================================================
-- 4. pg_cron Scheduled Jobs  (all times are UTC; PHT = UTC+8)
--    Midnight PHT = 16:00 UTC the previous calendar day.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Job 1 — Reset dailies at midnight PHT (16:00 UTC)
-- Sets completed = false for all dailies.
-- Note: pg_cron runs as a superuser, so RLS is bypassed — this is intentional.
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'tracker-reset-dailies',
  '0 16 * * *',
  $$
    UPDATE public.dailies
    SET    completed = false
    WHERE  completed = true;
  $$
);

-- ---------------------------------------------------------------------------
-- Job 2 — Penalise missed dailies (runs 1 minute after reset)
-- For each daily that was due "yesterday" in PHT time and was NOT completed
-- before the reset, deduct hp_penalty from the owner's user_stats.
-- ---------------------------------------------------------------------------
SELECT cron.schedule(
  'tracker-penalise-missed-dailies',
  '1 16 * * *',
  $$
    WITH yesterday_dow AS (
      -- Day-of-week for "yesterday" in Asia/Manila  (0 = Sun … 6 = Sat)
      SELECT EXTRACT(DOW FROM
        (now() AT TIME ZONE 'Asia/Manila') - INTERVAL '1 day'
      )::int AS dow
    ),
    missed AS (
      SELECT d.user_id,
             SUM(d.hp_penalty) AS total_penalty
      FROM   public.dailies d
      JOIN   yesterday_dow y ON (y.dow = ANY(d.days_of_week))
      WHERE  d.completed = false          -- not yet reset; we check before reset fires
      GROUP  BY d.user_id
    )
    UPDATE public.user_stats s
    SET    hp         = GREATEST(0, s.hp - m.total_penalty),
           updated_at = now()
    FROM   missed m
    WHERE  s.id = m.user_id;
  $$
);

-- ---------------------------------------------------------------------------
-- Job 3 — Penalise overdue assignments (runs 2 minutes after reset)
-- For each incomplete assignment whose due_date < today in PHT, deduct hp_penalty.
-- Does NOT re-penalise on subsequent days (see NOTE below).
-- ---------------------------------------------------------------------------
-- NOTE: To avoid daily re-penalisation we add an `hp_charged` boolean column.
ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS hp_charged boolean NOT NULL DEFAULT false;

SELECT cron.schedule(
  'tracker-penalise-overdue-assignments',
  '2 16 * * *',
  $$
    WITH today_pht AS (
      SELECT (now() AT TIME ZONE 'Asia/Manila')::date AS today
    ),
    overdue AS (
      SELECT a.user_id,
             SUM(a.hp_penalty) AS total_penalty
      FROM   public.assignments a
      CROSS  JOIN today_pht t
      WHERE  a.completed  = false
        AND  a.hp_charged = false
        AND  a.due_date   < t.today
      GROUP  BY a.user_id
    )
    UPDATE public.user_stats s
    SET    hp         = GREATEST(0, s.hp - o.total_penalty),
           updated_at = now()
    FROM   overdue o
    WHERE  s.id = o.user_id;

    -- Mark those assignments so they are not charged again tomorrow
    UPDATE public.assignments a
    SET    hp_charged = true
    FROM   today_pht t
    WHERE  a.completed  = false
      AND  a.hp_charged = false
      AND  a.due_date   < t.today;
  $$
);


-- =============================================================================
-- 5. Helper: seed the owner's stats row
-- =============================================================================
-- After you log in for the first time via magic link, run this to create
-- your stats row (replace the UUID with YOUR auth.users id from the dashboard):
--
--   INSERT INTO public.user_stats (id)
--   VALUES ('<your-auth-user-uuid>')
--   ON CONFLICT (id) DO NOTHING;
--
-- Then copy that UUID into your .env as: VITE_OWNER_USER_ID=<uuid>
