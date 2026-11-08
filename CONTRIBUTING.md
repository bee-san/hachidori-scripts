# Adding a package

A package is one folder under `scripts/`, named with lowercase letters, digits
and single hyphens. The folder's name is the package's slug, which Hachidori
uses to recognise it in the Script Store, so it never changes.

```
scripts/<slug>/
├── script.json   name, description, author, version and license
├── script.js     optional: the JavaScript
├── script.css    optional: the CSS
└── README.md     what it does and how to use it
```

A package has `script.js`, `script.css` or both.

## script.json

```json
{
  "schema": 1,
  "name": "Texthooker",
  "description": "One or two sentences on what it changes.",
  "author": "your-github-name",
  "version": "1.0.0",
  "license": "GPL-3.0-or-later"
}
```

Every field is one line of text. Raise `version` with every change: Hachidori
offers Update when the version it installed differs from the catalogue's.
`license` is an SPDX identifier for a license that lets anyone copy and run the
package.

## What a package can use

Hachidori runs a package as it runs the user's own scripts in Settings →
Advanced → User scripts ([user scripts](https://github.com/bee-san/hachidori/blob/main/docs/user-scripts.md)):

- **JavaScript** runs as a user script in the top frame of every page, from the
  page's next load, and on the search page. It runs inside a function of its
  own, so `return` ends it early and its top-level names are its own. It is a
  classic script: there is no top-level `await` and no extension API.
- The popup is `document.querySelector("hachidori-host").shadowRoot`, and
  `hachidori-popup-shown` and `hachidori-popup-hidden` fire on `window`. On the
  search page, `globalThis.HDSearchHistory` reads and edits the search history.
- **CSS** goes into the popup's shadow root, after Hachidori's and the
  dictionaries' styles and before the user's Design → Custom CSS. CSS for the
  search page itself, outside the popup, goes in from the JavaScript.

Keep everything in the package: no `<script>` from another site and no running
of text fetched from elsewhere.

## Before the pull request

1. Try the package in Hachidori with **Import files** in Advanced → User
   scripts.
2. Run `node tools/build-catalogue.mjs` (Node 22 or later) and commit the
   updated `catalogue.json`. It checks the package's fields and parses its
   JavaScript the way Hachidori runs it.
3. Open the pull request with what the package does, a screenshot when it
   changes what you see, and the browsers you tried it in.

CI runs `node tools/build-catalogue.mjs --check`. Bee reviews every package
before it is merged; only merged packages reach the Script Store.
