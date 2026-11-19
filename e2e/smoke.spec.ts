import { expect, test, type Page } from '@playwright/test';

import { DEMO_FIXTURES, DEMO_SLUGS } from '../lib/demoFixtures';
import { formatUsd } from '../lib/estimate';

/** Demo replay ticks one program every ~440 ms; 24 programs plus slack. */
const DEMO_REPLAY_TIMEOUT_MS = 20_000;

/** Number of Tab presses; well past the dialog's control count. */
const FOCUS_TRAP_TABS = 10;

/** Collects uncaught page errors and console errors for the whole test. */
function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  return errors;
}

for (const slug of DEMO_SLUGS) {
  test(`demo ${slug} renders the pre-baked results without an API key`, async ({ page }) => {
    // Arrange
    const errors = trackErrors(page);
    const fixture = DEMO_FIXTURES[slug];
    const eligibleCount = fixture.matches.filter((m) => m.eligible).length;

    // Act
    await page.goto(`/demo/${slug}`);

    // Assert
    await expect(page).toHaveURL(/\/results$/, { timeout: DEMO_REPLAY_TIMEOUT_MS });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      formatUsd(fixture.total_estimated_annual_value),
      { timeout: DEMO_REPLAY_TIMEOUT_MS },
    );
    await expect(page.getByText(`${eligibleCount} programs`).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test('an unknown demo slug redirects to the intake form', async ({ page }) => {
  await page.goto('/demo/not-a-persona');
  await expect(page).toHaveURL(/\/intake$/);
});

test('the intake form advances to the next step', async ({ page }) => {
  // Arrange
  const errors = trackErrors(page);
  await page.goto('/intake');
  await expect(page.getByText('Step 1 of 5')).toBeVisible();

  // Act
  await page.getByRole('button', { name: 'Next' }).click();

  // Assert
  await expect(page.getByText('Step 2 of 5')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the API key dialog traps focus and returns it on close', async ({ page }) => {
  // Arrange
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'API key settings' });

  // Act
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();

  // Assert: focus never leaves the dialog while tabbing. Polled because
  // base-ui wraps focus via a guard element just outside the popup, so
  // focus settles back inside a moment after the wrapping Tab press.
  for (let i = 0; i < FOCUS_TRAP_TABS; i++) {
    await page.keyboard.press('Tab');
    await expect
      .poll(() => dialog.evaluate((el) => el.contains(document.activeElement)), {
        message: `focus escaped the dialog after ${i + 1} Tab presses`,
      })
      .toBe(true);
  }

  // Assert: Escape closes it and focus returns to the trigger.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
