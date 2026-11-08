// SPDX-License-Identifier: GPL-3.0-or-later
//
// Merge duplicate pitch accents in Hachidori's popup (bee-san/hachidori#209).
//
// When two or more pitch accent dictionaries give a word exactly the same
// patterns, the popup lists them once, with every one of those dictionaries'
// names. A dictionary whose patterns differ in any way keeps its own line, so
// nothing a dictionary says is hidden.
(function () {
  "use strict";

  const watched = new WeakSet();

  // What a dictionary says: its patterns, with any tags on them, in order.
  function patternsOf(group) {
    return [...group.querySelectorAll(".pronunciation")].map(item => [
      item.dataset.pronunciationType ?? "",
      item.dataset.pronunciation ?? item.textContent.trim(),
      item.querySelector(".pronunciation-tag-list")?.textContent.trim() ?? "",
    ].join("\u0000")).join("\u0001");
  }

  function merge(list) {
    list.classList.add("hd-pitch-merged");
    const kept = new Map();
    for (const group of list.querySelectorAll(":scope > .pronunciation-group")) {
      const key = patternsOf(group);
      const first = kept.get(key);
      if (!first) {
        kept.set(key, group);
        continue;
      }
      // The first dictionary's line names this one too, and its patterns' labels say so.
      const tag = group.querySelector(".gsm-hoshidicts-pitch-source");
      if (tag) first.querySelector(".pronunciation-group-tag-list")?.append(tag);
      const names = [...first.querySelectorAll(".gsm-hoshidicts-pitch-source")].map(source => source.textContent.trim());
      for (const item of first.querySelectorAll(".pronunciation")) {
        const label = `${names.join(", ")}: ${item.dataset.pronunciation ?? ""}`;
        item.title = label;
        item.setAttribute("aria-label", label);
      }
      group.hidden = true;
    }
    // One line left reads as one dictionary's: no "1." in front of it.
    const shown = list.querySelectorAll(":scope > .pronunciation-group:not([hidden])").length;
    list.dataset.count = String(shown);
  }

  function apply(root) {
    for (const list of root.querySelectorAll(".pronunciation-group-list:not(.hd-pitch-merged)")) merge(list);
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
