import { fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { PrivacyModal } from "./PrivacyModal";
import { PrivacyChoiceProvider } from "../hooks/useCookieConsent";

function ModalHarness() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  return (
    <>
      <button ref={triggerRef} type="button" onClick={() => setOpen(true)}>Privacy</button>
      <PrivacyChoiceProvider>
        <PrivacyModal open={open} onClose={() => setOpen(false)} returnFocusRef={triggerRef} />
      </PrivacyChoiceProvider>
    </>
  );
}

test("opens, closes with Escape, and restores focus", () => {
  render(<ModalHarness />);
  const trigger = screen.getByRole("button", { name: "Privacy" });
  fireEvent.click(trigger);

  expect(screen.getByRole("dialog", { name: "A small, privacy-friendly portfolio." })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /read the complete privacy/i })).toHaveAttribute("href", "/privacy");
  expect(screen.getByRole("button", { name: "Close privacy policy" })).toHaveFocus();

  fireEvent.keyDown(window, { key: "Escape" });
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
