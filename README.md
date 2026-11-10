# Hachidori Scripts

Community user scripts for [Hachidori](https://github.com/bee-san/hachidori).
A package is JavaScript, CSS or both that changes Hachidori's popup, its
search page or the pages you read with it.

In Hachidori, open Settings → Advanced → User scripts. **Check for scripts**,
in its Script Store, reads this repository's [`catalogue.json`](catalogue.json),
and **Install** copies a package into your scripts, where you can switch it off
or delete it like your own. When a package's version changes here, **Update**
replaces it.

| Package | What it does |
| --- | --- |
| [Collapsible dictionaries](scripts/collapsible-dictionaries) | Folds each dictionary in the popup to its name and the start of its first definition; each word's first dictionary opens. |
| [Coloured dictionary names](scripts/coloured-dictionary-names) | Gives each dictionary's name a colour of its own, the same on every word. |
| [Jimaku Player](scripts/jimaku-player) | Japanese subtitles from jimaku.cc over Crunchyroll's player, synced with one key, for Hachidori to look up; with Crunchyroll mining on, notes get each line's audio and animation. |
| [Merge duplicate pitch accents](scripts/merge-duplicate-pitch-accents) | Lists a pitch accent once when several dictionaries give exactly the same patterns, with all their names. |
| [Pitch accents in a row](scripts/pitch-accents-in-a-row) | Shows the pitch accent dictionaries side by side under the headword instead of one line each. |
| [Texthooker](scripts/texthooker) | Turns the search page into a texthooker: the lines it keeps, with counts and times, a pause for the Clipboard monitor, and Edit and Delete on each line. |

To add a package, read [CONTRIBUTING.md](CONTRIBUTING.md) and open a pull
request. Bee reviews every package before it is merged.

The tools and documents are licensed under the GPL-3.0 ([LICENSE](LICENSE));
each package names its own license in its `script.json`.
