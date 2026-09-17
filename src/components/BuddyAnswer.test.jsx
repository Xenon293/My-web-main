import { render, screen } from "@testing-library/react";
import { BuddyAnswer } from "./BuddyAnswer";

test("renders educational Markdown and mathematics as readable content", () => {
  render(
    <BuddyAnswer>
      {"&#x20;\n\n### The rule\n\n- Add the previous terms\n\n$$F(n) = F(n-1) + F(n-2)$$"}
    </BuddyAnswer>,
  );

  expect(screen.getByRole("heading", { name: "The rule" })).toBeInTheDocument();
  expect(screen.getByRole("list")).toHaveTextContent("Add the previous terms");
  expect(document.querySelector(".katex-display")).toHaveTextContent("F(n)=F(n−1)+F(n−2)");
  expect(screen.queryByText("&#x20;")).not.toBeInTheDocument();
});
