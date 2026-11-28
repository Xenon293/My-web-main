import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AuthGate } from "./AuthGate";

const mocks = vi.hoisted(() => ({
  signInWithOtp: vi.fn(),
}));

vi.mock("../hooks/useAuth", () => ({ useAuth: () => null }));
vi.mock("../lib/supabase", () => ({
  supabase: { auth: { signInWithOtp: mocks.signInWithOtp } },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.signInWithOtp.mockResolvedValue({ error: null });
});

test("shows sent email and a resend cooldown after successful sign-in link request", async () => {
  render(<AuthGate>{() => null}</AuthGate>);
  fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
    target: { value: "student@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send magic link" }));

  expect(await screen.findByText(/Magic link sent to/)).toHaveTextContent("student@example.com");
  expect(screen.getByRole("button", { name: "Resend in 60s" })).toBeDisabled();
  expect(mocks.signInWithOtp).toHaveBeenCalledWith({
    email: "student@example.com",
    options: { emailRedirectTo: `${window.location.origin}/tracker` },
  });
});

test("shows readable rate limit errors and resets the sending state", async () => {
  mocks.signInWithOtp.mockResolvedValue({ error: { message: "Too many requests" } });
  render(<AuthGate>{() => null}</AuthGate>);
  fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
    target: { value: "student@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send magic link" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Email rate limit reached");
  await waitFor(() => expect(screen.getByRole("button", { name: "Send magic link" })).toBeEnabled());
});

test("resets the sending state when the request throws", async () => {
  mocks.signInWithOtp.mockRejectedValue(new Error("Network unavailable"));
  render(<AuthGate>{() => null}</AuthGate>);
  fireEvent.change(screen.getByPlaceholderText("your@email.com"), {
    target: { value: "student@example.com" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send magic link" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Network unavailable");
  await waitFor(() => expect(screen.getByRole("button", { name: "Send magic link" })).toBeEnabled());
});
