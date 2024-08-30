const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    // Launch a new browser instance
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Define the path to the HTML file based on the directory where the script is called from
    const filePath = path.resolve(process.cwd(), 'docs/index.html');
    const fileUrl = `file://${filePath}`;

    // Navigate to the HTML file
    await page.goto(fileUrl, { waitUntil: 'networkidle2' });

    // Remove or hide the search bar or any other element
    await page.evaluate(() => {
        const displayNoneInPdf = document.querySelectorAll('#header span, #container-search-h7vc6omi2hr2880'); // Adjust the selector as needed
        if (displayNoneInPdf) {
            displayNoneInPdf.forEach((element) => {
                element.remove();
                // or
                // element.style.display = 'none';
            });
        }
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
})();