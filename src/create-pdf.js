const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const path = require('path');
const pdfLib = require('pdf-lib');

(async () => {
    try {
        // Launch a new browser instance
        // Production
        const browser = await puppeteer.launch();
        
        // Test
        // const browser = await puppeteer.launch({ headless: false, devtools: true }); // Open DevTools automatically
        
        const page = await browser.newPage();

        // Read and parse the specs.json file
        const config = fs.readJsonSync('specs.json');

        // Extract the output_path from the specs.json file
        const outputPath = config.specs[0].output_path;
        
        // Extract title and description from the config
        const title = config.specs[0].title || '';
        const description = config.specs[0].description || '';
        const logo = config.specs[0].logo || '';
        const logoLink = config.specs[0].logo_link || '#';

        // Define the path to the HTML file based on the directory where the script is called from
        const filePath = path.resolve(process.cwd(), outputPath, 'index.html');
        const fileUrl = `file://${filePath}`;

        // Navigate to the HTML file
        await page.goto(fileUrl, { waitUntil: 'networkidle2' });

        // Handle cross-reference terms that may be fetched from another domain
        const targetClass = '.fetched-xref-term';
        
        // Try to get the first element with the target class
        const targetElement = await page.$(targetClass);
        
        // If such an element exists, wait for its content to be fully loaded
        if (targetElement) {
            const targetText = await page.evaluate(el => el.innerText, targetElement);
            await page.waitForFunction(
                (targetClass, targetText) => {
                    const element = document.querySelector(targetClass);
                    return element && element.innerText !== targetText;
                },
                {}, // Additional options if needed
                targetClass,
                targetText
            );
        }

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

        // Inject logo, title and description at the top of the document
        await page.evaluate((logo, logoLink, title, description) => {
            // Create wrapper for the logo, title and description
            const titleWrapper = document.createElement('div');
            titleWrapper.style.textAlign = 'center';
            titleWrapper.style.marginBottom = '30px';
            titleWrapper.style.padding = '20px';
            titleWrapper.style.borderBottom = '1px solid #ccc';
            
            // Add the logo if it exists
            if (logo) {
                const logoContainer = document.createElement('a');
                logoContainer.href = logoLink || '#';
                logoContainer.style.display = 'block';
                logoContainer.style.marginBottom = '15px';
                
                const logoImg = document.createElement('img');
                logoImg.src = logo;
                logoImg.style.maxHeight = '80px';
                logoImg.style.maxWidth = '100%';
                logoImg.alt = title || 'Logo';
                
                logoContainer.appendChild(logoImg);
                titleWrapper.appendChild(logoContainer);
            }
            
            // Create and style the title element
            if (title) {
                const titleElement = document.createElement('h1');
                titleElement.textContent = title;
                titleElement.style.fontSize = '24px';
                titleElement.style.fontWeight = 'bold';
                titleElement.style.marginBottom = '10px';
                titleWrapper.appendChild(titleElement);
            }
            
            // Create and style the description element
            if (description) {
                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = description;
                descriptionElement.style.fontSize = '16px';
                descriptionElement.style.color = '#555';
                titleWrapper.appendChild(descriptionElement);
            }
            
            // Insert at the top of the body
            const body = document.body;
            body.insertBefore(titleWrapper, body.firstChild);
        }, logo, logoLink, title, description);

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

            const displayNoneInPdf = document.querySelectorAll('.exclude-in-print'); // Adjust the selector as needed
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

        console.log('✅ PDF generated successfully! Find the PDF in the same directory as the index.html file.');
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
    }
})();