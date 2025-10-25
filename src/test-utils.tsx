import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { PanelProps } from '@grafana/data';
import { SimpleOptions } from './types';

/**
 * Custom render function for testing panel components
 * Provides default props that match Grafana's panel structure
 */
export function renderPanel(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options);
}

/**
 * Creates mock PanelProps for testing
 */
export function createMockPanelProps(
  overrides?: Partial<PanelProps<SimpleOptions>>
): PanelProps<SimpleOptions> {
  const defaultProps: PanelProps<SimpleOptions> = {
    data: {
      series: [],
      state: 'Done',
      timeRange: {
        from: Date.now() - 3600000,
        to: Date.now(),
        raw: { from: 'now-1h', to: 'now' },
      },
    } as any,
    timeRange: {
      from: Date.now() - 3600000,
      to: Date.now(),
      raw: { from: 'now-1h', to: 'now' },
    } as any,
    timeZone: 'browser',
    transparent: false,
    width: 800,
    height: 400,
    fieldConfig: {} as any,
    renderCounter: 1,
    title: 'Test Panel',
    eventBus: {
      subscribe: jest.fn(),
      publish: jest.fn(),
      getStream: jest.fn(),
      removeAllListeners: jest.fn(),
      newScopedBus: jest.fn(),
    } as any,
    options: {
      shifts: [],
      displayMode: 'buttons',
      showDatePicker: true,
      timezone: 'Europe/Warsaw',
    },
    onOptionsChange: jest.fn(),
    onFieldConfigChange: jest.fn(),
    replaceVariables: jest.fn((str) => str),
    onChangeTimeRange: jest.fn(),
    id: 1,
    ...overrides,
  };

  return defaultProps;
}

/**
 * Wait for async operations to complete
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));
