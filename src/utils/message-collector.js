/**
 * @file Message collector for capturing console output from menu operations
 * 
 * This module wraps the Logger to intercept and store all console messages
 * produced during menu [1] (render) and menu [4] (collect external references)
 * operations, storing them in JSON format for consumption by healthchecks.
 * 
 * The captured messages are stored in `.cache/console-messages.json` with
 * structured metadata including:
 * - timestamp: ISO timestamp of when the message was logged
 * - type: success, error, warn, info, process, highlight, debug, separator
 * - message: the actual message text
 * - operation: which menu operation triggered this (render or collectExternalReferences)
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * Message collection state
 */
const messageStore = {
    messages: [],
    currentOperation: null,
    isCollecting: false
};

/**
 * Start collecting messages for a specific operation
 * @param {string} operation - Operation name ('render' or 'collectExternalReferences')
 */
function startCollecting(operation) {
    messageStore.isCollecting = true;
    messageStore.currentOperation = operation;
}

/**
 * Stop collecting messages
 */
function stopCollecting() {
    messageStore.isCollecting = false;
    messageStore.currentOperation = null;
}

/**
 * Add a message to the collection
 * @param {string} type - Message type (success, error, warn, etc.)
 * @param {string} message - Message text
 * @param {Array} args - Additional arguments passed to logger
 */
function addMessage(type, message, args = []) {
    if (!messageStore.isCollecting) {
        return;
    }

    const messageEntry = {
        timestamp: new Date().toISOString(),
        type,
        message: String(message),
        operation: messageStore.currentOperation,
        additionalData: args.length > 0 ? args.map(arg => String(arg)) : undefined
    };

    messageStore.messages.push(messageEntry);
}

/**
 * Save collected messages to JSON file
 * Each run creates a fresh file, replacing any existing messages.
 * 
 * @param {string} [outputPath] - Optional custom output path
 * @returns {Promise<string>} Path to the saved file
 */
async function saveMessages(outputPath) {
    const cacheDir = path.join(process.cwd(), '.cache');
    const defaultPath = path.join(cacheDir, 'console-messages.json');
    const filePath = outputPath || defaultPath;

    await fs.ensureDir(path.dirname(filePath));

    const output = {
        metadata: {
            generatedAt: new Date().toISOString(),
            totalMessages: messageStore.messages.length,
            operations: [...new Set(messageStore.messages.map(m => m.operation))],
            messagesByType: messageStore.messages.reduce((acc, msg) => {
                acc[msg.type] = (acc[msg.type] || 0) + 1;
                return acc;
            }, {})
        },
        messages: messageStore.messages
    };

    await fs.writeJson(filePath, output, { spaces: 2 });

    return filePath;
}

/**
 * Clear all collected messages
 */
function clearMessages() {
    messageStore.messages = [];
}

/**
 * Get current messages (without saving)
 * @returns {Array} Array of message objects
 */
function getMessages() {
    return [...messageStore.messages];
}

/**
 * Get statistics about collected messages
 * @returns {Object} Statistics object
 */
function getStatistics() {
    return {
        total: messageStore.messages.length,
        byType: messageStore.messages.reduce((acc, msg) => {
            acc[msg.type] = (acc[msg.type] || 0) + 1;
            return acc;
        }, {}),
        byOperation: messageStore.messages.reduce((acc, msg) => {
            if (msg.operation) {
                acc[msg.operation] = (acc[msg.operation] || 0) + 1;
            }
            return acc;
        }, {}),
        isCollecting: messageStore.isCollecting,
        currentOperation: messageStore.currentOperation
    };
}

module.exports = {
    startCollecting,
    stopCollecting,
    addMessage,
    saveMessages,
    clearMessages,
    getMessages,
    getStatistics
};
