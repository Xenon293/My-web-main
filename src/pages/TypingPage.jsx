import { TypingTest } from "../components/TypingTest";

export default function TypingPage() {
  return (
    <main className="typing-page" id="top">
      <header className="utility-page-intro">
        <span className="eyebrow">A small utility</span>
        <h1>Find your rhythm.</h1>
        <p>Practice speed and accuracy in a focused, distraction-free typing test.</p>
      </header>
      <TypingTest />
    </main>
  );
}
