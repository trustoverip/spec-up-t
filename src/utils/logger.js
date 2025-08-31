const chalk = require('chalk');

/**
 * Logger utility with color-coded console output
 * Provides consistent logging across the spec-up-t application
 */
class Logger {
    /**
     * Success messages - green with checkmark
     */
    static success(message, ...args) {
        console.log(chalk.green('✅'), chalk.green(message), ...args);
    }

    /**
     * Error messages - red with X mark
     */
    static error(message, ...args) {
        console.log(chalk.red('✗'), chalk.red(message), ...args);
    }

    /**
     * Warning messages - yellow with warning symbol
     */
    static warn(message, ...args) {
        console.log(chalk.yellow('⚠'), chalk.yellow(message), ...args);
    }

    /**
     * Info messages - blue with info symbol
     */
    static info(message, ...args) {
        console.log(chalk.blue('ℹ'), chalk.blue(message), ...args);
    }

    /**
     * Processing messages - cyan
     */
    static process(message, ...args) {
        console.log(chalk.cyan('→'), chalk.cyan(message), ...args);
    }

    /**
     * Debug messages - gray
     */
    static debug(message, ...args) {
        console.log(chalk.gray('◦'), chalk.gray(message), ...args);
    }

    /**
     * Highlight important data - magenta
     */
    static highlight(message, ...args) {
        console.log(chalk.magenta('★'), chalk.magenta(message), ...args);
    }

    /**
     * Section separators
     */
    static separator() {
        console.log(chalk.gray('═'.repeat(60)));
    }

    /**
     * Progress indicator with counts
     */
    static progress(current, total, message) {
        const percentage = Math.round((current / total) * 100);
        const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
        console.log(chalk.cyan(`[${bar}] ${percentage}% ${message}`));
    }
}

module.exports = Logger;
