# Arlingkin

A personal portfolio and learning website built with plain HTML, CSS, and JavaScript.

Visit the live site: [arlingkin.vercel.app](https://arlingkin.vercel.app)

> “Let’s learn to code without AI.”

This repository contains the source for Arlingga’s personal site and notes hub. It is designed as a lightweight static website with multiple pages, a responsive dark theme, and a clean layout for portfolio content, skill highlights, projects, and notes.

## Highlights

- Personal portfolio landing page
- About, skills, projects, stats, and contact pages
- Notes / learning journal entries
- Responsive design for desktop and mobile
- Static deployment setup for Vercel, Firebase, and GitHub Pages
- Generated content via a build script

## Tech stack

This project is primarily built with:

- HTML: 45.9%
- JavaScript: 27.3%
- CSS: 26.8%

## Project structure

```text
.
├── README.md
├── SETUP.md
├── LICENSE
├── index.html
├── about.html
├── skills.html
├── projects.html
├── stats.html
├── contact.html
├── 404.html
├── sitemap.xml
├── robots.txt
├── firebase.json
├── vercel.json
├── app/
│   └── public/
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── data/
│   └── tools.json
├── icons/
├── notes/
├── partials/
├── scripts/
│   └── build.mjs
└── .github/
```

## Local development

Because this is a static site, you can run it locally with any basic local web server.

### Option 1: Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### Option 2: VS Code Live Server

Open the project in VS Code and run it with the Live Server extension if preferred.

## Deployment

The repository includes setup for multiple static hosting targets:

- Vercel
- Firebase Hosting
- GitHub Pages

For hosting and deployment details, see [SETUP.md](SETUP.md).

## Content generation

The project includes a build script that generates shared section content and UI metadata:

```bash
node scripts/build.mjs
```

This helps keep generated navigation and tool sections consistent across pages.

## Notes

This project follows a lightweight static-site approach rather than a framework-based app. That keeps the site easy to host, easy to inspect, and fast to deploy.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
