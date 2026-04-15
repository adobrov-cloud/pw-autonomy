import { expect, type Locator } from '@playwright/test';

export async function waitForStatusCompleted(
  statusButton: Locator,
  opts: { label: string; timeout?: number; completedPattern?: RegExp },
) {
  const timeout = opts.timeout ?? 10 * 60_000;
  await expect(statusButton).toBeVisible({ timeout });

  await expect
    .poll(
      async () => {
        const text = (await statusButton.textContent()) ?? '';
        return text.trim();
      },
      {
        timeout,
        intervals: [250, 500, 1000, 2000, 5000, 10_000],
        message: `Waiting for "${opts.label} - Completed"`,
      },
    )
    .toMatch(opts.completedPattern ?? new RegExp(`${escapeRegExp(opts.label)}\\s*-\\s*completed`, 'i'));
}

function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

