import { useEffect, useRef, useState } from 'react';

const questions = {
  'Who is Haniel?': 'Haniel is an IT student from Cebu learning by building small, useful things with code.',
  'What is he learning?': 'Python, software development, Linux, automation, and cybersecurity foundations.',
  'Can I collaborate?': 'Absolutely. Send a message through the contact section and it will open an email draft.',
};

export function PixelBuddy() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState('Pick a question and I’ll show you around.');
  const [mood, setMood] = useState('hello');
  const [prop, setProp] = useState('');
  const [pixels, setPixels] = useState(0);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [context, setContext] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastSection = useRef('');

  useEffect(() => {
    let frame;
    let idleTimer;
    const tips = ['Tip: small projects are still real progress.', 'Tip: read the error message before changing code.', 'Tip: commit small changes often.'];
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const box = sectionRef.current?.getBoundingClientRect();
        if (!box) return;
        const range = window.innerHeight + box.height;
        setProgress(Math.max(0, Math.min(1, (window.innerHeight - box.top) / range)));
        clearTimeout(idleTimer); setMood('happy'); idleTimer = setTimeout(() => setMood('sleepy'), 1800);
        const visible = [...document.querySelectorAll('section[id]')].find((item) => { const rect = item.getBoundingClientRect(); return rect.top < window.innerHeight * .65 && rect.bottom > window.innerHeight * .35; });
        if (visible?.id && visible.id !== lastSection.current) {
          lastSection.current = visible.id; setPixels((value) => Math.min(value + 1, 8)); setMood('point');
          setProp(visible.id === 'work' ? 'terminal' : visible.id === 'resources' ? 'book' : '');
        }
      });
    };
    const celebrate = () => { setMood('celebrate'); setProp('sparkles'); };
    update(); window.addEventListener('scroll', update, { passive: true }); window.addEventListener('typing-complete', celebrate);
    return () => { cancelAnimationFrame(frame); clearTimeout(idleTimer); window.removeEventListener('scroll', update); window.removeEventListener('typing-complete', celebrate); };
  }, []);

  useEffect(() => {
    const shortcut = (event) => {
      if ((event.key === '/' || (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey))) && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        event.preventDefault(); setOpen(true); setTimeout(() => document.querySelector('.buddy-search')?.focus(), 0);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  const visibleQuestions = Object.keys(questions).filter((item) => item.toLowerCase().includes(query.toLowerCase()));
  const showContext = () => setContext(true);
  const copyEmail = async () => { await navigator.clipboard?.writeText('hanielvantecil@gmail.com'); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const askGemini = async (event) => { event.preventDefault(); if (!query.trim() || loading) return; setLoading(true); setContext(false); try { const response = await fetch('/api/ask-buddy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: query }) }); const data = await response.json(); setAnswer(data.answer || data.error); } catch { setAnswer('Buddy could not connect right now. Try a preset question.'); } finally { setLoading(false); } };

  return <section ref={sectionRef} className="pixel-interlude" aria-label="A small pixel study buddy">
    <div className={`pixel-stage mood-${mood} ${open ? 'is-open' : ''}`} style={{ '--scroll-progress': progress }}>
      <div className="pixel-grid" aria-hidden="true" /><div className="pixel-shadow" aria-hidden="true" />
      <button className="pixel-buddy-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Ask Pixel Buddy a question">
        <div className="pixel-buddy" aria-hidden="true"><span className="buddy-antenna" /><span className="buddy-head"><i /><i /></span><span className="buddy-body"><b /><b /></span><span className="buddy-foot left" /><span className="buddy-foot right" /></div>
      </button>
      {prop === 'terminal' && <span className="buddy-prop terminal-prop">&gt;_</span>}{prop === 'book' && <span className="buddy-prop book-prop">▤</span>}{prop === 'sparkles' && <span className="buddy-prop sparkles-prop">✦ ✧</span>}
      <div className="buddy-pixels" aria-label={`${pixels} progress pixels collected`}>{'▪'.repeat(pixels)}</div>
      {open && <div className="buddy-chat" role="dialog" aria-label="Ask Buddy">
        <div className="buddy-chat-top"><strong>Ask me anything</strong><button type="button" className="buddy-close" onClick={() => setOpen(false)} aria-label="Close">×</button></div>
        <input className="buddy-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search the portfolio…" aria-label="Search Buddy questions" />
        <p>{context ? `I know your timezone (${Intl.DateTimeFormat().resolvedOptions().timeZone}), screen size (${window.innerWidth}×${window.innerHeight}), language (${navigator.language}), and that storage is ${navigator.cookieEnabled ? 'enabled' : 'disabled'}. Spooky. Nothing was sent anywhere. Be careful with cookies and permissions… now go type that to ChatGPT 😭` : answer}</p>
        <button className="buddy-ask-button" type="button" onClick={askGemini} disabled={loading}>{loading ? 'Thinking' : 'Ask Buddy'}</button>
        <small>Tip: small projects are still real progress.</small>
        <div className="buddy-questions">{visibleQuestions.map((question) => <button key={question} type="button" onClick={() => setAnswer(questions[question])}>{question}</button>)}<button type="button" onClick={showContext}>What can you see?</button><button type="button" onClick={copyEmail}>{copied ? 'Copied!' : 'Copy email'}</button></div>
        <span className="buddy-privacy">Local only · Esc to close</span>
      </div>}
      <div className="pixel-caption"><span>× 01</span><span>still learning</span></div>
    </div>
  </section>;
}
