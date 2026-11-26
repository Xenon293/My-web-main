import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Returns the current Supabase session.
 *
 * Values:
 *   undefined  — still resolving (show nothing / spinner)
 *   null       — no active session (visitor is not logged in)
 *   Session    — Supabase Session object; use session.user.id for the user UUID
 *
 * Usage:
 *   const session = useAuth();
 *   const userId  = session?.user?.id;   // undefined when not logged in
 *   const isOwner = Boolean(userId);
 */
export function useAuth() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return undefined;
    }

    // Hydrate immediately from the stored session (avoids flicker on reload)
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session ?? null));

    // Keep in sync with sign-in / sign-out events (e.g. magic-link callback)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return session;
}
