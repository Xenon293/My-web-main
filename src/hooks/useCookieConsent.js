import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { siteConfig } from "../config/site";

const PrivacyChoiceContext = createContext(null);

function readConsent() {
  return window.localStorage.getItem(siteConfig.consentStorageKey);
}

export function getOptionalConsent() {
  return readConsent() === "accepted";
}

export function PrivacyChoiceProvider({ children }) {
  const [consent, setConsent] = useState(readConsent);

  useEffect(() => {
    const syncAcrossTabs = (event) => {
      if (event.key === siteConfig.consentStorageKey) setConsent(event.newValue);
    };
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

  const decide = useCallback((value) => {
    if (value === null) {
      window.localStorage.removeItem(siteConfig.consentStorageKey);
    } else {
      window.localStorage.setItem(siteConfig.consentStorageKey, value);
    }
    setConsent(value);
  }, []);

  const value = useMemo(() => ({
    consent,
    decide,
    reset: () => decide(null),
    hasOptionalConsent: consent === "accepted",
  }), [consent, decide]);

  return createElement(PrivacyChoiceContext.Provider, { value }, children);
}

export function useCookieConsent() {
  const choice = useContext(PrivacyChoiceContext);
  if (!choice) throw new Error("useCookieConsent must be used inside PrivacyChoiceProvider");
  return choice;
}
