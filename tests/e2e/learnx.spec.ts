import { expect, test } from "@playwright/test";

test("landing page exposes the builder and command palette", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Turn ambition into/i })).toBeVisible();
  await page.getByRole("button", { name: /Start learning/i }).click();
  const prompt = page.getByPlaceholder("I want to learn Python in 3 months...");
  await expect(prompt).toBeVisible();
  await expect(prompt).toHaveAttribute("maxlength", "80");

  await page.getByRole("button", { name: "Start judge tour" }).click();
  await expect(page.getByRole("dialog", { name: "LearnX guided tour" })).toBeVisible();
  await expect(page.getByText("One goal, one clear path")).toBeVisible();
  await page.getByRole("button", { name: "Close guided tour" }).click();

  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog", { name: "LearnX Commands" })).toBeVisible();
  await expect(page.getByRole("option", { name: /Open offline demo/i })).toBeVisible();
});

test("offline demo supports comparison", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try demo roadmap/i }).click();
  await expect(page).toHaveURL(/\/roadmap\/demo\?roadmap=/, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: /Full-Stack Next.js Developer/i })).toBeVisible();

  await page.getByRole("button", { name: /Compare/i }).click();
  await expect(page.getByRole("heading", { name: "Compare two learning paths" })).toBeVisible();
  await page.getByRole("button", { name: /Compare with offline demo/i }).click();
  await expect(page.getByText("Planned schedule")).toBeVisible();
});
