import { CookieConsent } from "./CookieConsent";
import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { Presence } from "./Presence";
import { Seo } from "./Seo";
import { useLenisScroll } from "../hooks/useLenisScroll";

export function PageFrame({ children, pathname, project, showPresence = false }) {
  useLenisScroll();

  return (
    <>
      <Seo pathname={pathname} project={project} />
      <Nav />
      {showPresence && <div className="presence-wrap"><Presence /></div>}
      {children}
      <Footer />
      <CookieConsent />
    </>
  );
}
