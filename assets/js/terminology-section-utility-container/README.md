# Terminology Section Utility Container

Modular components for the terminology search and local/remote filter bar.

The bar is experimental: it is off by default and is enabled from the slide-in
settings menu under **Experimental → Terms search and filters**.

## Architecture

- **DOM Construction**: layout in `../terminology-section-utility-container.js`
- **Functionality**: behaviour modules in this directory

## Structure

```text
terminology-section-utility-container/
├── README.md                       # This documentation
├── hide-show-utility-container.js  # Removes the container when unused
├── create-term-filter.js           # Local/Remote filter functionality
└── search.js                       # Search functionality
```

## Main Module (`../terminology-section-utility-container.js`)

Coordinates:

1. The Experimental menu toggle (persisted in `localStorage`, default off)
2. DOM construction of the utility row
3. `attachTermFilterFunctionality(checkboxesContainer)`
4. `attachSearchFunctionality(searchInput, prevBtn, nextBtn, counter)`

Layout when enabled:

```text
25 terms    ☑ Local  ☑ Remote    [🔍 Search] [0 matches] [▲] [▼]
```

## Sub-Modules

### `create-term-filter.js`

- Checkbox change handling
- "At least one checked" enforcement
- HTML class toggling to hide/show local or remote terms

### `search.js`

- Debounced input handling
- Text highlighting and match navigation
- Keyboard navigation (arrow keys)

## Dependencies

- Bootstrap 5.3+ (styling classes)
- `specConfig` global object (optional `searchHighlightStyle`)

## Maintenance Notes

- Order in `asset-map.json` matters: functionality modules before the main module
- All modules use traditional function declarations for Gulp compatibility
- DOM elements are passed as parameters to avoid tight coupling
