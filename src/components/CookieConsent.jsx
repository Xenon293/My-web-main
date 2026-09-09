import { useCookieConsent } from "../hooks/useCookieConsent";

export function CookieConsent() {
  const { consent, decide, reset } = useCookieConsent();
  if (consent) return <button type="button" className="cookie-settings" onClick={reset}>Privacy settings</button>;
  return <aside className="cookie-consent" role="dialog" aria-labelledby="cookie-title">
    <div className="cookie-copy"><span className="cookie-label" id="cookie-title">Your privacy matters</span>
      <p>Necessary storage keeps preferences working. Optional storage helps show anonymous visitor counts. No advertising cookies are used.</p>
      <a href="/privacy">Privacy &amp; Cookie Policy</a>
    </div>
    <div className="cookie-actions"><button type="button" className="button button-secondary" onClick={() => decide("rejected")}>Reject optional</button><button type="button" className="button" onClick={() => decide("accepted")}>Accept optional</button></div>
  </aside>;
}
