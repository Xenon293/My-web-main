import { useEffect, useState } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { presence } from "../services/presence";
import { siteConfig } from "../config/site";

export function Presence() {
  const [count, setCount] = useState(null);
  const [status, setStatus] = useState("loading");
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent !== "accepted") {
      setStatus("offline");
      return undefined;
    }
    const refresh = async () => {
      const result = presence ? await presence.observe() : { status: "offline" };
      setStatus(result.status);
      if (result.status === "ready") setCount(result.count);
    };
    refresh();
    const timer = window.setInterval(refresh, siteConfig.presenceIntervalMs);
    return () => window.clearInterval(timer);
  }, [consent]);

  const label =
    status === "offline"
      ? "presence unavailable"
      : status === "loading"
        ? "checking presence"
        : `${count} ${count === 1 ? "person" : "people"} viewing now`;
  return (
    <span className={`presence-indicator is-${status}`} aria-label={label}>
      <span className="presence-eye" aria-hidden="true" />
      {label}
    </span>
  );
}
