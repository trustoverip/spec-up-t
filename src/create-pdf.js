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

        // Path to Bootstrap CSS file
        const bootstrapCssPath = path.resolve(process.cwd(), 'assets/css/bootstrap.min.css');
        
        // Check if Bootstrap CSS file exists
        const bootstrapExists = fs.existsSync(bootstrapCssPath);
        
        // Read Bootstrap CSS if it exists
        let bootstrapCss = '';
        if (bootstrapExists) {
            bootstrapCss = fs.readFileSync(bootstrapCssPath, 'utf8');
        }

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

        // Inject CSS to set padding, enforce system fonts, and apply Bootstrap print styles
        await page.evaluate((bootstrapCss) => {
            // Add Bootstrap CSS including its print media queries
            if (bootstrapCss) {
                const bootstrapStyle = document.createElement('style');
                bootstrapStyle.innerHTML = bootstrapCss;
                document.head.appendChild(bootstrapStyle);
            }
            
            const style = document.createElement('style');
            style.innerHTML = `
                @page {
                    margin-top: 15mm;
                    margin-bottom: 15mm;
                    margin-left: 15mm;
                    margin-right: 15mm;
                    border: none;
                }

                /* Override all fonts with system fonts and increase base font size */
                * {
                    font-family: Arial, Helvetica, sans-serif !important;
                }
                
                /* Set base font size to improve readability */
                body {
                    font-size: 14pt !important; /* Medium font size */
                    line-height: 1.5 !important;
                }
                
                /* Adjust heading sizes proportionally */
                h1 { font-size: 22pt !important; font-weight: bold !important; }
                h2 { font-size: 20pt !important; font-weight: bold !important; }
                h3 { font-size: 18pt !important; font-weight: bold !important; }
                h4 { font-size: 16pt !important; font-weight: bold !important; }
                h5 { font-size: 15pt !important; font-weight: bold !important; }
                h6 { font-size: 14pt !important; font-weight: bold !important; }
                
                /* Make pre and code blocks more readable */
                pre, code {
                    font-size: 13pt !important;
                    line-height: 1.4 !important;
                }
                
                /* Make table text more readable */
                table, th, td {
                    font-size: 13pt !important;
                }
                
                /* Additional print-specific styles */
                @media print {
                    a[href]:after {
                        content: none !important;
                    }
                    
                    .container {
                        width: auto;
                        max-width: 100%;
                    }
                    
                    /* Improve page breaks */
                    h1, h2, h3, h4, h5, h6 {
                        page-break-after: avoid;
                        margin-top: 1.2em !important;
                        margin-bottom: 0.6em !important;
                    }
                    
                    img {
                        page-break-inside: avoid;
                    }
                    
                    table {
                        page-break-inside: avoid;
                    }
                    
                    pre, blockquote {
                        page-break-inside: avoid;
                    }
                    
                    /* Add Bootstrap print classes explicitly */
                    .d-print-none {
                        display: none !important;
                    }
                    
                    .d-print-block {
                        display: block !important;
                    }
                    
                    .d-print-inline {
                        display: inline !important;
                    }
                    
                    .d-print-inline-block {
                        display: inline-block !important;
                    }
                    
                    .d-print-flex {
                        display: flex !important;
                    }
                    
                    .d-print-inline-flex {
                        display: inline-flex !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }, bootstrapCss);

        // Apply Bootstrap classes to elements in the page
        await page.evaluate(() => {
            // Add container class to body for better formatting
            document.body.classList.add('container-fluid', 'print');
            
            // Add Bootstrap classes to headings
            document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
                heading.classList.add('mt-4', 'mb-3');
            });
            
            // Add Bootstrap classes to tables
            document.querySelectorAll('table').forEach(table => {
                table.classList.add('table', 'table-bordered', 'mb-4');
            });
            
            // Add Bootstrap classes to code blocks
            document.querySelectorAll('pre').forEach(pre => {
                pre.classList.add('p-3', 'bg-light', 'border', 'rounded');
            });
        });

        // Inject logo, title and description at the top of the document
        await page.evaluate((logo, logoLink, title, description) => {
            // Create wrapper for the logo, title and description using Bootstrap classes
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'text-center mb-5 pb-4 border-bottom';
            
            // Add the logo if it exists
            if (logo) {
                const logoContainer = document.createElement('a');
                logoContainer.href = logoLink || '#';
                logoContainer.className = 'd-block mb-3';
                
                const logoImg = document.createElement('img');
                logoImg.src = logo;
                logoImg.className = 'img-fluid';
                logoImg.style.maxHeight = '90px'; // Moderate logo size
                logoImg.alt = title || 'Logo';
                
                logoContainer.appendChild(logoImg);
                titleWrapper.appendChild(logoContainer);
            }
            
            // Create and style the title element
            if (title) {
                const titleElement = document.createElement('h1');
                titleElement.textContent = title;
                titleElement.className = 'display-4 mb-2'; // Moderate title size
                titleElement.style.fontSize = '26pt'; // Explicitly set title font size
                titleWrapper.appendChild(titleElement);
            }
            
            // Create and style the description element
            if (description) {
                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = description;
                descriptionElement.className = 'lead';
                descriptionElement.style.fontSize = '16pt'; // Explicitly set description font size
                titleWrapper.appendChild(descriptionElement);
            }
            
            // Insert at the top of the body
            const body = document.body;
            body.insertBefore(titleWrapper, body.firstChild);
        }, logo, logoLink, title, description);

        // Remove or hide elements not needed for print
        await page.evaluate(() => {
            // Remove elements with display: none
            const hiddenElements = document.querySelectorAll('[style*="display: none"]');
            hiddenElements.forEach((element) => {
                element.remove();
            });

            // Remove elements that should be hidden in print
            document.querySelectorAll('.d-print-none').forEach(element => {
                element.remove();
            });

            // Remove all script elements
            const scriptElements = document.querySelectorAll('script');
            scriptElements.forEach((element) => {
                element.remove();
            });

            // Remove most style elements (keeping Bootstrap)
            const styleElements = document.querySelectorAll('style:not([data-bootstrap])');
            styleElements.forEach((element) => {
                element.remove();
            });

            // Improve styling for definition terms and descriptions
            const termsAndDefs = document.querySelectorAll('dt,dd');
            termsAndDefs.forEach((element) => {
                // Base styling for all terms and definitions
                element.style.backgroundColor = 'white';
                element.style.border = 'none';
                element.style.pageBreakInside = 'avoid'; // Avoid page breaks within terms/definitions
                
                if (element.tagName === 'DT') {
                    // Styling specifically for definition terms
                    element.style.fontWeight = 'bold';
                    element.style.marginTop = '1.3em';
                    element.style.paddingBottom = '0.4em';
                    element.style.borderBottom = '1px solid #e0e0e0';
                    element.style.fontSize = '16pt'; // Moderate font size for definition terms
                } else if (element.tagName === 'DD') {
                    // Styling specifically for definition descriptions
                    element.style.paddingLeft = '1.5em';
                    element.style.paddingTop = '0.6em';
                    element.style.paddingBottom = '0.8em';
                    element.style.marginBottom = '0.8em';
                    element.style.textAlign = 'justify';
                    element.style.fontSize = '14pt'; // Moderate font size for definition descriptions
                    
                    // Style tables inside definition descriptions
                    const tables = element.querySelectorAll('table');
                    tables.forEach(table => {
                        table.style.width = '100%';
                        table.style.marginTop = '0.6em';
                        table.style.marginBottom = '0.6em';
                        table.style.borderCollapse = 'collapse';
                        
                        // Style table cells
                        const cells = table.querySelectorAll('th, td');
                        cells.forEach(cell => {
                            cell.style.border = '1px solid #ddd';
                            cell.style.padding = '0.4em';
                            cell.style.fontSize = '13pt'; // Moderate font size for table cells
                        });
                    });
                }
            });
            
            // Ensure proper spacing between definition groups
            const dts = document.querySelectorAll('dt');
            dts.forEach((dt, index) => {
                if (index > 0) {
                    dt.style.marginTop = '2em'; // Add moderate space between definition groups
                }
            });
            
            // Set moderate font size for paragraphs and list items
            document.querySelectorAll('p, li').forEach(element => {
                element.style.fontSize = '14pt'; // Moderate size for paragraphs and lists
                element.style.margin = '0.4em 0';
                element.style.lineHeight = '1.5';
            });
            
            // Set moderate font size for code blocks and inline code
            document.querySelectorAll('pre code, code').forEach(element => {
                element.style.fontSize = '13pt'; // Moderate size for code blocks
            });
        });

        // Add hierarchical section numbering for PDF output only
        await page.evaluate(() => {
            const style = document.createElement('style');
            style.innerHTML = `
                @media print {
                    /* Base styles for all numbered elements */
                    article#content h1, 
                    article#content h2, 
                    article#content h3, 
                    article#content h4, 
                    article#content h5, 
                    article#content h6, 
                    article#content dt {
                        position: relative;
                        padding-left: 2.8em; /* Moderate padding for better readability */
                        text-indent: 0;
                    }
                    
                    /* Number styling for all heading levels */
                    article#content h1::before, 
                    article#content h2::before, 
                    article#content h3::before, 
                    article#content h4::before, 
                    article#content h5::before, 
                    article#content h6::before, 
                    article#content dt::before {
                        position: absolute;
                        left: 0;
                        font-weight: bold;
                        color: #333;
                        font-size: 100%; /* Match the font size of the respective heading */
                    }

                    /* Counter setup for the root element */
                    article#content {
                        counter-reset: h1;
                    }

                    /* Level 1 headings */
                    article#content h1 {
                        counter-increment: h1;
                        counter-reset: h2;
                        padding-left: 1.9em; /* Specific padding for h1 */
                    }
                    
                    article#content h1::before {
                        content: counter(h1) ".";
                    }

                    /* Level 2 headings */
                    article#content h2 {
                        counter-increment: h2;
                        counter-reset: h3;
                        padding-left: 2.6em; /* Specific padding for h2 */
                    }
                    
                    article#content h2::before {
                        content: counter(h1) "." counter(h2) ".";
                    }

                    /* Level 3 headings */
                    article#content h3 {
                        counter-increment: h3;
                        counter-reset: h4;
                        padding-left: 3.3em; /* Specific padding for h3 */
                    }
                    
                    article#content h3::before {
                        content: counter(h1) "." counter(h2) "." counter(h3) ".";
                    }

                    /* Level 4 headings */
                    article#content h4 {
                        counter-increment: h4;
                        counter-reset: h5;
                        padding-left: 4em; /* Specific padding for h4 */
                    }
                    
                    article#content h4::before {
                        content: counter(h1) "." counter(h2) "." counter(h3) "." counter(h4) ".";
                    }

                    /* Level 5 headings */
                    article#content h5 {
                        counter-increment: h5;
                        counter-reset: h6;
                        padding-left: 4.7em; /* Specific padding for h5 */
                    }
                    
                    article#content h5::before {
                        content: counter(h1) "." counter(h2) "." counter(h3) "." counter(h4) "." counter(h5) ".";
                    }

                    /* Level 6 headings */
                    article#content h6 {
                        counter-increment: h6;
                        padding-left: 5.4em; /* Specific padding for h6 */
                    }
                    
                    article#content h6::before {
                        content: counter(h1) "." counter(h2) "." counter(h3) "." counter(h4) "." counter(h5) "." counter(h6) ".";
                    }

                    /* Definition terms - treat as level 3 since they appear under level 2 headings */
                    article#content dt {
                        counter-increment: h3;
                        padding-left: 3.3em; /* Match h3 padding */
                    }
                    
                    article#content dt::before {
                        content: counter(h1) "." counter(h2) "." counter(h3) ".";
                        position: absolute;
                        left: 0;
                        /* Improve vertical alignment with the text */
                        top: 50%;
                        transform: translateY(-50%);
                        line-height: normal;
                    }
                    
                    /* Add spacing after the numbers */
                    article#content h1::before, 
                    article#content h2::before, 
                    article#content h3::before, 
                    article#content h4::before, 
                    article#content h5::before, 
                    article#content h6::before, 
                    article#content dt::before {
                        margin-right: 0.4em;
                    }
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
            printBackground: true, // Enable background graphics for Bootstrap styling
            quality: 100, // Maximum quality for images
            margin: {
                top: '18mm', // Moderate margins for better readability
                bottom: '18mm',
                left: '18mm',
                right: '18mm',
            }
        });

        await browser.close();

        // Load the PDF with pdf-lib to remove metadata and optimize fonts
        const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);
        pdfDoc.setTitle(title);
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');

        // Save the optimized PDF
        const optimizedPdfBytes = await pdfDoc.save();
        fs.writeFileSync('docs/index.pdf', optimizedPdfBytes);

        console.log('✅ PDF generated successfully! Find the PDF in the docs directory.');
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
    }
})();