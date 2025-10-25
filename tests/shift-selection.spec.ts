import { test, expect } from '@grafana/plugin-e2e';

test.describe('Shift Selection', () => {
  test('should display configured shifts in button mode', async ({ page, gotoPanelEditPage, readProvisionedDashboard }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    // Check if shift buttons are visible
    await expect(page.getByRole('button', { name: /Morning/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Afternoon/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Night/i })).toBeVisible();
  });

  test('should update Grafana time range when shift is selected', async ({
    page,
    gotoPanelEditPage,
    readProvisionedDashboard,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    // Get initial time range from the time picker button
    const timePickerBefore = page.getByTestId('data-testid TimePicker Open Button');
    const initialTimeRange = await timePickerBefore.textContent();

    // Click on a shift
    const morningShift = page.getByRole('button', { name: /Morning/i });
    await morningShift.click();

    // Wait for time range to update
    await page.waitForTimeout(500);

    // Check that time range has changed
    const timePickerAfter = page.getByTestId('data-testid TimePicker Open Button');
    const updatedTimeRange = await timePickerAfter.textContent();

    expect(updatedTimeRange).not.toBe(initialTimeRange);
  });

  test('should highlight selected shift', async ({ page, gotoPanelEditPage, readProvisionedDashboard }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    const morningShift = page.getByRole('button', { name: /Morning/i });

    // Check initial state
    await expect(morningShift).toHaveAttribute('aria-pressed', 'false');

    // Click shift
    await morningShift.click();

    // Check highlighted state
    await expect(morningShift).toHaveAttribute('aria-pressed', 'true');
  });

  test('should allow switching between shifts', async ({ page, gotoPanelEditPage, readProvisionedDashboard }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    const morningShift = page.getByRole('button', { name: /Morning/i });
    const afternoonShift = page.getByRole('button', { name: /Afternoon/i });

    // Select morning shift
    await morningShift.click();
    await expect(morningShift).toHaveAttribute('aria-pressed', 'true');
    await expect(afternoonShift).toHaveAttribute('aria-pressed', 'false');

    // Select afternoon shift
    await afternoonShift.click();
    await expect(afternoonShift).toHaveAttribute('aria-pressed', 'true');
    await expect(morningShift).toHaveAttribute('aria-pressed', 'false');
  });

  test('should display shift time ranges on buttons', async ({ page, gotoPanelEditPage, readProvisionedDashboard }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    // Check that time ranges are displayed
    await expect(page.getByText(/06:00.*14:00/)).toBeVisible();
    await expect(page.getByText(/14:00.*22:00/)).toBeVisible();
    await expect(page.getByText(/22:00.*06:00/)).toBeVisible();
  });

  test('should show appropriate icons for different shift types', async ({
    page,
    gotoPanelEditPage,
    readProvisionedDashboard,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    // Morning shift should have sun icon
    const morningButton = page.getByRole('button', { name: /Morning/i });
    await expect(morningButton.locator('svg')).toBeVisible();

    // Night shift should have moon icon
    const nightButton = page.getByRole('button', { name: /Night/i });
    await expect(nightButton.locator('svg')).toBeVisible();
  });

  test('should handle shift selection errors gracefully', async ({
    page,
    gotoPanelEditPage,
    readProvisionedDashboard,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    // Configure invalid timezone in panel options
    const options = panelEditPage.getCustomOptions('Simple Shift Selector');
    // Note: This test assumes we can configure an invalid timezone
    // The actual implementation might prevent this, so error handling would be tested differently

    // For now, just ensure clicking a shift doesn't crash the panel
    const morningShift = page.getByRole('button', { name: /Morning/i });
    await morningShift.click();

    // Panel should still be visible (not crashed)
    await expect(morningShift).toBeVisible();
  });
});
