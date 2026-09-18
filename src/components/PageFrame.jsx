import { useCallback, useRef, useState } from "react";
import { CookieConsent } from "./CookieConsent";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { Presence } from "./Presence";
import { PrivacyModal } from "./PrivacyModal";
import { Seo } from "./Seo";
import { useLenisScroll } from "../hooks/useLenisScroll";

export function PageFrame({ children, pathname, project, showPresence = false }) {
  useLenisScroll();
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const privacyTriggerRef = useRef(null);
  const openPrivacy = useCallback((event) => {
    event.preventDefault();
    privacyTriggerRef.current = event.currentTarget;
    setPrivacyOpen(true);
  }, []);
  const closePrivacy = useCallback(() => setPrivacyOpen(false), []);

  return (
    <>
      <Seo pathname={pathname} project={project} />
      <Nav />
      {showPresence && <div className="presence-wrap"><Presence /></div>}
      {children}
      <Footer onPrivacyOpen={openPrivacy} />
      <CookieConsent onPrivacyOpen={openPrivacy} />
      <PrivacyModal open={privacyOpen} onClose={closePrivacy} returnFocusRef={privacyTriggerRef} />
    </>
  );
}
