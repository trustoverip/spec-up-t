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
        const filePath = path.resolve(process.cwd(), outputPath, 'index.html');
        const fileUrl = `file://${filePath}`;

        // Navigate to the HTML file
        await page.goto(fileUrl, { waitUntil: 'networkidle2' });

        // Inject CSS to set padding
        await page.evaluate(() => {
            const style = document.createElement('style');
            style.innerHTML = `
                @page {
                    margin-top: 15mm;
                    margin-bottom: 15mm;
                    margin-left: 15mm;
                    margin-right: 15mm;
                    border: none;
                }
            `;
            document.head.appendChild(style);
        });

        // Remove or hide the search bar or any other element
        await page.evaluate(() => {
            const displayNoneInPdf = document.querySelectorAll('#header span, #container-search-h7vc6omi2hr2880, .btn'); // Adjust the selector as needed
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
                element.style.border = 'none';
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