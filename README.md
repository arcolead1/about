# Arlingkin

Personal site and learning journal of **Arlingga**, built with plain HTML, CSS and a bit of JavaScript. No framework, no bundler.

**Live:** [arlingkin.vercel.app](https://arlingkin.vercel.app)

> "Let's learn to code without AI."

## Features

- Pages: home, about, skills, projects, stats, contact, notes and a custom 404
- Notes (a short learning journal) with an RSS feed at `/feed.xml`
- English / Indonesian switcher and a dark / light theme, both remembered per visitor
- Live GitHub stats and a countdown to the next scheduled workflow run
- Responsive layout, reduced-motion support and a lighter mode for low-end devices
- Profile details (location, status, "now" list, and so on) can be changed from GitHub variables without editing code
- Deploys to Vercel, Firebase Hosting and GitHub Pages

## Project structure

```text
.
├── index.html, about.html, skills.html, projects.html,
│   stats.html, contact.html, 404.html     # pages (clean URLs: /about, /skills, ...)
├── notes/                                 # notes index and individual notes
├── partials/                              # shared header.html and footer.html
├── data/
│   ├── tools.json                         # tools, groups, icons, descriptions (EN/ID)
│   ├── notes.json                         # notes list, dates, tags, featured flag (EN/ID)
│   └── projects.json                      # projects: tags, status, stack, links (EN/ID)
├── assets/
│   ├── css/                               # style.css (design system), interactive.css (effects)
│   └── js/                                # main.js (i18n, nav, reveal), interactive.js,
│                                          # stats.js, filter.js, mail.js, site-config.js, valueskills.js,
│                                          # tools-i18n.js (generated)
├── icons/                                 # site icons and icons/tools/*.svg
├── scripts/
│   ├── build.mjs                          # generator (header, footer, tools, notes, feed)
│   └── inject-config.mjs                  # injects GitHub variables into site-config.js
├── app/public/                            # starter for the Firebase "app" subdomain
├── .github/workflows/                     # build-check, vercel-deploy, firebase-hosting, github-pages
├── feed.xml, sitemap.xml, robots.txt
├── vercel.json, firebase.json, .firebaserc
├── SETUP.md                               # hosting and CI setup (Indonesian)
└── LICENSE
```

## Local development

It is a static site, so any local web server works:

```bash
python -m http.server 8000
# open http://localhost:8000
```

Or use the VS Code Live Server extension.

Clean URLs such as `/about` need a server that maps them to `about.html`. With the plain Python server, open `/about.html` instead.

## Generated content

Some parts are generated so they stay identical on every page:

- header and footer, from `partials/`
- tool chips and skill cards, from `data/tools.json`
- the notes list, the projects page, `feed.xml` and `assets/js/tools-i18n.js`, from `data/notes.json`, `data/projects.json` and `data/tools.json`
- page URLs (canonical, Open Graph, JSON-LD), `sitemap.xml`, `robots.txt`, the stats repo in `stats.js` / `stats.html` and the CSP script hashes in `vercel.json`, from `data/site.json` (edit it first when forking)

After changing any of those sources, run:

```bash
node scripts/build.mjs          # regenerate and write files
node scripts/build.mjs --check  # verify only (used by CI, exits 1 if out of date)
```

Commit the regenerated files. The Node.js version in CI is 20.

### Adding a tool

1. Add an entry to `data/tools.json` (and to `featured` or a group if it should show up).
2. Put its icon in `icons/tools/<id>.svg`.
3. Run `node scripts/build.mjs`.

### Adding a note

1. Copy `notes/mindustry.html` to `notes/<slug>.html` and add its text keys in `assets/js/main.js`.
2. Add the entry to `data/notes.json` (with `tags` from the `tags` map there) and a URL to `sitemap.xml`.
3. Add `notes/<slug>.html` to the `pages` map in `scripts/build.mjs`.
4. Run `node scripts/build.mjs`.

### Adding a project

1. Add an entry to `data/projects.json` (`tags` from `types`, `status` from `status`, EN/ID `title`, `desc`, `cta`). Set `featured: true` for a big card (needs `badge` and `art`); everything else becomes a row.
2. Run `node scripts/build.mjs`. The card, filter chips, search index and i18n keys are generated.

Notes and Projects share one search/filter script (`assets/js/filter.js`, the `[data-filter]` markup) with tag chips, `?q=&tag=` links and "show more" paging.

## Site config variables

`assets/js/site-config.js` holds `__SITE_*__` placeholders. In CI, `scripts/inject-config.mjs` replaces them with GitHub Actions variables (**Settings → Secrets and variables → Actions → Variables**). A missing variable simply keeps the default text.

| Variable | Used for |
| --- | --- |
| `SITE_LOCATION`, `SITE_STATUS`, `SITE_WORKING_ON`, `SITE_OPEN_TO`, `SITE_FAV_COLOR`, `SITE_EMAIL` | facts list on the About page |
| `SITE_ROLE`, `SITE_TAGLINE` | home page eyebrow and status line |
| `SITE_NOW_1` to `SITE_NOW_4` | "Right now" list on the home page |

## Deployment

Pushing to `main` triggers the workflows in `.github/workflows/`:

| Workflow | Target | Requires |
| --- | --- | --- |
| `build-check.yml` | verifies generated files are committed | nothing |
| `vercel-deploy.yml` | Vercel (`arlingkin.vercel.app`) | secret `VERCEL_TOKEN` |
| `firebase-hosting.yml` | Firebase Hosting (main site and `app` subdomain) | secret `FIREBASE_TOKEN` |
| `github-pages.yml` | GitHub Pages | Pages source set to GitHub Actions |

The Vercel and Firebase workflows skip themselves when their secret is not set. Full step-by-step instructions are in [SETUP.md](SETUP.md).

## Tech notes

- Vanilla JavaScript only, loaded as classic scripts
- Translations live in the `T` object in `assets/js/main.js` and are applied through `data-i18n` attributes
- Fonts: DM Sans, DM Mono and Playfair Display via Google Fonts
- Tool icons are served locally from `icons/tools/` (path set by `iconBase` in `data/site.json`)

## License

[MIT](LICENSE)
