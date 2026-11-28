-- Tracker v2. Review before running in Supabase SQL Editor.
-- Adds private planning fields, review/event storage, rewards, and atomic RPCs.

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS schema_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subtasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS start_time time,
  ADD COLUMN IF NOT EXISTS end_time time,
  ADD COLUMN IF NOT EXISTS penalty_applied boolean NOT NULL DEFAULT false;

UPDATE public.assignments SET penalty_applied = hp_charged WHERE hp_charged AND NOT penalty_applied;
UPDATE public.assignments SET schema_version = 2 WHERE schema_version < 2;

ALTER TABLE public.dailies
  ADD COLUMN IF NOT EXISTS schema_version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS last_completed_date date;
UPDATE public.dailies
SET last_completed_date = (now() AT TIME ZONE 'Asia/Manila')::date
WHERE completed = true AND last_completed_date IS NULL;
UPDATE public.dailies SET schema_version = 2 WHERE schema_version < 2;

CREATE TABLE IF NOT EXISTS public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  cost integer NOT NULL DEFAULT 25 CHECK (cost > 0),
  redeemed_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rewards_owner_all ON public.rewards;
CREATE POLICY rewards_owner_all ON public.rewards FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.tracker_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Manila')::date,
  type text NOT NULL,
  xp_delta integer NOT NULL DEFAULT 0,
  hp_delta integer NOT NULL DEFAULT 0,
  streak integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tracker_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tracker_events_owner_all ON public.tracker_events;
CREATE POLICY tracker_events_owner_all ON public.tracker_events FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.tracker_review_dismissals (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  dismissed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, week_start)
);
ALTER TABLE public.tracker_review_dismissals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tracker_review_dismissals_owner_all ON public.tracker_review_dismissals;
CREATE POLICY tracker_review_dismissals_owner_all ON public.tracker_review_dismissals FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'tracker-penalise-missed-dailies';
SELECT cron.schedule(
  'tracker-penalise-missed-dailies', '1 16 * * *',
  $$
    WITH yesterday_dow AS (
      SELECT EXTRACT(DOW FROM (now() AT TIME ZONE 'Asia/Manila') - INTERVAL '1 day')::int AS dow,
             ((now() AT TIME ZONE 'Asia/Manila')::date - 1) AS missed_date
    ), missed AS (
      SELECT d.user_id, d.hp_penalty, y.missed_date
      FROM public.dailies d JOIN yesterday_dow y ON y.dow = ANY(d.days_of_week)
      WHERE d.last_completed_date IS DISTINCT FROM y.missed_date
    ), totals AS (
      SELECT user_id, SUM(hp_penalty) AS hp_lost FROM missed GROUP BY user_id
    ), applied AS (
      UPDATE public.user_stats s SET hp = GREATEST(0, s.hp - t.hp_lost), updated_at = now()
      FROM totals t WHERE s.id = t.user_id RETURNING s.id
    )
    INSERT INTO public.tracker_events(user_id,date,type,hp_delta)
    SELECT user_id, missed_date, 'task_missed', -hp_penalty FROM missed
  $$
);

