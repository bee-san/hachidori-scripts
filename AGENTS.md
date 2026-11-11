# AGENTS.md

These instructions apply to this repository of Hachidori Script Store packages.

## Working agreement

- Read `CONTRIBUTING.md` and the affected package's `README.md` before editing.
- Deliver changes through a dedicated branch and pull request. Keep each pull
  request focused on one outcome; do not push changes directly to `main`.
- Keep package slugs stable and preserve upstream attribution and licences.
- Keep packages self-contained. Hachidori runs their JavaScript inside a
  function as a classic script, with no extension or `GM_*` APIs and no
  top-level `await`. Do not fetch and execute remote code.
- Guard site-specific code before it accesses the page or starts background
  work, since Hachidori runs packages on other pages and in frames too.

## Configuration and credentials

- Put user-editable configuration, especially API keys, near the top of
  `script.js`, clearly labelled and before implementation details.
- Publish empty API-key defaults. Document where to obtain a key and how to
  set it; never commit real credentials or include them in logs or screenshots.
- Document precedence between source defaults and saved settings. Preserve
  existing saved values and storage keys when adding a source default.
- For Jimaku Player, keep `JIMAKU_API_KEY` at the top and use it only as the
  default when the existing `jp:jimaku-api-key` storage entry is absent or
  unreadable. The player's Settings remains the way to override or clear it.
- Keep Jimaku subtitle downloads and local-file loading independent of the
  API key; only Jimaku API requests carry the Authorization header.
- Preserve Jimaku Player's Hachidori subtitle markers and timing events when
  changing the player, so Crunchyroll mining continues to work.

## Package updates and validation

- Update the package's setup documentation when configuration changes, and
  raise its `script.json` version whenever its shipped code changes.
- Run `node tools/build-catalogue.mjs` with Node 22 or later and commit the
  generated `catalogue.json` together with the source. Do not hand-edit it.
- Run `node tools/build-catalogue.mjs --check` and `git diff --check`, and
  review the complete diff before opening the pull request.
- Try relevant behavior through Hachidori's Import files when a browser is
  available. Report exactly what was checked and any untested browser behavior
  in the pull request; include a screenshot for visible UI changes.
