import { expect, type Locator, type Page } from '@playwright/test';

export class Sidebar {
  readonly page: Page;

  readonly Root: Locator;
  readonly NewTaskItem: Locator;
  readonly AgentHubItem: Locator;
  readonly ProjectSettingsItem: Locator;
  readonly UserProfileTrigger: Locator;
  readonly UserProfileMenuItem: Locator;

  constructor(page: Page) {
    this.page = page;

    this.Root = page.getByTestId('sidebar');
    this.NewTaskItem = page.getByTestId('sidebar-new-task-item');
    this.AgentHubItem = page.getByTestId('sidebar-agent-hub-item');
    this.ProjectSettingsItem = page.getByTestId('sidebar-project-settings-item');
    this.UserProfileTrigger = page.getByTestId('sidebar-user-profile-trigger');
    this.UserProfileMenuItem = page.getByText(/user profile/i);
  }

  async assertVisible() {
    await expect(this.Root).toBeVisible();
  }

  async goToNewTask() {
    await this.NewTaskItem.click();
  }

  async goToAgentHub() {
    await this.AgentHubItem.click();
  }

  async goToProjectSettings() {
    await this.ProjectSettingsItem.click();
  }

  async openUserProfileMenu() {
    await this.UserProfileTrigger.click();
  }

  async openUserProfilePopupAndClose() {
    await this.openUserProfileMenu();

    const popupPromise = this.page.waitForEvent('popup');
    await this.UserProfileMenuItem.click();
    const popup = await popupPromise;

    await popup.keyboard.press('Escape').catch(() => {});
    await popup.close();
  }
}

