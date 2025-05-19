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

        // Extract configuration details
        const outputPath = config.specs[0].output_path;
        const title = config.specs[0].title || '';
        const description = config.specs[0].description || '';
        const logo = config.specs[0].logo || '';
        const logoLink = config.specs[0].logo_link || '#';

        // Define the HTML file path
        const filePath = path.resolve(process.cwd(), outputPath, 'index.html');
        const fileUrl = `file://${filePath}`;

        // Path to Bootstrap CSS
        const bootstrapCssPath = path.resolve(process.cwd(), 'assets/css/bootstrap.min.css');
        const bootstrapExists = fs.existsSync(bootstrapCssPath);
        let bootstrapCss = bootstrapExists ? fs.readFileSync(bootstrapCssPath, 'utf8') : '';

        // Path to PDF styles CSS
        const pdfStylesPath = path.resolve(process.cwd(), 'assets/css/create-pdf.css');
        const pdfStylesExist = fs.existsSync(pdfStylesPath);
        const pdfStylesCss = pdfStylesExist ? fs.readFileSync(pdfStylesPath, 'utf8') : '';

        // Navigate to the HTML file
        await page.goto(fileUrl, { waitUntil: 'networkidle2' });

        // Clean up unnecessary elements but be careful not to remove styles we need
        await page.evaluate(() => {
            document.querySelectorAll('[style*="display: none"], .d-print-none, script').forEach(element => element.remove());
            // Don't remove all style elements as some might be important
        });

        // Handle dynamically fetched cross-reference terms
        const targetClass = '.fetched-xref-term';
        const targetElement = await page.$(targetClass);
        if (targetElement) {
            const targetText = await page.evaluate(el => el.innerText, targetElement);
            await page.waitForFunction(
                (targetClass, targetText) => {
                    const element = document.querySelector(targetClass);
                    return element && element.innerText !== targetText;
                },
                {},
                targetClass,
                targetText
            );
        }

        // Force larger width on page content BEFORE injecting styles
        await page.evaluate(() => {
            // Select main content containers and expand them
            const containers = document.querySelectorAll('.container, main, section, article, .content');
            containers.forEach(container => {
                container.style.maxWidth = '95%';
                container.style.width = '95%';
                container.style.margin = '0 auto';
                container.style.padding = '0';
            });
            
            // Override any Bootstrap column constraints
            const columns = document.querySelectorAll('[class*="col-"]');
            columns.forEach(col => {
                col.style.maxWidth = '100%';
                col.style.width = '100%';
                col.style.paddingLeft = '0';
                col.style.paddingRight = '0';
            });
            
            // Ensure body takes full width
            document.body.style.maxWidth = '100%';
            document.body.style.width = '100%';
            document.body.style.padding = '0';
            document.body.style.margin = '0';
        });

        // Inject Bootstrap CSS and PDF styles CSS - No inline styling
        await page.evaluate((bootstrapCss, pdfStylesCss) => {
            // Add bootstrap if it exists
            if (bootstrapCss) {
                const bootstrapStyle = document.createElement('style');
                bootstrapStyle.innerHTML = bootstrapCss;
                bootstrapStyle.setAttribute('data-bootstrap', 'true');
                document.head.appendChild(bootstrapStyle);
            }

            // Add PDF styles CSS - all styling is defined here
            if (pdfStylesCss) {
                const style = document.createElement('style');
                style.id = 'pdf-styles';
                style.innerHTML = pdfStylesCss;
                document.head.appendChild(style);
            }

            // Add print-specific class
            document.body.classList.add('pdf-document', 'print');
        }, bootstrapCss, pdfStylesCss);

        // Add necessary Bootstrap classes to elements
        await page.evaluate(() => {
            // Add Bootstrap classes to tables
            document.querySelectorAll('table').forEach(table => {
                table.classList.add('table', 'table-bordered', 'table-striped', 'table-hover');
            });
            
            // Make sure meta-info is visible and toggle buttons are hidden
            document.querySelectorAll('.meta-info, .term-meta').forEach(meta => {
                meta.style.display = 'block';
            });
            
            document.querySelectorAll('.meta-toggle, button.meta-toggle').forEach(button => {
                button.style.display = 'none';
            });
        });

        // Inject logo, title, and description
        await page.evaluate((logo, logoLink, title, description) => {
            const titleWrapper = document.createElement('div');
            titleWrapper.className = 'text-center mb-5 pb-4 border-bottom';

            if (logo) {
                const logoContainer = document.createElement('a');
                logoContainer.href = logoLink;
                logoContainer.className = 'd-block mb-3';
                const logoImg = document.createElement('img');
                logoImg.src = logo;
                logoImg.className = 'img-fluid';
                logoContainer.appendChild(logoImg);
                titleWrapper.appendChild(logoContainer);
            }

            if (title) {
                const titleElement = document.createElement('h1');
                titleElement.textContent = title;
                titleElement.className = 'display-4 mb-2 pdf-title';
                titleWrapper.appendChild(titleElement);
            }

            if (description) {
                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = description;
                descriptionElement.className = 'lead mb-0';
                titleWrapper.appendChild(descriptionElement);
            }

            document.body.insertBefore(titleWrapper, document.body.firstChild);
        }, logo, logoLink, title, description);
        
        // Direct manipulation of definition lists to ensure proper styling in PDF
        await page.evaluate(() => {
            // Process all definition lists
            const definitionLists = document.querySelectorAll('dl.terms-and-definitions-list');
            definitionLists.forEach(list => {
                // Process all terms and definitions - target all dt and dd elements regardless of class
                const terms = list.querySelectorAll('dt, dd');
                terms.forEach(term => {
                    // Remove background and borders with !important to override any existing styles
                    term.setAttribute('style', term.getAttribute('style') + '; background: transparent !important; background-color: transparent !important; background-image: none !important; border: none !important; border-radius: 0 !important; padding: 0.5rem 0 !important;');
                });
                
                // Ensure all meta-info content is visible
                const metaInfoContents = list.querySelectorAll('dd.meta-info-content-wrapper');
                metaInfoContents.forEach(content => {
                    content.style.display = 'block';
                    content.style.maxHeight = 'none';
                    content.style.height = 'auto';
                    content.style.overflow = 'visible';
                    content.style.padding = '0.5rem 0';
                    content.style.margin = '0';
                    content.style.lineHeight = 'normal';
                    
                    // Remove the collapsed class if present
                    content.classList.remove('collapsed');
                });
                
                // Hide all meta-info toggle buttons
                const toggleButtons = list.querySelectorAll('.meta-info-toggle-button');
                toggleButtons.forEach(button => {
                    button.style.display = 'none';
                });
            });
            
            // Special handling for ALL transcluded terms with blue background - no class restrictions
            document.querySelectorAll('.transcluded-xref-term').forEach(el => {
                // Use the most aggressive approach possible to override the blue background
                el.setAttribute('style', el.getAttribute('style') + '; background: transparent !important; background-color: transparent !important; background-image: none !important;');
                
                // Also process any child elements to ensure complete removal of background
                Array.from(el.children).forEach(child => {
                    child.setAttribute('style', child.getAttribute('style') + '; background: transparent !important; background-color: transparent !important; background-image: none !important;');
                });
            });
            
            // Remove any inline styles that might be setting backgrounds
            document.querySelectorAll('style').forEach(styleTag => {
                let cssText = styleTag.textContent;
                // If the style tag contains transcluded-xref-term styles, modify them
                if (cssText.includes('transcluded-xref-term') && cssText.includes('background')) {
                    cssText = cssText.replace(/dt\.transcluded-xref-term[^}]+}/g, 
                                             'dt.transcluded-xref-term, dd.transcluded-xref-term { background: transparent !important; background-color: transparent !important; background-image: none !important; }');
                    styleTag.textContent = cssText;
                }
            });
        });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            path: path.resolve(process.cwd(), 'docs/index.pdf'),
            format: 'A4',
            displayHeaderFooter: true,
            footerTemplate: `
                <div style="width: 100%; text-align: center; font-size: 10pt; margin-top: 10mm;">
                    Page <span class="pageNumber"></span> of <span class="totalPages"></span>
                </div>
            `,
            headerTemplate: '<div></div>',
            preferCSSPageSize: true,
            printBackground: true,
            quality: 100,
            margin: { top: '10mm', bottom: '10mm', left: '3mm', right: '3mm' }
        });

        await browser.close();

        // Optimize PDF with pdf-lib
        const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);
        pdfDoc.setTitle(title);
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('');
        pdfDoc.setCreator('');
        const optimizedPdfBytes = await pdfDoc.save();
        fs.writeFileSync('docs/index.pdf', optimizedPdfBytes);

        console.log('✅ PDF generated successfully! Find the PDF in the docs directory.');
    } catch (error) {
        console.error('❌ Error generating PDF:', error);
    }
})();