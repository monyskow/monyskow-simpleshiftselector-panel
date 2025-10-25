import { test, expect } from '@grafana/plugin-e2e';

test.describe('Panel Basic Tests', () => {
  test('should display empty state when no shifts are configured', async ({
    gotoPanelEditPage,
    readProvisionedDashboard,
    page,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '2' }); // Panel 2 has no shifts

    // Should display the empty state message
    await expect(page.getByText('Please configure shifts in the panel editor.')).toBeVisible();

    // Empty state message is sufficient verification
    // Icon test IDs may vary across Grafana versions
  });

  test('should display shifts when configured', async ({ gotoPanelEditPage, readProvisionedDashboard, page }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' }); // Panel 1 has shifts

    // Should display shift buttons
    await expect(page.getByRole('button', { name: /Morning/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Afternoon/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Night/i })).toBeVisible();
  });

  test('should display date picker when enabled', async ({
    gotoPanelEditPage,
    readProvisionedDashboard,
    page,
  }) => {
    const dashboard = await readProvisionedDashboard({ fileName: 'dashboard.json' });
    const panelEditPage = await gotoPanelEditPage({ dashboard, id: '1' });

    // Check for date input
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();

    // Check for Today button
    await expect(page.getByRole('button', { name: /Today/i })).toBeVisible();
  });
});
