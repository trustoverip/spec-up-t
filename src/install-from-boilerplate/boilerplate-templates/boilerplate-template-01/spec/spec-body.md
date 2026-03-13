## Specification Body

This section contains the main content of the specification. Add your technical details, requirements, and descriptions here.

### Blockquote

> To be, or not to be, that is the question:
Whether 'tis nobler in the mind to suffer
The slings and arrows of outrageous fortune,
Or to take arms against a sea of troubles
And by opposing end them. To die—to sleep,
No more;

### Notices

::: note Basic Note
  Check this out.
:::

::: warning Warning Notice
  Houston, I think we have a problem
:::

::: todo Really Important
  Get this done!
:::

::: example Code Example

```json
// Some comment in JSON
{
  "foo": "bar",
  "baz": 2
}
```

:::

### Content Insertion

Use the following format to pull in content from other files in your project:

This text has been inserted here from another file: [[insert: assets/test.text]]

You can even insert content within more complex blocks, like the JSON object below which is being pulled in and rendered in a syntax-highlighted example block:

::: example Code Example

```json
[[insert: assets/test.json]]
```

:::

### Tables

|              Stage | Direct Products | ATP Yields |
| -----------------: | --------------: | ---------: |
|         Glycolysis |           2 ATP |            |
|                 ^^ |          2 NADH |   3--5 ATP |
| Pyruvaye oxidation |          2 NADH |      5 ATP |
|  Citric acid cycle |           2 ATP |            |
|                 ^^ |          6 NADH |     15 ATP |
|                 ^^ |         2 FADH2 |      3 ATP |
|     **30--32** ATP |                 |            |
[Net ATP yields per hexose]
