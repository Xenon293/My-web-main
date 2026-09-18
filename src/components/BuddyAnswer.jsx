import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

const SAFE_ENTITIES = {
  "&#x20;": " ",
  "&#32;": " ",
  "&nbsp;": " ",
  "&times;": "×",
  "&divide;": "÷",
  "&minus;": "−",
  "&plusmn;": "±",
  "&le;": "≤",
  "&leq;": "≤",
  "&ge;": "≥",
  "&geq;": "≥",
  "&ne;": "≠",
  "&infin;": "∞",
};

const SAFE_ENTITY_PATTERN = new RegExp(
  Object.keys(SAFE_ENTITIES).map((entity) => entity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "gi",
);

function normalizeProseAndMath(value) {
  return value
    .replace(SAFE_ENTITY_PATTERN, (entity) => SAFE_ENTITIES[entity.toLowerCase()])
    .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_, formula) => `$$\n${formula.trim()}\n$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, formula) => `$${formula.trim()}$`)
    .replace(/\$\$\s*([\s\S]*?)\s*\$\$/g, (_, formula) => `$$\n${formula.trim()}\n$$`)
    .replace(
      /(^|[\s(])\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d{2})?)(?=\s|[.,;:!?)]|$)/g,
      (_, prefix, amount) => `${prefix}\\$${amount}`,
    );
}

export function normalizeBuddyMarkdown(value) {
  if (typeof value !== "string") return "";

  return value
    .replace(/\r\n?/g, "\n")
    .split(/(```[\s\S]*?```|`[^`\n]*`)/g)
    .map((segment, index) => (index % 2 === 0 ? normalizeProseAndMath(segment) : segment))
    .join("")
    .replace(/^[\s\u00a0]+/, "")
    .trimEnd();
}

export function hasStructuredBuddyFormatting(value) {
  const normalized = normalizeBuddyMarkdown(value);
  return /(^|\n)(#{1,6}\s|[-*+]\s|\d+\.\s|```|---)|\$\$|(^|[^\\])\$[^\s$][\s\S]*?\$|[\u0370-\u03ff\u2070-\u209f\u2200-\u22ff\u27c0-\u27ef\u2980-\u2aff]/m.test(normalized);
}

export function BuddyAnswer({ children }) {
  return (
    <div className="buddy-answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: "ignore", throwOnError: false }]]}
        skipHtml
      >
        {normalizeBuddyMarkdown(children)}
      </ReactMarkdown>
    </div>
  );
}
