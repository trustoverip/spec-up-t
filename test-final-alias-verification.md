# Final Test: Alias Support Verification

## Terms and definitions intro

This test verifies the complete alias functionality:

1. **External reference with alias**: [[tref: vlei-glossary, vlei-ecosystem-governance-framework, vegf]]
2. **Reference to original term**: [[ref: vlei-ecosystem-governance-framework]]  
3. **Reference to alias**: [[ref: vegf]]

Expected behavior after the fix:

- The tref creates external reference using "vlei-ecosystem-governance-framework" for lookup
- The heading displays "vlei-ecosystem-governance-framework" (not "vegf")
- Both ref links scroll to the same transcluded term
- External content insertion works correctly because anchor points to main term ID

This should now work correctly with the fixed `addAnchorsToTerms.js`.
