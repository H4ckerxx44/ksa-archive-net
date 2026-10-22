import { expect, test } from "@playwright/test";

test("archive homepage and build table render", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Kitten Space Agency.*Archive/i);
  await expect(
    page.getByRole("heading", { name: /Kitten Space Agency/i }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build History" })).toBeVisible();

  const rows = page.locator("#tbody tr");
  await expect(rows.first()).toBeVisible();
  expect(await rows.count()).toBeGreaterThan(0);
  await expect(page.locator("#buildCount")).toContainText("builds tracked");
});

test("download links point to the archive file host", async ({ page }) => {
  await page.goto("/");

  const downloadLinks = page.locator("#tbody a.dl-link");
  const count = await downloadLinks.count();
  expect(count).toBeGreaterThan(0);

  for (const link of await downloadLinks.all()) {
    const href = await link.getAttribute("href");
    expect(href).toMatch(/^https:\/\/files\.ksa-archive\.net\/builds\/\d+\/[^/]+$/);
  }
});

test("theme toggle switches between dark and light themes", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");
  const initialTheme = await html.getAttribute("data-theme");

  await page.getByRole("button", { name: "Toggle light/dark mode" }).click();
  await expect(html).toHaveAttribute(
    "data-theme",
    initialTheme === "dark" ? "light" : "dark",
  );
});
