# Test Utilities

This directory contains shared test utilities to reduce code duplication across test files.

## escape-test-helpers.js

### Purpose
Provides common functionality for testing the escape mechanism across unit and integration tests.

### Functions

- **`createMockProcessor()`**: Creates a mock substitution processor that simulates tag processing
- **`createMockReplacers()`**: Creates mock replacer objects for integration testing
- **`expectContainsAll(result, expectedStrings)`**: Asserts multiple strings are present in result
- **`expectNotContainsAny(result, unexpectedStrings)`**: Asserts multiple strings are NOT present in result

### Usage
```javascript
const { 
  createMockProcessor, 
  createMockReplacers, 
  expectContainsAll, 
  expectNotContainsAny 
} = require('./test-utils/escape-test-helpers');

// Use in tests
const mockProcessor = createMockProcessor();
const mockReplacers = createMockReplacers();
expectContainsAll(result, ['expected1', 'expected2']);
expectNotContainsAny(result, ['unexpected1', 'unexpected2']);
```

### Why This File Should Stay
- **Reduces duplication**: Centralizes common test functionality used across multiple test files
- **Maintains consistency**: Ensures all escape mechanism tests use the same mock implementations
- **Improves maintainability**: Changes to test logic only need to be made in one place
- **Follows DRY principle**: Eliminates repeated code that was causing SonarQube duplication issues
