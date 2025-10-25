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
          { value: 'Europe/Paris', label: 'Europe/Paris (France, CET/CEST)' },
          { value: 'Europe/Berlin', label: 'Europe/Berlin (Germany, CET/CEST)' },
          { value: 'Europe/Rome', label: 'Europe/Rome (Italy, CET/CEST)' },
          { value: 'Europe/Madrid', label: 'Europe/Madrid (Spain, CET/CEST)' },
          { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam (Netherlands, CET/CEST)' },
          { value: 'Europe/Brussels', label: 'Europe/Brussels (Belgium, CET/CEST)' },
          { value: 'Europe/Vienna', label: 'Europe/Vienna (Austria, CET/CEST)' },
          { value: 'Europe/Stockholm', label: 'Europe/Stockholm (Sweden, CET/CEST)' },
          { value: 'Europe/Copenhagen', label: 'Europe/Copenhagen (Denmark, CET/CEST)' },
          { value: 'Europe/Oslo', label: 'Europe/Oslo (Norway, CET/CEST)' },
          { value: 'Europe/Helsinki', label: 'Europe/Helsinki (Finland, EET/EEST)' },
          { value: 'Europe/Athens', label: 'Europe/Athens (Greece, EET/EEST)' },
          { value: 'Europe/Bucharest', label: 'Europe/Bucharest (Romania, EET/EEST)' },
          { value: 'Europe/Prague', label: 'Europe/Prague (Czech Republic, CET/CEST)' },
          { value: 'Europe/Budapest', label: 'Europe/Budapest (Hungary, CET/CEST)' },
          { value: 'Europe/Lisbon', label: 'Europe/Lisbon (Portugal, WET/WEST)' },
          { value: 'Europe/Dublin', label: 'Europe/Dublin (Ireland, GMT/IST)' },
          { value: 'Europe/Moscow', label: 'Europe/Moscow (Russia, MSK)' },
          { value: 'Europe/Istanbul', label: 'Europe/Istanbul (Turkey, TRT)' },

          // Americas
          { value: 'America/New_York', label: 'America/New_York (US Eastern, EST/EDT)' },
          { value: 'America/Chicago', label: 'America/Chicago (US Central, CST/CDT)' },
          { value: 'America/Denver', label: 'America/Denver (US Mountain, MST/MDT)' },
          { value: 'America/Los_Angeles', label: 'America/Los_Angeles (US Pacific, PST/PDT)' },
          { value: 'America/Phoenix', label: 'America/Phoenix (US Arizona, MST)' },
          { value: 'America/Toronto', label: 'America/Toronto (Canada Eastern, EST/EDT)' },
          { value: 'America/Vancouver', label: 'America/Vancouver (Canada Pacific, PST/PDT)' },
          { value: 'America/Mexico_City', label: 'America/Mexico_City (Mexico, CST/CDT)' },
          { value: 'America/Sao_Paulo', label: 'America/Sao_Paulo (Brazil, BRT/BRST)' },
          { value: 'America/Buenos_Aires', label: 'America/Buenos_Aires (Argentina, ART)' },
          { value: 'America/Santiago', label: 'America/Santiago (Chile, CLT/CLST)' },
          { value: 'America/Bogota', label: 'America/Bogota (Colombia, COT)' },

          // Asia
          { value: 'Asia/Tokyo', label: 'Asia/Tokyo (Japan, JST)' },
          { value: 'Asia/Shanghai', label: 'Asia/Shanghai (China, CST)' },
          { value: 'Asia/Hong_Kong', label: 'Asia/Hong_Kong (Hong Kong, HKT)' },
          { value: 'Asia/Singapore', label: 'Asia/Singapore (Singapore, SGT)' },
          { value: 'Asia/Seoul', label: 'Asia/Seoul (South Korea, KST)' },
          { value: 'Asia/Taipei', label: 'Asia/Taipei (Taiwan, CST)' },
          { value: 'Asia/Bangkok', label: 'Asia/Bangkok (Thailand, ICT)' },
          { value: 'Asia/Jakarta', label: 'Asia/Jakarta (Indonesia, WIB)' },
          { value: 'Asia/Kuala_Lumpur', label: 'Asia/Kuala_Lumpur (Malaysia, MYT)' },
          { value: 'Asia/Manila', label: 'Asia/Manila (Philippines, PST)' },
          { value: 'Asia/Kolkata', label: 'Asia/Kolkata (India, IST)' },
          { value: 'Asia/Dubai', label: 'Asia/Dubai (UAE, GST)' },
          { value: 'Asia/Riyadh', label: 'Asia/Riyadh (Saudi Arabia, AST)' },
          { value: 'Asia/Jerusalem', label: 'Asia/Jerusalem (Israel, IST/IDT)' },

          // Australia & Pacific
          { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
          { value: 'Australia/Melbourne', label: 'Australia/Melbourne (AEST/AEDT)' },
          { value: 'Australia/Brisbane', label: 'Australia/Brisbane (AEST)' },
          { value: 'Australia/Perth', label: 'Australia/Perth (AWST)' },
          { value: 'Pacific/Auckland', label: 'Pacific/Auckland (New Zealand, NZST/NZDT)' },
          { value: 'Pacific/Fiji', label: 'Pacific/Fiji (FJT/FJST)' },
          { value: 'Pacific/Honolulu', label: 'Pacific/Honolulu (Hawaii, HST)' },

          // Africa
          { value: 'Africa/Cairo', label: 'Africa/Cairo (Egypt, EET)' },
          { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (South Africa, SAST)' },
          { value: 'Africa/Lagos', label: 'Africa/Lagos (Nigeria, WAT)' },
          { value: 'Africa/Nairobi', label: 'Africa/Nairobi (Kenya, EAT)' },

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
