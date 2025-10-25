# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-25

Initial release of Simple Shift Selector Panel plugin for Grafana.

### ✨ Features

#### Core Functionality
- Configurable shift selector panel with customizable time ranges
- Support for overnight shifts spanning midnight (e.g., 22:00-06:00)
- Full timezone support with dayjs timezone plugin and automatic DST handling
- Two display modes: button group and dropdown selector
- Optional date picker for viewing historical shift data
- Date offset support for multi-day shift definitions
- Automatic dashboard time range updates on shift selection
- Auto-deselect shift when date changes (prevents stale selection)

#### User Interface
- Full dark theme support matching Grafana's theme system
- Responsive button layouts that adapt to panel width
- Accessible dropdown with keyboard navigation support
- Grafana icon integration for consistent UI
- Error boundaries for graceful error handling
- Loading states and smooth transitions

### ⚙️ Configuration

- Add, edit, and remove shifts through panel editor
- Configure shift start/end times with intuitive time picker
- Set date offset for shifts spanning midnight (0 for same day, 1 for next day)
- Choose display timezone with full timezone database support
- Toggle date picker visibility for cleaner interface when not needed
- Switch between button and dropdown display modes based on use case

### 🧪 Testing

- **68 unit tests** with Jest and React Testing Library covering:
  - Time logic and timezone conversions
  - Panel component behavior and interactions
  - Editor component configuration
  - Error boundary error handling
- **32 E2E tests** with Playwright and @grafana/plugin-e2e covering:
  - Shift selection workflows
  - Date picker functionality
  - Display mode switching
  - Time range updates
- **93.1% code coverage** across:
  - 93% statements
  - 87% branches
  - 91% functions
  - 93% lines
- Comprehensive timezone and edge case testing including:
  - Overnight shift boundary conditions
  - DST transition handling
  - Multiple timezone support
  - Date offset calculations
- E2E tests across multiple Grafana versions (10.4+, 11.0+, latest)
- Full CI/CD integration with GitHub Actions

### 📚 Documentation

- Comprehensive README with features, use cases, and examples
- Detailed testing documentation (TESTING.md)
- Test summary report (TEST_SUMMARY.md)
- Development tutorial (TUTORIAL.md)
- Contribution guidelines (CONTRIBUTING.md)
- 4 professional screenshots showing:
  - Main panel view with button mode
  - Configuration editor interface
  - Dark theme support
  - Real-world usage example
- Professional SVG logo design
- Complete installation and usage guide
- Configuration examples with JSON

### 🏗️ Infrastructure

- Built with @grafana/create-plugin scaffolding v5.2.0
- Webpack 5 build system with:
  - Development mode with watch and live reload
  - Production mode with optimization
  - Source maps for debugging
- TypeScript 5.5.4 with strict mode enabled
- ESLint + Prettier code formatting with:
  - @grafana/eslint-config rules
  - Stylistic TypeScript rules
  - React hooks linting
- Docker-based development environment with:
  - Docker Compose configuration
  - Grafana provisioning
  - Hot module reload support
- GitHub Actions CI/CD pipelines:
  - Automated typecheck on every commit
  - Automated lint checking
  - Unit tests with coverage reporting
  - E2E tests across Grafana versions (matrix testing)
  - Plugin validator integration
  - Automated builds and artifact upload
  - Bundle stats tracking
  - Compatibility testing (is-compatible workflow)
- Jest 29.5.0 + SWC for fast test execution
- Playwright 1.52.0 for reliable E2E testing
- Coverage reporting with lcov and HTML formats

### 🌍 Compatibility

- **Grafana**: 10.4.0 or later
- **Browsers**: Chrome, Firefox, Safari, Edge (modern versions with ES6+ support)
- **Node.js**: 22 or later (for development)
- **npm**: 11.4.2 or later (for development)

### 🎯 Use Cases

Perfect for operational dashboards in:
- **Manufacturing**: Production metrics across 8-hour shifts (Day/Afternoon/Night)
  - Equipment efficiency tracking
  - Downtime analysis by shift
  - Output monitoring per shift
- **Healthcare**: Patient care during nurse rotations
  - Vital statistics by shift
  - Medication administration tracking
  - Patient outcomes monitoring
- **Logistics**: Delivery performance and warehouse operations
  - Shipments processed per shift
  - Loading dock efficiency
  - Staff productivity tracking
- **Operations**: 24/7 operations centers
  - Customer support metrics
  - Facility management
  - Real-time operational data access

### 🔒 Security

- No data collection or user tracking
- No third-party analytics
- Secure credential handling (not applicable for this panel type)
- No environment manipulation
- 0 security vulnerabilities (npm audit passed)
- Apache 2.0 open source license

### 📦 Dependencies

**Production**:
- @grafana/data: ^12.2.0
- @grafana/i18n: ^12.2.0
- @grafana/runtime: ^12.2.0
- @grafana/schema: ^12.2.0
- @grafana/ui: ^12.2.0
- @emotion/css: 11.10.6
- dayjs: ^1.11.18
- react: 18.2.0
- react-dom: 18.2.0

**Development**:
- Full list available in package.json
- All dependencies vetted for security

## Initial Contributors

- [@monyskow](https://github.com/monyskow) - Initial implementation, testing, and documentation

[1.0.0]: https://github.com/monyskow/monyskow-simpleshiftselector-panel/releases/tag/v1.0.0
