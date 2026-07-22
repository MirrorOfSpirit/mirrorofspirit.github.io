# Pentest Portfolio — Jekyll theme

A lightweight, custom dark theme for a pentesting/security portfolio and blog. Built for
GitHub Pages. No frameworks, no build step beyond Jekyll itself, nothing to touch after
setup except Markdown files and `_config.yml`.

## What's inside

- **Collections**: `_writeups`, `_projects`, `_notes` — each with its own layout and index page.
- **Custom theme**: dark, GitHub-Dark/VS Code-inspired, no "hacker" clichés. Severity-coded
  badges (difficulty, tags) borrow from real vuln-severity conventions.
- **Client-side search**: `/search.json` is generated at build time; `assets/js/search.js`
  does substring/ranked search over it. No external service, no API keys.
- **Auto table of contents**: generated from `##`/`###` headings in each post at runtime —
  you never write a TOC by hand.
- **Reading time**: computed automatically from word count.
- **Syntax highlighting**: Rouge (Jekyll/GitHub Pages default), themed to match the site.
- **Code copy buttons**: added automatically to every code block.
- **Tag filtering**: client-side filter bar on each collection index, plus a full `/tags/` page.
- **Responsive**: single-column collapse on mobile, collapsible nav.

## 1. Local setup

You need Ruby (3.1+) and Bundler installed.

```bash
gem install bundler
bundle install
bundle exec jekyll serve
```

Visit `http://localhost:4000`.

## 2. Configure the site

Edit **`_config.yml`** — this is the only place you should need to put personal info:

```yaml
title: "Your Name"
url: "https://yourusername.github.io"
author:
  name: "Your Name"
  role: "Penetration Tester / Security Researcher"
  bio: "..."
  email: "you@example.com"
  github: "yourusername"
  linkedin: "yourusername"
  resume: "/assets/resume.pdf"
```

Replace `assets/img/avatar-placeholder.svg` with a real photo (update the `src` in `about.md`),
and drop your résumé PDF at `assets/resume.pdf` if you want the About page link to work.

## 3. Deploy to GitHub Pages

**Option A — plain GitHub Pages build (simplest):**

1. Push this repo to GitHub.
2. Repo Settings → Pages → Source → "Deploy from a branch" → `main` / `root`.
3. Done. GitHub's own Jekyll build picks it up (the `Gemfile` mirrors `github-pages` exactly,
   so what builds locally builds there too).

**Option B — GitHub Actions (recommended, more control, no plugin whitelist limits):**

A workflow is already included at `.github/workflows/pages.yml`. Just enable it:

1. Repo Settings → Pages → Source → "GitHub Actions".
2. Push to `main`. The included workflow builds and deploys automatically.

## 4. Writing content — this is the only thing you do day-to-day

### A writeup

Create `_writeups/YYYY-MM-DD-machine-name.md`:

```yaml
---
title: "Machine Name"
date: 2026-03-01
difficulty: Medium      # Easy | Medium | Hard | Insane
os: Linux                # Linux | Windows
tags: [htb, linux, web]
skills:
  - Web enumeration
  - Privilege escalation via SUID
description: "One-line summary shown on cards and in search."
---

## Enumeration
## Initial Access
## Privilege Escalation
## Lessons Learned
## Mitigations
```

Keep those five `##` headings — the sidebar table of contents, and the whole point of the
format (a report a hiring manager can skim), depends on that structure. A working example
lives at `_writeups/2026-01-15-example-htb-machine.md` — delete or overwrite it.

### A project

Create `_projects/YYYY-MM-DD-name.md` with `title`, `date`, `tags`, `description`, and
optionally `repo` / `link`. See `_projects/2026-02-01-recon-automation-toolkit.md`.

### A note

Create `_notes/YYYY-MM-DD-name.md` with `title`, `date`, `tags`, `description`. Freeform
body — no required section structure. See `_notes/2026-02-10-linux-privesc-cheatsheet.md`.

Difficulty badge colors map to `difficulty` (case-insensitive): `easy` → green, `medium` →
yellow, `hard` → orange, `insane`/`critical` → red. Anything else falls back to a neutral
gray badge, so you can also use `difficulty` creatively (e.g. `Info`) if needed.

## 5. Structure reference

```
_config.yml          site settings — the main file you'll edit
_writeups/            HTB/CTF writeups (collection)
_projects/            tooling & research projects (collection)
_notes/                cheat sheets & standalone notes (collection)
_layouts/              HTML templates (default, home, writeup, project, note, collection, page)
_includes/              head, header, footer, search modal
assets/css/main.scss   the entire theme, in one file, token-based (edit :root vars to retheme)
assets/js/main.js       nav, TOC generation, scrollspy, code-copy buttons, search modal wiring
assets/js/search.js     client-side search against /search.json
search.json             build-time generated search index (Liquid, not something you edit)
index.md, about.md,
writeups.md, projects.md,
notes.md, tags.md       top-level pages
```

## 6. Retheming

Every color, font, radius, and spacing constant lives in `:root` at the top of
`assets/css/main.scss`. Change the tokens, not the rules below them.

## Notes on GitHub Pages plugin limits

This theme deliberately avoids any Jekyll plugin outside GitHub Pages' whitelist
(`jekyll-feed`, `jekyll-seo-tag`, `jekyll-sitemap`) — TOC, reading time, and search are all
done with Liquid + vanilla JS instead of plugins like `jekyll-toc`. That means Option A
(plain GitHub Pages build) works with zero extra configuration.
