import { useEffect, useRef, useState, useCallback } from "react";

const WORD_BANK = [
  "the",
  "be",
  "of",
  "and",
  "a",
  "to",
  "in",
  "he",
  "have",
  "it",
  "that",
  "for",
  "they",
  "with",
  "as",
  "not",
  "on",
  "she",
  "at",
  "by",
  "this",
  "we",
  "you",
  "do",
  "but",
  "his",
  "from",
  "say",
  "her",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
  "code",
  "build",
  "create",
  "learn",
  "simple",
  "fast",
  "clean",
  "system",
  "change",
  "light",
  "dark",
  "focus",
  "keep",
  "world",
  "great",
  "small",
  "need",
  "feel",
  "high",
  "place",
  "still",
  "point",
  "hand",
  "life",
  "write",
  "read",
  "state",
  "mind",
  "power",
  "start",
  "run",
  "open",
  "close",
  "true",
  "key",
  "line",
  "file",
  "data",
  "path",
  "next",
  "flow",
  "form",
  "show",
  "case",
  "free",
  "real",
  "hard",
  "more",
  "both",
  "under",
  "never",
  "always",
  "today",
  "sound",
  "right",
  "left",
  "found",
  "might",
  "while",
  "last",
  "thing",
  "group",
  "begin",
  "help",
  "every",
  "quick",
  "press",
  "drive",
  "tool",
  "space",
];

function getRandomWords(count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * WORD_BANK.length);
    result.push(WORD_BANK[randomIndex]);
  }
  return result;
}

// Lightweight zero-dependency Web Audio Sound Effects Synthesizer
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // Mechanical switch body thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(460, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.035);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.036);

    // Mechanical snap click
    const click = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    click.type = "triangle";
    click.frequency.setValueAtTime(1800, now);
    click.frequency.exponentialRampToValueAtTime(250, now + 0.015);
    clickGain.gain.setValueAtTime(0.045, now);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
    click.connect(clickGain).connect(this.ctx.destination);
    click.start(now);
    click.stop(now + 0.016);
  }

  playBuzz() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(130, now);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.095);
  }

  playChime() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const startTime = this.ctx.currentTime + i * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.07, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.5);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.52);
    });
  }
}

const sounds = new SoundEngine();

