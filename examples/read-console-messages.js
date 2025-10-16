/**
 * @file Example demonstrating message collector usage
 * 
 * This example shows how to read and analyze the console messages
 * captured during menu operations [1] and [4].
 * 
 * Usage:
 *   node examples/read-console-messages.js
 */

const fs = require('fs-extra');
const path = require('path');

async function analyzeConsoleMessages() {
    const messagePath = path.join(process.cwd(), '.cache', 'console-messages.json');

    // Check if the file exists
    if (!await fs.pathExists(messagePath)) {
        console.log('❌ No console messages found.');
        console.log('   Run "npm run render" or "npm run collectExternalReferences" first.');
        process.exit(1);
    }

    // Read the messages
    const output = await fs.readJson(messagePath);

    // Display metadata
    console.log('\n📊 Console Message Analysis');
    console.log('═'.repeat(60));
    console.log(`Generated at: ${output.metadata.generatedAt}`);
    console.log(`Total messages: ${output.metadata.totalMessages}`);
    console.log(`Operations: ${output.metadata.operations.join(', ')}`);
    console.log('\nMessages by type:');
    Object.entries(output.metadata.messagesByType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
    });

    // Analyze errors
    const errors = output.messages.filter(m => m.type === 'error');
    if (errors.length > 0) {
        console.log('\n❌ Errors detected:');
        errors.forEach(error => {
            console.log(`  [${error.timestamp}] ${error.message}`);
            if (error.additionalData && error.additionalData.length > 0) {
                console.log(`    Details: ${error.additionalData.join(', ')}`);
            }
        });
    } else {
        console.log('\n✅ No errors detected');
    }

    // Analyze warnings
    const warnings = output.messages.filter(m => m.type === 'warn');
    if (warnings.length > 0) {
        console.log('\n🟡 Warnings detected:');
        warnings.forEach(warning => {
            console.log(`  [${warning.timestamp}] ${warning.message}`);
        });
    } else {
        console.log('✅ No warnings detected');
    }

    // Show successful operations
    const successes = output.messages.filter(m => m.type === 'success');
    console.log(`\n✅ Successful operations: ${successes.length}`);
    if (successes.length > 0 && successes.length <= 5) {
        successes.forEach(success => {
            console.log(`  - ${success.message}`);
        });
    }

    // Operation breakdown
    const messagesByOp = output.messages.reduce((acc, msg) => {
        if (msg.operation) {
            acc[msg.operation] = (acc[msg.operation] || 0) + 1;
        }
        return acc;
    }, {});

    console.log('\n📋 Messages by operation:');
    Object.entries(messagesByOp).forEach(([op, count]) => {
        console.log(`  ${op}: ${count} messages`);
    });

    // Health summary
    console.log('\n🏥 Health Summary:');
    if (errors.length > 0) {
        console.log('  Status: ❌ ERROR - Issues detected during operation');
    } else if (warnings.length > 0) {
        console.log('  Status: 🟡 WARNING - Operation completed with warnings');
    } else {
        console.log('  Status: ✅ SUCCESS - Operation completed successfully');
    }

    console.log('═'.repeat(60) + '\n');
}

// Run the analysis
analyzeConsoleMessages().catch(error => {
    console.error('❌ Failed to analyze messages:', error.message);
    process.exit(1);
});