CREATE OR REPLACE FUNCTION public.complete_tracker_assignment(assignment_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE a public.assignments%ROWTYPE; s public.user_stats%ROWTYPE; today_pht date := (now() AT TIME ZONE 'Asia/Manila')::date; gained integer; xp_total integer; next_xp integer; next_level integer;
BEGIN
  SELECT * INTO a FROM public.assignments WHERE id = assignment_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND OR a.completed THEN RETURN jsonb_build_object('ok', false); END IF;
  gained := CASE WHEN a.due_date IS NOT NULL AND today_pht > a.due_date THEN GREATEST(1, floor(a.xp_reward / 2.0)::int) ELSE a.xp_reward + CASE WHEN a.due_date IS NOT NULL AND today_pht < a.due_date THEN a.bonus_xp ELSE 0 END END;
  UPDATE public.assignments SET completed = true, completed_at = now() WHERE id = a.id;
  SELECT * INTO s FROM public.user_stats WHERE id = a.user_id FOR UPDATE;
  IF FOUND THEN
    xp_total := s.xp + gained; next_level := s.level; next_xp := s.xp_to_next;
    WHILE xp_total >= next_xp LOOP xp_total := xp_total - next_xp; next_level := next_level + 1; next_xp := next_level * 100; END LOOP;
    UPDATE public.user_stats SET level = next_level, xp = xp_total, xp_to_next = next_xp, updated_at = now() WHERE id = a.user_id;
  END IF;
  INSERT INTO public.activity_log(user_id,date,count) VALUES(a.user_id,today_pht,1) ON CONFLICT(user_id,date) DO UPDATE SET count = public.activity_log.count + 1;
  INSERT INTO public.tracker_events(user_id,date,type,xp_delta) VALUES(a.user_id,today_pht,'task_completed',gained);
  RETURN jsonb_build_object('ok', true, 'xp_gain', gained);
END $$;

CREATE OR REPLACE FUNCTION public.complete_tracker_daily(daily_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE d public.dailies%ROWTYPE; s public.user_stats%ROWTYPE; weekday_pht integer := EXTRACT(DOW FROM (now() AT TIME ZONE 'Asia/Manila'))::integer; today_pht date := (now() AT TIME ZONE 'Asia/Manila')::date; xp_total integer; next_xp integer; next_level integer;
BEGIN
  SELECT * INTO d FROM public.dailies WHERE id = daily_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND OR d.completed OR NOT (weekday_pht = ANY(d.days_of_week)) THEN RETURN jsonb_build_object('ok', false); END IF;
  UPDATE public.dailies SET completed = true, last_completed_date = today_pht, schema_version = 2 WHERE id = d.id;
  SELECT * INTO s FROM public.user_stats WHERE id = d.user_id FOR UPDATE;
  IF FOUND THEN
    xp_total := s.xp + d.xp_reward; next_level := s.level; next_xp := s.xp_to_next;
    WHILE xp_total >= next_xp LOOP xp_total := xp_total - next_xp; next_level := next_level + 1; next_xp := next_level * 100; END LOOP;
    UPDATE public.user_stats SET level = next_level, xp = xp_total, xp_to_next = next_xp, updated_at = now() WHERE id = d.user_id;
  END IF;
  INSERT INTO public.activity_log(user_id,date,count) VALUES(d.user_id,today_pht,1) ON CONFLICT(user_id,date) DO UPDATE SET count = public.activity_log.count + 1;
  INSERT INTO public.tracker_events(user_id,date,type,xp_delta) VALUES(d.user_id,today_pht,'task_completed',d.xp_reward);
  RETURN jsonb_build_object('ok', true, 'xp_gain', d.xp_reward);
END $$;

CREATE OR REPLACE FUNCTION public.apply_overdue_assignment_penalties(owner_id uuid)
RETURNS TABLE(assignment_id uuid, hp_lost integer) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE today_pht date := (now() AT TIME ZONE 'Asia/Manila')::date; a record;
BEGIN
  IF auth.uid() IS NOT NULL AND owner_id <> auth.uid() THEN RAISE EXCEPTION 'Not allowed'; END IF;
  FOR a IN UPDATE public.assignments x SET penalty_applied = true, hp_charged = true
    WHERE x.user_id = owner_id AND NOT x.completed AND NOT x.penalty_applied AND NOT x.hp_charged AND x.due_date < today_pht
    RETURNING x.id, x.user_id, x.hp_penalty
  LOOP
    UPDATE public.user_stats SET hp = GREATEST(0, hp - a.hp_penalty), updated_at = now() WHERE id = owner_id;
    INSERT INTO public.tracker_events(user_id,date,type,hp_delta) VALUES(owner_id,today_pht,'task_missed',-a.hp_penalty);
    assignment_id := a.id; hp_lost := a.hp_penalty; RETURN NEXT;
  END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.apply_overdue_assignment_penalties(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_overdue_assignment_penalties(uuid) TO authenticated;

SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'tracker-penalise-overdue-assignments';
SELECT cron.schedule(
  'tracker-penalise-overdue-assignments', '2 16 * * *',
  $$ SELECT public.apply_overdue_assignment_penalties(id) FROM public.user_stats $$
);

CREATE OR REPLACE FUNCTION public.redeem_tracker_reward(reward_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE r public.rewards%ROWTYPE; s public.user_stats%ROWTYPE;
BEGIN
  SELECT * INTO r FROM public.rewards WHERE id = reward_id AND user_id = auth.uid() FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'unavailable'); END IF;
  SELECT * INTO s FROM public.user_stats WHERE id = auth.uid() FOR UPDATE;
  IF NOT FOUND OR s.gold < r.cost THEN RETURN jsonb_build_object('ok', false, 'reason', 'insufficient_gold'); END IF;
  UPDATE public.user_stats SET gold = gold - r.cost, updated_at = now() WHERE id = auth.uid();
  UPDATE public.rewards SET redeemed_count = redeemed_count + 1 WHERE id = r.id RETURNING redeemed_count INTO r.redeemed_count;
  INSERT INTO public.activity_log(user_id,date,count) VALUES(auth.uid(),(now() AT TIME ZONE 'Asia/Manila')::date,1) ON CONFLICT(user_id,date) DO UPDATE SET count = public.activity_log.count + 1;
  RETURN jsonb_build_object('ok', true, 'redeemed_count', r.redeemed_count);
END $$;