export function TypingTest() {
  // Test configuration
  const [mode, setMode] = useState("time"); // 'time' | 'words'
  const [timeConfig, setTimeConfig] = useState(30); // 15 | 30 | 60
  const [wordsConfig, setWordsConfig] = useState(25); // 10 | 25 | 50 | 100
  const [isMuted, setIsMuted] = useState(false);

  // Test state
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [history, setHistory] = useState([]); // array of strings typed for past words
  const [isStarted, setIsStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Caret coordinates
  const [caretPos, setCaretPos] = useState({ left: 0, top: 0, width: 2 });
  const [isTyping, setIsTyping] = useState(false);

  // DOM Refs
  const inputRef = useRef(null);
  const wordsContainerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const completedRef = useRef(false);

  // Sync mute state with sound engine
  useEffect(() => {
    sounds.muted = isMuted;
  }, [isMuted]);

  // Generate word pool when config changes
  const resetTest = useCallback(() => {
    clearInterval(intervalRef.current);
    const count = mode === "words" ? wordsConfig : Math.max(timeConfig * 3, 60);
    const newWords = getRandomWords(count);
    setWords(newWords);
    setCurrentWordIndex(0);
    setCurrentInput("");
    setHistory([]);
    setIsStarted(false);
    setIsCompleted(false);
    completedRef.current = false;
    setTimeLeft(timeConfig);
    setElapsedSeconds(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    startTimeRef.current = null;
    setCaretPos({ left: 0, top: 0, width: 2 });
  }, [mode, timeConfig, wordsConfig]);

  // Initial load or config reset
  useEffect(() => {
    resetTest();
  }, [resetTest]);

  // Focus input helper
  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      setIsFocused(true);
    }
  };

  // Timer runner
  useEffect(() => {
    if (!isStarted || isCompleted) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      if (mode === "time") {
        const remaining = Math.max(timeConfig - elapsed, 0);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          finishTest();
        }
      }
    }, 200);

    return () => clearInterval(intervalRef.current);
  }, [isStarted, isCompleted, mode, timeConfig]);

  // Complete test
  const finishTest = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    window.dispatchEvent(new CustomEvent("typing-complete"));
    clearInterval(intervalRef.current);
    setIsCompleted(true);
    setIsStarted(false);
    sounds.playChime();
  }, []);

  // Check if Words mode has reached the end
  useEffect(() => {
    if (
      isStarted &&
      mode === "words" &&
      currentWordIndex >= wordsConfig &&
      words.length > 0
    ) {
      finishTest();
    }
  }, [
    isStarted,
    mode,
    currentWordIndex,
    wordsConfig,
    words.length,
    finishTest,
  ]);

  // Update Caret Position
  useEffect(() => {
    if (!wordsContainerRef.current) return;

    const activeWordEl = wordsContainerRef.current.querySelector(
      `.word[data-index="${currentWordIndex}"]`,
    );
    if (!activeWordEl) return;

    const letterEls = activeWordEl.querySelectorAll(".letter");
    const containerRect = wordsContainerRef.current.getBoundingClientRect();

    if (currentInput.length < letterEls.length) {
      // Caret is in front of the active character
      const targetLetter = letterEls[currentInput.length];
      if (targetLetter) {
        const letterRect = targetLetter.getBoundingClientRect();
        setCaretPos({
          left: letterRect.left - containerRect.left,
          top: letterRect.top - containerRect.top,
          width: 2,
        });
      }
    } else {
      // Caret is at the end of the word or on extra letters
      const lastLetter = letterEls[letterEls.length - 1];
      if (lastLetter) {
        const lastRect = lastLetter.getBoundingClientRect();
        setCaretPos({
          left: lastRect.right - containerRect.left,
          top: lastRect.top - containerRect.top,
          width: 2,
        });
      }
    }
  }, [currentWordIndex, currentInput, words]);

  // Keyboard shortcut listener for Tab / Enter to quick-restart
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === "Tab" || (isCompleted && e.key === "Enter")) {
        e.preventDefault();
        resetTest();
        setTimeout(focusInput, 50);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [isCompleted, resetTest]);

  // Handle keystroke input
  const handleKeyDown = (e) => {
    // Prevent default scrolling on Space
    if (e.key === " ") {
      e.preventDefault();
    }

    if (isCompleted) return;

    // Start timer on very first keypress
    if (!isStarted) {
      setIsStarted(true);
      startTimeRef.current = Date.now();
    }

    // Set typing state for caret solid animation
    setIsTyping(true);
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => setIsTyping(false), 500);

    const targetWord = words[currentWordIndex] || "";

    // Handle Backspace
    if (e.key === "Backspace") {
      if (currentInput.length > 0) {
        setCurrentInput((prev) => prev.slice(0, -1));
        sounds.playClick();
      } else if (currentWordIndex > 0) {
        // Jump back to previous word if it had mistakes
        const prevTyped = history[currentWordIndex - 1];
        const prevTarget = words[currentWordIndex - 1];
        if (prevTyped !== prevTarget) {
          setCurrentWordIndex((prev) => prev - 1);
          setCurrentInput(prevTyped);
          setHistory((prev) => prev.slice(0, -1));
          sounds.playClick();
        }
      }
      return;
    }

    // Handle Space (Word submission)
    if (e.key === " ") {
      if (currentInput.length === 0) return; // Don't advance on double-space

      setTotalKeystrokes((prev) => prev + 1);

      // Check correctness of current word
      if (currentInput === targetWord) {
        setCorrectKeystrokes((prev) => prev + 1); // bonus keystroke for valid space
        sounds.playClick();
      } else {
        sounds.playBuzz();
      }

      setHistory((prev) => [...prev, currentInput]);
      setCurrentWordIndex((prev) => prev + 1);
      setCurrentInput("");

      // Check if finished in words mode
      if (mode === "words" && currentWordIndex + 1 >= wordsConfig) {
        finishTest();
      }
      return;
    }

    // Single character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setTotalKeystrokes((prev) => prev + 1);
      const nextChar = e.key;
      const expectedChar = targetWord[currentInput.length];

      if (nextChar === expectedChar) {
        setCorrectKeystrokes((prev) => prev + 1);
        sounds.playClick();
      } else {
        sounds.playBuzz();
      }

      setCurrentInput((prev) => prev + nextChar);
    }
  };

  // Real-time Stats Calculation
  const activeSeconds = Math.max(elapsedSeconds, 1);
  const currentWpm =
    Math.round(correctKeystrokes / 5 / (activeSeconds / 60)) || 0;
  const currentAccuracy =
    totalKeystrokes > 0
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 100;

  return (
    <section
      className="typing-test cookie-typing-section"
      aria-labelledby="typing-title"
    >
      <div className="typing-test-inner">
        {/* Header with Title and Volume Mute Toggle */}
        <div className="typing-header-bar">
          <div>
            <span className="eyebrow">Interactive Speed Test</span>
            <h2 id="typing-title">Cookie Type.</h2>
          </div>

          <div className="typing-controls">
            <button
              type="button"
              className="sound-toggle-btn"
              onClick={() => setIsMuted(!isMuted)}
              aria-label={
                isMuted
                  ? "Unmute typing sound effects"
                  : "Mute typing sound effects"
              }
              title={isMuted ? "Unmute SFX" : "Mute SFX"}
            >
              {isMuted ? "🔇 Muted" : "🔊 SFX On"}
            </button>
          </div>
        </div>

        {/* Minimalist Cookie Type config bar */}
        <div className="monkey-config-bar">
          <div className="config-group">
            <button
              type="button"
              className={`config-btn ${mode === "time" ? "active" : ""}`}
              onClick={() => setMode("time")}
            >
              time
            </button>
            <button
              type="button"
              className={`config-btn ${mode === "words" ? "active" : ""}`}
              onClick={() => setMode("words")}
            >
              words
            </button>
          </div>

          <div className="config-divider" />

          <div className="config-group">
            {mode === "time"
              ? [15, 30, 60].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`config-btn ${timeConfig === t ? "active" : ""}`}
                    onClick={() => {
                      setTimeConfig(t);
                      setTimeLeft(t);
                    }}
                  >
                    {t}s
                  </button>
                ))
              : [10, 25, 50, 100].map((w) => (
                  <button
                    key={w}
                    type="button"
                    className={`config-btn ${wordsConfig === w ? "active" : ""}`}
                    onClick={() => setWordsConfig(w)}
                  >
                    {w}
                  </button>
                ))}
          </div>
        </div>

        {/* Live Counters */}
        <div className="monkey-live-stats">
          <span className="live-metric timer">
            {mode === "time"
              ? `${timeLeft}s`
              : `${Math.min(currentWordIndex, wordsConfig)} / ${wordsConfig}`}
          </span>
          {isStarted && !isCompleted && (
            <>
              <span className="live-metric">{currentWpm} wpm</span>
              <span className="live-metric">{currentAccuracy}% acc</span>
            </>
          )}
        </div>

        {/* Main Typing Area or Results View */}
        {!isCompleted ? (
          <div
            className={`monkey-typing-box ${!isFocused ? "not-focused" : ""}`}
            onClick={focusInput}
            role="region"
            aria-label="Typing test words area"
          >
            {/* Hidden capture input */}
            <input
              ref={inputRef}
              className="monkey-hidden-input"
              value=""
              onChange={() => {}}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="off"
              spellCheck="false"
              aria-label="Typing capture input"
            />

            {/* Click to Focus Overlay if unfocused */}
            {!isFocused && (
              <div className="focus-indicator">
                <span>Click or press any key to focus</span>
              </div>
            )}

            {/* Words Container */}
            <div ref={wordsContainerRef} className="words-wrapper">
              {/* Smooth Animated Caret */}
              <div
                className={`monkey-caret ${isTyping ? "typing" : "blinking"}`}
                style={{
                  transform: `translate3d(${caretPos.left}px, ${caretPos.top}px, 0)`,
                }}
              />

              {words.map((word, wIdx) => {
                const isCurrent = wIdx === currentWordIndex;
                const isPast = wIdx < currentWordIndex;
                const typedWord = isCurrent
                  ? currentInput
                  : isPast
                    ? history[wIdx] || ""
                    : "";

                // Letters matching
                const maxLen = Math.max(word.length, typedWord.length);
                const letters = [];

                for (let i = 0; i < maxLen; i++) {
                  const targetChar = word[i];
                  const typedChar = typedWord[i];

                  let status = "untouched";
                  if (i < typedWord.length) {
                    if (targetChar === undefined) {
                      status = "extra";
                    } else if (typedChar === targetChar) {
                      status = "correct";
                    } else {
                      status = "incorrect";
                    }
                  }

                  letters.push(
                    <span key={i} className={`letter ${status}`}>
                      {targetChar || typedChar}
                    </span>,
                  );
                }

                return (
                  <div
                    key={`${word}-${wIdx}`}
                    className={`word ${isCurrent ? "active-word" : ""} ${
                      isPast && history[wIdx] !== word ? "has-error" : ""
                    }`}
                    data-index={wIdx}
                  >
                    {letters}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Results Card Screen */
          <div className="monkey-results-card">
            <div className="results-header">
              <span className="eyebrow">Test Completed</span>
              <h3>Performance Summary</h3>
            </div>

            <div className="results-grid">
              <div className="result-metric primary">
                <span className="metric-label">wpm</span>
                <span className="metric-val big">{currentWpm}</span>
              </div>

              <div className="result-metric primary">
                <span className="metric-label">acc</span>
                <span className="metric-val big">{currentAccuracy}%</span>
              </div>

              <div className="result-metric">
                <span className="metric-label">mode</span>
                <span className="metric-val">
                  {mode}{" "}
                  {mode === "time" ? `${timeConfig}s` : `${wordsConfig}w`}
                </span>
              </div>

              <div className="result-metric">
                <span className="metric-label">characters</span>
                <span className="metric-val">
                  {correctKeystrokes} / {totalKeystrokes - correctKeystrokes} /{" "}
                  {totalKeystrokes}
                </span>
                <span className="sub-label">correct / incorrect / total</span>
              </div>

              <div className="result-metric">
                <span className="metric-label">time</span>
                <span className="metric-val">{elapsedSeconds}s</span>
              </div>
            </div>

            <div className="results-actions">
              <button
                type="button"
                className="restart-btn"
                onClick={() => {
                  resetTest();
                  setTimeout(focusInput, 50);
                }}
              >
                ↻ Restart Test
              </button>
              <span className="restart-hint">
                Tip: Press <kbd>Tab</kbd> or <kbd>Enter</kbd> to quickly restart
              </span>
            </div>
          </div>
        )}

        {/* Bottom Quick Restart / Helper */}
        {!isCompleted && (
          <div className="monkey-bottom-bar">
            <button
              type="button"
              className="quick-restart-btn"
              onClick={() => {
                resetTest();
                setTimeout(focusInput, 50);
              }}
              title="Restart test (Tab)"
            >
              ↻ restart test
            </button>
            <span className="keyboard-tip">tab + enter to restart</span>
          </div>
        )}
      </div>
    </section>
  );
}
