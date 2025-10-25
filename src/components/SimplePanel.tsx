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

// Helper function to determine the best icon for a shift based on its name
const getShiftIcon = (shiftName: string): string => {
  const name = shiftName.toLowerCase();
  if (name.includes('morning') || name.includes('day')) {
    return 'sun';
  } else if (name.includes('evening') || name.includes('afternoon')) {
    return 'cloud';
  } else if (name.includes('night')) {
    return 'moon';
  } else if (name.includes('weekend')) {
    return 'calendar-alt';
  } else {
    return 'clock-nine';
  }
};

const SimplePanelContent: React.FC<Props> = ({ options, onChangeTimeRange }) => {
  const { shifts, displayMode, showDatePicker = true, timezone = 'Europe/Warsaw' } = options;
  const theme = useTheme2();

  // State for selected date and selected shift
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format('YYYY-MM-DD'));
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!shifts || shifts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Icon name="info-circle" size="lg" style={{ marginBottom: '8px' }} />
        <div>Please configure shifts in the panel editor.</div>
      </div>
    );
  }

  const onShiftClick = (shift: Shift) => {
    try {
      // Clear any previous errors
      setError(null);

      // Calculate time range in the configured timezone, returns UTC milliseconds
      const { from, to } = getShiftTimeRange(shift, timezone, selectedDate);
      onChangeTimeRange({ from, to });
      setSelectedShift(shift); // Track the selected shift
    } catch (err) {
      // Handle errors gracefully
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate shift time range';
      setError(errorMessage);
      console.error('Error calculating shift time range:', err);
    }
  };

  const onTodayClick = () => {
    const today = dayjs().format('YYYY-MM-DD');
    setSelectedDate(today);
  };

  // Show error message if there's an error
  if (error) {
    return (
      <div className={styles.emptyState} style={{ borderColor: 'var(--error)' }}>
        <Icon name="exclamation-triangle" size="lg" style={{ marginBottom: '8px', color: 'var(--error)' }} />
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>Error</div>
        <div style={{ fontSize: '13px' }}>{error}</div>
        <button
          style={{
            marginTop: '12px',
            padding: '6px 12px',
            background: 'var(--shift-button-bg)',
            border: '1px solid var(--shift-button-border)',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
          onClick={() => setError(null)}
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Dropdown mode with enhanced styling
  if (displayMode === 'dropdown') {
    const selectOptions = shifts.map((s) => ({
      label: `${s.name} (${s.start} - ${s.end})`,
      value: s,
    }));
    const selectedValue = selectedShift
      ? {
          label: `${selectedShift.name} (${selectedShift.start} - ${selectedShift.end})`,
          value: selectedShift,
        }
      : undefined;

    const dropdownStyles = css`
      [data-theme='dark'] & {
        --container-bg: linear-gradient(135deg, rgba(30, 41, 59, 0.05) 0%, rgba(15, 23, 42, 0.05) 100%);
        --shift-button-bg: linear-gradient(
          135deg,
          ${theme.colors.background.secondary} 0%,
          ${theme.colors.emphasize(theme.colors.background.primary, 0.03)} 100%
        );
        --shift-button-border: ${theme.colors.border.medium};
        --shift-button-text: ${theme.colors.text.primary};
        --shift-button-hover-bg: linear-gradient(
          135deg,
          ${theme.colors.emphasize(theme.colors.background.secondary, 0.05)} 0%,
          ${theme.colors.background.secondary} 100%
        );
        --shift-button-hover-border: ${theme.colors.border.strong};
        --date-picker-bg: rgba(${theme.colors.emphasize(theme.colors.background.secondary, 0.05)}, 0.5);
        --date-picker-border: ${theme.colors.border.weak};
        --date-input-bg: ${theme.colors.background.secondary};
        --date-input-border: ${theme.colors.border.medium};
        --date-input-text: ${theme.colors.text.primary};
        --date-input-hover-bg: ${theme.colors.emphasize(theme.colors.background.secondary, 0.03)};
        --date-input-hover-border: ${theme.colors.border.strong};
        --date-input-focus-border: ${theme.colors.primary.main};
        --date-input-focus-shadow: ${theme.colors.emphasize(theme.colors.primary.main, 0.2)};
        --date-input-icon-filter: invert(1) brightness(10) contrast(2);
      }
    `;

    return (
      <div className={cx(styles.dropdownContainer, dropdownStyles)}>
        <div className={styles.mainRow}>
          {showDatePicker && (
            <div className={styles.datePickerSection}>
              <div className={styles.datePickerLabel}>
                <Icon name="calendar-alt" />
                <span>Date:</span>
              </div>
              <div className={styles.dateInput}>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.currentTarget.value);
                    setSelectedShift(null);
                  }}
                  className={styles.nativeInput}
                  style={{ colorScheme: 'light dark' }}
                  data-date-format="yyyy-mm-dd"
                  placeholder="YYYY-MM-DD"
                  title={`Selected: ${selectedDate}`}
                />
              </div>
              <button className={styles.todayButton} onClick={onTodayClick}>
                <Icon name="sync" />
                Today
              </button>
            </div>
          )}
          <div className={styles.selectWrapper}>
            {/* TODO: Migrate to Combobox when stable
                Currently using deprecated Select component because:
                1. Combobox migration is still ongoing in Grafana core (see grafana/grafana#94681)
                2. Our use case requires complex Shift objects as values with SelectableValue<Shift>
                3. Combobox API differs significantly and requires value mapping
                4. Select is still functional and widely used in existing plugins
                Migration tracked in issue #3 */}
            {/* eslint-disable-next-line @typescript-eslint/no-deprecated */}
            <Select
              options={selectOptions}
              value={selectedValue}
              onChange={(selectable) => onShiftClick(selectable.value!)}
              placeholder="Select a shift..."
              prefix={
                selectedValue ? (
                  <Icon name={getShiftIcon(selectedValue.value.name) as any} />
                ) : (
                  <Icon name="clock-nine" />
                )
              }
            />
          </div>
        </div>
      </div>
    );
  }

  // Button mode (default) with custom styling
  const buttonStyles = css`
    [data-theme='dark'] & {
      --container-bg: linear-gradient(135deg, rgba(30, 41, 59, 0.05) 0%, rgba(15, 23, 42, 0.05) 100%);
      --shift-button-bg: linear-gradient(
        135deg,
        ${theme.colors.background.secondary} 0%,
        ${theme.colors.emphasize(theme.colors.background.primary, 0.03)} 100%
      );
      --shift-button-border: ${theme.colors.border.medium};
      --shift-button-text: ${theme.colors.text.primary};
      --shift-button-hover-bg: linear-gradient(
        135deg,
        ${theme.colors.emphasize(theme.colors.background.secondary, 0.05)} 0%,
        ${theme.colors.background.secondary} 100%
      );
      --shift-button-hover-border: ${theme.colors.border.strong};
      --shift-button-hover-shadow: 0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.2);
      --shift-button-active-bg: linear-gradient(
        135deg,
        ${theme.colors.primary.main} 0%,
        ${theme.colors.primary.shade} 100%
      );
      --shift-button-active-border: ${theme.colors.primary.border};
      --shift-button-active-text: ${theme.colors.primary.contrastText};
      --shift-button-active-shadow: 0 12px 32px ${theme.colors.emphasize(theme.colors.primary.main, 0.4)},
        0 4px 12px ${theme.colors.emphasize(theme.colors.primary.main, 0.3)};
      --empty-state-bg: ${theme.colors.background.secondary};
      --empty-state-border: ${theme.colors.border.weak};
      --empty-state-hover-border: ${theme.colors.border.medium};
      --empty-state-hover-bg: ${theme.colors.emphasize(theme.colors.background.secondary, 0.03)};
      --date-picker-bg: rgba(${theme.colors.emphasize(theme.colors.background.secondary, 0.05)}, 0.5);
      --date-picker-border: ${theme.colors.border.weak};
      --date-input-bg: ${theme.colors.background.secondary};
      --date-input-border: ${theme.colors.border.medium};
      --date-input-text: ${theme.colors.text.primary};
      --date-input-hover-bg: ${theme.colors.emphasize(theme.colors.background.secondary, 0.03)};
      --date-input-hover-border: ${theme.colors.border.strong};
      --date-input-focus-border: ${theme.colors.primary.main};
      --date-input-focus-shadow: ${theme.colors.emphasize(theme.colors.primary.main, 0.2)};
      --date-input-icon-filter: invert(1) brightness(10) contrast(2);
    }
  `;

  return (
    <div className={cx(styles.container, buttonStyles)}>
      <div className={styles.mainRow}>
        {showDatePicker && (
          <div className={styles.datePickerSection}>
            <div className={styles.datePickerLabel}>
              <Icon name="calendar-alt" />
              <span>Date:</span>
            </div>
            <div className={styles.dateInput}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.currentTarget.value);
                  setSelectedShift(null);
                }}
                className={styles.nativeInput}
                style={{ colorScheme: 'light dark' }}
                data-date-format="yyyy-mm-dd"
                placeholder="YYYY-MM-DD"
                title={`Selected: ${selectedDate}`}
              />
            </div>
            <button className={styles.todayButton} onClick={onTodayClick}>
              <Icon name="sync" />
              Today
            </button>
          </div>
        )}
        <div className={styles.buttonGroup}>
          {shifts.map((shift, index) => {
            const isSelected = selectedShift?.name === shift.name;
            const icon = getShiftIcon(shift.name);

            return (
              <button
                key={index}
                className={cx(styles.shiftButton, { [styles.active]: isSelected })}
                onClick={() => onShiftClick(shift)}
                aria-pressed={isSelected}
                title={`${shift.name}: ${shift.start} - ${shift.end}`}
              >
                <span className={styles.icon}>
                  <Icon name={icon as any} />
                </span>
                <div className={styles.shiftInfo}>
                  <span className={styles.shiftName}>{shift.name}</span>
                  <span className={styles.shiftTime}>
                    {shift.start} - {shift.end}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Wrap the panel component with ErrorBoundary for graceful error handling
export const SimplePanel: React.FC<Props> = (props) => {
  return (
    <ErrorBoundary>
      <SimplePanelContent {...props} />
    </ErrorBoundary>
  );
};
