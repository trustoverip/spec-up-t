const fs = require('fs-extra');
const puppeteer = require('puppeteer');
const path = require('path');
const pdfLib = require('pdf-lib');
const Logger = require('./utils/logger');



/**
 * Creates ISO-compliant PDF metadata
 */
function createISOMetadata(config) {
    const now = new Date();
    return {
        title: config.specs[0].title || 'Untitled Document',
        author: config.specs[0].author || '',
        subject: config.specs[0].description || '',
        keywords: config.specs[0].keywords || [],
        creator: 'Spec-Up PDF Generator',
        producer: 'Spec-Up with ISO Compliance',
        creationDate: now,
        modificationDate: now
    };
}

/**
 * Configures Puppeteer page for ISO compliance
 */
async function configurePageForISO(page) {
    // emulateMediaType ensures @media print rules from the page's own CSS apply.
    await page.emulateMediaType('print');
}

/**
 * Applies accessibility tags for PDF/UA compliance
 */
async function applyAccessibilityTags(page) {
    await page.evaluate(() => {
        // Add semantic structure for accessibility
        const main = document.querySelector('main') || document.body;
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }

        // Tag headings for proper structure
        document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(heading => {
            if (!heading.getAttribute('role')) {
                heading.setAttribute('role', 'heading');
                heading.setAttribute('aria-level', heading.tagName.charAt(1));
            }
        });

        // Tag navigation elements
        const toc = document.getElementById('toc') || document.getElementById('pdf-toc');
        if (toc && !toc.getAttribute('role')) {
            toc.setAttribute('role', 'navigation');
            toc.setAttribute('aria-label', 'Table of Contents');
        }

        // Tag tables for accessibility
        document.querySelectorAll('table').forEach(table => {
            if (!table.getAttribute('role')) {
                table.setAttribute('role', 'table');
            }
        });

        // Add alt text to images if missing
        document.querySelectorAll('img').forEach(img => {
            if (!img.getAttribute('alt')) {
                img.setAttribute('alt', img.getAttribute('title') || 'Image');
            }
        });
    });
}

/**
 * Creates table of contents for PDF
 */
async function createTOCIfNeeded(page, logo, logoLink, title, description) {
    await page.evaluate((logo, logoLink, title, description) => {
        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'text-center mb-5 pb-4 border-bottom pdf-cover';

        if (logo) {
            const logoContainer = document.createElement('a');
            logoContainer.href = logoLink;
            logoContainer.className = 'd-block mb-3 pdf-logo-container';
            const logoImg = document.createElement('img');
            logoImg.src = logo;
            logoImg.className = 'img-fluid pdf-logo';
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
            descriptionElement.className = 'lead mb-0 pdf-description';
            titleWrapper.appendChild(descriptionElement);
        }

        document.body.insertBefore(titleWrapper, document.body.firstChild);

        // Create a Table of Contents if it doesn't exist
        if (!document.getElementById('toc')) {
            // Generate a TOC based on the headings in the document
            const headings = Array.from(document.querySelectorAll('h1:not(.pdf-title), h2, h3, h4, h5, h6')).filter(h => {
                // Only include headings with IDs that can be linked to
                return h.id && h.id.trim() !== '';
            });

            if (headings.length > 0) {
                // Create TOC container
                const tocContainer = document.createElement('div');
                tocContainer.id = 'toc';
                tocContainer.className = 'toc-container pdf-toc';

                // Create TOC heading
                const tocHeading = document.createElement('h2');
                tocHeading.textContent = 'Contents';
                tocHeading.className = 'toc-heading pdf-toc-heading';
                tocContainer.appendChild(tocHeading);

                // Create TOC list
                const tocList = document.createElement('ul');
                tocList.className = 'toc-list pdf-toc-list';
                tocContainer.appendChild(tocList);

                // Add all headings to the TOC
                let currentLevel = 0;
                let currentList = tocList;
                let listStack = [tocList];

                headings.forEach(heading => {
                    // Get heading level (1-6 for h1-h6)
                    const level = parseInt(heading.tagName[1]);

                    // Navigate to the correct nesting level
                    if (level > currentLevel) {
                        // Go deeper - create a new nested list
                        for (let i = currentLevel; i < level; i++) {
                            if (currentList.lastChild) {
                                const nestedList = document.createElement('ul');
                                currentList.lastChild.appendChild(nestedList);
                                listStack.push(nestedList);
                                currentList = nestedList;
                            } else {
                                // If no items exist yet, add a dummy item
                                const dummyItem = document.createElement('li');
                                const nestedList = document.createElement('ul');
                                dummyItem.appendChild(nestedList);
                                currentList.appendChild(dummyItem);
                                listStack.push(nestedList);
                                currentList = nestedList;
                            }
                        }
                    } else if (level < currentLevel) {
                        // Go up - pop from the stack
                        for (let i = currentLevel; i > level; i--) {
                            listStack.pop();
                        }
                        currentList = listStack[listStack.length - 1];
                    }

                    currentLevel = level;

                    // Create list item with link
                    const listItem = document.createElement('li');
                    const link = document.createElement('a');
                    link.href = '#' + heading.id;
                    link.textContent = heading.textContent;
                    listItem.appendChild(link);
                    currentList.appendChild(listItem);
                });

                // Insert the TOC after the title section
                document.body.insertBefore(tocContainer, titleWrapper.nextSibling);

                console.log('Generated a Table of Contents with ' + headings.length + ' entries.');
            }
        }
    }, logo, logoLink, title, description);
}

