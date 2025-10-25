# How to Create a Grafana Panel Plugin: Complete Tutorial

This tutorial walks you through building a complete Grafana panel plugin from scratch. We'll build the **Simple Shift Selector** plugin, which allows users to quickly change dashboard time ranges by clicking predefined work shifts.

## Table of Contents

1. [What We're Building](#what-were-building)
2. [Prerequisites](#prerequisites)
3. [Understanding the Scaffolded Structure](#understanding-the-scaffolded-structure)
4. [Step 1: Define Plugin Metadata](#step-1-define-plugin-metadata)
5. [Step 2: Define TypeScript Interfaces](#step-2-define-typescript-interfaces)
6. [Step 3: Configure Panel Options](#step-3-configure-panel-options)
7. [Step 4: Implement Time Logic](#step-4-implement-time-logic)
8. [Step 5: Create CSS Styles](#step-5-create-css-styles)
9. [Step 6: Build the Main Panel Component](#step-6-build-the-main-panel-component)
10. [Step 7: Add Error Boundary](#step-7-add-error-boundary)
11. [Step 8: Build the Custom Editor](#step-8-build-the-custom-editor)
12. [Step 9: Add Assets](#step-9-add-assets)
13. [Testing and Development](#testing-and-development)
14. [Building and Deployment](#building-and-deployment)
15. [Best Practices and Common Pitfalls](#best-practices-and-common-pitfalls)

---

## What We're Building

The **Simple Shift Selector** plugin helps operations teams, manufacturers, healthcare facilities, and logistics companies quickly switch between predefined time ranges (shifts) on their dashboards. Instead of manually adjusting the time picker, users can click a button like "Day Shift" or "Night Shift" to instantly update the entire dashboard.

### Key Features:
- **Shift Buttons or Dropdown**: Display shifts as clickable buttons or a dropdown menu
- **Date Picker**: Select any date to view historical shifts
- **Timezone Support**: Define shifts in a specific business timezone
- **Overnight Shifts**: Properly handle shifts that span midnight (e.g., 22:00-06:00)
- **Date Offset**: Reference shifts by their end date (useful for overnight shifts)
- **Dark/Light Theme**: Full theme support with custom styling

---

## Prerequisites

Before starting, ensure you have:

1. **Node.js >= 22** installed
2. **npm** package manager
3. **Basic knowledge of**:
   - TypeScript
   - React (hooks, state management)
   - CSS
   - Grafana's basic concepts (panels, time ranges)

4. **A scaffolded Grafana plugin project**. Create one with:
   ```bash
   npx @grafana/create-plugin@latest
   ```
   Choose "Panel plugin" when prompted.

---

## Understanding the Scaffolded Structure

When you scaffold a Grafana panel plugin, you get this structure:

```
monyskow-simpleshiftselector-panel/
├── src/
│   ├── components/
│   │   └── SimplePanel.tsx          # Main panel component
│   ├── img/                          # Plugin logo and screenshots
│   ├── module.ts                     # Plugin registration and options
│   ├── plugin.json                   # Plugin metadata
│   └── types.ts                      # TypeScript type definitions
├── tests/                            # E2E tests
├── docker-compose.yaml               # Local Grafana instance
├── package.json                      # Dependencies and scripts
└── tsconfig.json                     # TypeScript configuration
```

### Key Files:

- **`src/plugin.json`**: Metadata shown in Grafana's plugin catalog
- **`src/types.ts`**: TypeScript interfaces for your panel's options
- **`src/module.ts`**: Registers your panel and defines configuration options
- **`src/components/SimplePanel.tsx`**: The React component that renders your panel

---

## Step 1: Define Plugin Metadata

The `plugin.json` file tells Grafana about your plugin. Let's enhance it with proper metadata.

### File: `src/plugin.json`

```json
{
  "$schema": "https://raw.githubusercontent.com/grafana/grafana/main/docs/sources/developers/plugins/plugin.schema.json",
  "type": "panel",
  "name": "Simple Shift Selector",
  "id": "monyskow-simpleshiftselector-panel",
  "info": {
    "keywords": [
      "shift",
      "time",
      "selector",
      "operations",
      "manufacturing",
      "healthcare",
      "logistics",
      "time range",
      "date picker",
      "timezone"
    ],
    "description": "A panel plugin for quickly changing dashboard time range by selecting predefined work shifts. Perfect for operational dashboards with day/night shifts, manufacturing operations, healthcare rotations, and logistics tracking.",
    "author": {
      "name": "monyskow",
      "email": "marcinct@onyskow.com",
      "url": "https://onyskow.com"
    },
    "logos": {
      "small": "img/logo.svg",
      "large": "img/logo.svg"
    },
    "links": [
      {
        "name": "GitHub",
        "url": "https://github.com/monyskow/grafana-simple-shift-selector"
      },
      {
        "name": "Documentation",
        "url": "https://github.com/monyskow/grafana-simple-shift-selector/blob/main/README.md"
      },
      {
        "name": "License",
        "url": "https://github.com/monyskow/grafana-simple-shift-selector/blob/main/LICENSE"
      }
    ],
    "screenshots": [
      {
        "name": "Main Panel View",
        "path": "img/screenshot-main.png"
      },
      {
        "name": "Configuration Editor",
        "path": "img/screenshot-config.png"
      },
      {
        "name": "Dark Theme Support",
        "path": "img/screenshot-dark.png"
      },
      {
        "name": "Real-World Usage Example",
        "path": "img/screenshot-usecase.png"
      }
    ],
    "version": "%VERSION%",
    "updated": "%TODAY%"
  },
  "dependencies": {
    "grafanaDependency": ">=10.4.0",
    "plugins": []
  }
}
```

### Key Points:

- **`type`**: Always `"panel"` for panel plugins
- **`id`**: Unique identifier (format: `<org>-<plugin-name>-<type>`)
- **`keywords`**: Help users find your plugin in the catalog
- **`description`**: Clear explanation of what your plugin does
- **`screenshots`**: Showcase your plugin's features
- **`grafanaDependency`**: Minimum Grafana version required

---

## Step 2: Define TypeScript Interfaces

TypeScript interfaces ensure type safety and enable IntelliSense in your IDE.

### File: `src/types.ts`

```typescript
// Represents a single work shift with start/end times
export interface Shift {
  name: string;          // Display name (e.g., "Day Shift", "Night Shift")
  start: string;         // Start time in "HH:mm" format (24-hour)
  end: string;           // End time in "HH:mm" format (24-hour)
  dateOffset?: number;   // Optional: days to add/subtract from selected date (e.g., -1, 0, +1)
}

// Panel configuration options
export interface SimpleOptions {
  shifts: Shift[];                    // Array of configured shifts
  displayMode: 'buttons' | 'dropdown'; // How shifts are displayed
  showDatePicker: boolean;            // Whether to show the date picker
  selectedDate?: string;              // Currently selected date (ISO format: YYYY-MM-DD)
  timezone: string;                   // IANA timezone (e.g., "Europe/Warsaw")
}
```

### Why These Fields?

- **`Shift.name`**: User-friendly label displayed on buttons/dropdown
- **`Shift.start/end`**: Times in 24-hour format for parsing
- **`Shift.dateOffset`**: Allows referencing overnight shifts by their end date
  - Example: A 22:00-06:00 shift on "Monday" with `dateOffset: -1` starts Sunday 22:00
- **`SimpleOptions.timezone`**: Critical for global teams - ensures shifts are interpreted consistently regardless of user location

---

## Step 3: Configure Panel Options

The `module.ts` file registers your panel with Grafana and defines the configuration UI in the panel editor.

### File: `src/module.ts`

```typescript
import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';
import { SimpleEditor } from './components/SimpleEditor';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addRadio({
      path: 'displayMode',
      name: 'Display mode',
      description: 'Choose how shifts are displayed',
      defaultValue: 'buttons',
      settings: {
        options: [
          { value: 'buttons', label: 'Buttons' },
          { value: 'dropdown', label: 'Dropdown' },
        ],
      },
    })
    .addBooleanSwitch({
      path: 'showDatePicker',
      name: 'Show date picker',
      description: 'Enable calendar date picker in the panel',
      defaultValue: true,
    })
    .addSelect({
      path: 'timezone',
      name: 'Business Timezone',
      description: 'Timezone for shift definitions. All shift times are interpreted in this timezone, regardless of client location.',
      defaultValue: 'Europe/Warsaw',
      settings: {
        options: [
          // Europe
          { value: 'Europe/Warsaw', label: 'Europe/Warsaw (Poland, CET/CEST)' },
          { value: 'Europe/London', label: 'Europe/London (UK, GMT/BST)' },
          // ... many more timezones
          // UTC
          { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
        ],
      },
    })
    .addCustomEditor({
      id: 'shiftsEditor',
      path: 'shifts',
      name: 'Shifts',
      description: 'Configure work shifts',
      defaultValue: [],
      editor: SimpleEditor,
    });
});
```

### Understanding the Option Builders:

Grafana provides several builders for common input types:

1. **`.addRadio()`**: Radio buttons for mutually exclusive choices
2. **`.addBooleanSwitch()`**: Toggle switch for on/off options
3. **`.addSelect()`**: Dropdown menu with predefined choices
4. **`.addCustomEditor()`**: Your own React component for complex inputs

Each builder accepts:
- **`path`**: Property name in your `SimpleOptions` interface
- **`name`**: Label shown in the panel editor
- **`description`**: Helpful text explaining the option
- **`defaultValue`**: Initial value when panel is first added

### Why a Custom Editor?

The **shifts editor** is complex - each shift has multiple fields (name, start, end, offset). Rather than creating multiple text inputs, we build a custom React component (`SimpleEditor`) that provides a better UX with:
- Inline add/remove buttons
- Input validation
- Visual grouping of related fields

---

## Step 4: Implement Time Logic

This is the heart of our plugin. We need to:
1. Parse shift times (e.g., "08:00")
2. Apply them to a selected date
3. Handle timezone conversions
4. Deal with overnight shifts (22:00-06:00)
5. Return UTC timestamps for Grafana

### Why dayjs?

We need a library for timezone handling. While `@grafana/data` includes dayjs, it doesn't include timezone plugins. So we install dayjs separately:

```bash
npm install dayjs
```

### File: `src/timeLogic.ts`

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Shift } from './types';

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Calculates the absolute 'from' and 'to' epoch milliseconds for a given shift.
 *
 * @param shift - The shift configuration with start/end times and optional date offset
 * @param tz - IANA timezone (e.g., "Europe/Warsaw")
 * @param selectedDate - Optional date string (YYYY-MM-DD)
 * @returns Object with 'from' and 'to' as UTC epoch milliseconds
 */
export const getShiftTimeRange = (
  shift: Shift,
  tz: string,
  selectedDate?: string
): { from: number; to: number } => {
  // Validate inputs
  if (!shift || !shift.start || !shift.end) {
    throw new Error('Invalid shift configuration: shift object must have start and end times');
  }
  if (!tz || typeof tz !== 'string') {
    throw new Error('Invalid timezone: timezone must be a non-empty string');
  }

  // Create base date in the specified timezone
  let baseDate = selectedDate ? dayjs.tz(selectedDate, tz) : dayjs.tz(dayjs(), tz);

  if (!baseDate.isValid()) {
    throw new Error(`Invalid timezone or date: "${tz}" / "${selectedDate}"`);
  }

  // Apply date offset if configured
  if (shift.dateOffset) {
    baseDate = baseDate.add(shift.dateOffset, 'day');
  }

  // Parse time format
  const startParts = shift.start.split(':');
  const endParts = shift.end.split(':');

  if (startParts.length !== 2 || endParts.length !== 2) {
    throw new Error(`Invalid time format: start="${shift.start}", end="${shift.end}". Expected HH:mm format.`);
  }

  const [startHour, startMin] = startParts.map(Number);
  const [endHour, endMin] = endParts.map(Number);

  // Validate ranges
  if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
    throw new Error(`Invalid time values: Hours and minutes must be numbers.`);
  }
  if (startHour < 0 || startHour > 23 || endHour < 0 || endHour > 23) {
    throw new Error(`Invalid hour values: hours must be between 0 and 23`);
  }
  if (startMin < 0 || startMin > 59 || endMin < 0 || endMin > 59) {
    throw new Error(`Invalid minute values: minutes must be between 0 and 59`);
  }

  // Set times in the specified timezone
  let from = baseDate.hour(startHour).minute(startMin).second(0).millisecond(0);
  let to = baseDate.hour(endHour).minute(endMin).second(0).millisecond(0);

  // Check for overnight shift (e.g., 22:00 -> 06:00)
  if (from.isAfter(to)) {
    to = to.add(1, 'day');
  }

  // Convert to UTC and return as milliseconds
  return {
    from: from.utc().valueOf(),
    to: to.utc().valueOf(),
  };
};
```

### Key Concepts:

**1. Timezone Handling:**
```typescript
dayjs.tz(selectedDate, tz)
```
This creates a date object **in the specified timezone**. If a factory in Poland defines "08:00", it means 08:00 Warsaw time, not 08:00 in the user's browser timezone.

**2. Overnight Shifts:**
```typescript
if (from.isAfter(to)) {
  to = to.add(1, 'day');
}
```
If start time (22:00) is after end time (06:00), the end must be the next day.

**3. UTC Conversion:**
```typescript
from.utc().valueOf()
```
Grafana expects UTC timestamps. We calculate in the business timezone, then convert to UTC milliseconds.

**4. Date Offset:**
```typescript
if (shift.dateOffset) {
  baseDate = baseDate.add(shift.dateOffset, 'day');
}
```
This allows users to reference overnight shifts by their end date. Example:
- Shift: 22:00-06:00 with `dateOffset: -1`
- Selected date: "2025-01-15" (Wednesday)
- Actual range: Tuesday 22:00 → Wednesday 06:00

---

## Step 5: Create CSS Styles

We use CSS Modules for scoped styling. This prevents style conflicts with other panels.

### File: `src/components/SimplePanel.module.css`

```css
.container {
  padding: 8px;
  background: var(--container-bg);
  border-radius: 8px;
}

.mainRow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Date Picker Styles */
.datePickerSection {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
  background: var(--date-picker-bg);
  border-radius: 8px;
  border: 1px solid var(--date-picker-border);
  height: 32px;
}

.dateInput input {
  font-size: 14px !important;
  height: 32px !important;
  background: var(--date-input-bg) !important;
  border: 1px solid var(--date-input-border) !important;
  color: var(--date-input-text) !important;
  border-radius: 4px !important;
  transition: all 0.2s ease !important;
}

.dateInput input:hover {
  border-color: var(--date-input-hover-border) !important;
}

.dateInput input:focus {
  outline: none !important;
  border-color: var(--date-input-focus-border) !important;
  box-shadow: 0 0 0 2px var(--date-input-focus-shadow) !important;
}

/* Shift Button Styles */
.shiftButton {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 8px;
  font-weight: 500;
  border: 2px solid;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--shift-button-bg);
  border-color: var(--shift-button-border);
  height: 32px;
}

.shiftButton:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: var(--shift-button-hover-shadow);
}

.shiftButton.active {
  background: var(--shift-button-active-bg);
  border-color: var(--shift-button-active-border);
  color: var(--shift-button-active-text);
  font-weight: 600;
  box-shadow: var(--shift-button-active-shadow);
}

/* Light theme variables - default */
.container {
  --container-bg: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(245, 245, 245, 0.05) 100%);
  --shift-button-bg: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  --shift-button-border: #e2e8f0;
  --shift-button-active-bg: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  /* ... more variables */
}
```

### Why CSS Variables?

CSS variables (e.g., `--shift-button-bg`) allow us to dynamically override values for dark theme using Emotion's `css` helper in the React component.

---

## Step 6: Build the Main Panel Component

This is where everything comes together.

### File: `src/components/SimplePanel.tsx`

```typescript
import React, { useState } from 'react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions, Shift } from '../types';
import { Select, useTheme2, Icon } from '@grafana/ui';
import { getShiftTimeRange } from '../timeLogic';
import { css, cx } from '@emotion/css';
import styles from './SimplePanel.module.css';
import dayjs from 'dayjs';
import { ErrorBoundary } from './ErrorBoundary';

interface Props extends PanelProps<SimpleOptions> {}

const getShiftIcon = (shiftName: string): string => {
  const name = shiftName.toLowerCase();
  if (name.includes('morning') || name.includes('day')) return 'sun';
  if (name.includes('evening') || name.includes('afternoon')) return 'cloud';
  if (name.includes('night')) return 'moon';
  return 'clock-nine';
};

const SimplePanelContent: React.FC<Props> = ({ options, onChangeTimeRange }) => {
  const { shifts, displayMode, showDatePicker = true, timezone = 'Europe/Warsaw' } = options;
  const theme = useTheme2();

  // State management
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Empty state
  if (!shifts || shifts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon name="info-circle" size="lg" />
        <div>Please configure shifts in the panel editor.</div>
      </div>
    );
  }

  // Handle shift selection
  const onShiftClick = (shift: Shift) => {
    try {
      setError(null);
      const { from, to } = getShiftTimeRange(shift, timezone, selectedDate);
      onChangeTimeRange({ from, to });  // Update dashboard time range
      setSelectedShift(shift);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate shift time range');
    }
  };

  const onTodayClick = () => {
    setSelectedDate(dayjs().format('YYYY-MM-DD'));
  };

  // Button mode rendering
  const buttonStyles = css`
    [data-theme='dark'] & {
      --shift-button-bg: linear-gradient(135deg, ${theme.colors.background.secondary} 0%, ...);
      /* Override variables for dark theme */
    }
  `;

  return (
    <div className={cx(styles.container, buttonStyles)}>
      <div className={styles.mainRow}>
        {showDatePicker && (
          <div className={styles.datePickerSection}>
            <Icon name="calendar-alt" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.currentTarget.value)}
            />
            <button onClick={onTodayClick}>Today</button>
          </div>
        )}
        <div className={styles.buttonGroup}>
          {shifts.map((shift, index) => (
            <button
              key={index}
              className={cx(styles.shiftButton, { [styles.active]: selectedShift?.name === shift.name })}
              onClick={() => onShiftClick(shift)}
            >
              <Icon name={getShiftIcon(shift.name) as any} />
              <span>{shift.name}</span>
              <span className={styles.shiftTime}>{shift.start} - {shift.end}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SimplePanel: React.FC<Props> = (props) => (
  <ErrorBoundary>
    <SimplePanelContent {...props} />
  </ErrorBoundary>
);
```

### Key Patterns:

**1. PanelProps Interface:**
```typescript
interface Props extends PanelProps<SimpleOptions> {}
```
Grafana passes props like `options`, `data`, `width`, `height`, `onChangeTimeRange`, etc.

**2. Updating Dashboard Time Range:**
```typescript
onChangeTimeRange({ from, to });
```
This is the magic! It updates Grafana's **global time picker**, affecting all panels on the dashboard.

**3. React State:**
- `selectedDate`: Tracks which date the user is viewing
- `selectedShift`: Highlights the active shift button
- `error`: Displays validation errors gracefully

**4. Dynamic Theme Styling:**
```typescript
const buttonStyles = css`
  [data-theme='dark'] & {
    --shift-button-bg: ${theme.colors.background.secondary};
  }
`;
```
We use `useTheme2()` to access Grafana's theme colors and override CSS variables dynamically.

---

## Step 7: Add Error Boundary

React Error Boundaries catch JavaScript errors in the component tree and display a fallback UI instead of crashing.

### File: `src/components/ErrorBoundary.tsx`

```typescript
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Icon } from '@grafana/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Icon name="exclamation-triangle" size="lg" />
          <div>Something went wrong</div>
          <div>{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
```

### Why Error Boundaries?

Without an error boundary, a single JavaScript error (e.g., `undefined.property`) crashes your entire panel. With an error boundary, you show a helpful message and keep the rest of the dashboard working.

---

## Step 8: Build the Custom Editor

The shifts editor allows users to add, edit, and remove shifts directly in Grafana's panel editor.

### File: `src/components/SimpleEditor.tsx`

```typescript
import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Field, Input, Button } from '@grafana/ui';
import { Shift } from '../types';

export const SimpleEditor: React.FC<StandardEditorProps<Shift[]>> = ({ value, onChange }) => {
  const shifts = value || [];

  const onShiftChange = (index: number, updatedShift: Shift) => {
    const newShifts = [...shifts];
    newShifts[index] = updatedShift;
    onChange(newShifts);
  };

  const onAddShift = () => {
    onChange([...shifts, { name: 'New Shift', start: '08:00', end: '16:00', dateOffset: 0 }]);
  };

  const onRemoveShift = (index: number) => {
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    onChange(newShifts);
  };

  return (
    <div>
      {shifts.map((shift, index) => (
        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <Field label="Name">
            <Input
              value={shift.name}
              onChange={(e) => onShiftChange(index, { ...shift, name: e.currentTarget.value })}
              width={20}
            />
          </Field>
          <Field label="Start (HH:mm)">
            <Input
              value={shift.start}
              onChange={(e) => onShiftChange(index, { ...shift, start: e.currentTarget.value })}
              width={15}
            />
          </Field>
          <Field label="End (HH:mm)">
            <Input
              value={shift.end}
              onChange={(e) => onShiftChange(index, { ...shift, end: e.currentTarget.value })}
              width={15}
            />
          </Field>
          <Field label="Date Offset">
            <Input
              type="number"
              value={shift.dateOffset ?? 0}
              onChange={(e) => onShiftChange(index, { ...shift, dateOffset: parseInt(e.currentTarget.value) || 0 })}
              width={10}
            />
          </Field>
          <Button variant="destructive" onClick={() => onRemoveShift(index)}>
            Remove
          </Button>
        </div>
      ))}
      <Button variant="secondary" icon="plus" onClick={onAddShift}>
        Add Shift
      </Button>
    </div>
  );
};
```

### Key Patterns:

**1. StandardEditorProps:**
```typescript
StandardEditorProps<Shift[]>
```
Grafana provides `value` (current shifts array) and `onChange` (callback to update it).

**2. Immutable Updates:**
```typescript
const newShifts = [...shifts];
newShifts[index] = updatedShift;
onChange(newShifts);
```
Always create a new array when updating state to trigger React re-renders.

**3. Grafana UI Components:**
- `<Field>`: Provides consistent label/description styling
- `<Input>`: Styled text input matching Grafana's theme
- `<Button>`: Themed button with variants (primary, secondary, destructive)

---

## Step 9: Add Assets

Copy your logo and screenshots to `src/img/`:

```bash
src/img/
├── logo.svg                    # 40x40 SVG icon
├── screenshot-main.png         # Main panel view
├── screenshot-config.png       # Editor configuration
├── screenshot-dark.png         # Dark theme
└── screenshot-usecase.png      # Real-world example
```

These are referenced in `plugin.json` and shown in Grafana's plugin catalog.

---

## Testing and Development

### Local Development:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   This watches for file changes and rebuilds automatically.

3. **Start local Grafana:**
   ```bash
   npm run server
   ```
   Opens Grafana at `http://localhost:3000` with your plugin loaded.

4. **Add your panel to a dashboard:**
   - Create a new dashboard
   - Click "Add" → "Visualization"
   - Search for "Simple Shift Selector"
   - Configure shifts in the panel editor

### Testing Timezone Logic:

Test your plugin with:
- Different timezones (New York, Tokyo, etc.)
- Overnight shifts (22:00-06:00)
- Date offsets (-1, 0, +1)
- Daylight Saving Time transitions

### Debugging:

- Open browser DevTools (F12)
- Check the Console for errors
- Use `console.log()` in your code
- React DevTools extension helps inspect component state

---

## Building and Deployment

### Build for Production:

```bash
npm run build
```

This creates optimized files in the `dist/` folder.

### Sign Your Plugin:

Grafana requires plugins to be signed for production use:

1. Create a Grafana Cloud account
2. Get an API key
3. Run:
   ```bash
   npx @grafana/sign-plugin@latest
   ```

### Publish to Grafana Catalog:

Follow the [official guide](https://grafana.com/docs/grafana/latest/developers/plugins/publish-a-plugin/) to submit your plugin.

---

## Best Practices and Common Pitfalls

### ✅ Best Practices:

1. **Always validate user input** (shift times, timezones)
2. **Use TypeScript** for type safety
3. **Handle errors gracefully** (Error Boundaries, try/catch)
4. **Test timezone edge cases** (DST, overnight shifts)
5. **Use CSS Modules** to avoid style conflicts
6. **Follow Grafana's theme colors** (`useTheme2()`)
7. **Add helpful documentation** (README, tooltips)

### ❌ Common Pitfalls:

1. **Forgetting UTC conversion** - Always return UTC timestamps to Grafana
2. **Ignoring overnight shifts** - Check if `start > end`
3. **Hardcoding styles** - Use theme colors for dark/light mode support
4. **Mutating state directly** - Always create new objects/arrays
5. **Not handling empty states** - Show helpful messages when no shifts are configured
6. **Skipping input validation** - Bad time formats will crash your plugin

### Performance Tips:

- Avoid heavy computations in render
- Memoize expensive calculations with `useMemo`
- Use `React.memo` for expensive child components
- Debounce rapid user inputs (date picker)

---

## Conclusion

You've built a complete Grafana panel plugin! You've learned:

- ✅ Plugin structure and metadata
- ✅ TypeScript interfaces for type safety
- ✅ Panel options configuration
- ✅ Complex timezone and time logic
- ✅ React component patterns in Grafana
- ✅ CSS styling with theme support
- ✅ Custom editors for complex inputs
- ✅ Error handling and debugging

### Next Steps:

1. Add unit tests with Jest
2. Add E2E tests with Playwright
3. Implement active shift highlighting
4. Add shift presets (8-hour, 12-hour)
5. Support custom shift colors
6. Publish to Grafana's plugin catalog

### Resources:

- [Grafana Plugin Documentation](https://grafana.com/docs/grafana/latest/developers/plugins/)
- [Grafana UI Components](https://developers.grafana.com/ui/)
- [dayjs Documentation](https://day.js.org/docs/en/installation/installation)
- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

Happy coding! 🚀
