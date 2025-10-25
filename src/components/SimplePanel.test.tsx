import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SimplePanel } from './SimplePanel';
import { createMockPanelProps } from '../test-utils';
import { Shift } from '../types';

// Mock the timeLogic module
jest.mock('../timeLogic', () => ({
  getShiftTimeRange: jest.fn((shift, timezone, selectedDate) => ({
    from: new Date(`${selectedDate} ${shift.start}`).getTime(),
    to: new Date(`${selectedDate} ${shift.end}`).getTime(),
  })),
}));

describe('SimplePanel', () => {
  const mockShifts: Shift[] = [
    { name: 'Morning', start: '06:00', end: '14:00' },
    { name: 'Afternoon', start: '14:00', end: '22:00' },
    { name: 'Night', start: '22:00', end: '06:00' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should display empty state when no shifts are configured', () => {
      const props = createMockPanelProps({
        options: {
          shifts: [],
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      expect(screen.getByText('Please configure shifts in the panel editor.')).toBeInTheDocument();
    });

    it('should display info icon in empty state', () => {
      const props = createMockPanelProps({
        options: {
          shifts: [],
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      // Check for icon by test id
      const icon = screen.getByTestId('info-circle');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Button Display Mode', () => {
    it('should render shift buttons when shifts are configured', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      expect(screen.getByText('Morning')).toBeInTheDocument();
      expect(screen.getByText('Afternoon')).toBeInTheDocument();
      expect(screen.getByText('Night')).toBeInTheDocument();
    });

    it('should display shift time ranges on buttons', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      expect(screen.getByText('06:00 - 14:00')).toBeInTheDocument();
      expect(screen.getByText('14:00 - 22:00')).toBeInTheDocument();
      expect(screen.getByText('22:00 - 06:00')).toBeInTheDocument();
    });

    it('should call onChangeTimeRange when shift button is clicked', () => {
      const mockOnChangeTimeRange = jest.fn();
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
        onChangeTimeRange: mockOnChangeTimeRange,
      });

      render(<SimplePanel {...props} />);

      const morningButton = screen.getByRole('button', { name: /Morning/i });
      fireEvent.click(morningButton);

      expect(mockOnChangeTimeRange).toHaveBeenCalledWith(
        expect.objectContaining({
          from: expect.any(Number),
          to: expect.any(Number),
        })
      );
    });

    it('should highlight selected shift', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      const morningButton = screen.getByRole('button', { name: /Morning/i });
      fireEvent.click(morningButton);

      expect(morningButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Dropdown Display Mode', () => {
    it('should render dropdown when displayMode is dropdown', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'dropdown',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      expect(screen.getByText('Select a shift...')).toBeInTheDocument();
    });

    it('should show shift options in dropdown format', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'dropdown',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      // Dropdown should contain placeholder text
      expect(screen.getByText('Select a shift...')).toBeInTheDocument();
    });
  });

  describe('Date Picker', () => {
    it('should render date picker when showDatePicker is true', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
      expect(dateInput).toBeInTheDocument();
    });

    it('should not render date picker when showDatePicker is false', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: false,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      const dateInputs = screen.queryAllByDisplayValue(/\d{4}-\d{2}-\d{2}/);
      expect(dateInputs.length).toBe(0);
    });

    it('should render Today button', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      expect(screen.getByRole('button', { name: /Today/i })).toBeInTheDocument();
    });

    it('should reset date to today when Today button is clicked', async () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/) as HTMLInputElement;

      // Change date to a past date
      fireEvent.change(dateInput, { target: { value: '2025-01-01' } });
      expect(dateInput.value).toBe('2025-01-01');

      // Click Today button
      const todayButton = screen.getByRole('button', { name: /Today/i });
      fireEvent.click(todayButton);

      // Should reset to current date
      await waitFor(() => {
        const today = new Date().toISOString().split('T')[0];
        expect(dateInput.value).toBe(today);
      });
    });

    it('should unselect shift when date is changed', async () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      // Select a shift
      const morningButton = screen.getByRole('button', { name: /Morning/i });
      fireEvent.click(morningButton);
      expect(morningButton).toHaveAttribute('aria-pressed', 'true');

      // Change the date
      const dateInput = screen.getByDisplayValue(/\d{4}-\d{2}-\d{2}/);
      fireEvent.change(dateInput, { target: { value: '2025-01-01' } });

      // Shift should be deselected
      await waitFor(() => {
        expect(morningButton).toHaveAttribute('aria-pressed', 'false');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when shift calculation fails', async () => {
      const { getShiftTimeRange } = require('../timeLogic');
      getShiftTimeRange.mockImplementationOnce(() => {
        throw new Error('Invalid timezone');
      });

      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Invalid/Timezone',
        },
      });

      render(<SimplePanel {...props} />);

      const morningButton = screen.getByRole('button', { name: /Morning/i });
      fireEvent.click(morningButton);

      await waitFor(() => {
        expect(screen.getByText(/Error/i)).toBeInTheDocument();
        expect(screen.getByText(/Invalid timezone/i)).toBeInTheDocument();
      });
    });

    it('should allow dismissing error message', async () => {
      const { getShiftTimeRange } = require('../timeLogic');
      getShiftTimeRange.mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      const morningButton = screen.getByRole('button', { name: /Morning/i });
      fireEvent.click(morningButton);

      await waitFor(() => {
        expect(screen.getByText(/Test error/i)).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: /Dismiss/i });
      fireEvent.click(dismissButton);

      await waitFor(() => {
        expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('ErrorBoundary Integration', () => {
    it('should be wrapped with ErrorBoundary', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      // Should not throw even if there's an error
      expect(() => render(<SimplePanel {...props} />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on shift buttons', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      const morningButton = screen.getByRole('button', { name: /Morning/i });
      expect(morningButton).toHaveAttribute('aria-pressed');
      expect(morningButton).toHaveAttribute('title', 'Morning: 06:00 - 14:00');
    });

    it('should update aria-pressed when shift is selected', () => {
      const props = createMockPanelProps({
        options: {
          shifts: mockShifts,
          displayMode: 'buttons',
          showDatePicker: true,
          timezone: 'Europe/Warsaw',
        },
      });

      render(<SimplePanel {...props} />);

      const morningButton = screen.getByRole('button', { name: /Morning/i });
      expect(morningButton).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(morningButton);
      expect(morningButton).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
