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

        console.log(); // Extra newline for readability
    }

    /**
     * Error messages - red with X mark
     * 
     * Enhanced error logging with optional context and actionable guidance.
     * 
     * @param {string} message - The main error message
     * @param {...any} args - Additional arguments. Can include:
     *   - Regular values (strings, numbers, objects) for message formatting
     *   - An options object (if last arg is object with 'hint', 'context', or 'details' keys):
     *     - hint: Actionable suggestion for fixing the error
     *     - context: Additional context about where/why the error occurred
     *     - details: Technical details or error objects
     * 
     * @example
     * Logger.error('File not found', { 
     *   context: 'specs.json',
     *   hint: 'Create a specs.json file in your project root',
     *   details: error.message 
     * });
     */
    static error(message, ...args) {
        // Extract options object if present (last arg with special keys)
        const lastArg = args[args.length - 1];
        const isOptionsObject = lastArg && typeof lastArg === 'object' &&
            (lastArg.hint || lastArg.context || lastArg.details);

        const options = isOptionsObject ? args.pop() : {};
        const regularArgs = args;

        // Display main error message
        console.log(chalk.red('❌'), chalk.red(message), ...regularArgs);

        // Display context if provided - helps identify the scope of the error
        if (options.context) {
            console.log(chalk.red('   Context:'), chalk.gray(options.context));
        }

        // Display technical details if provided - useful for debugging
        if (options.details) {
            const detailsStr = typeof options.details === 'object'
                ? JSON.stringify(options.details, null, 2)
                : String(options.details);
            console.log(chalk.red('   Details:'), chalk.gray(detailsStr));
        }

        // Display actionable hint if provided - most valuable for authors
        if (options.hint) {
            console.log(chalk.yellow('   💡 How to fix:'), chalk.yellow(options.hint));
        }

        // Collect message with all context for healthcheck/JSON output
        messageCollector.addMessage('error', message, [...regularArgs, options]);

        console.log(); // Extra newline for readability
    }

    /**
     * Warning messages - yellow with warning symbol
     * 
     * Enhanced warning logging with optional context and actionable guidance.
     * 
     * @param {string} message - The main warning message
     * @param {...any} args - Additional arguments. Can include:
     *   - Regular values (strings, numbers, objects) for message formatting
     *   - An options object (if last arg is object with 'hint', 'context', or 'details' keys):
     *     - hint: Actionable suggestion for addressing the warning
     *     - context: Additional context about where/why the warning occurred
     *     - details: Technical details or related information
     * 
     * @example
     * Logger.warn('Using fallback configuration', { 
     *   context: 'specs.json missing optional field',
     *   hint: 'Add "output_path" to specs.json for better control',
     *   details: 'Using default: ./docs' 
     * });
     */
    static warn(message, ...args) {
        // Extract options object if present (last arg with special keys)
        const lastArg = args[args.length - 1];
        const isOptionsObject = lastArg && typeof lastArg === 'object' &&
            (lastArg.hint || lastArg.context || lastArg.details);

        const options = isOptionsObject ? args.pop() : {};
        const regularArgs = args;

        // Display main warning message
        console.log(chalk.keyword('orange')('❗'), chalk.yellow(message), ...regularArgs);

        // Display context if provided - helps identify the scope of the warning
        if (options.context) {
            console.log(chalk.yellow('   Context:'), chalk.gray(options.context));
        }

        // Display technical details if provided - useful for understanding the situation
        if (options.details) {
            const detailsStr = typeof options.details === 'object'
                ? JSON.stringify(options.details, null, 2)
                : String(options.details);
            console.log(chalk.yellow('   Details:'), chalk.gray(detailsStr));
        }

        // Display actionable hint if provided - helps authors improve their spec
        if (options.hint) {
            console.log(chalk.cyan('   💡 Suggestion:'), chalk.cyan(options.hint));
        }

        // Collect message with all context for healthcheck/JSON output
        messageCollector.addMessage('warn', message, [...regularArgs, options]);

        console.log(); // Extra newline for readability
    }

    static info(message, ...args) {
        console.log(chalk.blue('📋'), chalk.blue(message), ...args);
        messageCollector.addMessage('info', message, args);

        console.log(); // Extra newline for readability
    }

    /**
     * Processing messages - cyan
     */
    static process(message, ...args) {
        console.log(chalk.cyan('🔄'), chalk.cyan(message), ...args);
        messageCollector.addMessage('process', message, args);

        console.log(); // Extra newline for readability
    }

    /**
     * Debug messages - gray
     */
    static debug(message, ...args) {
        console.log(chalk.gray('🔍'), chalk.gray(message), ...args);
        messageCollector.addMessage('debug', message, args);

        console.log(); // Extra newline for readability
    }

    /**
     * Highlight important data - magenta
     */
    static highlight(message, ...args) {
        console.log(chalk.blue('📋'), chalk.blue(message), ...args);
        messageCollector.addMessage('highlight', message, args);

        console.log(); // Extra newline for readability
    }

    /**
     * Section separators
     */
    static separator() {
        console.log(chalk.gray('═'.repeat(60)));
        messageCollector.addMessage('separator', '═'.repeat(60), []);

        console.log(); // Extra newline for readability
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

        console.log(); // Extra newline for readability
    }
}

module.exports = Logger;
