const attempts = new Map();
const WINDOW = 8 * 60 * 60 * 1000;
const LIMIT = 5;
const MAX_PROMPT_LENGTH = 500;
const REQUEST_TIMEOUT = 20_000;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function allowedOrigin(origin) {
  if (!origin) return true;
  if (origin === "http://localhost:5173" || origin === "http://127.0.0.1:5173") return true;
  const configured = process.env.URL || process.env.VITE_SITE_URL;
  return Boolean(configured && origin === configured.replace(/\/$/, ""));
}

export default async (request) => {
  if (request.method !== "POST")
    return json({ error: "Method not allowed" }, 405);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json"))
    return json({ error: "JSON requests are required." }, 415);
  if (!allowedOrigin(request.headers.get("origin")))
    return json({ error: "Request origin is not allowed." }, 403);
  const body = await request.json().catch(() => null);
  const prompt = body && typeof body === "object" ? body.prompt : undefined;
  if (
    typeof prompt !== "string" ||
    prompt.trim().length < 2 ||
    prompt.length > MAX_PROMPT_LENGTH
  )
    return json({ error: "Please ask a short question." }, 400);
  const ip = request.headers.get("x-nf-client-connection-ip") || "unknown";
  const now = Date.now();
  const record = attempts.get(ip) || { count: 0, started: now };
  if (now - record.started >= WINDOW) {
    record.count = 0;
    record.started = now;
  }
  if (record.count >= LIMIT)
    return json({ error: "Buddy needs a rest. Try again in 8 hours." }, 429);
  if (!process.env.GEMINI_API_KEY)
    return json({ error: "Gemini is not configured yet. Use the preset questions for now." }, 503);
  record.count += 1;
  attempts.set(ip, record);
  const headers = {
    "Content-Type": "application/json",
    "x-goog-api-key": process.env.GEMINI_API_KEY,
  };
  const modelsResponse = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models",
    { headers: { "x-goog-api-key": process.env.GEMINI_API_KEY }, signal: AbortSignal.timeout(REQUEST_TIMEOUT) },
  );
  if (!modelsResponse.ok) {
    console.error("Gemini models request failed with status", modelsResponse.status);
    return json({ error: "Buddy is temporarily unavailable. Try again later." }, 502);
  }
  const models = (await modelsResponse.json()).models || [];
  const canGenerate = (item) =>
    item.supportedGenerationMethods?.includes("generateContent");
  const model =
    models.find(
      (item) => item.name === "models/gemini-3.6-flash" && canGenerate(item),
    ) ||
    models.find(
      (item) => item.name?.includes("gemini-3.6-flash") && canGenerate(item),
    ) ||
    models.find((item) => item.name?.includes("flash") && canGenerate(item)) ||
    models.find(canGenerate);
  if (!model)
    return json({ error: "Buddy is temporarily unavailable. Try again later." }, 502);
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        system_instruction: {
          parts: [
            {
              text: "You are Buddy, Haniel Molejon's friendly portfolio and educational assistant. For questions about Haniel, his portfolio, projects, skills, learning goals, resources, or internship interests, use only verified information supplied by this portfolio; never invent achievements, qualifications, project outcomes, links, contact details, or personal facts. Clearly say when portfolio information is unavailable. You may also answer general educational questions about mathematics, programming, science, writing, time and dates, and other academic topics using reliable general knowledge. Teach clearly at the user's apparent level, show the important steps for calculations and problem solving, and explain the reasoning instead of giving only a final answer. Keep portfolio answers concise and educational answers as brief as possible without omitting necessary steps. Format answers as standard Markdown. For mathematics, use valid LaTeX with $...$ for inline expressions and $$...$$ for display equations. Use aligned, cases, matrix, or other KaTeX-supported environments inside display equations when helpful. Never use \\(...\\), \\[...\\], raw HTML, HTML entities, Unicode-art approximations, or unmatched math delimiters. Write literal currency and percentages as ordinary prose so they are not mistaken for equations. Distinguish general knowledge from verified portfolio facts. Never claim access to private data, exact location, cookies, passwords, browsing history, device files, or live information you cannot verify. Do not claim to be Haniel or speak on his behalf. Do not request sensitive personal information. If uncertain, say so. Do not use emojis.",
            },
          ],
        },
        contents: [{ role: "user", parts: [{ text: prompt.trim() }] }],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT),
    },
  );
  if (!response.ok) {
    console.error("Gemini request failed with status", response.status);
    const message =
      response.status === 401 || response.status === 403
        ? "Buddy is temporarily unavailable."
        : response.status === 429
          ? "Gemini quota is currently exhausted. Try again later."
          : "Buddy is temporarily unavailable. Try again later.";
    return json({ error: message }, 502);
  }
  const data = await response.json();
  return json({
    answer:
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Buddy could not think of an answer.",
  });
};

export const config = {
  path: "/api/ask-buddy",
  rateLimit: { windowLimit: 20, windowSize: 60, aggregateBy: ["ip"] },
};
