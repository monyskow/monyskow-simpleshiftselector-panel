# Testing Guide for Simple Shift Selector Plugin

This document provides comprehensive information about the testing strategy and how to run tests for the Simple Shift Selector Grafana plugin.

## Testing Strategy

The plugin uses a multi-layered testing approach:

1. **Unit Tests** - Test individual components and business logic in isolation
2. **E2E Tests** - Test the complete plugin behavior in a real Grafana environment
3. **CI/CD** - Automated testing across multiple Grafana versions

## Test Framework Stack

- **Unit Testing**: Jest + React Testing Library + @testing-library/jest-dom
- **E2E Testing**: Playwright + @grafana/plugin-e2e
- **Coverage**: Jest coverage with Istanbul
- **CI/CD**: GitHub Actions

## Running Tests Locally

### Unit Tests

```bash
# Run tests in watch mode (recommended for development)
npm test

# Run all tests once
npm run test:ci

# Run tests with coverage report
npm run test:coverage
```

#### Coverage Reports

After running `npm run test:coverage`, you can view the coverage report:
- **Terminal**: Coverage summary displayed in console
- **HTML Report**: Open `coverage/lcov-report/index.html` in your browser
- **LCOV**: `coverage/lcov.info` for CI integration

#### Coverage Thresholds

The project maintains the following minimum coverage thresholds:
- **Statements**: 80%
- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 80%

### E2E Tests

```bash
# Start Grafana with the plugin
npm run server

# In another terminal, run E2E tests
npm run e2e

# Run specific test file
npx playwright test tests/shift-selection.spec.ts

# Run in UI mode (interactive)
npx playwright test --ui

# Run with debugging
npx playwright test --debug
```

## Test Files Structure

```
monyskow-simpleshiftselector-panel/
├── src/
│   ├── components/
│   │   ├── SimplePanel.test.tsx          # Panel component tests
│   │   ├── SimpleEditor.test.tsx         # Editor component tests
│   │   └── ErrorBoundary.test.tsx        # Error handling tests
│   ├── timeLogic.test.ts                 # Business logic tests
│   └── test-utils.tsx                    # Shared test utilities
├── tests/                                 # E2E tests
│   ├── shift-selection.spec.ts           # Shift selection E2E tests
│   ├── date-picker.spec.ts               # Date picker E2E tests
│   └── display-modes.spec.ts             # Display mode E2E tests
└── jest.config.js                        # Jest configuration
```

## What's Tested

### Unit Tests

#### timeLogic.test.ts
- Time range calculations in different timezones
- Overnight shift handling
- Date offset functionality
- DST (Daylight Saving Time) transitions
- Error handling for invalid inputs
- Active shift detection

#### SimplePanel.test.tsx
- Empty state when no shifts configured
- Shift button rendering and interaction
- Dropdown mode rendering
- Date picker functionality
- **Date change resets selected shift** (NEW feature)
- Time range updates on shift selection
- Error boundary integration
- Accessibility (ARIA attributes)

#### SimpleEditor.test.tsx
- Adding new shifts
- Editing shift properties (name, start, end)
- Date offset controls (increment/decrement)
- Removing shifts
- Field validation

#### ErrorBoundary.test.tsx
- Catching and displaying errors
- Custom fallback UI
- Error logging
- Recovery behavior

### E2E Tests

#### shift-selection.spec.ts
- Shift buttons visibility
- Time range updates when shift is selected
- Visual highlighting of selected shift
- Switching between shifts
- Shift icons display
- Error handling

#### date-picker.spec.ts
- Date picker visibility
- Default to current date
- Date selection
- **Shift deselection when date changes** (NEW feature)
- Today button functionality
- Date-based time range calculation

#### display-modes.spec.ts
- Button mode display
- Dropdown mode display
- Icon rendering in both modes
- Layout responsiveness
- Mode switching (if applicable)
- Empty state handling

## CI/CD Testing

### GitHub Actions Workflow

The CI pipeline runs:

1. **Build & Lint Job**
   - Type checking (`npm run typecheck`)
   - Linting (`npm run lint`)
   - Unit tests with coverage (`npm run test:ci`)
   - Build (`npm run build`)

2. **E2E Tests Job** (matrix strategy)
   - Tests across multiple Grafana versions
   - Automatically resolves compatible versions
   - Runs in parallel for efficiency
   - Publishes test reports to GitHub Pages

### Tested Grafana Versions

The plugin is automatically tested against:
- Latest patch versions from the last 6 releases
- Based on `grafanaDependency` in plugin.json

## Writing New Tests

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should handle user interaction', () => {
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@grafana/plugin-e2e';

test('should display panel correctly', async ({
  page,
  gotoPanelEditPage,
  readProvisionedDashboard
}) => {
  const dashboard = await readProvisionedDashboard({
    fileName: 'dashboard.json'
  });
  const panelEditPage = await gotoPanelEditPage({
    dashboard,
    id: '1'
  });

  await expect(page.getByText('Expected Text')).toBeVisible();
});
```

## Best Practices

### Unit Tests
- Use React Testing Library's user-centric queries (`getByRole`, `getByLabelText`)
- Test behavior, not implementation details
- Mock external dependencies (API calls, time functions)
- Keep tests focused and independent
- Use descriptive test names

### E2E Tests
- Test complete user workflows
- Use stable selectors (roles, labels, test IDs)
- Add appropriate waits for async operations
- Test across different panel configurations
- Verify visual changes and state updates

## Troubleshooting

### Unit Tests Failing
- Ensure timezone is UTC (set in jest.config.js)
- Check mock implementations match actual behavior
- Verify @grafana dependencies are up to date

### E2E Tests Failing
- Ensure Grafana is running (`npm run server`)
- Check if provisioned dashboards are loaded correctly
- Verify test data matches dashboard configuration
- Use `--debug` flag to step through tests

### Coverage Threshold Failures
- Add tests for uncovered code paths
- Focus on critical business logic first
- Use coverage HTML report to identify gaps

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)
- [Grafana Plugin E2E](https://grafana.com/developers/plugin-tools/e2e-test-a-plugin)

## Recent Test Additions

### Date Change Resets Selected Shift
A new feature was added where changing the date automatically deselects the currently selected shift. This is covered by:

**Unit Tests:**
- `SimplePanel.test.tsx` - "should unselect shift when date is changed"

**E2E Tests:**
- `date-picker.spec.ts` - "should unselect shift when date is changed"
- `date-picker.spec.ts` - "should unselect shift when Today button resets date"

This ensures users must explicitly re-select a shift after changing the date, preventing confusion about which date's shift is active.
