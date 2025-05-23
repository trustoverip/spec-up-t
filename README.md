# Spec-Up-T

## Build Status
[![Spec-Up-T CI Status](https://github.com/blockchainbird/spec-up-t/actions/workflows/ci.yml/badge.svg?branch=add-jest-coverage-workflow)](https://github.com/blockchainbird/spec-up-t/actions/workflows/ci.yml)

### Test Results
Detailed test results can be found in the GitHub Actions logs for each workflow run. Specifically, check the output of the "Run Tests (No Coverage)" job for standard test results, and the "Run Tests (With Coverage)" job for tests run with coverage enabled.

### Test Coverage
A summary of the test coverage is available in the GitHub Actions logs for the "Run Tests (With Coverage)" job, within the output of its "Run Jest tests and coverage" step. Currently, detailed coverage reports are not uploaded as artifacts, so the logs are the primary place to view this information.

### Running Locally
To run the different build and test processes locally, first ensure you have all dependencies installed:
```bash
npm install
```

Then, you can use the following commands:

**1. Build Artifacts**

To compile assets (CSS, JavaScript) as done in the `build` CI job:
```bash
npx gulp compile
```

**2. Run Tests (No Coverage)**

To run the Jest tests without generating a coverage report, similar to the `test-no-coverage` CI job:
```bash
npm test
```

**3. Run Tests (With Coverage)**

To run the Jest tests and generate a coverage report in the console, similar to the `test-coverage` CI job:
```bash
npm run test:coverage
```
