# Testing Documentation

## Overview

This project uses **Vitest** as the testing framework, providing comprehensive unit tests for utilities and state management.

## Test Coverage

Current test coverage:
- **Overall**: 88.65% statements, 77.55% branch, 100% functions, 95.65% lines
- **formBuilderStore.ts**: 88.33% statements, 76.51% branch, 100% functions, 95.91% lines
- **formUtils.ts**: 92.85% statements, 86.66% branch, 100% functions, 92.85% lines

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm test
```

### Run tests with UI
```bash
npm run test:ui
```

### Generate coverage report
```bash
npm run test:coverage
```

The coverage report will be generated in the `coverage` directory and displayed in the terminal.

## Test Structure

### Utility Tests (`src/utils/formUtils.test.ts`)
Tests for utility functions including:
- `generateId()` - Unique ID generation
- `createDefaultElement()` - Default element creation for all form types
- `isValidFieldName()` - Field name validation
- `sanitizeFieldName()` - Field name sanitization
- `DRAG_ITEMS` - Drag items configuration

**Test Coverage**: 32 tests covering all form element types and edge cases

### Store Tests (`src/stores/formBuilderStore.test.ts`)
Comprehensive tests for the Pinia store including:
- Initial state verification
- Form creation (`createNewForm`)
- Element management (`addElement`, `updateElement`, `removeElement`)
- Element reordering (`reorderElement`)
- Element selection (`selectElement`)
- Preview mode toggling
- Getters (`sortedElements`, `hasElements`, `jsonSchema`)
- Form validation (`validateForm`)
- JSON Schema export/import (`exportToJsonSchema`, `importFromJsonSchema`)

**Test Coverage**: 59 tests covering all actions, getters, and state changes

## Key Testing Features

### Mocked Timers
Tests use fake timers to ensure consistent date/time values:
```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### Pinia Store Setup
Store tests use a fresh Pinia instance for each test:
```typescript
beforeEach(() => {
  setActivePinia(createPinia());
});
```

### Comprehensive Coverage
- All form element types (text, email, password, textarea, number, range, date, datetime, time, select, radio, checkbox)
- Edge cases (empty forms, invalid data, missing elements)
- State management (orders, selections, updates)
- Error handling (duplicate names, missing required fields)
- JSON Schema import/export

## Best Practices

1. **Isolation**: Each test is isolated with fresh state
2. **Descriptive Names**: Test names clearly describe what is being tested
3. **Arrange-Act-Assert**: Tests follow AAA pattern
4. **Edge Cases**: Tests cover both happy paths and error scenarios
5. **Type Safety**: Tests leverage TypeScript for type checking

## Adding New Tests

When adding new functionality:
1. Create corresponding test file with `.test.ts` extension
2. Import necessary testing utilities from `vitest`
3. Follow existing test patterns
4. Aim for high coverage (>80%)
5. Test both success and failure cases

## Continuous Integration

Tests can be integrated into CI/CD pipelines:
```bash
# Run tests in CI mode
npm test -- --run

# Generate coverage report
npm run test:coverage
```

## Coverage Exclusions

The following files are excluded from coverage reports (configured in `vitest.config.ts`):
- `node_modules/`
- `dist/`
- `*.config.*`
- `**/*.d.ts`
- `src/main.ts`
- `src/**/*.vue` (Component tests to be added separately)

## Future Improvements

- Add component tests using `@vue/test-utils`
- Add end-to-end tests with Playwright or Cypress
- Increase branch coverage to >90%
- Add visual regression tests
- Add performance benchmarks
