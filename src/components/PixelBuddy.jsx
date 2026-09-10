import { useEffect, useRef, useState } from "react";

const questions = {
  "Who is Haniel?":
    "Haniel is an IT student from Cebu learning by building small, useful things with code.",
  "What is he learning?":
    "Python, software development, Linux, automation, and cybersecurity foundations.",
  "Can I collaborate?":
    "Absolutely. Send a message through the contact section and it will open an email draft.",
};

export function PixelBuddy() {
  const sectionRef = useRef(null);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(
    "Pick a question and I'll show you around.",
  );
  const [mood, setMood] = useState("hello");
  const [prop, setProp] = useState("");
  const [pixels, setPixels] = useState(0);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayAnswer, setDisplayAnswer] = useState("");
  const [promptCount, setPromptCount] = useState(() => {
    try {
      const usage = JSON.parse(localStorage.getItem("buddy-prompts") || "{}");
      return usage.started && Date.now() - usage.started < 8 * 60 * 60 * 1000
        ? usage.count
        : 0;
    } catch {
      return 0;
    }
  });
  const [showHint, setShowHint] = useState(
    () => !localStorage.getItem("buddy-hint-seen"),
  );
  const lastSection = useRef("");

  useEffect(() => {
    let frame;
    let idleTimer;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = sectionRef.current?.getBoundingClientRect();
        if (!box) return;
        setProgress(
          Math.max(
            0,
            Math.min(
              1,
              (window.innerHeight - box.top) /
                (window.innerHeight + box.height),
            ),
          ),
        );
        clearTimeout(idleTimer);
        setMood("happy");
        idleTimer = setTimeout(() => setMood("sleepy"), 1800);
        const visible = [...document.querySelectorAll("section[id]")].find(
          (item) => {
            const rect = item.getBoundingClientRect();
            return (
              rect.top < window.innerHeight * 0.65 &&
              rect.bottom > window.innerHeight * 0.35
            );
          },
        );
        if (visible?.id && visible.id !== lastSection.current) {
          lastSection.current = visible.id;
          setPixels((value) => Math.min(value + 1, 8));
          setMood("point");
          setProp(
            visible.id === "work"
              ? "terminal"
              : visible.id === "resources"
                ? "book"
                : "",
          );
        }
      });
    };
    const celebrate = () => {
      setMood("celebrate");
      setProp("sparkles");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("typing-complete", celebrate);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idleTimer);
      window.removeEventListener("scroll", update);
      window.removeEventListener("typing-complete", celebrate);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setDisplayAnswer("Give me a second to look through the portfolio.");
      return undefined;
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const area = timezone.includes("/")
      ? timezone.split("/").pop().replaceAll("_", " ")
      : "an unknown area";
    const localTime = new Intl.DateTimeFormat([], {
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());
    const text = context
      ? `I can make a rough guess from your timezone: ${area}. It is ${localTime} for you. I can also see a ${window.innerWidth} x ${window.innerHeight} screen, ${navigator.language} language, and ${navigator.cookieEnabled ? "browser storage is enabled" : "browser storage is disabled"}. I cannot see your exact location or private data. Nothing was sent anywhere. Be careful with cookies and permissions.`
      : answer;
    setDisplayAnswer("");
    let index = 0;
    const timer = window.setInterval(() => {
      index += 2;
      setDisplayAnswer(text.slice(0, index));
      if (index >= text.length) window.clearInterval(timer);
    }, 18);
    return () => window.clearInterval(timer);
  }, [answer, context, loading]);

  useEffect(() => {
    const shortcut = (event) => {
      if (
        (event.key === "/" ||
          (event.key.toLowerCase() === "k" &&
            (event.metaKey || event.ctrlKey))) &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        setOpen(true);
        setTimeout(() => document.querySelector(".buddy-search")?.focus(), 0);
      }
      if (event.key === "Escape" && open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    window.addEventListener("keydown", shortcut);
    return () => window.removeEventListener("keydown", shortcut);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const controls = [...dialog.querySelectorAll('input, button:not([disabled]), a[href]')];
    dialog.querySelector(".buddy-search")?.focus();
    const trapFocus = (event) => {
      if (event.key !== "Tab" || controls.length === 0) return;
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("keydown", trapFocus);
    return () => dialog.removeEventListener("keydown", trapFocus);
  }, [open]);

  const visibleQuestions = Object.keys(questions).filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );
  const chooseQuestion = (question) => {
    setContext(false);
    setQuery("");
    setAnswer(questions[question]);
  };
  const showContext = () => {
    setContext(true);
    setQuery("");
    setAnswer("");
  };
  const copyEmail = async () => {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText("hanielvantecil@gmail.com");
      setCopied(true);
    } catch {
      setAnswer("Copying is unavailable. Email Haniel at hanielvantecil@gmail.com.");
    }
    setTimeout(() => setCopied(false), 1400);
  };
  const dismissHint = () => {
    localStorage.setItem("buddy-hint-seen", "1");
    setShowHint(false);
  };
  const clearConversation = () => {
    setContext(false);
    setQuery("");
    setAnswer("Pick a question and I'll show you around.");
  };
  const askGemini = async (event) => {
    event.preventDefault();
    if (!query.trim() || loading || promptCount >= 5) return;
    setLoading(true);
    setContext(false);
    try {
      const response = await fetch("/api/ask-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });
      const data = await response.json();
      setAnswer(data.answer || data.error || "No answer returned.");
      const next = promptCount + 1;
      setPromptCount(next);
      const oldUsage = JSON.parse(
        localStorage.getItem("buddy-prompts") || "{}",
      );
      localStorage.setItem(
        "buddy-prompts",
        JSON.stringify({
          count: next,
          started: oldUsage.started || Date.now(),
        }),
      );
    } catch {
      setAnswer("Gemini is unavailable. Try one of the local questions below.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      className="pixel-interlude"
      aria-label="A small pixel study buddy"
    >
      <div
        className={`pixel-stage mood-${mood} ${open ? "is-open" : ""}`}
        style={{ "--scroll-progress": progress }}
      >
        <div className="pixel-grid" aria-hidden="true" />
        <div className="pixel-shadow" aria-hidden="true" />
        <button
          ref={triggerRef}
          className="pixel-buddy-button"
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label="Ask Pixel Buddy a question"
        >
          <div className="pixel-buddy" aria-hidden="true">
            <span className="buddy-antenna" />
            <span className="buddy-head">
              <i />
              <i />
            </span>
            <span className="buddy-body">
              <b />
              <b />
            </span>
            <span className="buddy-foot left" />
            <span className="buddy-foot right" />
          </div>
        </button>
        {prop === "terminal" && (
          <span className="buddy-prop terminal-prop">&gt;_</span>
        )}
        {prop === "book" && <span className="buddy-prop book-prop">book</span>}
        {prop === "sparkles" && (
          <span className="buddy-prop sparkles-prop">* *</span>
        )}
        <div
          className="buddy-pixels"
          role="img"
          aria-label={`${pixels} progress pixels collected`}
        >
          {"*".repeat(pixels)}
        </div>
        {open && (
          <div
            ref={dialogRef}
            className="buddy-chat"
            role="dialog"
            aria-modal="true"
            aria-label="Ask Buddy"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="buddy-chat-top">
              <div>
                <span className="buddy-status">
                  <i /> online
                </span>
                <strong>Ask Buddy</strong>
              </div>
              <button
                type="button"
                className="buddy-close"
                onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
                aria-label="Close"
              >
                x
              </button>
            </div>
            {showHint && (
              <div className="buddy-hint">
                Press slash or Ctrl K anytime to open Buddy.{" "}
                <button type="button" onClick={dismissHint}>
                  Got it
                </button>
              </div>
            )}
            <div
              className={`buddy-response ${context ? "is-context" : ""}`}
              aria-live="polite"
            >
              <span className="buddy-response-label">
                {loading
                  ? "thinking"
                  : context
                    ? "browser check"
                    : "buddy says"}
              </span>
              <p>
                {displayAnswer}
                <span className="buddy-caret" aria-hidden="true">
                  ▌
                </span>
              </p>
            </div>
            <form className="buddy-ask-form" onSubmit={askGemini}>
              <input
                className="buddy-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.nativeEvent.isComposing)
                    event.currentTarget.form?.requestSubmit();
                }}
                placeholder={
                  promptCount >= 5
                    ? "Local questions are still available"
                    : "Ask about Haniel..."
                }
                aria-label="Ask Buddy a question"
              />
              <button
                className="buddy-ask-button"
                type="submit"
                disabled={loading || !query.trim() || promptCount >= 5}
              >
                {loading ? "Thinking" : "Ask"}
              </button>
            </form>
            <span className="buddy-enter-hint">
              {promptCount >= 5
                ? "AI limit reached | try a preset"
                : `${5 - promptCount} AI questions left | Press Enter to ask`}
            </span>
            <div className="buddy-tip">
              <span>Tip</span> Read the error before changing code.
            </div>
            <div className="buddy-questions">
              <span className="buddy-questions-label">Try one</span>
              {visibleQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => chooseQuestion(question)}
                >
                  {question}
                </button>
              ))}
              <button type="button" onClick={showContext}>
                What can you see?
              </button>
              <button type="button" onClick={copyEmail}>
                {copied ? "Copied" : "Copy email"}
              </button>
              <button type="button" onClick={clearConversation}>
                Clear
              </button>
            </div>
            <span className="buddy-privacy">Local only | Esc to close</span>
          </div>
        )}
        <div className="pixel-caption">
          <span>x 01</span>
          <span>still learning</span>
        </div>
      </div>
    </section>
  );
}
