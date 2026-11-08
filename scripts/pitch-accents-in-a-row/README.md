# Pitch accents in a row

Shows each pitch accent dictionary's patterns side by side under the headword,
wrapping onto the next line when the popup runs out of room, instead of one
numbered line per dictionary. A word that three dictionaries cover takes one
line instead of three.

![The popup for 雨: Pitch A's あめ [1] and Pitch B's あめ [1] and あめ [0] on one line](preview.png)

## Use it

Install **Pitch accents in a row** from Settings → Advanced → User scripts →
Script Store, or add `script.css` there with **Import files**. It is CSS only,
so it needs no permission, and it applies from the next popup.

It goes well with
[Merge duplicate pitch accents](../merge-duplicate-pitch-accents/README.md),
which lists patterns that several dictionaries agree on once.

## Where it works

In Hachidori's standard popup, in any colours, and in the search page's results.
The Theme Store's layouts (Nazeka, Plain, JL, Bee's Theme and Crystal) draw
pitch accents their own way, and the script leaves them as they are.

Requested in [bee-san/hachidori#642](https://github.com/bee-san/hachidori/issues/642).
