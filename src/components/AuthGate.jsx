import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

/**
 * AuthGate — wraps the private (editable) portion of the Tracker page.
 *
 * Public visitors never see this component rendered; instead, TrackerPage
 * renders the read-only public showcase and mounts AuthGate only for the
 * hidden admin panel.  AuthGate itself only shows the sign-in form when
 * the user navigates to /tracker/login or when the subtle "Admin" button
 * is clicked.
 *
 * Props:
 *   children  — the full interactive workspace (passed session + userId)
 *   onSession — optional callback(session) called when session resolves
 */
export function AuthGate({ children, onSession }) {
  const session = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Notify parent of resolved session (so TrackerPage can unlock panels)
  if (onSession && session !== undefined) {
    onSession(session);
  }

  // Still resolving — render nothing (parent shows public content already)
  if (session === undefined) return null;

  // Active session — render the private workspace
  if (session) {
    return children(session);
  }

  // No session — render the minimal magic-link form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("Supabase is not configured. Check your .env file and restart the dev server.");
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          // Redirect back to /tracker after clicking the magic link
          emailRedirectTo: `${window.location.origin}/tracker`,
        },
      });
      if (authError) {
        setError(authError.message);
      } else {
        setSent(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send magic link.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="tracker-auth-confirm">
        <span className="eyebrow">Admin access</span>
        <p>Magic link sent — check your email and click the link to continue.</p>
      </div>
    );
  }

  return (
    <div className="tracker-auth">
      <span className="eyebrow">Admin access</span>
      <h2>Sign in</h2>
      <p>Enter your email to receive a one-time sign-in link.</p>
      <form onSubmit={handleSubmit} className="tracker-auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="tracker-input"
          autoComplete="email"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="tracker-btn tracker-btn--primary"
          disabled={loading || !email.trim()}
        >
          {loading ? "Sending…" : "Send magic link"}
        </button>
      </form>
      {error && <p className="tracker-auth-error">{error}</p>}
    </div>
  );
}
