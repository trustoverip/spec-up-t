#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

// Import modules from the health-check directory
const externalSpecsChecker = require('./health-check/external-specs-checker');
const termReferencesChecker = require('./health-check/term-references-checker');
const specsConfigurationChecker = require('./health-check/specs-configuration-checker');
const termsIntroChecker = require('./health-check/terms-intro-checker');
const outputGitignoreChecker = require('./health-check/output-gitignore-checker');
const trefTermChecker = require('./health-check/tref-term-checker');

// Configuration
const OUTPUT_DIR = path.join(process.cwd(), 'output');

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper function to read specs.json file
function getRepoInfo() {
    try {
        // Path to the default boilerplate specs.json
        const defaultSpecsPath = path.join(
            __dirname,
            'install-from-boilerplate',
            'boilerplate',
            'specs.json'
        );
        
        let defaultValues = {
            host: 'github',
            account: 'blockchain-bird',
            repo: 'spec-up-t'
        };

        // Try to load default values from boilerplate specs.json
        if (fs.existsSync(defaultSpecsPath)) {
            try {
                const defaultSpecsContent = fs.readFileSync(defaultSpecsPath, 'utf8');
                const defaultSpecs = JSON.parse(defaultSpecsContent);
                
                if (defaultSpecs?.specs?.[0]?.source) {
                    const source = defaultSpecs.specs[0].source;
                    defaultValues = {
                        host: source.host || defaultValues.host,
                        account: source.account || defaultValues.account,
                        repo: source.repo || defaultValues.repo
                    };
                }
            } catch (error) {
                console.error('Error reading boilerplate specs.json:', error);
            }
        }

        // Look for specs.json in the current working directory (where the command is run from)
        const specsPath = path.join(process.cwd(), 'specs.json');
        
        if (fs.existsSync(specsPath)) {
            const specsContent = fs.readFileSync(specsPath, 'utf8');
            const specs = JSON.parse(specsContent);
            
            // Check if source field exists and has required properties
            if (specs?.specs?.[0]?.source?.host && 
                specs?.specs?.[0]?.source?.account && 
                specs?.specs?.[0]?.source?.repo) {
                
                const sourceInfo = specs.specs[0].source;
                
                // Check if values have been changed from defaults
                const valuesChanged = 
                    sourceInfo.host !== defaultValues.host ||
                    sourceInfo.account !== defaultValues.account ||
                    sourceInfo.repo !== defaultValues.repo;
                
                // If values haven't changed, just return the default values
                // This allows the user to manually change these later
                if (!valuesChanged) {
                    return {
                        host: sourceInfo.host,
                        account: sourceInfo.account,
                        repo: sourceInfo.repo,
                        branch: sourceInfo.branch || defaultValues.branch
                    };
                }
                
                // If values have changed, verify the repository exists
                const repoExists = checkRepositoryExists(
                    sourceInfo.host,
                    sourceInfo.account,
                    sourceInfo.repo
                );
                
                if (repoExists) {
                    // Repository exists, return the verified info
                    return {
                        host: sourceInfo.host,
                        account: sourceInfo.account,
                        repo: sourceInfo.repo,
                        branch: sourceInfo.branch || defaultValues.branch,
                        verified: true
                    };
                } else {
                    // Repository doesn't exist, but values have been changed
                    // Return the values with a verification failed flag
                    return {
                        host: sourceInfo.host,
                        account: sourceInfo.account,
                        repo: sourceInfo.repo,
                        branch: sourceInfo.branch || defaultValues.branch,
                        verified: false
                    };
                }
            }
        } else {
            console.log('specs.json not found');
        }
    } catch (error) {
        console.error('Error reading specs.json:', error);
    }
    
    // Return default values if specs.json doesn't exist or doesn't contain the required information
    return {
        host: 'github',
        account: 'blockchain-bird',
        repo: 'spec-up-t',
        branch: 'main'
    };
}

