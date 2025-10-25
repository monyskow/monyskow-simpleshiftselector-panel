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
