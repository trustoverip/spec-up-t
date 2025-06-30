## Test File for Alias Functionality

This test verifies that:

1. `[[tref: vlei1, vlei-ecosystem-governance-framework, vEGF]]` creates an external reference using the original term "vlei-ecosystem-governance-framework" but displays "vEGF" as alias
2. `[[ref: vlei-ecosystem-governance-framework]]` scrolls to the same transcluded term
3. `[[ref: vEGF]]` also scrolls to the same transcluded term  
4. The heading always displays "vlei-ecosystem-governance-framework", not "vEGF"

Test cases:
- External reference with alias: [[tref: vlei1, vlei-ecosystem-governance-framework, vEGF]]
- Reference to original term: [[ref: vlei-ecosystem-governance-framework]]
- Reference to alias: [[ref: vEGF]]

All three should work correctly.
