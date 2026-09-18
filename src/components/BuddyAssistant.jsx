import { useEffect, useRef, useState } from "react";
import { BuddyAnswer, hasStructuredBuddyFormatting, normalizeBuddyMarkdown } from "./BuddyAnswer";

const questions = {
  "Who is Haniel?": "Haniel is an IT student from Cebu learning by building small, useful things with code.",
  "What is he learning?": "Python, software development, Linux, automation, and cybersecurity foundations.",
  "Can I collaborate?": "Absolutely. Send a message through the contact section and it will open an email draft.",
};

export function BuddyAssistant() {
  const inputRef = useRef(null);
  const [answer, setAnswer] = useState("Ask me about Haniel's work or an educational topic. I can help with math, programming, science, writing, and more.");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayAnswer, setDisplayAnswer] = useState("");
  const [typing, setTyping] = useState(false);
  const [promptCount, setPromptCount] = useState(() => {
    try {
      const usage = JSON.parse(localStorage.getItem("buddy-prompts") || "{}");
      return usage.started && Date.now() - usage.started < 8 * 60 * 60 * 1000 ? usage.count : 0;
    } catch { return 0; }
  });

  useEffect(() => {
    if (loading) { setDisplayAnswer("Give me a second to think that through."); setTyping(false); return undefined; }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const area = timezone.includes("/") ? timezone.split("/").pop().replaceAll("_", " ") : "an unknown area";
    const localTime = new Intl.DateTimeFormat([], { hour: "numeric", minute: "2-digit" }).format(new Date());
    const text = context
      ? `I can make a rough guess from your timezone: ${area}. It is ${localTime} for you. I can also see a ${window.innerWidth} x ${window.innerHeight} screen, ${navigator.language} language, and ${navigator.cookieEnabled ? "browser storage is enabled" : "browser storage is disabled"}. I cannot see your exact location or private data. Nothing was sent anywhere.`
      : answer;
    const normalizedText = normalizeBuddyMarkdown(text);
    const hasStructuredFormatting = hasStructuredBuddyFormatting(normalizedText);
    if (hasStructuredFormatting || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplayAnswer(normalizedText);
      setTyping(false);
      return undefined;
    }
    setDisplayAnswer("");
    setTyping(true);
    let index = 0;
    const timer = window.setInterval(() => {
      index += 3;
      setDisplayAnswer(normalizedText.slice(0, index));
      if (index >= normalizedText.length) { window.clearInterval(timer); setTyping(false); }
    }, 12);
    return () => window.clearInterval(timer);
  }, [answer, context, loading]);

  const chooseQuestion = (question) => { setContext(false); setQuery(""); setAnswer(questions[question]); };
  const showContext = () => { setContext(true); setQuery(""); setAnswer(""); };
  const copyEmail = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText("hanielvantecil@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { setContext(false); setAnswer("Copying is unavailable. Email Haniel at hanielvantecil@gmail.com."); }
  };
  const clearConversation = () => {
    setContext(false); setQuery("");
    setAnswer("Ask me about Haniel's work or an educational topic. I can help with math, programming, science, writing, and more.");
    inputRef.current?.focus();
  };
  const askGemini = async (event) => {
    event.preventDefault();
    const prompt = query.trim();
    if (!prompt || loading || promptCount >= 5) return;
    setLoading(true); setContext(false);
    try {
      const response = await fetch("/api/ask-buddy", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
      const data = await response.json();
      setAnswer(data.answer || data.error || "No answer returned.");
      const next = promptCount + 1;
      setPromptCount(next);
      const oldUsage = JSON.parse(localStorage.getItem("buddy-prompts") || "{}");
      localStorage.setItem("buddy-prompts", JSON.stringify({ count: next, started: oldUsage.started || Date.now() }));
      setQuery("");
    } catch { setAnswer("Buddy is unavailable right now. Try one of the local questions below."); }
    finally { setLoading(false); }
  };

  return (
    <section className="buddy-workspace" aria-labelledby="buddy-page-title">
      <header className="buddy-page-heading">
        <div><span className="eyebrow">Portfolio + learning assistant</span><h1 id="buddy-page-title">Ask Buddy.</h1><p>Explore Haniel's work or ask for help understanding an educational topic.</p></div>
        <div className="buddy-page-avatar" aria-hidden="true"><span className="buddy-antenna" /><span className="buddy-head"><i /><i /></span><span className="buddy-body"><b /><b /></span><span className="buddy-foot left" /><span className="buddy-foot right" /></div>
      </header>
      <div className={`buddy-page-response ${context ? "is-context" : ""}`} aria-live="polite" aria-busy={loading}>
        <span className="buddy-response-label">{loading ? "thinking" : context ? "browser check" : "buddy says"}</span>
        <BuddyAnswer>{displayAnswer}</BuddyAnswer>
        {typing ? <span className="buddy-caret" aria-hidden="true">▌</span> : null}
      </div>
      <form className="buddy-page-form" onSubmit={askGemini}>
        <label htmlFor="buddy-question">What would you like to learn or know?</label>
        <div><textarea ref={inputRef} id="buddy-question" className="buddy-page-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={promptCount >= 5 ? "AI limit reached; preset questions are still available." : "For example: Explain quadratic equations step by step…"} rows="3" maxLength="500" disabled={promptCount >= 5} /><button className="buddy-page-submit" type="submit" disabled={loading || !query.trim() || promptCount >= 5}>{loading ? "Thinking…" : "Ask Buddy"}</button></div>
        <span>{promptCount >= 5 ? "AI limit reached for this 8-hour period." : `${5 - promptCount} AI questions remaining · 500 characters maximum`}</span>
      </form>
      <div className="buddy-page-suggestions"><span className="eyebrow">Quick questions</span><div>{Object.keys(questions).map((question) => <button key={question} type="button" onClick={() => chooseQuestion(question)}>{question}</button>)}<button type="button" onClick={showContext}>What can you see?</button><button type="button" onClick={copyEmail}>{copied ? "Email copied" : "Copy email"}</button><button type="button" onClick={clearConversation}>Clear answer</button></div></div>
      <p className="buddy-page-note">Buddy may make mistakes. Verify important answers and do not share sensitive personal information.</p>
    </section>
  );
}
