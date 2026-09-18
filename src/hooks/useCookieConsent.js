import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { siteConfig } from "../config/site";

const PrivacyChoiceContext = createContext(null);
const VALID_CONSENT = new Set(["accepted", "rejected"]);

function normalizeConsent(value) {
  return VALID_CONSENT.has(value) ? value : null;
}

function readConsent() {
  return normalizeConsent(window.localStorage.getItem(siteConfig.consentStorageKey));
}

export function getOptionalConsent() {
  return readConsent() === "accepted";
}

export function PrivacyChoiceProvider({ children }) {
  const [consent, setConsent] = useState(readConsent);

  useEffect(() => {
    const syncAcrossTabs = (event) => {
      if (event.key === siteConfig.consentStorageKey) setConsent(normalizeConsent(event.newValue));
    };
    window.addEventListener("storage", syncAcrossTabs);
    return () => window.removeEventListener("storage", syncAcrossTabs);
  }, []);

  const decide = useCallback((value) => {
    const nextValue = normalizeConsent(value);
    if (value === null) {
      window.localStorage.removeItem(siteConfig.consentStorageKey);
    } else if (nextValue) {
      window.localStorage.setItem(siteConfig.consentStorageKey, nextValue);
    } else {
      return;
    }
    setConsent(nextValue);
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
