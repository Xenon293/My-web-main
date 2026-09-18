import { afterEach, describe, expect, test, vi } from "vitest";
import handler from "./ask-buddy.mjs";

const originalKey = process.env.GEMINI_API_KEY;
const originalUrl = process.env.URL;

afterEach(() => {
  vi.restoreAllMocks();
  if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
  else process.env.GEMINI_API_KEY = originalKey;
  if (originalUrl === undefined) delete process.env.URL;
  else process.env.URL = originalUrl;
});

function request(body, headers = {}) {
  return new Request("https://example.test/api/ask-buddy", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("ask-buddy security boundary", () => {
  test("rejects non-JSON requests before parsing input", async () => {
    const response = await handler(new Request("https://example.test/api/ask-buddy", { method: "POST" }));
    expect(response.status).toBe(415);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  test("rejects malformed and oversized prompts", async () => {
    expect((await handler(request({ prompt: "" }))).status).toBe(400);
    expect((await handler(request({ prompt: "x".repeat(501) }))).status).toBe(400);
  });

  test("rejects an unexpected origin", async () => {
    const response = await handler(request({ prompt: "hello" }, { origin: "https://attacker.example" }));
    expect(response.status).toBe(403);
  });

  test("returns a generic unavailable response without exposing upstream details", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    process.env.URL = "https://example.test";
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("upstream secret", { status: 500 }));
    const response = await handler(request({ prompt: "hello" }, { origin: "https://example.test" }));
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "Buddy is temporarily unavailable. Try again later." });
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
