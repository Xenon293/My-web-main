import { useEffect } from "react";
import { useCookieConsent } from "../hooks/useCookieConsent";

export function CookieConsent() {
  const { consent, decide, reset } = useCookieConsent();
  useEffect(() => {
    document.body.classList.toggle("cookie-banner-open", !consent);
    return () => document.body.classList.remove("cookie-banner-open");
  }, [consent]);

  if (consent) return <button type="button" className="cookie-settings" onClick={reset}>Privacy settings</button>;

  return (
    <aside className="cookie-consent" role="dialog" aria-modal="false" aria-labelledby="cookie-title" aria-describedby="cookie-description">
      <div className="cookie-copy">
        <span className="cookie-label" id="cookie-title">Your privacy matters</span>
        <p id="cookie-description">Necessary storage keeps preferences working. Optional storage helps show anonymous visitor counts.</p>
        <a href="/privacy">Privacy &amp; Cookie Policy</a>
      </div>
      <div className="cookie-actions">
        <button type="button" className="button button-secondary" onClick={() => decide("rejected")}>Reject optional</button>
        <button type="button" className="button" onClick={() => decide("accepted")}>Accept optional</button>
      </div>
    </aside>
  );
}
