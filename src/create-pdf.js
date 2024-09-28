const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    try {
        // Launch a new browser instance
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Read and parse the specs.json file
        const config = fs.readJsonSync('specs.json');

        // Extract the output_path from the specs.json file
        const outputPath = config.specs[0].output_path;

        // Define the path to the HTML file based on the directory where the script is called from
        //TODO: replace `docs/index.html` with the path in specs.json
        const filePath = path.resolve(process.cwd(), outputPath, 'index.html');
        const fileUrl = `file://${filePath}`;

        // Navigate to the HTML file
        await page.goto(fileUrl, { waitUntil: 'networkidle2' });

        // Remove or hide the search bar or any other element
        await page.evaluate(() => {
            // Remove or hide the search bar or any other element
            const displayNoneInPdf = document.querySelectorAll('#header span, #container-search-h7vc6omi2hr2880, .collapse-all-defs-button'); // Adjust the selector as needed
            if (displayNoneInPdf) {
            displayNoneInPdf.forEach((element) => {
                element.remove();
                // or
                // element.style.display = 'none';
            });
            }

            // Set terms and defs backgrounds to white to save ink when printing
            const termsAndDefs = document.querySelectorAll('dt,dd');
            termsAndDefs.forEach((element) => {
            element.style.backgroundColor = 'white';
            });
        });

        // Generate the PDF
        await page.pdf({
            path: path.resolve(process.cwd(), 'docs/index.pdf'), // Output file path
            format: 'A4', // Paper format
            printBackground: true, // Print background graphics
            displayHeaderFooter: false, // Do not display header and footer
            preferCSSPageSize: true // Use CSS-defined page size
        });

        // Close the browser instance
        await browser.close();

        console.log('\n   SPEC-UP-T: PDF generated successfully! Find the PDF in the same directory as the index.html file.' + "\n");
    } catch (error) {
        console.error('SPEC-UP-T: Error generating PDF:', error + "\n");
    }
})();