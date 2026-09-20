import { render, screen } from "@testing-library/react";
import {
  BuddyAnswer,
  hasStructuredBuddyFormatting,
  normalizeBuddyMarkdown,
} from "./BuddyAnswer";

test("renders educational Markdown and display mathematics as readable content", () => {
  render(
    <BuddyAnswer>
      {"&#x20;\r\n\r\n### The rule\r\n\r\n- Add the previous terms\r\n\r\n$$F(n) = F(n-1) + F(n-2)$$"}
    </BuddyAnswer>,
  );

  expect(screen.getByRole("heading", { name: "The rule" })).toBeInTheDocument();
  expect(screen.getByRole("list")).toHaveTextContent("Add the previous terms");
  expect(document.querySelector(".katex-display")).toHaveTextContent("F(n)=F(n−1)+F(n−2)");
  expect(document.body).not.toHaveTextContent("&#x20;");
});

test("normalizes alternate math delimiters and safe entities", () => {
  render(
    <BuddyAnswer>
      {String.raw`The angle is \(\theta = 45^\circ\), so \(x \le y\).

\[\int_0^1 x^2\,dx = \frac{1}{3}\]

Also: &infin; &times; &divide; &plusmn; &ne;`}
    </BuddyAnswer>,
  );

  expect(document.querySelectorAll(".katex")).toHaveLength(3);
  expect(document.querySelector(".katex-display .katex-html")).toHaveTextContent("∫");
  expect(document.querySelector(".katex-display .katex-html")).toHaveTextContent("dx");
  expect(document.querySelector(".katex-display .mfrac")).toBeInTheDocument();
  expect(screen.getByText(/Also:/)).toHaveTextContent("Also: ∞ × ÷ ± ≠");
  expect(document.body.textContent).not.toMatch(/\\\(|\\\)|\\\[|\\\]/);
});

test("decodes safe numeric math entities without exposing entity markup", () => {
  render(<BuddyAnswer>{"The result is &#x2212;3 and the angle is &#x03B8; = 90&#176;."}</BuddyAnswer>);

  expect(screen.getByText(/The result is/)).toHaveTextContent("The result is −3 and the angle is θ = 90°.");
  expect(document.body.textContent).not.toMatch(/&#x|&#\d/);
});

test("renders advanced calculus and matrix notation with KaTeX", () => {
  render(
    <BuddyAnswer>
      {String.raw`$$
\begin{aligned}
\lim_{x \to 0}\frac{\sin x}{x} &= 1 \\
\frac{d}{dx}x^n &= nx^{n-1} \\
\sum_{k=1}^{n} k &= \frac{n(n+1)}{2}
\end{aligned}
$$

$$\begin{bmatrix}1 & 2 \\ 3 & 4\end{bmatrix}\vec{v}$$`}
    </BuddyAnswer>,
  );

  expect(document.querySelectorAll(".katex-display")).toHaveLength(2);
  expect(document.querySelector(".mfrac")).toBeInTheDocument();
  expect(document.querySelector(".mop.op-limits")).toBeInTheDocument();
  expect(document.querySelector(".mtable")).toBeInTheDocument();
});

test("preserves currency, percentages, escaped dollars, and code examples", () => {
  const answer = [
    String.raw`A notebook costs $5 and the discount is 20%. The variable \$x is text.`,
    "",
    "Inline code: `\\[not math\\]`",
    "",
    "```js",
    'const price = "$10";',
    String.raw`const delimiter = "\(not math\)";`,
    "```",
  ].join("\n");

  render(<BuddyAnswer>{answer}</BuddyAnswer>);

  expect(screen.getByText(/A notebook costs/)).toHaveTextContent("A notebook costs $5 and the discount is 20%. The variable $x is text.");
  expect(screen.getByText("\\[not math\\]")).toBeInTheDocument();
  expect(screen.getByText(/const price/)).toHaveTextContent('const price = "$10";');
  expect(document.querySelector(".katex")).not.toBeInTheDocument();
});

test("keeps malformed LaTeX readable instead of crashing the answer", () => {
  render(<BuddyAnswer>{String.raw`The attempted result is $\frac{1}{$ and the explanation continues.`}</BuddyAnswer>);

  expect(screen.getByText(/The attempted result is/)).toBeInTheDocument();
  expect(document.querySelector(".katex-error")).toHaveTextContent("\\frac{1}{");
  expect(screen.getByText(/explanation continues/)).toBeInTheDocument();
});

test("detects mathematical responses so the typewriter cannot slice their markup", () => {
  expect(hasStructuredBuddyFormatting(String.raw`Solve \(x^2 = 4\)`)).toBe(true);
  expect(hasStructuredBuddyFormatting("For every x ∈ ℝ, x² ≥ 0.")).toBe(true);
  expect(hasStructuredBuddyFormatting("A plain portfolio answer.")).toBe(false);
});

test("normalization is idempotent and leaves code delimiters unchanged", () => {
  const input = [String.raw`\[x^2 + y^2 = z^2\]`, "", String.raw`\`\(literal\)\``].join("\n");
  const normalized = normalizeBuddyMarkdown(input);

  expect(normalizeBuddyMarkdown(normalized)).toBe(normalized);
  expect(normalized).toContain("$$\nx^2 + y^2 = z^2\n$$");
  expect(normalized).toContain(String.raw`\`\(literal\)\``);
});
