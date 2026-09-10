import { getRouteMetadata } from "./Seo";

test("provides distinct metadata for the privacy route", () => {
  expect(getRouteMetadata("/privacy").title).toMatch(/Privacy/);
  expect(getRouteMetadata("/privacy").title).not.toBe(getRouteMetadata("/").title);
});
