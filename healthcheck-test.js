(async () => {
    const {
        createProvider,
        runHealthChecks,
        formatResultsAsText,
        formatResultsAsHtml,
        openHtmlFile,      // ✅ This opens files
        getOpenCommand     // ✅ This only returns command name
        // } = await import('spec-up-t-healthcheck');
    } = await import('/Users/kor/webdev/Blockchain-Bird/KERI/Spec-Up/active-bcb/spec-up-t-healthcheck/lib/index.js');
    console.log("🚀 ~ openHtmlFile:", openHtmlFile)

    const provider = createProvider('.');
    const results = await runHealthChecks(provider, {
        checks: ['package-json', 'spec-files', 'specs-json']
    });

    // Check results
    console.log(`Health Score: ${results.summary.score}%`);
    console.log(`Passed: ${results.summary.passed}/${results.summary.total}`);

    if (results.summary.hasErrors) {
        console.error('❌ Some checks failed');
        console.log(formatResultsAsText(results));
        
        // Print detailed specs-json errors if present
        const specsJsonResult = results.results.find(r => r.check === 'specs-json');
        if (specsJsonResult && specsJsonResult.status === 'fail') {
            console.log('\n🔍 Detailed specs-json errors:');
            if (specsJsonResult.details && specsJsonResult.details.errors) {
                specsJsonResult.details.errors.forEach(error => {
                    console.log(`  ❌ ${error}`);
                });
            }
            if (specsJsonResult.details && specsJsonResult.details.warnings) {
                specsJsonResult.details.warnings.forEach(warning => {
                    console.log(`  ⚠️ ${warning}`);
                });
            }
        }
    } else {
        console.log('✅ All checks passed!');
    }

    // Generate your report...
    const htmlReport = formatResultsAsHtml(results, {
        title: 'My Project Health Check',
        repositoryUrl: 'https://github.com/user/repo'
    });
    // await fs.writeFile('health-report.html', htmlReport);
    await import('fs/promises').then(fs =>
        fs.writeFile('health-report.html', htmlReport)
    );


    // Open the file correctly:
    const opened = await openHtmlFile('health-report.html'); // ✅ This actually opens the file
    if (!opened) {
        console.error('Failed to open HTML report');
    }

    // Optional: Show what command is being used
    const commandName = getOpenCommand(); // ✅ Just for info: 'open', 'start', etc.
    console.log(`Platform uses: ${commandName}`);




})().catch(console.error);