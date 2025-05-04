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
        const pdfStylesPath = path.resolve(process.cwd(), 'assets/css/pdf-styles.css');
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
            margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' }
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