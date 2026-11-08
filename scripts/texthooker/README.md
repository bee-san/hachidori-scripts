# Texthooker

Turns Hachidori's search page into a texthooker. It lists the lines the search
page keeps, newest at the bottom, scrolling along as they arrive, with the
number of lines and of Japanese characters. You can show each line's time,
pause the Clipboard monitor, and edit or delete a line. Hover a word with
Hachidori's activation key to look it up as on any page, or click it; the
result shows beside the lines, in the search page's results area.

## Use it

1. Switch on Settings → Advanced → Search history.
2. Install **Texthooker** from Settings → Advanced → User scripts → Script
   Store, or add `script.js` there with **Import files**.
3. Let Hachidori run user scripts: Chrome's **Allow User Scripts** on
   Hachidori's details page, or **Allow user scripts** in Settings on Firefox
   (154 or later for the search page).
4. Open the search page and switch on its Clipboard monitor. A program that
   copies each new line, such as Textractor with its clipboard extension, then
   fills the list.

It uses only `HDSearchHistory`, the search page's history API
([Hachidori's search history guide](https://github.com/bee-san/hachidori/blob/main/docs/search-history.md#for-user-scripts-hdsearchhistory)),
and does nothing on other pages.

Inspired by [texthooker-ui](https://github.com/Renji-XD/texthooker-ui) (MIT,
Copyright (c) 2023 Renji-xD); no code is taken from it. It has no websocket
client: the lines come from the search page's history, which the Clipboard
monitor fills.