(async () => {
    try {
        // Launch a new browser instance with ISO-compliant settings
        const browser = await puppeteer.launch({
            args: ['--disable-web-security', '--allow-running-insecure-content']
        });
        const page = await browser.newPage();

        // Configure page for ISO compliance
        await configurePageForISO(page);

        // Read and parse the specs.json file
        const config = fs.readJsonSync('specs.json');
        const metadata = createISOMetadata(config);

        // Extract configuration details
        const outputPath = config.specs[0].output_path;
        const title = config.specs[0].title || '';
        const description = config.specs[0].description || '';
        const logo = config.specs[0].logo || '';
        const logoLink = config.specs[0].logo_link || '#';

        // Define the HTML file path
        const filePath = path.resolve(process.cwd(), outputPath, 'index.html');
        const fileUrl = `file://${filePath}`;

        // Package-level CSS — these ship with spec-up-t and must be resolved
        // relative to this script, not relative to process.cwd().
        const pkgRoot = path.resolve(__dirname, '..');
        const bootstrapCssPath = path.join(pkgRoot, 'assets', 'css', 'embedded-libraries', 'bootstrap.min.css');
        const bootstrapCss = fs.existsSync(bootstrapCssPath) ? fs.readFileSync(bootstrapCssPath, 'utf8') : '';

        const pdfStylesPath = path.join(pkgRoot, 'assets', 'css', 'create-pdf.css');
        const pdfStylesCss = fs.existsSync(pdfStylesPath) ? fs.readFileSync(pdfStylesPath, 'utf8') : '';

        // Project-level custom CSS — lives in the consuming project and is never
        // overwritten by spec-up-t updates. Loaded last so overrides win.
        const customCssPath = path.resolve(process.cwd(), 'assets', 'custom.css');
        const customCss = fs.existsSync(customCssPath) ? fs.readFileSync(customCssPath, 'utf8') : '';

        // Navigate to the HTML file
        await page.goto(fileUrl, { waitUntil: 'networkidle2' });

        // Apply accessibility tags for PDF/UA compliance
        await applyAccessibilityTags(page);

        // Clean up unnecessary elements but be careful not to remove styles we need
        await page.evaluate(() => {
            // Preserve TOC if it exists (skip removing it even if it has display:none)
            document.querySelectorAll('[style*="display: none"]:not(#toc):not(#toc *), .d-print-none:not(#toc):not(#toc *), script').forEach(element => element.remove());
            // Don't remove all style elements as some might be important

            // If TOC doesn't exist, we'll need to create one
            if (!document.getElementById('toc')) {
                console.log('No TOC found in the document. Will create one.');
            }
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

        // Inject Bootstrap CSS and PDF styles CSS
        await page.evaluate((bootstrapCss, pdfStylesCss, customCss) => {
            // Add bootstrap if it exists
            if (bootstrapCss) {
                const bootstrapStyle = document.createElement('style');
                bootstrapStyle.textContent = bootstrapCss;
                bootstrapStyle.setAttribute('data-bootstrap', 'true');
                document.head.appendChild(bootstrapStyle);
            }

            // Add PDF styles CSS - all styling is defined here
            if (pdfStylesCss) {
                const style = document.createElement('style');
                style.id = 'pdf-styles';
                style.textContent = pdfStylesCss;
                document.head.appendChild(style);
            }

            // Inject custom.css last so project overrides win over everything else
            if (customCss) {
                const customStyle = document.createElement('style');
                customStyle.id = 'custom-css';
                customStyle.textContent = customCss;
                document.head.appendChild(customStyle);
            }

            // Add print-specific class
            document.body.classList.add('pdf-document', 'print');
        }, bootstrapCss, pdfStylesCss, customCss);

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

        // Inject logo, title, and description AND handle TOC creation if needed
        await createTOCIfNeeded(page, logo, logoLink, title, description);

        // Remove the .collapsed class from definition meta-info wrappers so CSS can show them.
        // All visual properties (display, overflow, background, borders) are handled by create-pdf.css.
        await page.evaluate(() => {
            document.querySelectorAll('dl.terms-and-definitions-list dd.meta-info-content-wrapper').forEach(content => {
                content.classList.remove('collapsed');
            });

            // Rebuild the original #toc as a print-optimised #pdf-toc with dotted leaders and page numbers.
            const toc = document.getElementById('toc');
            if (toc) {
                // Keep the original hidden so the new one is the only TOC rendered.
                toc.style.display = 'none';

                const pdfToc = document.createElement('div');
                pdfToc.id = 'pdf-toc';

                // Class excluded by the body h2 rule so it doesn't inherit section-heading styles.
                const tocHeading = document.createElement('h2');
                tocHeading.className = 'pdf-toc-heading';
                tocHeading.textContent = 'Contents';
                pdfToc.appendChild(tocHeading);

                const tocList = document.createElement('ul');
                pdfToc.appendChild(tocList);

                // Mirror the link structure from the original TOC.
                toc.querySelectorAll('a').forEach(link => {
                    const href = link.getAttribute('href');
                    const targetId = href.substring(1);

                    const li = document.createElement('li');

                    const rowDiv = document.createElement('div');
                    rowDiv.className = 'toc-row';

                    const title = document.createElement('a');
                    title.href = href;
                    title.textContent = link.textContent;
                    title.className = 'toc-title';
                    title.setAttribute('data-target-id', targetId);

                    const leader = document.createElement('div');
                    leader.className = 'toc-leader';

                    // Page number is populated later by the tooltip-extraction step.
                    const pageNumber = document.createElement('span');
                    pageNumber.className = 'toc-page-number';
                    pageNumber.setAttribute('data-for-id', targetId);

                    rowDiv.appendChild(title);
                    rowDiv.appendChild(leader);
                    li.appendChild(rowDiv);
                    li.appendChild(pageNumber);

                    // Mirror indentation from the nesting depth in the original TOC.
                    let level = 0;
                    let parent = link.closest('li');
                    while (parent) {
                        const parentList = parent.closest('ul');
                        if (parentList && parentList !== toc) {
                            level++;
                            parent = parentList.closest('li');
                        } else {
                            break;
                        }
                    }
                    if (level > 0) {
                        li.style.paddingLeft = (level * 15) + 'px';
                    }

                    tocList.appendChild(li);
                });

                // Insert the rebuilt TOC immediately after the cover page.
                const titleWrapper = document.querySelector('.text-center.mb-5.pb-4.border-bottom');
                if (titleWrapper && titleWrapper.nextSibling) {
                    document.body.insertBefore(pdfToc, titleWrapper.nextSibling);
                } else {
                    document.body.insertBefore(pdfToc, document.body.firstChild);
                }
            }
        });

        Logger.process('Generating PDF with proper TOC page numbers...');

        // Extract page numbers from the tooltip attributes that spec-up-t renders on TOC links,
        // then populate the .toc-page-number spans in #pdf-toc before the final render.
        await page.evaluate(() => {
            // Find the PDF TOC 
            const pdfToc = document.getElementById('pdf-toc');
            if (!pdfToc) return;

            const tocEntries = pdfToc.querySelectorAll('.toc-page-number');
            const originalToc = document.getElementById('toc');

            if (originalToc) {
                // Get all links from the original TOC that have tooltip data
                const originalLinks = originalToc.querySelectorAll('a[title], a[data-bs-title]');

                // Create a mapping from heading IDs to page numbers based on tooltips
                const idToPageMap = {};

                originalLinks.forEach(link => {
                    // Extract the heading ID from href
                    const href = link.getAttribute('href');
                    if (!href || !href.startsWith('#')) return;

                    const headingId = href.substring(1);

                    // Extract page number from tooltip text (e.g., "Go to page 5")
                    const tooltipText = link.getAttribute('title') || link.getAttribute('data-bs-title');
                    if (!tooltipText) return;

                    const pageNumberMatch = tooltipText.match(/Go to page (\d+)/i);
                    if (pageNumberMatch && pageNumberMatch[1]) {
                        const pageNumber = parseInt(pageNumberMatch[1], 10);
                        if (!isNaN(pageNumber)) {
                            idToPageMap[headingId] = pageNumber;
                        }
                    }
                });

                // Now update the TOC page numbers using the extracted values
                tocEntries.forEach(entry => {
                    const targetId = entry.getAttribute('data-for-id');
                    if (targetId && idToPageMap[targetId]) {
                        entry.textContent = idToPageMap[targetId];
                    }
                });
            } else {
                // Fallback to old estimation method if original TOC is not available
                console.log('Original TOC not found, using page number estimation method');

                // Find all headings with IDs (potential TOC targets)
                const headingsWithIds = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(h => h.id);

                // Use real offsets for more accurate page numbers
                const idToPosition = {};

                headingsWithIds.forEach(heading => {
                    const rect = heading.getBoundingClientRect();
                    idToPosition[heading.id] = {
                        top: rect.top + window.scrollY,
                        id: heading.id
                    };
                });

                // Sort by vertical position
                const sortedPositions = Object.values(idToPosition).sort((a, b) => a.top - b.top);

                // A4 page height (mm to pixels at 96 DPI)
                const pageHeight = 297 * 96 / 25.4;
                const effectivePageHeight = pageHeight - 20; // Account for margins

                // Start on page 3 (after title and TOC)
                let currentPage = 3;
                let currentOffset = 0;

                // Calculate page numbers based on relative positions
                sortedPositions.forEach(pos => {
                    while (pos.top > currentOffset + effectivePageHeight) {
                        currentPage++;
                        currentOffset += effectivePageHeight;
                    }

                    idToPosition[pos.id].page = currentPage;
                });

                // Update TOC entries with calculated page numbers
                tocEntries.forEach(entry => {
                    const targetId = entry.getAttribute('data-for-id');
                    if (targetId && idToPosition[targetId] && idToPosition[targetId].page) {
                        entry.textContent = idToPosition[targetId].page;
                    }
                });
            }
        });

        // Final PDF generation with correct page numbers
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

        Logger.success('PDF generated by Puppeteer. Processing with pdf-lib for ISO compliance...');

        // Optimize PDF with pdf-lib for ISO compliance
        try {
            const pdfDoc = await pdfLib.PDFDocument.load(pdfBuffer);

            // Set ISO-compliant metadata (this is safer than XMP embedding)
            pdfDoc.setTitle(metadata.title);
            pdfDoc.setAuthor(metadata.author);
            pdfDoc.setSubject(metadata.subject);
            pdfDoc.setKeywords(metadata.keywords);
            pdfDoc.setProducer(metadata.producer);
            pdfDoc.setCreator(metadata.creator);
            pdfDoc.setCreationDate(metadata.creationDate);
            pdfDoc.setModificationDate(metadata.modificationDate);

            Logger.success('ISO metadata applied successfully.');

            // Save with conservative settings to ensure compatibility
            const optimizedPdfBytes = await pdfDoc.save({
                useObjectStreams: false, // Required for PDF/A compliance
                addDefaultPage: false
            });

            fs.writeFileSync('docs/index.pdf', optimizedPdfBytes);
            Logger.success('PDF saved with ISO compliance features.');
        } catch (pdfError) {
            Logger.warn('Could not apply ISO metadata, saving original PDF: %s', pdfError.message);
            // Fallback: save the original PDF if post-processing fails
            fs.writeFileSync('docs/index.pdf', pdfBuffer);
        }

        Logger.success('PDF generated successfully! Find the PDF in the docs directory.');
    } catch (error) {
        Logger.error('Error generating PDF', {
            context: 'Failed during PDF document generation',
            hint: 'Ensure the HTML file exists (run "npm run render" first), Puppeteer is installed, and you have write permissions',
            details: error.message || error
        });
    }
})();
