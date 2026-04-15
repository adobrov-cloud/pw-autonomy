import { expect, type Locator, type Page } from '@playwright/test';
import { Sidebar } from './Sidebar';
import { waitForStatusCompleted } from '../helpers/statusWait';

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
  readonly CodeGenerationStatusButton: Locator;
  readonly PrePrStatusButton: Locator;
  readonly DiscardTaskButton: Locator;
  readonly ConfirmDiscardTaskButton: Locator;
  readonly PlanningBuildButton: Locator;
  readonly SendToDevsButton: Locator;
  readonly SendToDevsDialog: Locator;
  readonly ConfirmSendToDevsDialogButton: Locator;

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
    this.CodeGenerationStatusButton = page.getByRole('button', { name: /^code generation\s*-\s*/i });
    this.PrePrStatusButton = page.getByRole('button', { name: /^pre\s*-?\s*pr\s*-\s*/i });
    this.DiscardTaskButton = page.getByTestId('discard-task-button');
    this.ConfirmDiscardTaskButton = page.getByTestId('close-task-discard-button');
    this.PlanningBuildButton = page.getByTestId('planning-build-button');
    this.SendToDevsButton = page.getByTestId('send-to-devs-button');

    this.SendToDevsDialog = page.getByRole('dialog', { name: /send to devs/i });
    this.ConfirmSendToDevsDialogButton = this.SendToDevsDialog.getByRole('button', {
      name: /^send to devs$/i,
    });
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
    await waitForStatusCompleted(this.PlanningStatusButton, {
      label: 'Planning',
      timeout: opts?.timeout,
    });
  }

  async waitForCodeGenerationCompleted(opts?: { timeout?: number }) {
    await waitForStatusCompleted(this.CodeGenerationStatusButton, {
      label: 'Code Generation',
      timeout: opts?.timeout,
    });
  }

  async waitForPrePrCompleted(opts?: { timeout?: number }) {
    await waitForStatusCompleted(this.PrePrStatusButton, {
      label: 'Pre PR',
      completedPattern: /pre\s*-?\s*pr\s*-\s*completed/i,
      timeout: opts?.timeout,
    });
  }

  async discardTask(opts?: { timeout?: number }) {
    const timeout = opts?.timeout ?? 30_000;
    await expect(this.DiscardTaskButton).toBeVisible({ timeout });
    await this.DiscardTaskButton.click();

    // Confirm in the modal/popover that appears after clicking discard.
    await expect(this.ConfirmDiscardTaskButton).toBeVisible({ timeout });
    await this.ConfirmDiscardTaskButton.click();
  }

  async pressBuild(opts?: { timeout?: number }) {
    const timeout = opts?.timeout ?? 30_000;
    await expect(this.PlanningBuildButton).toBeVisible({ timeout });
    await this.PlanningBuildButton.click();
  }

  async sendToDevs(opts?: { timeout?: number }) {
    const timeout = opts?.timeout ?? 30_000;
    await expect(this.SendToDevsButton).toBeVisible({ timeout });
    await expect(this.SendToDevsButton).toBeEnabled({ timeout });

    await this.SendToDevsButton.click();

    // Clicking the top-bar button opens a confirmation dialog.
    await expect(this.SendToDevsDialog).toBeVisible({ timeout });
    await expect(this.ConfirmSendToDevsDialogButton).toBeVisible({ timeout });
    await expect(this.ConfirmSendToDevsDialogButton).toBeEnabled({ timeout });
    await this.ConfirmSendToDevsDialogButton.click();

    // Confirm click had an effect: Pre PR status appears or the dialog closes.
    await expect
      .poll(
        async () => {
          const [dialogVisible, prePrVisible] = await Promise.all([
            this.SendToDevsDialog.isVisible().catch(() => false),
            this.PrePrStatusButton.isVisible().catch(() => false),
          ]);
          return prePrVisible || !dialogVisible;
        },
        {
          timeout,
          intervals: [250, 500, 1000, 2000],
          message: 'Waiting for Send to Devs confirmation to start',
        },
      )
      .toBeTruthy();
  }
}

