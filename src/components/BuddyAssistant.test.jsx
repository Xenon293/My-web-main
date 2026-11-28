import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BuddyAssistant } from "./BuddyAssistant";

vi.mock("./BuddyAnswer", () => ({
  BuddyAnswer: ({ children }) => <div>{children}</div>,
  hasStructuredBuddyFormatting: () => false,
  normalizeBuddyMarkdown: (value) => value,
}));

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ json: async () => ({ answer: "Here is the answer." }) }));
  vi.stubGlobal("matchMedia", () => ({ matches: true, addListener: vi.fn(), removeListener: vi.fn() }));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("Enter submits the Buddy prompt", async () => {
  render(<BuddyAssistant />);
  const input = screen.getByLabelText("What would you like to learn or know?");
  fireEvent.change(input, { target: { value: "Explain fractions" } });
  fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

  await waitFor(() => expect(fetch).toHaveBeenCalledWith("/api/ask-buddy", expect.objectContaining({ method: "POST" })));
  expect(await screen.findByText("Here is the answer.")).toBeInTheDocument();
});

test("Shift+Enter keeps the newline behavior and does not submit", () => {
  render(<BuddyAssistant />);
  const input = screen.getByLabelText("What would you like to learn or know?");
  fireEvent.change(input, { target: { value: "First line" } });
  const event = new KeyboardEvent("keydown", { key: "Enter", shiftKey: true, bubbles: true, cancelable: true });
  input.dispatchEvent(event);

  expect(event.defaultPrevented).toBe(false);
  expect(fetch).not.toHaveBeenCalled();
});
