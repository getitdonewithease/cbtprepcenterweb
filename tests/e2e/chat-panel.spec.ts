import { test, expect } from "@playwright/test";

// TODO: Enable this once the E2E environment has a seeded review session and
// authenticated storage state. The Tier 2 test in
// src/features/practice/ui/__tests__/AIChatPanel.test.tsx covers the freeze
// regression until then.
test.describe.skip("AI Chat Panel E2E (Tier 3 E2E Test)", () => {
  test("review page loads and AI chat does not freeze on history interaction", async ({ page }) => {
    await page.goto("/practice/review/test-session-id");

    await expect(page.getByRole("heading", { name: /test review/i })).toBeVisible();

    const aiHelpButton = page.getByRole("button", { name: /ai help/i });
    await expect(aiHelpButton).toBeVisible();
    await aiHelpButton.click();

    const chatInput = page.getByPlaceholder(/ask about this question|how can i help you today/i);
    await expect(chatInput).toBeVisible();
    await expect(chatInput).toBeEnabled();
    await chatInput.fill("Hello AI Tutor");
    await expect(chatInput).toHaveValue("Hello AI Tutor");

    const historyToggle = page.getByLabel(/toggle chat history/i);
    await expect(historyToggle).toBeVisible();
    await historyToggle.click();

    // Once a seeded empty conversation is available, add:
    // await page.getByRole("button", { name: "Empty Test Conversation" }).click();
    // await expect(chatInput).toBeEnabled();
  });
});
