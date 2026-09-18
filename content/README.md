# How to Edit Your Website Content

All the text on your website is stored in simple text files in this `content/` folder. You can edit them directly on GitHub — no coding needed!

## How to edit a file on GitHub

1. Go to the `content/` folder on GitHub
2. Click the file you want to edit (e.g. `research.md`)
3. Click the pencil icon (top right) to edit
4. Make your changes
5. Click **Commit changes** at the bottom
6. Your site will update automatically within a few minutes

---

## Text Formatting

You can use these anywhere in your text:

| What you type | What it looks like |
|---|---|
| `**bold text**` | **bold text** |
| `*italic text*` | *italic text* |
| `[link text](https://example.com)` | [link text](https://example.com) |

Example:

```
I combine connectomics with [two-photon imaging](https://example.com)
to study *Drosophila* **neural circuits**.
```

---

## File Guide

### `research.md` — Research section

The first paragraph (before the first `---`) is the intro text. Each subsequent block has three parts:

1. **Tag** (e.g. "Current", "Previous") — first line, shown as a small label
2. **Title** — line starting with `# `
3. **Description** — remaining text

```
I study how sensory inputs drive behaviour.

---

Current
# My Research Project Title
Description of this research goes here. You can use
**bold**, *italic*, and [links](https://example.com).

---

Previous
# Another Project
Description of another project.
```

---

### `talks.md` — Talks & Posters section

Each entry has exactly 4 lines, separated by `---`:

1. **Type** — `Talk` or `Poster`
2. **Title** — the talk/poster title
3. **Venue** — conference or event name
4. **Date** — when and where

```
Talk
My Talk Title
Conference Name
June 2025, City, Country

---

Poster
My Poster Title
Another Conference
November 2024, City, Country
```

---

### `cv.md` — CV section

Sections start with `## Section Name`. Each entry within a section has:
- **Line 1**: Date range (use `--` for en-dash, e.g. `2024--present`)
- **Line 2**: Title (can include `[links](url)`)
- **Line 3**: Institution/location
- **Line 4** (optional): Additional detail

Entries are separated by blank lines.

```
## Education

2024--present
PhD, Biological Sciences
University of Cambridge
[Jefferis Lab](https://example.com). My PhD research topic.

2021--2024
MSc, Biological Sciences
University of Konstanz, Germany
My MSc research details.
```

---

### Publications

Publications load automatically from your Semantic Scholar profile — no editing needed! When a new paper is indexed by Semantic Scholar, it will appear on your website automatically.

---

### `papers.md` — Paper collection (`/papers/`)

Each entry is a block, blocks are separated by `---`. The short form is two lines:

```
10.1038/nature08678
pheromone, aggression
```

1. **DOI** — title, authors, journal and year are fetched from Crossref automatically
2. **Tags** — comma separated
3. **Note** (optional) — any further plain line is your own comment, shown under the paper

Any line can instead be written as `key: value`, and these keys are understood:

| Key | Use |
|---|---|
| `link:` | open something other than doi.org — a specific figure, table or PDF |
| `title:`, `authors:`, `journal:`, `year:` | for entries Crossref does not know: books, chapters, web pages. Whatever you write here wins over Crossref |
| `status:` | your reading status: `read` or `to-read`. Not a tag — it gets its own filter, and you can also set it by clicking on the page |
| `tags:`, `note:`, `doi:` | the same as the positional lines, when you prefer to be explicit |

Marking one as read:

```
10.1038/nature08678
pheromone, aggression
status: read
```

A book, with no DOI to look up:

```
title: The study of instinct
tags: book, behaviour
authors: Tinbergen
year: 1951
```

**Tags are paths.** A dot makes a sub-topic: `pheromone.contact` is part of `pheromone`,
so picking `pheromone` shows it too, and picking `pheromone.contact` narrows to it.

On the page: a Read / To read / Unmarked row, topic filters with live counts (a topic that would empty the list reads 0 and
cannot be picked), a search box over titles, authors, journals, DOIs, notes and tags (press
`/` to focus it), and a Newest / Oldest / A to Z sort. Entries are grouped by year, so the
order of blocks in this file does not matter — add new ones anywhere.

**Marking papers read from the page.** Every entry has `read`, `to read` and `pick` under it.
Clicking `read` or `to read` marks the paper straight away, but only in your own browser — a
static site has nowhere else to put it. The bar then says how many marks you have made and
offers **Copy papers.md**, which hands you the whole file with your marks folded in: paste it
over this file, commit, and the marks become permanent for everyone. **Forget my marks** throws
your local ones away and leaves whatever the file says. A mark that matches the file is not
stored, so you can also un-mark something the file calls read.

**Picking papers by hand.** `pick` on an entry adds it to a set that is independent of the
filters — use it when the papers you want to send someone have nothing in common. With picks
made, `Copy link` gives `?doi=a,b,c` — that exact list, in that order. `Mark picked read` marks
the whole set at once.

**Sharing.** With nothing picked, `Copy link` copies the current view:
`?tag=pheromone,olfaction&q=receptor&sort=old&status=read`. Whoever opens it lands on the same
list, filtered the same way. The button also drops the link into a box on the page, selected,
for the times a browser refuses to give a page the clipboard.

Metadata is fetched from Crossref in batches of 20 DOIs and cached in the reader's browser for
a month, so a second visit needs no requests at all. DOIs Crossref does not hold — arXiv,
Zenodo — are looked up at DataCite instead. If neither has it, write the `title:` and friends
into the block yourself.
