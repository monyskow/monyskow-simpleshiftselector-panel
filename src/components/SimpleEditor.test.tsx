import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SimpleEditor } from './SimpleEditor';
import { Shift } from '../types';
import { StandardEditorProps } from '@grafana/data';

describe('SimpleEditor', () => {
  const mockOnChange = jest.fn();

  const createMockProps = (shifts: Shift[] = []): StandardEditorProps<Shift[]> => ({
    value: shifts,
    onChange: mockOnChange,
    context: {} as any,
    item: {} as any,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    it('should render Add Shift button when no shifts exist', () => {
      render(<SimpleEditor {...createMockProps()} />);

      expect(screen.getByRole('button', { name: /Add Shift/i })).toBeInTheDocument();
    });

    it('should render existing shifts', () => {
      const shifts: Shift[] = [
        { name: 'Morning', start: '06:00', end: '14:00' },
        { name: 'Evening', start: '14:00', end: '22:00' },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      expect(screen.getByDisplayValue('Morning')).toBeInTheDocument();
      expect(screen.getByDisplayValue('06:00')).toBeInTheDocument();
      expect(screen.getAllByDisplayValue('14:00').length).toBe(2); // Both end and start
      expect(screen.getByDisplayValue('Evening')).toBeInTheDocument();
      expect(screen.getByDisplayValue('22:00')).toBeInTheDocument();
    });
  });

  describe('Adding Shifts', () => {
    it('should call onChange with new shift when Add Shift is clicked', () => {
      render(<SimpleEditor {...createMockProps()} />);

      const addButton = screen.getByRole('button', { name: /Add Shift/i });
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        {
          name: 'New Shift',
          start: '08:00',
          end: '16:00',
          dateOffset: 0,
        },
      ]);
    });

    it('should add multiple shifts', () => {
      const initialShifts: Shift[] = [
        { name: 'Morning', start: '06:00', end: '14:00' },
      ];

      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const addButton = screen.getByRole('button', { name: /Add Shift/i });
      fireEvent.click(addButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Morning', start: '06:00', end: '14:00' },
        { name: 'New Shift', start: '08:00', end: '16:00', dateOffset: 0 },
      ]);
    });
  });

  describe('Editing Shifts', () => {
    const initialShifts: Shift[] = [
      { name: 'Morning', start: '06:00', end: '14:00', dateOffset: 0 },
    ];

    it('should update shift name when input changes', () => {
      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const nameInput = screen.getByDisplayValue('Morning');
      fireEvent.change(nameInput, { target: { value: 'Early Morning' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Early Morning', start: '06:00', end: '14:00', dateOffset: 0 },
      ]);
    });

    it('should update start time when input changes', () => {
      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const startInput = screen.getByDisplayValue('06:00');
      fireEvent.change(startInput, { target: { value: '07:00' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Morning', start: '07:00', end: '14:00', dateOffset: 0 },
      ]);
    });

    it('should update end time when input changes', () => {
      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const endInput = screen.getByDisplayValue('14:00');
      fireEvent.change(endInput, { target: { value: '15:00' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Morning', start: '06:00', end: '15:00', dateOffset: 0 },
      ]);
    });

    it('should update date offset when input changes', () => {
      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const offsetInput = screen.getByDisplayValue('0');
      fireEvent.change(offsetInput, { target: { value: '-1' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Morning', start: '06:00', end: '14:00', dateOffset: -1 },
      ]);
    });
  });

  describe('Date Offset Controls', () => {
    const initialShifts: Shift[] = [
      { name: 'Night', start: '22:00', end: '06:00', dateOffset: 0 },
    ];

    it('should increment date offset when plus button is clicked', () => {
      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const plusButton = screen.getByLabelText('Increase date offset');
      fireEvent.click(plusButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Night', start: '22:00', end: '06:00', dateOffset: 1 },
      ]);
    });

    it('should decrement date offset when minus button is clicked', () => {
      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const minusButton = screen.getByLabelText('Decrease date offset');
      fireEvent.click(minusButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Night', start: '22:00', end: '06:00', dateOffset: -1 },
      ]);
    });

    it('should handle multiple increments', () => {
      render(<SimpleEditor {...createMockProps(initialShifts)} />);

      const plusButton = screen.getByLabelText('Increase date offset');
      fireEvent.click(plusButton);

      // First click should increment from 0 to 1
      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Night', start: '22:00', end: '06:00', dateOffset: 1 },
      ]);

      // Component doesn't re-render with new props in test, so second click
      // still increments from 0. In real app, parent re-renders with new value.
      fireEvent.click(plusButton);
      expect(mockOnChange).toHaveBeenCalledTimes(2);
    });

    it('should handle undefined dateOffset', () => {
      const shiftsWithoutOffset: Shift[] = [
        { name: 'Day', start: '08:00', end: '16:00' }, // No dateOffset
      ];

      render(<SimpleEditor {...createMockProps(shiftsWithoutOffset)} />);

      const plusButton = screen.getByLabelText('Increase date offset');
      fireEvent.click(plusButton);

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Day', start: '08:00', end: '16:00', dateOffset: 1 },
      ]);
    });
  });

  describe('Removing Shifts', () => {
    it('should remove shift when Remove button is clicked', () => {
      const shifts: Shift[] = [
        { name: 'Morning', start: '06:00', end: '14:00' },
        { name: 'Evening', start: '14:00', end: '22:00' },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[0]); // Remove first shift

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Evening', start: '14:00', end: '22:00' },
      ]);
    });

    it('should remove correct shift when multiple exist', () => {
      const shifts: Shift[] = [
        { name: 'Morning', start: '06:00', end: '14:00' },
        { name: 'Afternoon', start: '14:00', end: '22:00' },
        { name: 'Night', start: '22:00', end: '06:00' },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      const removeButtons = screen.getAllByRole('button', { name: /Remove/i });
      fireEvent.click(removeButtons[1]); // Remove middle shift

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Morning', start: '06:00', end: '14:00' },
        { name: 'Night', start: '22:00', end: '06:00' },
      ]);
    });

    it('should handle removing all shifts', () => {
      const shifts: Shift[] = [
        { name: 'Only Shift', start: '08:00', end: '16:00' },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      const removeButton = screen.getByRole('button', { name: /Remove/i });
      fireEvent.click(removeButton);

      expect(mockOnChange).toHaveBeenCalledWith([]);
    });
  });

  describe('Field Labels', () => {
    it('should display appropriate field labels', () => {
      const shifts: Shift[] = [
        { name: 'Test', start: '08:00', end: '16:00' },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Start (HH:mm)')).toBeInTheDocument();
      expect(screen.getByText('End (HH:mm)')).toBeInTheDocument();
      expect(screen.getByText('Date Offset (days)')).toBeInTheDocument();
    });

    it('should display placeholder text for time inputs', () => {
      const shifts: Shift[] = [
        { name: 'Test', start: '', end: '' },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      const inputs = screen.getAllByPlaceholderText(/\d{2}:\d{2}/);
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined value prop', () => {
      const props: StandardEditorProps<Shift[]> = {
        value: undefined as any,
        onChange: mockOnChange,
        context: {} as any,
        item: {} as any,
      };

      render(<SimpleEditor {...props} />);

      expect(screen.getByRole('button', { name: /Add Shift/i })).toBeInTheDocument();
    });

    it('should handle empty string in number input', () => {
      const shifts: Shift[] = [
        { name: 'Test', start: '08:00', end: '16:00', dateOffset: 5 },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      const offsetInput = screen.getByDisplayValue('5');
      fireEvent.change(offsetInput, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Test', start: '08:00', end: '16:00', dateOffset: 0 },
      ]);
    });

    it('should preserve other shift properties when updating one field', () => {
      const shifts: Shift[] = [
        { name: 'Complex', start: '08:00', end: '16:00', dateOffset: -1 },
      ];

      render(<SimpleEditor {...createMockProps(shifts)} />);

      const nameInput = screen.getByDisplayValue('Complex');
      fireEvent.change(nameInput, { target: { value: 'Updated' } });

      expect(mockOnChange).toHaveBeenCalledWith([
        { name: 'Updated', start: '08:00', end: '16:00', dateOffset: -1 },
      ]);
    });
  });
});
