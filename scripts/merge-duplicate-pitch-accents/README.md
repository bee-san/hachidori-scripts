# Merge duplicate pitch accents

When several pitch accent dictionaries give a word exactly the same patterns,
the popup lists them once, with every one of those dictionaries' names on that
line. A dictionary whose patterns differ in any way, or that tags them
differently, keeps its own line, so nothing a dictionary says is hidden.

![The popup for 食べる: one line, たべる [2], named Pitch A and Pitch B](preview.png)

## Use it

1. Install **Merge duplicate pitch accents** from Settings → Advanced → User
   scripts → Script Store, or add `script.js` and `script.css` there with
   **Import files**.
2. Let Hachidori run user scripts: Chrome's **Allow User Scripts** on
   Hachidori's details page, or **Allow user scripts** in Settings on Firefox.
3. Reload the pages you have open.

A merged line's description, which screen readers announce, names every
dictionary on it. It goes well with
[Pitch accents in a row](../pitch-accents-in-a-row/README.md).

## Where it works

In Hachidori's standard popup, in any colours, and in the search page's results.
The Theme Store's layouts (Nazeka, Plain, JL, Bee's Theme and Crystal) draw
pitch accents their own way, and the script leaves them as they are.

Requested in [bee-san/hachidori#209](https://github.com/bee-san/hachidori/issues/209),
which asks for pitch accents to be de-duplicated as Hoshi Reader and Chimahon
do.
