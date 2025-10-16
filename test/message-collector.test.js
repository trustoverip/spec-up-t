/**
 * @file Unit tests for message-collector utility
 * 
 * Tests the message collection functionality that captures console output
 * from Logger calls and stores them in JSON format.
 */

const messageCollector = require('../src/utils/message-collector');
const Logger = require('../src/utils/logger');
const fs = require('fs-extra');
const path = require('path');

describe('Message Collector', () => {
    // Clean up before and after each test
    beforeEach(() => {
        messageCollector.clearMessages();
    });

    afterEach(() => {
        messageCollector.stopCollecting();
        messageCollector.clearMessages();
    });

    describe('Basic Collection', () => {
        test('should start and stop collecting', () => {
            expect(messageCollector.getStatistics().isCollecting).toBe(false);
            
            messageCollector.startCollecting('test');
            expect(messageCollector.getStatistics().isCollecting).toBe(true);
            expect(messageCollector.getStatistics().currentOperation).toBe('test');
            
            messageCollector.stopCollecting();
            expect(messageCollector.getStatistics().isCollecting).toBe(false);
            expect(messageCollector.getStatistics().currentOperation).toBe(null);
        });

        test('should collect messages when active', () => {
            messageCollector.startCollecting('test');
            
            Logger.info('Test message');
            Logger.success('Success message');
            Logger.warn('Warning message');
            
            const messages = messageCollector.getMessages();
            expect(messages).toHaveLength(3);
            expect(messages[0].message).toBe('Test message');
            expect(messages[0].type).toBe('info');
            expect(messages[0].operation).toBe('test');
            
            messageCollector.stopCollecting();
        });

        test('should not collect messages when inactive', () => {
            Logger.info('This should not be collected');
            
            const messages = messageCollector.getMessages();
            expect(messages).toHaveLength(0);
        });

        test('should clear messages', () => {
            messageCollector.startCollecting('test');
            Logger.info('Message 1');
            Logger.info('Message 2');
            
            expect(messageCollector.getMessages()).toHaveLength(2);
            
            messageCollector.clearMessages();
            expect(messageCollector.getMessages()).toHaveLength(0);
            
            messageCollector.stopCollecting();
        });
    });

    describe('Message Structure', () => {
        test('should include all required fields', () => {
            messageCollector.startCollecting('test');
            Logger.info('Test message', 'extra', 'data');
            
            const messages = messageCollector.getMessages();
            expect(messages[0]).toHaveProperty('timestamp');
            expect(messages[0]).toHaveProperty('type');
            expect(messages[0]).toHaveProperty('message');
            expect(messages[0]).toHaveProperty('operation');
            
            messageCollector.stopCollecting();
        });

        test('should capture additional arguments', () => {
            messageCollector.startCollecting('test');
            Logger.info('Test', 'arg1', 'arg2', 123);
            
            const messages = messageCollector.getMessages();
            expect(messages[0].additionalData).toEqual(['arg1', 'arg2', '123']);
            
            messageCollector.stopCollecting();
        });

        test('should handle different message types', () => {
            messageCollector.startCollecting('test');
            
            Logger.success('Success');
            Logger.error('Error');
            Logger.warn('Warning');
            Logger.info('Info');
            Logger.process('Process');
            Logger.highlight('Highlight');
            Logger.debug('Debug');
            Logger.separator();
            
            const messages = messageCollector.getMessages();
            expect(messages).toHaveLength(8);
            
            const types = messages.map(m => m.type);
            expect(types).toContain('success');
            expect(types).toContain('error');
            expect(types).toContain('warn');
            expect(types).toContain('info');
            expect(types).toContain('process');
            expect(types).toContain('highlight');
            expect(types).toContain('debug');
            expect(types).toContain('separator');
            
            messageCollector.stopCollecting();
        });
    });

    describe('Statistics', () => {
        test('should calculate message counts by type', () => {
            messageCollector.startCollecting('test');
            
            Logger.info('Info 1');
            Logger.info('Info 2');
            Logger.success('Success 1');
            Logger.error('Error 1');
            
            const stats = messageCollector.getStatistics();
            expect(stats.total).toBe(4);
            expect(stats.byType.info).toBe(2);
            expect(stats.byType.success).toBe(1);
            expect(stats.byType.error).toBe(1);
            
            messageCollector.stopCollecting();
        });

        test('should track messages by operation', () => {
            messageCollector.startCollecting('render');
            Logger.info('Render 1');
            Logger.info('Render 2');
            messageCollector.stopCollecting();
            
            messageCollector.startCollecting('collect');
            Logger.info('Collect 1');
            messageCollector.stopCollecting();
            
            const stats = messageCollector.getStatistics();
            expect(stats.byOperation.render).toBe(2);
            expect(stats.byOperation.collect).toBe(1);
        });
    });

    describe('File Operations', () => {
        const testOutputPath = path.join(__dirname, '.test-cache', 'test-messages.json');

        beforeEach(async () => {
            // Clean up test output
            await fs.remove(path.dirname(testOutputPath));
        });

        afterEach(async () => {
            // Clean up test output
            await fs.remove(path.dirname(testOutputPath));
        });

        test('should save messages to file', async () => {
            messageCollector.startCollecting('test');
            Logger.info('Test message');
            Logger.success('Success');
            messageCollector.stopCollecting();
            
            const savedPath = await messageCollector.saveMessages(testOutputPath);
            expect(savedPath).toBe(testOutputPath);
            
            const exists = await fs.pathExists(testOutputPath);
            expect(exists).toBe(true);
        });

        test('should create directory if it does not exist', async () => {
            messageCollector.startCollecting('test');
            Logger.info('Test');
            messageCollector.stopCollecting();
            
            await messageCollector.saveMessages(testOutputPath);
            
            const dirExists = await fs.pathExists(path.dirname(testOutputPath));
            expect(dirExists).toBe(true);
        });

        test('should include metadata in saved file', async () => {
            messageCollector.startCollecting('test');
            Logger.info('Info message');
            Logger.success('Success message');
            Logger.warn('Warning message');
            messageCollector.stopCollecting();
            
            await messageCollector.saveMessages(testOutputPath);
            
            const output = await fs.readJson(testOutputPath);
            
            expect(output).toHaveProperty('metadata');
            expect(output).toHaveProperty('messages');
            
            expect(output.metadata).toHaveProperty('generatedAt');
            expect(output.metadata).toHaveProperty('totalMessages');
            expect(output.metadata).toHaveProperty('operations');
            expect(output.metadata).toHaveProperty('messagesByType');
            
            expect(output.metadata.totalMessages).toBe(3);
            expect(output.metadata.operations).toContain('test');
            expect(output.metadata.messagesByType.info).toBe(1);
            expect(output.metadata.messagesByType.success).toBe(1);
            expect(output.metadata.messagesByType.warn).toBe(1);
        });

        test('should save valid JSON', async () => {
            messageCollector.startCollecting('test');
            Logger.info('Message 1');
            Logger.success('Message 2');
            messageCollector.stopCollecting();
            
            await messageCollector.saveMessages(testOutputPath);
            
            // Should not throw when reading
            const output = await fs.readJson(testOutputPath);
            expect(output.messages).toHaveLength(2);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty message collection', () => {
            messageCollector.startCollecting('test');
            messageCollector.stopCollecting();
            
            const messages = messageCollector.getMessages();
            expect(messages).toHaveLength(0);
            
            const stats = messageCollector.getStatistics();
            expect(stats.total).toBe(0);
        });

        test('should handle multiple start calls', () => {
            messageCollector.startCollecting('operation1');
            messageCollector.startCollecting('operation2');
            
            Logger.info('Test');
            
            const messages = messageCollector.getMessages();
            expect(messages[0].operation).toBe('operation2'); // Last operation
            
            messageCollector.stopCollecting();
        });

        test('should handle special characters in messages', () => {
            messageCollector.startCollecting('test');
            Logger.info('Special chars: 😀 🔥 \n\t \\');
            
            const messages = messageCollector.getMessages();
            expect(messages[0].message).toContain('😀');
            
            messageCollector.stopCollecting();
        });

        test('should convert non-string messages to strings', () => {
            messageCollector.startCollecting('test');
            Logger.info({ nested: 'object' });
            Logger.info(123);
            Logger.info(null);
            
            const messages = messageCollector.getMessages();
            expect(typeof messages[0].message).toBe('string');
            expect(typeof messages[1].message).toBe('string');
            expect(typeof messages[2].message).toBe('string');
            
            messageCollector.stopCollecting();
        });
    });
});
