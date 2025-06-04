# Utils Module

This directory contains utility modules that provide cross-platform functionality for the Spec-Up-T health check system.

## file-opener.js

Provides secure, cross-platform file opening functionality with proper command path resolution.

### Features:
- **Cross-platform support**: Handles Windows (`start`), macOS (`open`), and Linux (`xdg-open`) 
- **Secure path resolution**: Uses absolute command paths instead of relying on PATH environment variable
- **Error handling**: Graceful fallback when commands cannot be located

### Functions:
- `getCommandPath(command)` - Resolves absolute path for a given command
- `getOpenCommand()` - Returns the platform-specific file opening command path
- `openFile(filePath)` - Opens any file in its default application
- `openHtmlFile(htmlFilePath)` - Specifically opens HTML files in the default browser

### Security:
This module was created to address SonarQube security issues by:
1. Eliminating shell injection vulnerabilities through proper argument separation
2. Avoiding PATH hijacking by using absolute command paths
3. Providing controlled, sanitized command execution

### Usage:
```javascript
const fileOpener = require('./utils/file-opener');

// Open an HTML report
const success = fileOpener.openHtmlFile('/path/to/report.html');

// Get absolute path for a command
const gitPath = fileOpener.getCommandPath('git');
```
