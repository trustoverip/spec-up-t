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

                /* Override all fonts with system fonts */
                * {
                    font-family: Arial, Helvetica, sans-serif !important;
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
                logoImg.style.maxHeight = '80px';
                logoImg.alt = title || 'Logo';
                
                logoContainer.appendChild(logoImg);
                titleWrapper.appendChild(logoContainer);
            }
            
            // Create and style the title element
            if (title) {
                const titleElement = document.createElement('h1');
                titleElement.textContent = title;
                titleElement.className = 'display-4 mb-2';
                titleWrapper.appendChild(titleElement);
            }
            
            // Create and style the description element
            if (description) {
                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = description;
                descriptionElement.className = 'lead text-muted';
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

            // Set terms and defs backgrounds to white to save ink when printing
            const termsAndDefs = document.querySelectorAll('dt,dd');
            termsAndDefs.forEach((element) => {
                element.style.backgroundColor = 'white';
                element.style.border = 'none';
            });
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
                top: '15mm',
                bottom: '15mm',
                left: '15mm',
                right: '15mm',
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