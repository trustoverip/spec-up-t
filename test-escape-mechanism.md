# Escape Mechanism Test Document

This document tests the escape mechanism for substitution tags.

## Normal Tags (should be processed)

Here are some normal tags that should be processed:

- [[def: authentication, auth]] - This should create a definition
- [[xref: external-spec, term-name]] - This should create a cross-reference
- [[tref: external-spec, transcluded-term]] - This should create a transcluded reference

## Escaped Tags (should be displayed literally)

Here are some escaped tags that should be displayed literally:

- \[[def: authentication, auth]] - This should show literal tag syntax
- \[[xref: external-spec, term-name]] - This should show literal xref syntax  
- \[[tref: external-spec, transcluded-term]] - This should show literal tref syntax

## Double Escaped Tags (should show backslash + literal)

Here are double escaped tags:

- \\[[def: authentication]] - This should show: \[[def: authentication]]
- \\[[xref: spec, term]] - This should show: \[[xref: spec, term]]

## Mixed Content

Here we mix normal and escaped tags:

Normal [[def: mixed-term]] and escaped \[[def: literal-example]] in same paragraph.

## Complex Example

Instructions for users:

To create a definition, use the syntax \[[def: term-name, synonym1, synonym2]].

To reference an external term, use \[[xref: spec-name, term-name]].

But this [[def: working-example]] should actually work as a definition.
