# Escape Mechanism for Substitution Tags

## Problem Statement

The Spec-Up tool uses special substitution tags with the format `[[type: content]]` where type can be:
- `def` - definitions
- `xref` - cross-references  
- `tref` - term references
- `spec` - specifications

However, there's no way to display these tags literally in documentation (e.g., when writing instructions about how to use them).

## Proposed Solution

Implement a backslash escape mechanism following common markup conventions:

### Escape Patterns
- `\[[def: example]]` → renders as literal `[[def: example]]`
- `\\[[def: example]]` → renders as `\` followed by processed substitution
- `[[def: example]]` → processes normally (no change to existing behavior)

### Implementation Strategy

**Three-phase approach:**

1. **Pre-processing**: Convert escaped sequences to temporary placeholders
   - `\[[` → `__SPEC_UP_ESCAPED_TAG__`
   - `\\[[` → `\__SPEC_UP_ESCAPED_TAG__`

2. **Tag Processing**: Existing substitution logic runs normally (placeholders ignored)

3. **Post-processing**: Restore escaped sequences as literals
   - `__SPEC_UP_ESCAPED_TAG__` → `[[`

### Benefits
- Backward compatible - no changes to existing documents
- Simple to understand and use
- Follows established escape conventions
- Low cognitive complexity implementation

### Implementation Requirements
- Must pass SonarQube analysis
- Keep cognitive complexity below 15
- Minimize code additions where possible

## Next Steps
1. Locate substitution tag processing code
2. Implement three-phase escape handling
3. Add unit tests for escape scenarios
4. Update documentation with escape syntax
