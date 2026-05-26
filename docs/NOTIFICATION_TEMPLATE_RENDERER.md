# Template renderer

## Rules

- Only `{{variable_name}}` placeholders are interpolated.
- HTML output escapes `& < > " '` for variables; the template body is
  inserted verbatim (designers may include trusted HTML).
- Plain-text and subject output do not escape characters.
- Unknown variables resolve to empty strings and are reported in
  `missingVariables`.
- Required variables that resolve to empty produce a warning.
- Subject is truncated to 200 characters.
- If a template body contains `<script>` or `javascript:`, the
  renderer logs a warning. Variables themselves cannot inject scripts
  because they are HTML-escaped.

## API

```ts
renderTemplate({ templateKey, variables, overrides? })
  → { subject, html, text, missingVariables, warnings } | null
previewTemplate(templateKey, variables?)
  → same as renderTemplate, with example values pre-filled
```

## Why not Handlebars / Mustache?

We deliberately avoid bringing a template engine that interprets
helpers or expressions, because some have known RCE / prototype
pollution histories. The current substitution is bounded, regex-based,
and has no code-evaluation path.
