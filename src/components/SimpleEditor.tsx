import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { Field, Input, Button } from '@grafana/ui';
import { Shift } from '../types';

export const SimpleEditor: React.FC<StandardEditorProps<Shift[]>> = ({ value, onChange }) => {
  const shifts = value || [];

  // Helper to update a specific shift
  const onShiftChange = (index: number, updatedShift: Shift) => {
    const newShifts = [...shifts];
    newShifts[index] = updatedShift;
    onChange(newShifts);
  };

  // Helper to add a new, empty shift
  const onAddShift = () => {
    const newShifts = [...shifts, { name: 'New Shift', start: '08:00', end: '16:00', dateOffset: 0 }];
    onChange(newShifts);
  };

  // Helper to remove a shift
  const onRemoveShift = (index: number) => {
    const newShifts = [...shifts];
    newShifts.splice(index, 1);
    onChange(newShifts);
  };

  return (
    <div>
      <Field label="" description="">
        <div>
          {shifts.map((shift, index) => (
            <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'flex-end' }}>
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
                  placeholder="08:00"
                />
              </Field>
              <Field label="End (HH:mm)">
                <Input
                  value={shift.end}
                  onChange={(e) => onShiftChange(index, { ...shift, end: e.currentTarget.value })}
                  width={15}
                  placeholder="16:00"
                />
              </Field>
              <Field label="Date Offset (days)" description="Days to add/subtract from selected date">
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <Button
                    icon="minus"
                    variant="secondary"
                    size="sm"
                    onClick={() => onShiftChange(index, { ...shift, dateOffset: (shift.dateOffset ?? 0) - 1 })}
                    title="Decrease offset"
                    aria-label="Decrease date offset"
                  />
                  <Input
                    type="number"
                    value={shift.dateOffset ?? 0}
                    onChange={(e) =>
                      onShiftChange(index, { ...shift, dateOffset: parseInt(e.currentTarget.value, 10) || 0 })
                    }
                    width={10}
                    placeholder="0"
                    style={{ textAlign: 'center' }}
                  />
                  <Button
                    icon="plus"
                    variant="secondary"
                    size="sm"
                    onClick={() => onShiftChange(index, { ...shift, dateOffset: (shift.dateOffset ?? 0) + 1 })}
                    title="Increase offset"
                    aria-label="Increase date offset"
                  />
                </div>
              </Field>
              <Button variant="destructive" size="md" onClick={() => onRemoveShift(index)}>
                Remove
              </Button>
            </div>
          ))}
          <Button variant="secondary" icon="plus" onClick={onAddShift}>
            Add Shift
          </Button>
        </div>
      </Field>
    </div>
  );
};
