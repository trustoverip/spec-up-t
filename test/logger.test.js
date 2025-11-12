/**
 * @file Unit tests for enhanced Logger.error and Logger.warn functionality
 * 
 * Tests the new context, hint, and details options for error and warning messages.
 * Ensures backward compatibility with existing simple message calls.
 */

const Logger = require('../src/utils/logger');
const messageCollector = require('../src/utils/message-collector');

// Mock console.log to capture output
let consoleLogs = [];
const originalConsoleLog = console.log;

beforeAll(() => {
    console.log = (...args) => {
        consoleLogs.push(args);
    };
});

afterAll(() => {
    console.log = originalConsoleLog;
});

beforeEach(() => {
    consoleLogs = [];
    messageCollector.clearMessages();
});

afterEach(() => {
    messageCollector.stopCollecting();
});

describe('Enhanced Logger.error', () => {
    test('should work with simple message (backward compatibility)', () => {
        Logger.error('Simple error message');

        expect(consoleLogs.length).toBeGreaterThan(0);
        expect(consoleLogs[0].join(' ')).toContain('Simple error message');
    });

    test('should work with message and regular arguments', () => {
        Logger.error('Error with args', 'arg1', 123);

        expect(consoleLogs.length).toBeGreaterThan(0);
        const output = consoleLogs[0].join(' ');
        expect(output).toContain('Error with args');
        expect(output).toContain('arg1');
        expect(output).toContain('123');
    });

    test('should display context when provided', () => {
        consoleLogs = [];
        Logger.error('Test error', { context: 'specs.json' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Context:');
        expect(allOutput).toContain('specs.json');
    });

    test('should display hint when provided', () => {
        consoleLogs = [];
        Logger.error('Test error', { hint: 'Run npm install' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('How to fix:');
        expect(allOutput).toContain('Run npm install');
    });

    test('should display details when provided', () => {
        consoleLogs = [];
        Logger.error('Test error', { details: 'Error code: 404' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Details:');
        expect(allOutput).toContain('Error code: 404');
    });

    test('should handle all options together', () => {
        consoleLogs = [];
        Logger.error('Test error', {
            context: 'Test context',
            hint: 'Test hint',
            details: 'Test details'
        });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Test error');
        expect(allOutput).toContain('Context:');
        expect(allOutput).toContain('Test context');
        expect(allOutput).toContain('How to fix:');
        expect(allOutput).toContain('Test hint');
        expect(allOutput).toContain('Details:');
        expect(allOutput).toContain('Test details');
    });

    test('should handle regular args mixed with options', () => {
        consoleLogs = [];
        Logger.error('Error', 'arg1', 'arg2', { hint: 'Fix it' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Error');
        expect(allOutput).toContain('arg1');
        expect(allOutput).toContain('arg2');
        expect(allOutput).toContain('Fix it');
    });

    test('should handle object details', () => {
        consoleLogs = [];
        Logger.error('Test error', {
            details: { code: 404, message: 'Not found' }
        });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('404');
        expect(allOutput).toContain('Not found');
    });

    test('should not treat regular object as options', () => {
        consoleLogs = [];
        Logger.error('Test error', { someData: 'value' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Test error');
        // Should treat it as regular argument, not as options
        // The object will be stringified as [object Object]
        expect(allOutput).toContain('[object Object]');
    });

    test('should collect enhanced messages', () => {
        messageCollector.startCollecting('test');

        Logger.error('Test error', {
            context: 'test context',
            hint: 'test hint',
            details: 'test details'
        });

        const messages = messageCollector.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].type).toBe('error');
        expect(messages[0].message).toBe('Test error');

        // Should have collected the options
        const additionalData = messages[0].additionalData;
        expect(additionalData).toBeDefined();
        expect(additionalData.length).toBeGreaterThan(0);

        messageCollector.stopCollecting();
    });
});

describe('Enhanced Logger.warn', () => {
    test('should work with simple message (backward compatibility)', () => {
        Logger.warn('Simple warning message');

        expect(consoleLogs.length).toBeGreaterThan(0);
        expect(consoleLogs[0].join(' ')).toContain('Simple warning message');
    });

    test('should work with message and regular arguments', () => {
        Logger.warn('Warning with args', 'arg1', 123);

        expect(consoleLogs.length).toBeGreaterThan(0);
        const output = consoleLogs[0].join(' ');
        expect(output).toContain('Warning with args');
        expect(output).toContain('arg1');
        expect(output).toContain('123');
    });

    test('should display context when provided', () => {
        consoleLogs = [];
        Logger.warn('Test warning', { context: 'Configuration file' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Context:');
        expect(allOutput).toContain('Configuration file');
    });

    test('should display hint when provided', () => {
        consoleLogs = [];
        Logger.warn('Test warning', { hint: 'Consider updating to latest version' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Suggestion:');
        expect(allOutput).toContain('Consider updating to latest version');
    });

    test('should display details when provided', () => {
        consoleLogs = [];
        Logger.warn('Test warning', { details: 'Using fallback: default' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Details:');
        expect(allOutput).toContain('Using fallback: default');
    });

    test('should handle all options together', () => {
        consoleLogs = [];
        Logger.warn('Test warning', {
            context: 'Test context',
            hint: 'Test suggestion',
            details: 'Test details'
        });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Test warning');
        expect(allOutput).toContain('Context:');
        expect(allOutput).toContain('Test context');
        expect(allOutput).toContain('Suggestion:');
        expect(allOutput).toContain('Test suggestion');
        expect(allOutput).toContain('Details:');
        expect(allOutput).toContain('Test details');
    });

    test('should handle regular args mixed with options', () => {
        consoleLogs = [];
        Logger.warn('Warning', 'arg1', 'arg2', { hint: 'Update config' });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Warning');
        expect(allOutput).toContain('arg1');
        expect(allOutput).toContain('arg2');
        expect(allOutput).toContain('Update config');
    });

    test('should collect enhanced messages', () => {
        messageCollector.startCollecting('test');

        Logger.warn('Test warning', {
            context: 'test context',
            hint: 'test hint',
            details: 'test details'
        });

        const messages = messageCollector.getMessages();
        expect(messages).toHaveLength(1);
        expect(messages[0].type).toBe('warn');
        expect(messages[0].message).toBe('Test warning');

        messageCollector.stopCollecting();
    });
});

describe('Edge Cases', () => {
    test('should handle empty options object', () => {
        consoleLogs = [];
        Logger.error('Test', {});

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Test');
        // Should just show the message without extra lines
    });

    test('should handle null and undefined in options', () => {
        consoleLogs = [];
        Logger.error('Test', {
            context: null,
            hint: undefined,
            details: 'valid'
        });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Test');
        expect(allOutput).toContain('Details:');
        expect(allOutput).toContain('valid');
    });

    test('should handle special characters in options', () => {
        consoleLogs = [];
        Logger.error('Test', {
            hint: 'Fix with: npm run build && npm test'
        });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('npm run build && npm test');
    });

    test('should handle multiline strings in options', () => {
        consoleLogs = [];
        Logger.error('Test', {
            details: 'Line 1\nLine 2\nLine 3'
        });

        const allOutput = consoleLogs.map(log => log.join(' ')).join('\n');
        expect(allOutput).toContain('Line 1');
        expect(allOutput).toContain('Line 2');
        expect(allOutput).toContain('Line 3');
    });
});
