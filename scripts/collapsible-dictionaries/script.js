// SPDX-License-Identifier: GPL-3.0-or-later
//
// Collapsible dictionaries for Hachidori's popup (bee-san/hachidori#671).
//
// Each dictionary's card gets a toggle beside its name. A closed card keeps its
// name and tags and shows the start of its first definition, so a word with
// many dictionaries fits in a small popup. By default each word's first
// dictionary opens and the rest stay closed; a dictionary you open or close
// stays that way for the rest of the page's visit.
//
// Change the settings below to choose what starts open. Dictionary names are
// the ones the popup shows on each card.
(function () {
  "use strict";

  // "first" opens each word's first dictionary and closes the rest;
  // "all" opens every dictionary; "none" closes every dictionary.
  const START = "first";
  // Dictionaries that always start open, or always start closed, whatever
  // START says. For example: ["Jitendex"].
  const ALWAYS_OPEN = [];
  const ALWAYS_CLOSED = [];
  // Keep a dictionary open or closed, once you change it, until the page is
  // reloaded.
  const REMEMBER = true;

  const CARD = ".gsm-hoshidicts-glossary-card";
  const chosen = new Map();
  const watched = new WeakSet();

  function dictionaryOf(card) {
    return card.querySelector(".definition-item[data-dictionary]")?.dataset.dictionary ?? "";
  }

  function startsOpen(card, name) {
    if (REMEMBER && chosen.has(name)) return chosen.get(name);
    if (ALWAYS_OPEN.includes(name)) return true;
    if (ALWAYS_CLOSED.includes(name)) return false;
    if (START === "all") return true;
    if (START === "none") return false;
    // The first card of its word: a card in the same entry comes before it.
    const entry = card.closest(".gsm-hoshidicts-entry") ?? card.parentElement;
    return entry.querySelector(CARD) === card;
  }

  // The start of the card's first definition, for its closed state: its
  // glosses joined with " · ", as the popup's header summary joins them, and a
  // space between a gloss's paragraphs.
  function previewOf(card) {
    const content = card.querySelector(".gsm-hoshidicts-glossary-content");
    if (!content) return "";
    const items = content.querySelectorAll(".gloss-item");
    const texts = [...(items.length > 0 ? items : [content])].map((item) => {
      const copy = item.cloneNode(true);
      for (const block of copy.querySelectorAll("div, p, li, br, tr, td")) block.before(" ");
      return copy.textContent.replace(/\s+/gu, " ").trim();
    }).filter(Boolean);
    return texts.join(" · ").slice(0, 200);
  }

  function chevron(document) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M6 3.5 10.5 8 6 12.5");
    svg.append(path);
    return svg;
  }

  function setOpen(card, open) {
    card.dataset.hdOpen = String(open);
    card.querySelector(".hd-collapse-toggle")?.setAttribute("aria-expanded", String(open));
  }

  function makeCollapsible(card) {
    const name = dictionaryOf(card);
    const document = card.ownerDocument;
    // The row with the dictionary's name, or a new one where the card has none.
    let head = card.querySelector(".gsm-hoshidicts-dictionary-tag")?.closest(".definition-tag-list");
    if (!head) {
      head = document.createElement("div");
      head.className = "definition-tag-list gsm-hoshidicts-definition-tags hd-collapse-head-added";
      const label = document.createElement("span");
      label.className = "gsm-hoshidicts-tag gsm-hoshidicts-dictionary-tag";
      label.textContent = name;
      head.append(label);
      card.prepend(head);
    }
    head.classList.add("hd-collapse-head");
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "hd-collapse-toggle";
    toggle.setAttribute("aria-label", name || "Dictionary");
    toggle.append(chevron(document));
    const preview = document.createElement("span");
    preview.className = "hd-collapse-preview";
    preview.textContent = previewOf(card);
    head.prepend(toggle);
    head.append(preview);
    card.classList.add("hd-collapsible");
    setOpen(card, startsOpen(card, name));
    head.addEventListener("click", (event) => {
      // Links and the popup's own buttons in the row keep their clicks.
      if (event.target.closest("a, button:not(.hd-collapse-toggle), input, select, textarea")) return;
      const open = card.dataset.hdOpen !== "true";
      setOpen(card, open);
      if (REMEMBER) chosen.set(name, open);
    });
  }

  function apply(root) {
    for (const card of root.querySelectorAll(`${CARD}:not(.hd-collapsible)`)) makeCollapsible(card);
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
