import { useEffect, useRef } from "react";
import { ROUTES } from "../config/routes";
import { useCookieConsent } from "../hooks/useCookieConsent";

export function PrivacyModal({ open, onClose, returnFocusRef }) {
  const { consent } = useCookieConsent();
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled])')];
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      returnFocusRef.current?.focus();
    };
  }, [onClose, open, returnFocusRef]);

  if (!open) return null;

  return (
    <div className="privacy-modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="privacy-modal privacy-summary" ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="privacy-policy-title">
        <div className="privacy-modal__bar">
          <span>Privacy &amp; cookies</span>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="Close privacy policy">Close</button>
        </div>
        <div className="privacy-summary__body">
          <h2 id="privacy-policy-title">A small, privacy-friendly portfolio.</h2>
          <p>Necessary browser storage remembers your theme and site preferences on this device.</p>
          <p>Optional storage enables only the anonymous live visitor count through Supabase.</p>
          <div className="privacy-summary__status">
            <span>Optional presence</span>
            <strong>{consent === "accepted" ? "Accepted" : consent === "rejected" ? "Rejected" : "Not chosen"}</strong>
          </div>
          <p className="privacy-summary__note">No account, cross-device tracking, or sale of personal information.</p>
          <a className="privacy-modal__full-page" href={ROUTES.privacy.path}>Read the complete Privacy &amp; Cookie Policy <span aria-hidden="true">{"\u2192"}</span></a>
        </div>
      </div>
    </div>
  );
}
