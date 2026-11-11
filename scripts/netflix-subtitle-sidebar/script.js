// SPDX-License-Identifier: GPL-3.0-or-later

if (location.hostname !== "www.netflix.com" || window !== window.top) return;

const PANEL_ID = "hachidori-netflix-subtitle-sidebar";
const CUE_CLASS = "hd-netflix-sidebar-cue";
const HISTORY_LIMIT = 200;
const watchId = () => /^\/watch\/(\d+)(?:\/|$)/u.exec(location.pathname)?.[1] ?? null;

const panel = document.createElement("aside");
panel.id = PANEL_ID;
const heading = document.createElement("h2");
heading.id = `${PANEL_ID}-heading`;
heading.textContent = "Subtitles";
panel.setAttribute("aria-labelledby", heading.id);
const empty = document.createElement("p");
empty.textContent = "Turn on subtitles in Netflix to see them here.";
const list = document.createElement("ul");
list.setAttribute("aria-label", "Recent subtitles");
list.tabIndex = 0;
panel.append(heading, empty, list);

// A constructable sheet styles the page without an inline style element.
let sheet;
function installStyles() {
  if (sheet) return;
  sheet = new CSSStyleSheet();
  const activePlayer = `:root:has(> body > #${PANEL_ID}:not([hidden])) .watch-video`;
  sheet.replaceSync(`
    :root { --hd-netflix-sidebar-width: clamp(224px, 28vw, 368px); }
    ${activePlayer} {
      width: calc(100vw - var(--hd-netflix-sidebar-width)) !important;
      right: auto !important;
    }
    #${PANEL_ID} {
      position: fixed;
      z-index: 10000;
      inset: 0 0 0 auto;
      width: var(--hd-netflix-sidebar-width);
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      border-left: 1px solid #393939;
      background: #171717;
      color: #f5f5f5;
      color-scheme: dark;
      font: 16px/1.55 system-ui, sans-serif;
    }
    #${PANEL_ID}[hidden] { display: none; }
    #${PANEL_ID} > h2 {
      margin: 0;
      padding: 16px 20px;
      border-bottom: 1px solid #393939;
      color: inherit;
      font: 600 16px/1.4 system-ui, sans-serif;
    }
    #${PANEL_ID} > p { margin: 16px 20px; color: #bcbcbc; }
    #${PANEL_ID} > ul {
      flex: 1;
      min-height: 0;
      margin: 0;
      padding: 12px;
      overflow: auto;
      overscroll-behavior: contain;
      scrollbar-gutter: stable;
      list-style: none;
    }
    #${PANEL_ID} > ul:focus-visible { outline: 2px solid #a9a9a9; outline-offset: -2px; }
    #${PANEL_ID} .${CUE_CLASS} {
      display: block;
      padding: 8px;
      border-radius: 5px;
      white-space: pre-line;
      overflow-wrap: anywhere;
      user-select: text;
    }
    #${PANEL_ID} .${CUE_CLASS}[aria-current] { background: #2d2d2d; }
    @media (max-width: 640px) {
      ${activePlayer} { width: 100vw !important; height: 60vh !important; bottom: auto !important; }
      #${PANEL_ID} { inset: 60vh 0 0; width: auto; border: 0; border-top: 1px solid #393939; }
      #${PANEL_ID} > h2 { padding-block: 8px; }
    }
  `);
  document.adoptedStyleSheets.push(sheet);
}

// Keep explicit caption line breaks and the base text of ruby annotations.
function subtitleText(node) {
  if (node.nodeType === Node.TEXT_NODE) return node.data.replace(/\s+/gu, " ");
  if (node.nodeName === "BR") return "\n";
  if (node.nodeName === "RT" || node.nodeName === "RP") return "";
  return Array.from(node.childNodes, subtitleText).join("");
}

let lastText = "";
let deferredScrollTop = null;
function scrollToLatest() {
  list.scrollTop = list.scrollHeight;
  deferredScrollTop = null;
}

list.addEventListener("pointerleave", () => {
  if (deferredScrollTop === list.scrollTop) scrollToLatest();
  deferredScrollTop = null;
});

let subtitleLayer = null;
function readSubtitles() {
  const text = Array.from(subtitleLayer?.querySelectorAll(".player-timedtext-text-container") ?? [])
    .filter(line => line.getClientRects().length && getComputedStyle(line).visibility === "visible")
    .flatMap(line => subtitleText(line).split("\n"))
    .map(line => line.trim()).filter(Boolean).join("\n");
  if (text === lastText) return;
  lastText = text;
  if (!text) return;

  const wasAtEnd = list.scrollHeight - list.clientHeight - list.scrollTop <= 4;
  list.lastElementChild?.removeAttribute("aria-current");
  const cue = document.createElement("li");
  cue.className = CUE_CLASS;
  cue.dir = "auto";
  cue.setAttribute("aria-current", "true");
  cue.textContent = text;
  list.append(cue);
  if (list.childElementCount > HISTORY_LIMIT) list.firstElementChild.remove();
  empty.hidden = true;

  // Keep the text under the pointer still while someone is looking it up.
  if (wasAtEnd || deferredScrollTop === list.scrollTop) {
    if (list.matches(":hover")) deferredScrollTop = list.scrollTop;
    else scrollToLatest();
  }
}

let movie = null;
let player = null;
let pendingFrame = 0;
const subtitleObserver = new MutationObserver(scheduleSync);

function sync() {
  pendingFrame = 0;
  const nextMovie = watchId();
  const nextPlayer = nextMovie ? document.querySelector(".watch-video") : null;
  const nextLayer = nextPlayer?.querySelector(".player-timedtext") ?? null;
  if (nextMovie !== movie) {
    movie = nextMovie;
    list.replaceChildren();
    empty.hidden = false;
    deferredScrollTop = null;
    // Netflix can reuse the player during an episode change. Wait for its
    // subtitle to change before adding anything from that reused player.
    if (nextLayer !== subtitleLayer || !nextMovie) lastText = "";
  }
  player = nextPlayer;

  if (nextLayer !== subtitleLayer) {
    subtitleObserver.disconnect();
    subtitleLayer = nextLayer;
    if (subtitleLayer) subtitleObserver.observe(subtitleLayer, {
      subtree: true, childList: true, characterData: true,
      attributes: true, attributeFilter: ["class", "style", "hidden"],
    });
  }
  if (!player) {
    panel.remove();
    return;
  }

  installStyles();
  if (!panel.isConnected) document.body.append(panel);
  const wasHidden = panel.hidden;
  const fullscreen = document.fullscreenElement;
  panel.hidden = Boolean(fullscreen && !fullscreen.contains(panel));
  readSubtitles();
  if (wasHidden && !panel.hidden) scrollToLatest();
}

function scheduleSync() {
  if (!pendingFrame) pendingFrame = requestAnimationFrame(sync);
}

// Netflix replaces the player and subtitle layer and navigates between titles
// in the same document. Only observe cue text within the active subtitle layer.
new MutationObserver(() => {
  if (watchId() !== movie || (movie && (!player?.isConnected || !subtitleLayer?.isConnected || !panel.isConnected))) {
    scheduleSync();
  }
}).observe(document.documentElement, { childList: true, subtree: true });
window.navigation?.addEventListener("currententrychange", scheduleSync);
window.addEventListener("popstate", scheduleSync);
document.addEventListener("fullscreenchange", scheduleSync);
sync();
