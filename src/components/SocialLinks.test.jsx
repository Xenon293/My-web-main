import { render, screen } from "@testing-library/react";
import { siteConfig } from "../config/site";
import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Nav } from "./Nav";

test.each([
  ["navigation", <Nav />],
  ["footer", <Footer onPrivacyOpen={() => {}} />],
  ["contact", <Contact />],
])("shows Instagram in the %s", (_, component) => {
  const { unmount } = render(component);
  expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute("href", siteConfig.instagram);
  unmount();
});