// Helper function to check if a repository exists
function checkRepositoryExists(host, account, repo) {
    try {
        // For synchronous checking, we'll use a simple HTTP HEAD request
        const url = `https://${host}.com/${account}/${repo}`;
        
        // Simple synchronous HTTP request using execSync
        const cmd = process.platform === 'win32' 
            ? `curl -s -o /nul -w "%{http_code}" -I ${url}`
            : `curl -s -o /dev/null -w "%{http_code}" -I ${url}`;
            
        const statusCode = execSync(cmd).toString().trim();
        
        // 200, 301, 302 status codes indicate the repo exists
        return ['200', '301', '302'].includes(statusCode);
    } catch (error) {
        console.error('Error checking repository existence:', error);
        return false;
    }
}

// Helper function to get the appropriate file open command based on platform
function getOpenCommand() {
    if (process.platform === 'win32') {
        return 'start';
    } else if (process.platform === 'darwin') {
        return 'open';
    } else {
        return 'xdg-open';
    }
}

// Helper function to format current time for the filename
function getFormattedTimestamp() {
    const now = new Date();
    return now.toISOString()
        .replace(/[T:]/g, '-')
        .replace(/\..+/, '')
        .replace(/Z/g, 'Z');
}

// Helper function to generate a human-readable timestamp for display
function getHumanReadableTimestamp() {
    return new Date().toLocaleString();
}

// Helper function to determine status display parameters based on result
function getStatusDisplay(result) {
    if (result.status === 'warning' || result.success === 'partial') {
        // Warning status
        return {
            statusClass: 'text-warning',
            statusIcon: '<i class="bi bi-exclamation-triangle-fill"></i>',
            statusText: 'Warning'
        };
    } else if (result.success) {
        // Pass status
        return {
            statusClass: 'text-success',
            statusIcon: '<i class="bi bi-check-circle-fill"></i>',
            statusText: 'Pass'
        };
    } else {
        // Fail status
        return {
            statusClass: 'text-danger',
            statusIcon: '<i class="bi bi-x-circle-fill"></i>',
            statusText: 'Fail'
        };
    }
}

// Main function to run all checks and generate the report
async function runHealthCheck() {
    console.log('Running health checks...');

    // Collection to store all check results
    const results = [];

  try {
      
        // Run term reference tref check
        const trefTermResults = await trefTermChecker.checkTrefTerms(process.cwd());
        results.push({
          title: 'Check Trefs in all external specs',
          results: trefTermResults
        });

        // Run external specs URL check
        const externalSpecsResults = await externalSpecsChecker.checkExternalSpecs(process.cwd());
        results.push({
            title: 'Check External Specs URL',
            results: externalSpecsResults
        });

        // Run term references check
        const termReferencesResults = await termReferencesChecker.checkTermReferences(process.cwd());
        results.push({
            title: 'Check Term References',
            results: termReferencesResults
        });

        // Run specs.json configuration check
        const specsConfigResults = await specsConfigurationChecker.checkSpecsJsonConfiguration(process.cwd());
        results.push({
            title: 'Check <code>specs.json</code> configuration',
            results: specsConfigResults
        });

        // Run terms-and-definitions-intro.md check
        const termsIntroResults = await termsIntroChecker.checkTermsIntroFile(process.cwd());
        results.push({
            title: 'Check <code>terms-and-definitions-intro.md</code>',
            results: termsIntroResults
        });

        // Run output directory gitignore check
        const outputGitignoreResults = await outputGitignoreChecker.checkOutputDirGitIgnore(process.cwd());
        results.push({
            title: 'Check <code>.gitignore</code>',
            results: outputGitignoreResults
        });

        // Add more checks here in the future

        // Generate and open the report
        generateReport(results);
    } catch (error) {
        console.error('Error running health checks:', error);
        process.exit(1);
    }
}

// Generate HTML report
function generateReport(checkResults) {
    const timestamp = getFormattedTimestamp();
    // Get repository information from specs.json
    const repoInfo = getRepoInfo();
    const reportFileName = `health-check-${timestamp}-${repoInfo.account}-${repoInfo.repo}.html`;
    const reportPath = path.join(OUTPUT_DIR, reportFileName);

    
    const htmlContent = generateHtmlReport(checkResults, getHumanReadableTimestamp(), repoInfo);

    fs.writeFileSync(reportPath, htmlContent);
    console.log(`Report generated: ${reportPath}`);

    // Open the report in the default browser
    try {
        const openCommand = getOpenCommand();
        execSync(`${openCommand} "${reportPath}"`);
    } catch (error) {
        console.error('Failed to open the report:', error);
    }
}

