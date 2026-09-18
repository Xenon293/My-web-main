import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, test, vi } from "vitest";
import { siteConfig } from "../config/site";
import { PrivacyChoiceProvider } from "../hooks/useCookieConsent";
import { CookieConsent } from "./CookieConsent";

beforeEach(() => localStorage.clear());

function renderConsent(onPrivacyOpen = vi.fn((event) => event.preventDefault())) {
  return render(
    <PrivacyChoiceProvider>
      <CookieConsent onPrivacyOpen={onPrivacyOpen} />
    </PrivacyChoiceProvider>,
  );
}

test("saves a first-visit decision and reopens without resetting it", () => {
  renderConsent();
  fireEvent.click(screen.getByRole("button", { name: "Reject optional" }));

  expect(localStorage.getItem(siteConfig.consentStorageKey)).toBe("rejected");
  const settings = screen.getByRole("button", { name: "Privacy settings" });
  expect(settings).toHaveFocus();

  fireEvent.click(settings);
  expect(screen.getByText(/current choice:/i)).toHaveTextContent("Optional rejected");
  fireEvent.click(screen.getByRole("button", { name: "Accept optional" }));
  expect(localStorage.getItem(siteConfig.consentStorageKey)).toBe("accepted");
});

test("restores a saved decision without showing the card", () => {
  localStorage.setItem(siteConfig.consentStorageKey, "accepted");
  renderConsent();

  expect(screen.getByRole("button", { name: "Privacy settings" })).toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "Your privacy matters" })).not.toBeInTheDocument();
});
