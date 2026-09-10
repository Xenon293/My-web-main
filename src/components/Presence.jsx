import { useEffect, useState } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { presence } from "../services/presence";
import { siteConfig } from "../config/site";

export function Presence() {
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState("idle");
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent !== "accepted") {
      setStatus("idle");
      setCount(null);
      return undefined;
    }
    const refresh = async () => {
      try {
        const result = presence ? await presence.observe() : { status: "disabled" };
        setStatus(result.status);
        if (result.status === "ready") setCount(result.count);
      } catch {
        setStatus("disabled");
      }
    };
    refresh();
    const timer = window.setInterval(refresh, siteConfig.presenceIntervalMs);
    return () => window.clearInterval(timer);
  }, [consent]);

  if (status !== "ready") return null;
  const label = `${count} ${count === 1 ? "person" : "people"} viewing now`;
  return (
    <span className={`presence-indicator is-${status}`} aria-label={label}>
      <span className="presence-eye" aria-hidden="true" />
      {label}
    </span>
  );
}
