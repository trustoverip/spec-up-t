#!/usr/bin/env node

/**
 * @fileoverview Spec-Up-T Health Check Tool - Wrapper for spec-up-t-healthcheck
 * 
 * This script is called from consuming projects via:
 *   require('spec-up-t/src/health-check.js')
 * 
 * It delegates to the new spec-up-t-healthcheck npm package while maintaining
 * backward compatibility with existing consuming projects.
 * 
 * @author Spec-Up-T Team
 * @version 2.0.0
 * @since 2025-10-11
 * @deprecated The old implementation is replaced by spec-up-t-healthcheck
 */

const path = require('path');
const {spawn} = require('child_process');

/**
 * Main function that runs the health check on the consuming project
 * 
 * This function is called when a consuming project executes:
 * npm run healthCheck
 * 
 * Which triggers: require('spec-up-t/src/health-check.js')
 */
async function runHealthCheck() {
    console.log('🏥 Initializing Spec-Up-T Health Check...\n');
    
    // Get the path to the run-healthcheck.js script in spec-up-t
    const healthCheckScript = path.join(__dirname, 'run-healthcheck.js');
    
    // Pass through all command line arguments (excluding node and script name)
    const args = process.argv.slice(2);
    
    // Run the health check script with Node, passing through all arguments
    // The script will automatically check process.cwd() (the consuming project)
    const child = spawn('node', [healthCheckScript, ...args], {
        stdio: 'inherit',  // Pass through all I/O
        cwd: process.cwd()  // Ensure we're in the consuming project directory
    });
    
    // Handle process exit
    child.on('exit', (code) => {
        process.exit(code || 0);
    });
    
    // Handle errors
    child.on('error', (error) => {
        console.error('❌ Failed to run health check:', error.message);
        console.error('\nTroubleshooting:');
        console.error('  - Ensure spec-up-t-healthcheck is installed');
        console.error('  - Try running: npm install in the spec-up-t package');
        console.error('  - Check that Node.js is properly installed');
        process.exit(1);
    });
}

// Run the health check if this file is executed directly or required
if (require.main === module || process.env.SPEC_UP_T_HEALTH_CHECK_RUN !== 'false') {
    runHealthCheck().catch(error => {
        console.error('❌ Health check failed:', error);
        process.exit(1);
    });
}

module.exports = runHealthCheck;
