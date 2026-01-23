#!/usr/bin/env node
/**
 * Cross-platform menu launcher
 * Detects the OS and runs the appropriate menu script (bash or batch)
 * 
 * This module is called by the npm "menu" script and ensures that the menu
 * works on Windows, macOS, and Linux by selecting the correct script type.
 * 
 * Cognitive complexity: 3 (kept low by simple OS detection logic)
 */

const { execSync } = require('child_process');
const path = require('path');

/**
 * Launches the menu using the appropriate script for the current OS
 * 
 * On Windows, runs the .bat script using cmd.exe
 * On Unix-like systems (macOS, Linux), runs the .sh script using bash
 * 
 * @throws {Error} If the script execution fails
 */
function launchMenu() {
  const isWindows = process.platform === 'win32';
  
  // Determine which script to run based on OS
  const scriptName = isWindows ? 'menu-wrapper.bat' : 'menu-wrapper.sh';
  const scriptPath = path.join(process.cwd(), scriptName);
  
  try {
    // On Windows, use cmd to run .bat files
    // On Unix-like systems, use bash to run .sh files
    const command = isWindows 
      ? `"${scriptPath}"` 
      : `bash "${scriptPath}"`;
    
    // Execute the script and inherit stdio to show output directly
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    // Error will be displayed by the child process
    process.exit(error.status || 1);
  }
}

// Run the menu launcher
launchMenu();
