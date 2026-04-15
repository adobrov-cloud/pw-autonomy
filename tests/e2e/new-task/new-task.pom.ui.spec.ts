import { expect, test } from '@playwright/test';
import { NewTaskPage } from '../../pages/NewTaskPage';
import { loginWithEnv } from '../../helpers/auth';

test.describe('New Task (POM) - assertions', () => {
  test('loads and mode toggle switches', async ({ page }) => {
    await loginWithEnv(page);

    const newTaskPage = new NewTaskPage(page);
    await newTaskPage.open();
    await newTaskPage.assertLoaded();

    await expect(newTaskPage.ModeToggleButton).toBeVisible();

    await newTaskPage.setMode('smart');
    await expect(newTaskPage.SwitchToFastModeButton).toBeVisible();

    await newTaskPage.setMode('fast');
    await expect(newTaskPage.SwitchToSmartModeButton).toBeVisible();
  });

  test('submits in fast mode and receives echo response', async ({ page }) => {
    test.setTimeout(6 * 60_000);
    await loginWithEnv(page);

    const newTaskPage = new NewTaskPage(page);
    await newTaskPage.open();
    await newTaskPage.assertLoaded();

    await newTaskPage.setMode('fast');
    await newTaskPage.createTask('123');

    // Wait until the run is truly done (button switches to "Planning - Completed").
    await newTaskPage.waitForPlanningCompleted({ timeout: 5 * 60_000 });

    const expected = /It looks like your message was just ["“]123["”]/i;
    await expect(page.getByText(expected)).toBeVisible({ timeout: 5 * 60_000 });

    await newTaskPage.discardTask();
  });
});

