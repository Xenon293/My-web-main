import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

export function normalizeBuddyMarkdown(value) {
  return value
    .replace(/^(?:(?:&#x20;|&nbsp;)|\s)+/i, "")
    .replace(/\$\$([^\n$]+?)\$\$/g, (_, formula) => `$$\n${formula}\n$$`);
}

export function BuddyAnswer({ children }) {
  return (
    <div className="buddy-answer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        skipHtml
      >
        {normalizeBuddyMarkdown(children)}
      </ReactMarkdown>
    </div>
  );
}
