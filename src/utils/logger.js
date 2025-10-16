const chalk = require('chalk');
const messageCollector = require('./message-collector');

/**
 * Logger utility with color-coded console output
 * Provides consistent logging across the spec-up-t application
 * 
 * All messages are automatically collected when message collection is active,
 * allowing healthchecks and other tools to consume the output in JSON format.
 */
class Logger {
    /**
     * Success messages - green with checkmark
     */
    static success(message, ...args) {
        console.log(chalk.green('✅'), chalk.green(message), ...args);
        messageCollector.addMessage('success', message, args);
    }

    /**
     * Error messages - red with X mark
     */
    static error(message, ...args) {
        console.log(chalk.red('❌'), chalk.red(message), ...args);
        messageCollector.addMessage('error', message, args);
    }

    /**
     * Warning messages - yellow with warning symbol
     */
    static warn(message, ...args) {
        console.log(chalk.yellow('🟡'), chalk.yellow(message), ...args);
        messageCollector.addMessage('warn', message, args);
    }

    /**
     * Info messages - blue with info symbol
     */
    static info(message, ...args) {
        console.log(chalk.blue('📒'), chalk.blue(message), ...args);
        messageCollector.addMessage('info', message, args);
    }

    /**
     * Processing messages - cyan
     */
    static process(message, ...args) {
        console.log(chalk.cyan('🔄'), chalk.cyan(message), ...args);
        messageCollector.addMessage('process', message, args);
    }

    /**
     * Debug messages - gray
     */
    static debug(message, ...args) {
        console.log(chalk.gray('🔍'), chalk.gray(message), ...args);
        messageCollector.addMessage('debug', message, args);
    }

    /**
     * Highlight important data - magenta
     */
    static highlight(message, ...args) {
        console.log(chalk.blue('✨'), chalk.blue(message), ...args);
        messageCollector.addMessage('highlight', message, args);
    }

    /**
     * Section separators
     */
    static separator() {
        console.log(chalk.gray('═'.repeat(60)));
        messageCollector.addMessage('separator', '═'.repeat(60), []);
    }

    /**
     * Progress indicator with counts
     */
    static progress(current, total, message) {
        const percentage = Math.round((current / total) * 100);
        const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
        const progressMessage = `[${bar}] ${percentage}% ${message}`;
        console.log(chalk.cyan(`📊 ${progressMessage}`));
        messageCollector.addMessage('progress', progressMessage, [current, total]);
    }
}

module.exports = Logger;
