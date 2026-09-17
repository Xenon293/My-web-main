import { render, waitFor } from "@testing-library/react";
import { Presence } from "./Presence";
import { siteConfig } from "../config/site";
import { PrivacyChoiceProvider } from "../hooks/useCookieConsent";

test("does not render or contact presence without optional consent", async () => {
  localStorage.setItem(siteConfig.consentStorageKey, "rejected");
  const { container } = render(<PrivacyChoiceProvider><Presence /></PrivacyChoiceProvider>);
  await waitFor(() => expect(container).toBeEmptyDOMElement());
});
