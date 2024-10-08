const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const path = require('path');
const pdfLib = require('pdf-lib');

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

        // Inject CSS to set padding and enforce system fonts
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

                /* Override all fonts with system fonts */
                * {
                    font-family: Arial, Helvetica, sans-serif !important;
                }
            `;
            document.head.appendChild(style);
        });

        // Remove or hide the search bar or any other element
        await page.evaluate(() => {
            // Remove elements with display: none
            const hiddenElements = document.querySelectorAll('[style*="display: none"]');
            hiddenElements.forEach((element) => {
                element.remove();
            });

            // Remove all script elements
            const scriptElements = document.querySelectorAll('script');
            scriptElements.forEach((element) => {
                element.remove();
            });

            // Remove all style elements
            const styleElements = document.querySelectorAll('style');
            styleElements.forEach((element) => {
                element.remove();
            });

            // // Remove images
            // const images = document.querySelectorAll('img');
            // images.forEach((img) => {
            //     img.remove();
            // });

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

            // Inject CSS Reset and Basic Styling
            const style = document.createElement('style');
            style.innerHTML = `
                /* CSS Reset */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                html, body {
                    height: 100%;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 14px;
                    line-height: 1.6;
                    color: #333;
                    background-color: #fff;
                }

                /* Basic Styling */
                body {
                    padding: 15mm;
                }
                h1, h2, h3, h4, h5, h6 {
                    margin-bottom: 10px;
                }
                p {
                    margin-bottom: 15px;
                }
                ul, ol {
                    margin-left: 20px;
                    margin-bottom: 15px;
                }
                a {
                    color: #007BFF;
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                table, th, td {
                    border: 1px solid #ddd;
                }
                th, td {
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
            `;
            document.head.appendChild(style);
        });


        // Generate the PDF with optimized settings
        const pdfBuffer = await page.pdf({
            path: path.resolve(process.cwd(), 'docs/index.pdf'), // Output file path
            format: 'A4', // Paper format
            displayHeaderFooter: false, // Do not display header and footer
            preferCSSPageSize: true, // Use CSS-defined page size
            printBackground: false, // Disable background graphics
            quality: 1, // Adjust the quality of images (0-100)
            compressionLevel: 10 // Maximum compression
        });

        await browser.close();

        // Load the PDF with pdf-lib to remove metadata and optimize fonts
        const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        // Save the optimized PDF
        const optimizedPdfBytes = await pdfDoc.save();
        fs.writeFileSync('docs/index.pdf', optimizedPdfBytes);

        console.log('\n   SPEC-UP-T: PDF generated successfully! Find the PDF in the same directory as the index.html file.' + "\n");
    } catch (error) {
        console.error('SPEC-UP-T: Error generating PDF:', error + "\n");
    }
})();