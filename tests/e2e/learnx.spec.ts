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

test("sample paths populate the builder and preserve the sign-in gate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Python & AI", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Get fluent in Python" })).toBeVisible();
  await page.getByRole("button", { name: /Machine learning, Weeks 5/ }).click();
  await expect(page.getByRole("heading", { name: "Train your first model" })).toBeVisible();
  await expect(page.getByTestId("learning-path-preview")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: test.info().outputPath("landing-desktop.png") });
  await page.getByRole("button", { name: "Make it yours" }).click();
  const prompt = page.getByPlaceholder("I want to learn Python in 3 months...");
  await expect(prompt).toHaveValue("Master Python & Machine Learning in 2 months");
  await expect(prompt).toBeFocused();
  await page.getByRole("button", { name: "Forge my path" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: /Forging/ })).toHaveCount(0);
});

test("mobile preview works with reduced motion and no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/");
  const design = page.getByRole("group", { name: "Explore sample learning tracks" }).getByRole("button", { name: "Design", exact: true });
  await design.focus();
  await page.keyboard.press("Enter");
  await expect(design).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Start with the person" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByTestId("learning-path-preview")).toHaveCSS("opacity", "1");
  await page.screenshot({ path: test.info().outputPath("landing-mobile.png") });
  await page.getByRole("button", { name: "Make it yours" }).click();
  await expect(page.getByPlaceholder("I want to learn Python in 3 months...")).toHaveValue("UI/UX Design for beginners in 4 weeks");
});

test("saved demo can be resumed from the landing page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Try demo roadmap/i }).click();
  await expect(page.getByRole("heading", { name: /Full-Stack Next.js Developer/i })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(localStorage.getItem("learnx:active-roadmap:v1")))).toBe(true);
  await page.goto("/");
  await expect(page.getByText("Pick up where you left off")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Roadmap completion" })).toHaveAttribute("aria-valuenow", "25");
  await page.getByRole("button", { name: "Continue learning", exact: true }).click();
  await expect(page).toHaveURL(/\/roadmap\/demo\?roadmap=/);
  await expect(page.getByRole("heading", { name: /Full-Stack Next.js Developer/i })).toBeVisible();
});

test("learning studio saves favorites and turns a weekly schedule into a goal", async ({ page }) => {
  await page.goto("/");
  await page.locator("#explore").screenshot({ path: test.info().outputPath("learning-studio-desktop.png") });
  const filters = page.getByRole("group", { name: "Filter learning paths" });
  await filters.getByRole("button", { name: "Design", exact: true }).click();
  await page.getByRole("button", { name: "Save Design with intention", exact: true }).click();
  await filters.getByRole("button", { name: /Saved/ }).click();
  await expect(page.getByRole("heading", { name: "Design with intention" })).toBeVisible();
  await page.getByRole("button", { name: "Plan Design with intention", exact: true }).click();
  await expect(page.getByLabel("What are we making time for?")).toHaveValue("design");
  const sessionLength = page.getByRole("slider", { name: "Time per session" });
  await sessionLength.focus();
  await sessionLength.press("Home");
  await sessionLength.press("ArrowRight");
  await sessionLength.press("ArrowRight");
  await sessionLength.press("ArrowRight");
  await page.getByRole("button", { name: "Tuesday", exact: true }).click();
  await page.getByRole("button", { name: "8 weeks", exact: true }).click();
  await page.reload();
  await filters.getByRole("button", { name: /Saved/ }).click();
  await expect(page.getByRole("button", { name: "Unsave Design with intention" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("slider", { name: "Time per session" })).toHaveValue("60");
  await page.getByRole("button", { name: "Build my learning plan" }).click();
  await expect(page.getByPlaceholder("I want to learn Python in 3 months...")).toHaveValue("UI/UX design in 8 weeks; 60 min/day, 4 days/week");
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.locator("#study-planner").screenshot({ path: test.info().outputPath("study-planner-mobile.png") });
});
