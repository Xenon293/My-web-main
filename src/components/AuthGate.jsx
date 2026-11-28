import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { siteConfig } from "../config/site";

const RESEND_COOLDOWN_SECONDS = 60;

export function AuthGate({ children, onSession }) {
  const session = useAuth();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) return undefined;
    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setCooldownSeconds(remaining);
      if (remaining === 0) setCooldownUntil(0);
    };
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  if (onSession && session !== undefined) onSession(session);
  if (session === undefined) return null;
  if (session) return children(session);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const normalizedEmail = email.trim();
    if (cooldownSeconds > 0) return;
    if (!supabase) {
      setError("Supabase is not configured. Check your .env file and restart the dev server.");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: { emailRedirectTo: `${siteConfig.siteUrl.replace(/\/$/, "")}/tracker` },
      });
      if (authError) {
        const message = authError.message || "Could not send the sign-in link. Please try again.";
        setError(/rate.?limit|too many requests/i.test(message)
          ? `Email rate limit reached. Please wait before trying again. ${message}`
          : message);
      } else {
        setSentTo(normalizedEmail);
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
        setCooldownUntil(Date.now() + RESEND_COOLDOWN_SECONDS * 1000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send magic link.";
      setError(/rate.?limit|too many requests/i.test(message)
        ? `Email rate limit reached. Please wait before trying again. ${message}`
        : message);
    } finally {
      setLoading(false);
    }
  };

  if (sentTo) {
    return (
      <div className="tracker-auth-confirm">
        <span className="eyebrow">Admin access</span>
        <p>Magic link sent to <strong>{sentTo}</strong>. Check your email and click the link to continue.</p>
        <button
          type="button"
          className="tracker-btn tracker-btn--primary"
          onClick={() => { setEmail(sentTo); setSentTo(""); setError(""); }}
          disabled={cooldownSeconds > 0 || loading}
        >
          {cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : "Resend magic link"}
        </button>
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
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          className="tracker-input"
          autoComplete="email"
          required
          disabled={loading}
        />
        <button
          type="submit"
          className="tracker-btn tracker-btn--primary"
          disabled={loading || cooldownSeconds > 0 || !email.trim()}
        >
          {loading ? "Sending…" : cooldownSeconds > 0 ? `Resend in ${cooldownSeconds}s` : "Send magic link"}
        </button>
      </form>
      {error && <p className="tracker-auth-error" role="alert">{error}</p>}
    </div>
  );
}