// Generate HTML content
function generateHtmlReport(checkResults, timestamp, repoInfo) {
    let resultsHtml = '';

    // Add repository verification check at the beginning if needed
    if (repoInfo && repoInfo.verified === false) {
        const failStatus = {
            statusClass: 'text-danger',
            statusIcon: '<i class="bi bi-x-circle-fill"></i>',
            statusText: 'Fail'
        };
        
        // Create a new section at the top for repository verification
        resultsHtml += `
      <div class="card mb-4 results-card alert-danger" data-section="repository-verification">
        <div class="card-header bg-danger text-white">
          <h5>Repository Verification</h5>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Status</th>
                <th>Check</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr data-status="fail" class="check-row">
                <td class="${failStatus.statusClass}" style="white-space: nowrap;">
                  ${failStatus.statusIcon} <span style="vertical-align: middle;">${failStatus.statusText}</span>
                </td>
                <td>Repository existence check</td>
                <td>The repository at https://${repoInfo.host}.com/${repoInfo.account}/${repoInfo.repo} does not exist or is not accessible. Please verify the repository information in specs.json.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    }

    checkResults.forEach(section => {
        resultsHtml += `
      <div class="card mb-4 results-card" data-section="${section.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}">
        <div class="card-header">
          <h5>${section.title}</h5>
        </div>
        <div class="card-body">
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Status</th>
                <th>Check</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
    `;

        section.results.forEach(result => {
            const { statusClass, statusIcon, statusText } = getStatusDisplay(result);

            // Add data-status attribute to identify rows by status and reorder columns to put status first
            resultsHtml += `
        <tr data-status="${statusText.toLowerCase()}" class="check-row">
          <td class="${statusClass}" style="white-space: nowrap;">
            ${statusIcon} <span style="vertical-align: middle;">${statusText}</span>
          </td>
          <td>${result.name}</td>
          <td>${result.details || ''}</td>
        </tr>
      `;
        });

        resultsHtml += `
            </tbody>
          </table>
        </div>
      </div>
    `;
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Spec-Up-T Health Check Report</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
      <style>
        body {
          padding-top: 2rem;
          padding-bottom: 2rem;
        }
        .report-header {
          margin-bottom: 2rem;
        }
        .timestamp {
          color: #6c757d;
        }
        .filter-toggle {
          margin-bottom: 1rem;
        }
        .hidden-item {
          display: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="report-header">
          <h1>Spec-Up-T Health Check Report</h1>
          <p class="timestamp">Generated: ${timestamp}</p>
          <p class="repo-info">
            Repository: <a href="https://${repoInfo.host}.com/${repoInfo.account}/${repoInfo.repo}" target="_blank">https://${repoInfo.host}.com/${repoInfo.account}/${repoInfo.repo}</a><br>
            Username: ${repoInfo.account}<br>
            Repo name: ${repoInfo.repo}
          </p>
        </div>
        
        <div class="filter-toggle form-check form-switch">
          <input class="form-check-input" type="checkbox" id="togglePassingChecks" checked>
          <label class="form-check-label" for="togglePassingChecks">Show / hide passing checks</label>
        </div>
        
        <div class="results">
          ${resultsHtml}
        </div>
      </div>
      
      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        // Toggle function for passing checks
        document.getElementById('togglePassingChecks').addEventListener('change', function() {
          const showPassing = this.checked;
          const passingRows = document.querySelectorAll('tr[data-status="pass"]');
          
          // Hide/show passing rows
          passingRows.forEach(row => {
            if (showPassing) {
              row.classList.remove('hidden-item');
            } else {
              row.classList.add('hidden-item');
            }
          });
          
          // Check each results card to see if it should be hidden
          document.querySelectorAll('.results-card').forEach(card => {
            const visibleRows = card.querySelectorAll('tr.check-row:not(.hidden-item)');
            
            if (visibleRows.length === 0) {
              // If no visible rows, hide the entire card
              card.classList.add('hidden-item');
            } else {
              // Otherwise show it
              card.classList.remove('hidden-item');
            }
          });
        });
      </script>
    </body>
    </html>
  `;
}

// Run the health check
runHealthCheck();