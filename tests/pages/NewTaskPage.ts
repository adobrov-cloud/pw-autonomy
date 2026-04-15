import { expect, type Locator, type Page } from '@playwright/test';
import { Sidebar } from './Sidebar';

export type TaskStep = 'planning' | 'code_generation' | 'detect_component';
export type Mode = 'smart' | 'fast';

export class NewTaskPage {
  readonly page: Page;
  readonly sidebar: Sidebar;

  readonly Root: Locator;
  readonly TaskDescriptionTextbox: Locator;
  readonly SubmitButton: Locator;

  readonly StepSelectorButton: Locator;
  readonly ModeToggleButton: Locator;
  readonly SwitchToSmartModeButton: Locator;
  readonly SwitchToFastModeButton: Locator;

  readonly ConnectFigmaChip: Locator;
  readonly FromScreenshotChip: Locator;

  readonly DismissTrialBannerButton: Locator;
  readonly PlanningStatusButton: Locator;
  readonly DiscardTaskButton: Locator;
  readonly ConfirmDiscardTaskButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sidebar = new Sidebar(page);

    this.Root = page.getByTestId('new-task-page');
    this.TaskDescriptionTextbox = page.getByTestId('task-description-textbox');
    this.SubmitButton = page.getByTestId('submit-button');

    this.StepSelectorButton = page.getByTestId('step-selector-button');
    this.ModeToggleButton = page.getByRole('button', { name: /switch to (fast|smart) mode/i });
    this.SwitchToSmartModeButton = page.getByRole('button', { name: /switch to smart mode/i });
    this.SwitchToFastModeButton = page.getByRole('button', { name: /switch to fast mode/i });

    this.ConnectFigmaChip = page.getByTestId('connect-figma-chip');
    this.FromScreenshotChip = page.getByTestId('from-screenshot-chip');

    this.DismissTrialBannerButton = page.getByRole('button', { name: /dismiss trial banner/i });
    this.PlanningStatusButton = page.getByRole('button', { name: /^planning\s*-\s*/i });
    this.DiscardTaskButton = page.getByTestId('discard-task-button');
    this.ConfirmDiscardTaskButton = page.getByTestId('close-task-discard-button');
  }

  async assertLoaded() {
    await expect(this.Root).toBeVisible();
    await expect(this.TaskDescriptionTextbox).toBeVisible();
    await expect(this.SubmitButton).toBeVisible();

    await expect(this.StepSelectorButton).toBeVisible();
    await expect(this.ModeToggleButton).toBeVisible();

    await expect(this.ConnectFigmaChip).toBeVisible();
    await expect(this.FromScreenshotChip).toBeVisible();
  }

  async open() {
    await this.sidebar.goToNewTask();
    await this.assertLoaded();
  }

  async setStep(step: TaskStep) {
    await this.StepSelectorButton.click();
    await this.page.getByTestId(`step-selector-item-${step}`).click();
  }

  /**
   * The toggle button label indicates the *next* mode it will switch to.
   * If "Switch to smart mode" is visible -> current mode is fast, click to become smart.
   */
  async setMode(mode: Mode) {
    const clickIfVisible = async (locator: Locator) => {
      if (await locator.isVisible().catch(() => false)) {
        await locator.click();
        return true;
      }
      return false;
    };

    if (mode === 'smart') {
      await clickIfVisible(this.SwitchToSmartModeButton);
      await expect(this.SwitchToFastModeButton).toBeVisible();
      return;
    }

    await clickIfVisible(this.SwitchToFastModeButton);
    await expect(this.SwitchToSmartModeButton).toBeVisible();
  }

  async switchToSmartMode() {
    await this.setMode('smart');
  }

  async switchToFastMode() {
    await this.setMode('fast');
  }

  async connectFigma() {
    await this.ConnectFigmaChip.click();
  }

  async chooseFromScreenshot() {
    await this.FromScreenshotChip.click();
  }

  async dismissTrialBannerIfVisible() {
    if (await this.DismissTrialBannerButton.isVisible().catch(() => false)) {
      await this.DismissTrialBannerButton.click();
    }
  }

  async pressEscape(times = 1) {
    for (let i = 0; i < times; i++) {
      await this.page.keyboard.press('Escape');
    }
  }

  async createTask(description: string) {
    await this.TaskDescriptionTextbox.click();
    await this.TaskDescriptionTextbox.fill(description);
    await this.SubmitButton.click();
  }

  async waitForPlanningCompleted(opts?: { timeout?: number }) {
    const timeout = opts?.timeout ?? 5 * 60_000;
    await expect(this.PlanningStatusButton).toBeVisible({ timeout });

    await expect
      .poll(
        async () => {
          const text = (await this.PlanningStatusButton.textContent()) ?? '';
          return text.trim();
        },
        {
          timeout,
          intervals: [250, 500, 1000, 2000, 5000, 10_000],
          message: 'Waiting for "Planning - Completed"',
        },
      )
      .toMatch(/planning\s*-\s*completed/i);
  }

  async discardTask(opts?: { timeout?: number }) {
    const timeout = opts?.timeout ?? 30_000;
    await expect(this.DiscardTaskButton).toBeVisible({ timeout });
    await this.DiscardTaskButton.click();

    // Confirm in the modal/popover that appears after clicking discard.
    await expect(this.ConfirmDiscardTaskButton).toBeVisible({ timeout });
    await this.ConfirmDiscardTaskButton.click();
  }
}

