# Terminology Section Utility Container

This directory contains the modular components for the terminology section utility container functionality.

## Structure

```text
terminology-section-utility-container/
├── create-alphabet-index.js      # Creates alphabet navigation and basic container structure
├── create-term-filter.js         # Creates Local/Remote filter checkboxes
├── search.js                     # Implements in-page search functionality
└── hide-show-utility-container.js # Hides container when no terms exist
```

## Main Module

The main coordination module is located at `../terminology-section-utility-container.js` and orchestrates all components in the correct order:

1. **Container Structure**: Creates the two-row Bootstrap layout
2. **Alphabet Index**: Adds alphabet navigation to Row 1
3. **Term Filters**: Adds Local/Remote checkboxes to Row 2
4. **Search**: Adds search functionality to Row 2

## Dependencies

All modules depend on:

- Bootstrap 5.3+ (for styling classes)
- `specConfig` global object (for search styling configuration)

## Usage

The modules are automatically loaded and initialized via the asset compilation process. The main module coordinates everything when the DOM is ready.

## Layout

**Row 1 (Alphabet):**

```text
[A] [B] [C] [D] [E] [F] [G] [H] [I] [J] [K] [L] [M] [N] [O] [P] [Q] [R] [S] [T] [U] [V] [W] [X] [Y] [Z]
```

**Row 2 (Controls):**

```text
25 terms    ☑ Local  ☑ Remote    [🔍 Search] [0 matches] [▲] [▼]
```

## Maintenance Notes

- Functions are globally available after compilation due to Gulp concatenation
- Order in `asset-map.json` matters: sub-modules must be loaded before the main module
- All modules use traditional function declarations (not ES6 modules) for Gulp compatibility
- Bootstrap classes are used extensively to minimize custom CSS
