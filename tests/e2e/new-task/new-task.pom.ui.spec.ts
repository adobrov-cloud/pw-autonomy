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

  test('submits planning prompt and builds after completion', async ({ page }) => {
    test.setTimeout(40 * 60_000);
    await loginWithEnv(page);

    const newTaskPage = new NewTaskPage(page);
    await newTaskPage.open();
    await newTaskPage.assertLoaded();

    const prompt =
      'Run the application locally and open  http://localhost:3000/projects/new . ' +
      'Create a new project and set its name to:  {current timestamp} {faker.commerce.productName()} . ' +
      'Use Faker’s  commerce.productName()  method to generate the project name, since that method produces descriptive product names like “Incredible Soft Gloves.”  ' +
      'If you format the timestamp in ISO style, note that JavaScript’s  Date.prototype.toISOString()  returns a UTC timestamp ending in  Z , so use that only if UTC is acceptable for your flow';

    await newTaskPage.setMode('smart');
    await newTaskPage.createTask(prompt);

    await newTaskPage.waitForPlanningCompleted({ timeout: 10 * 60_000 });
    await newTaskPage.pressBuild();

    await expect(page.getByText("Plan approved. Let's make it real!")).toBeVisible({
      timeout: 60_000,
    });

    await newTaskPage.waitForCodeGenerationCompleted({ timeout: 20 * 60_000 });
    await newTaskPage.sendToDevs();
    await newTaskPage.waitForPrePrCompleted({ timeout: 10 * 60_000 });
  });
});

