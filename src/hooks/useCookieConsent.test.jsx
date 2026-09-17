import { fireEvent, render, screen } from "@testing-library/react";
import { PrivacyChoiceProvider, useCookieConsent } from "./useCookieConsent";
import { siteConfig } from "../config/site";

function ChoiceProbe() {
  const { consent, decide } = useCookieConsent();
  return <button type="button" onClick={() => decide("accepted")}>{consent || "undecided"}</button>;
}

test("shares a privacy choice immediately and persists it", () => {
  localStorage.removeItem(siteConfig.consentStorageKey);
  render(<PrivacyChoiceProvider><ChoiceProbe /></PrivacyChoiceProvider>);
  fireEvent.click(screen.getByRole("button", { name: "undecided" }));
  expect(screen.getByRole("button", { name: "accepted" })).toBeInTheDocument();
  expect(localStorage.getItem(siteConfig.consentStorageKey)).toBe("accepted");
});
