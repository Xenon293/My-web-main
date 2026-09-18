import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { GitHubActivity } from "./GitHubActivity";

afterEach(() => vi.unstubAllGlobals());

test("renders live contribution data", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      total: { lastYear: 12 },
      contributions: [{ date: "2026-09-18", count: 2, level: 2 }],
    }),
  }));

  render(<GitHubActivity />);
  await waitFor(() => expect(screen.getByText("12 contributions in the last year")).toBeInTheDocument());
  expect(screen.getByRole("img", { name: "12 GitHub contributions in the last year" })).toBeInTheDocument();
});

test("keeps a profile fallback when activity cannot load", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  render(<GitHubActivity />);

  expect(await screen.findByText(/calendar is unavailable/i)).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /view profile/i })).toHaveAttribute("href", "https://github.com/Xenon293");
});
