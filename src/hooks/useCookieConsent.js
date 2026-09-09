import { useEffect, useState } from "react";
import { siteConfig } from "../config/site";

export function getOptionalConsent() {
  return window.localStorage.getItem(siteConfig.consentStorageKey) === "accepted";
}

export function useCookieConsent() {
  const [consent, setConsent] = useState(null);
  useEffect(() => {
    setConsent(window.localStorage.getItem(siteConfig.consentStorageKey));
  }, []);
  const decide = (value) => {
    if (value === null) {
      window.localStorage.removeItem(siteConfig.consentStorageKey);
    } else {
      window.localStorage.setItem(siteConfig.consentStorageKey, value);
    }
    setConsent(value);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: value }));
  };
  return { consent, decide, reset: () => decide(null), hasOptionalConsent: consent === "accepted" };
}
