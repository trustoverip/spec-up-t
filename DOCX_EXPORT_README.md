# DOCX Export Feature

## Overview

The `create-docx.js` script provides DOCX (Microsoft Word) export functionality for Spec-Up-T generated specifications. This feature complements the existing PDF export by offering an editable document format that stakeholders can modify and collaborate on.

## Why This File Should Stay

This file is essential for the following reasons:

1. **Format Diversity**: Provides an additional export format beyond HTML and PDF
2. **Editability**: DOCX files can be edited by stakeholders, enabling collaborative review and modification
3. **Standards Compliance**: Follows Microsoft Word document standards with proper metadata and structure
4. **Integration**: Seamlessly integrates with the existing Spec-Up-T workflow and menu system
5. **Accessibility**: Maintains document structure and accessibility features when converting from HTML

## Features

- **Structured Conversion**: Converts HTML headings, paragraphs, lists, and tables to proper DOCX elements
- **Metadata Support**: Includes document properties like title, author, description, and keywords
- **Table of Contents**: Automatically generates a navigable table of contents
- **Typography**: Preserves text formatting including bold, italic, and inline code
- **Accessibility**: Maintains semantic structure for screen readers and other assistive technologies

## Usage

### Command Line

```bash
npm run todocx
```

### Menu System

Access through the interactive menu:

```bash
npm run menu
```

Then select option `[3] Export to DOCX`

## Technical Implementation

The script uses the `docx` library to generate ISO-compliant Word documents with:

- Proper document structure and metadata
- Responsive table layouts
- Heading hierarchy preservation
- List formatting maintenance
- Table structure conversion

## Dependencies

- `docx`: ^8.5.0 - Core DOCX generation library
- `jsdom`: For HTML parsing and DOM manipulation
- `fs-extra`: File system operations

## Integration Points

The DOCX export feature integrates with:

- `config-scripts-keys.js`: Defines the npm script command
- `menu.sh`: Provides interactive menu access
- `package.json`: Includes the docx dependency

## Error Handling

The script includes comprehensive error handling for:

- Missing specs.json configuration
- Missing HTML source files
- DOCX generation failures
- File system operations

## Output

Generated DOCX files are saved to the `docs/` directory as `index.docx`, maintaining consistency with other export formats.
