import { useEffect, useRef, useState } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";
import { ROUTES } from "../config/routes";

export function CookieConsent({ onPrivacyOpen }) {
  const { consent, decide } = useCookieConsent();
  const [open, setOpen] = useState(() => !consent);
  const settingsButtonRef = useRef(null);
  const restoreSettingsFocusRef = useRef(false);
  const choose = (value) => {
    decide(value);
    restoreSettingsFocusRef.current = true;
    setOpen(false);
  };

  useEffect(() => {
    if (!consent) setOpen(true);
  }, [consent]);

  useEffect(() => {
    document.body.classList.toggle("cookie-banner-open", open);
    return () => document.body.classList.remove("cookie-banner-open");
  }, [open]);

  useEffect(() => {
    if (!open && restoreSettingsFocusRef.current) {
      settingsButtonRef.current?.focus();
      restoreSettingsFocusRef.current = false;
    }
  }, [open]);

  if (!open) return <button ref={settingsButtonRef} type="button" className="cookie-settings" onClick={() => setOpen(true)}>Privacy settings</button>;

  return (
    <aside className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-description">
      {consent && <button type="button" className="cookie-consent__close" onClick={() => setOpen(false)} aria-label="Close privacy settings">Close</button>}
      <div className="cookie-copy">
        <span className="cookie-label" id="cookie-title">Your privacy matters</span>
        <p id="cookie-description">This browser remembers your preferences. Optional storage only enables the anonymous visitor count.</p>
        {consent && <span className="cookie-current">Current choice: <strong>{consent === "accepted" ? "Optional accepted" : "Optional rejected"}</strong></span>}
        <a href={ROUTES.privacy.path} onClick={onPrivacyOpen}>Privacy &amp; Cookie Policy</a>
      </div>
      <div className="cookie-actions">
        <button type="button" className="button button-secondary" onClick={() => choose("rejected")}>Reject optional</button>
        <button type="button" className="button" onClick={() => choose("accepted")}>Accept optional</button>
      </div>
    </aside>
  );
}
