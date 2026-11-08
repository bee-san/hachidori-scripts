// SPDX-License-Identifier: GPL-3.0-or-later
//
// Coloured dictionary names for Hachidori's popup.
//
// Each dictionary's name on its cards gets a colour of its own, the same on
// every word and every page, so you can tell your dictionaries apart at a
// glance. A dictionary listed in COLOURS gets the colour you give it; any
// other gets one made from its name. Every colour keeps white text readable.
(function () {
  "use strict";

  // Your own colours, by the name the popup shows on the card: any CSS colour
  // dark enough for white text. For example: { "Jitendex": "#b45309" }.
  const COLOURS = {};

  const TAG = ".gsm-hoshidicts-dictionary-tag:not(.hd-dictionary-colour)";
  const watched = new WeakSet();

  // A hue from the name, so a dictionary keeps its colour everywhere.
  function hueOf(name) {
    let hash = 2166136261;
    for (const character of name) hash = Math.imul(hash ^ character.codePointAt(0), 16777619) >>> 0;
    return hash % 360;
  }

  function paint(tag) {
    const name = tag.title || tag.textContent.trim();
    tag.classList.add("hd-dictionary-colour");
    if (Object.hasOwn(COLOURS, name)) tag.style.setProperty("--hd-dictionary-colour", COLOURS[name]);
    else tag.style.setProperty("--hd-dictionary-hue", String(hueOf(name)));
  }

  function apply(root) {
    for (const tag of root.querySelectorAll(TAG)) paint(tag);
  }

  // The popup re-renders inside one root for each lookup, entry and child
  // popup, so the root is watched rather than each popup.
  function watch() {
    const root = document.querySelector("hachidori-host")?.shadowRoot;
    if (!root) return;
    apply(root);
    if (watched.has(root)) return;
    watched.add(root);
    new MutationObserver(() => apply(root)).observe(root, { childList: true, subtree: true });
  }

  window.addEventListener("hachidori-popup-shown", watch);
  watch();
})();
