# Contributing to Simple Shift Selector Panel

Thank you for your interest in contributing to the Simple Shift Selector Panel! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Testing Requirements](#testing-requirements)
- [Code Style](#code-style)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Community Guidelines](#community-guidelines)

## 🛠️ Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 22 or later
- **npm** 11 or later
- **Docker** (for running local Grafana instance)
- **Git**

### Getting Started

1. **Fork the repository** on GitHub
   - Navigate to https://github.com/monyskow/monyskow-simpleshiftselector-panel
   - Click the "Fork" button in the top right

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/monyskow-simpleshiftselector-panel.git
   cd monyskow-simpleshiftselector-panel
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start development**:
   ```bash
   # Terminal 1: Start webpack in watch mode
   npm run dev

   # Terminal 2: Start local Grafana instance
   npm run server
   ```

5. **Open Grafana**: Navigate to http://localhost:3000
   - Username: `admin`
   - Password: `admin`
   - The plugin should appear in the panel list

## 🔄 Development Workflow

### Making Changes

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

   Branch naming conventions:
   - `feature/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation changes
   - `test/` - Test additions or updates
   - `refactor/` - Code refactoring

2. **Make your changes**
   - Write code following the project style guide
   - Add or update tests as needed
   - Update documentation if you change functionality
   - Keep commits focused and atomic

3. **Run tests frequently**:
   ```bash
   npm run test:ci          # Run all unit tests
   npm run test:coverage    # Run with coverage report
   npm run e2e              # Run E2E tests (requires npm run server)
   ```

4. **Check types and linting**:
   ```bash
   npm run typecheck        # TypeScript type checking
   npm run lint             # ESLint check
   npm run lint:fix         # Auto-fix linting issues
   ```

5. **Build the plugin**:
   ```bash
   npm run build            # Production build
   ```

### Keeping Your Fork Updated

```bash
# Add upstream remote (one time only)
git remote add upstream https://github.com/monyskow/monyskow-simpleshiftselector-panel.git

# Fetch upstream changes
git fetch upstream

# Update your main branch
git checkout main
git merge upstream/main

# Update your feature branch
git checkout feature/your-feature-name
git rebase main
```

## 🧪 Testing Requirements

All contributions must include appropriate tests. We maintain high test coverage (93%+) to ensure plugin reliability.

### Unit Tests (Required)

- **Required for**: All business logic, utility functions, React components
- **Framework**: Jest + React Testing Library
- **Location**: `src/**/*.test.ts(x)`
- **Coverage targets**:
  - Statements: 80%+
  - Branches: 70%+
  - Functions: 70%+
  - Lines: 80%+

**Example unit test**:
```typescript
import { getShiftTimeRange } from './timeLogic';

describe('getShiftTimeRange', () => {
  it('should calculate time range for basic shift', () => {
    const shift = { name: 'Morning', start: '08:00', end: '16:00', dateOffset: 0 };
    const result = getShiftTimeRange(shift, 'Europe/Warsaw', '2025-01-15');

    expect(result.from).toBeDefined();
    expect(result.to).toBeDefined();
    // Assert correct time range
  });
});
```

### E2E Tests (Required for UI Changes)

- **Required for**: New UI features, user workflows, interaction changes
- **Framework**: Playwright + @grafana/plugin-e2e
- **Location**: `tests/**/*.spec.ts`
- **Test environments**: Multiple Grafana versions

**Example E2E test**:
```typescript
import { test, expect } from '@grafana/plugin-e2e';

test('should update time range when shift is selected', async ({ page, gotoPanelEditPage }) => {
  await gotoPanelEditPage({ dashboard: { uid: 'test-dashboard' } });

  const morningButton = page.getByRole('button', { name: /Morning/i });
  await morningButton.click();

  const timePicker = page.getByTestId('data-testid TimePicker Open Button');
  await expect(timePicker).toContainText('06:00');
});
```

### Running Tests

```bash
# Unit tests
npm run test              # Watch mode (for development)
npm run test:ci           # CI mode (all tests once)
npm run test:coverage     # With coverage report

# E2E tests
npm run server            # Start Grafana (keep running)
npm run e2e               # Run all E2E tests
npm run e2e -- --headed   # Run with browser visible (debugging)

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix
```

### Test Quality Standards

- **Deterministic**: Tests should pass consistently, no flaky tests
- **Isolated**: Each test should be independent
- **Clear descriptions**: Use descriptive test names
- **Edge cases**: Test boundary conditions and error scenarios
- **Mocking**: Mock external dependencies (time, API calls, etc.)

## 💅 Code Style

### General Guidelines

- **TypeScript**: Always use TypeScript, avoid `any` types
- **Components**: Functional components with hooks (no class components)
- **Immutability**: Prefer const, avoid mutations
- **Naming**:
  - Components: `PascalCase` (`SimplePanel`, `ShiftButton`)
  - Functions: `camelCase` (`calculateTimeRange`, `handleShiftClick`)
  - Constants: `UPPER_SNAKE_CASE` (`DEFAULT_TIMEZONE`, `MAX_SHIFTS`)
  - Files: Match component/export name (`SimplePanel.tsx`, `timeLogic.ts`)

### TypeScript Patterns

**Good**:
```typescript
interface TimeRange {
  from: string;
  to: string;
}

interface ShiftProps {
  name: string;
  onSelect: (shift: Shift) => void;
  isSelected: boolean;
}

/**
 * Calculates the time range for a given shift
 * @param shift - The shift configuration
 * @param timezone - The target timezone
 * @param date - The date in YYYY-MM-DD format
 * @returns The calculated time range in ISO format
 */
export function calculateShiftTimeRange(
  shift: Shift,
  timezone: string,
  date: string
): TimeRange {
  // Implementation
}
```

**Avoid**:
```typescript
// Too generic, no types
function calc(s: any, tz: any) {
  // Implementation
}

// Using any
function process(data: any) {
  return data.value; // No type safety
}
```

### React Patterns

**Good**:
```typescript
interface Props {
  shift: Shift;
  onSelect: (shift: Shift) => void;
}

export const ShiftButton: React.FC<Props> = ({ shift, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(shift);
  }, [shift, onSelect]);

  return (
    <button onClick={handleClick} aria-label={`Select ${shift.name} shift`}>
      {shift.name}
    </button>
  );
};
```

**Avoid**:
```typescript
// Inline handlers (recreated on every render)
<button onClick={() => onSelect(shift)}>
  {shift.name}
</button>

// Missing accessibility
<button onClick={handleClick}>
  {shift.name}
</button>
```

### File Structure

Keep files focused and manageable:
- **Components**: < 300 lines
- **Utilities**: < 200 lines
- **Tests**: < 500 lines (can be longer for comprehensive tests)

### Documentation

- Add JSDoc comments for public APIs
- Comment complex logic or non-obvious code
- Update README.md for user-facing changes
- Keep inline comments concise and helpful

## 🚀 Pull Request Process

### Before Submitting

1. **Update documentation**:
   - If you changed public APIs → Update README.md
   - If you added features → Update CHANGELOG.md
   - If you changed configuration → Update README configuration section

2. **Ensure all checks pass**:
   ```bash
   npm run test:ci          # ✅ All unit tests pass
   npm run e2e              # ✅ All E2E tests pass
   npm run typecheck        # ✅ No type errors
   npm run lint             # ✅ No linting errors
   npm run build            # ✅ Build successful
   npm run test:coverage    # ✅ Coverage maintained/improved
   ```

3. **Update CHANGELOG.md**:
   ```markdown
   ## [Unreleased]

   ### Added
   - New feature description (#PR-number)

   ### Fixed
   - Bug fix description (#PR-number)

   ### Changed
   - Breaking change description (#PR-number)
   ```

### Pull Request Guidelines

**Title**: Use conventional commits format:
- `feat: Add support for custom timezones`
- `fix: Correct overnight shift calculation`
- `docs: Update installation instructions`
- `test: Add tests for date picker`
- `refactor: Simplify time calculation logic`
- `chore: Update dependencies`

**Description** template:
```markdown
## Description
Brief description of what this PR does.

## Motivation
Why is this change needed? What problem does it solve?

## Changes
- List of main changes
- Another change
- Breaking changes (if any)

## Testing
How to test these changes:
1. Step 1
2. Step 2
3. Expected result

## Screenshots
(If applicable, add before/after screenshots)

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] All CI checks passing
- [ ] Self-review completed

## Breaking Changes
(If any, describe migration path)
```

### Review Process

1. **Automated checks** run on PR submission (CI pipeline)
2. **Maintainer review** typically within 3-5 business days
3. **Address feedback** if requested by reviewers
4. **Approval and merge** by project maintainer

### After Merge

- Your changes will be included in the next release
- You'll be credited in the CHANGELOG
- Thank you for contributing! 🎉

## 🐛 Reporting Bugs

Use [GitHub Issues](https://github.com/monyskow/monyskow-simpleshiftselector-panel/issues) with the bug report template.

### Good Bug Report Includes:

- **Clear title**: Short, descriptive summary
- **Description**: What went wrong
- **Steps to reproduce**:
  1. Go to...
  2. Click on...
  3. Configure...
  4. See error
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happened
- **Environment**:
  - Grafana version (e.g., 10.4.0)
  - Plugin version (e.g., 1.0.0)
  - Browser and version (e.g., Chrome 120)
  - OS (e.g., macOS 14, Windows 11)
- **Console errors**: Check browser console (F12)
- **Screenshots**: If applicable
- **Additional context**: Relevant configuration, dashboard setup, etc.

### Example Bug Report:

```markdown
**Title**: Overnight shift displays incorrect end time in dropdown mode

**Description**:
When using dropdown display mode, overnight shifts (e.g., 22:00-06:00)
show the wrong end time in the selector.

**Steps to Reproduce**:
1. Configure shift: Name="Night", Start="22:00", End="06:00", Offset=1
2. Set display mode to "dropdown"
3. Open dropdown selector
4. Observe displayed time range

**Expected**: Should show "Night (22:00 - 06:00 +1 day)"
**Actual**: Shows "Night (22:00 - 06:00)"

**Environment**:
- Grafana: 11.0.0
- Plugin: 1.0.0
- Browser: Firefox 121
- OS: Ubuntu 22.04

**Console Errors**: None

**Screenshots**: [Attach screenshot]
```

## 💡 Requesting Features

Use [GitHub Issues](https://github.com/monyskow/monyskow-simpleshiftselector-panel/issues) with the feature request template.

### Good Feature Request Includes:

- **Clear title**: Feature summary
- **Use case**: Why do you need this?
- **Proposed solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional context**: Examples, mockups, references

### Example Feature Request:

```markdown
**Title**: Add support for shift templates/presets

**Use Case**:
As a dashboard administrator managing multiple dashboards with similar
shift patterns, I want to save shift configurations as templates so I can
reuse them across dashboards without manually recreating them each time.

**Proposed Solution**:
Add a "Save as Template" button in the panel editor that:
1. Saves current shift configuration with a name
2. Makes it available in a "Load Template" dropdown
3. Stores templates in browser localStorage or Grafana preferences

**Alternatives**:
- Export/import shift configuration as JSON
- Dashboard-level shift configuration (inherited by all panels)

**Additional Context**:
Similar feature in the "Time of Day" panel plugin.
```

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Be Professional
- No trolling, insulting comments, or personal attacks
- No harassment, public or private
- No publishing others' private information without permission
- Keep discussions on-topic and productive
- Respect project maintainers' decisions

### Be Helpful
- Help newcomers get started
- Provide constructive feedback in reviews
- Share knowledge and experience
- Acknowledge contributions from others
- Be patient with questions

### Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to marcinct@onyskow.com.

## ❓ Questions?

- **General questions**: [GitHub Discussions](https://github.com/monyskow/monyskow-simpleshiftselector-panel/discussions)
- **Bug reports**: [GitHub Issues](https://github.com/monyskow/monyskow-simpleshiftselector-panel/issues)
- **Feature requests**: [GitHub Issues](https://github.com/monyskow/monyskow-simpleshiftselector-panel/issues)
- **Email**: marcinct@onyskow.com

## 📚 Additional Resources

- [Grafana Plugin Development Guide](https://grafana.com/developers/plugin-tools/)
- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

Thank you for contributing to Simple Shift Selector Panel! 🎉

Your contributions help make this plugin better for everyone.
