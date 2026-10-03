# Arlingkin

A personal portfolio and learning site for Arlingga (`arlingkin`), built as a static multi-page website using plain HTML, CSS, and JavaScript.

> Repo description: "Let's learn to code without ai"

This project showcases:
- personal profile and about page
- skills and projects sections
- notes / learning journal entries
- contact and social links
- responsive dark-themed portfolio design
- static deployment setup for Vercel, Firebase, and GitHub Pages

## Tech stack

The repository is primarily composed of:
- HTML: 45.9%
- JavaScript: 27.3%
- CSS: 26.8%

## Project structure

- `index.html` — home landing page
- `about.html` — about section
- `skills.html` — skills overview
- `projects.html` — portfolio/projects
- `stats.html` — stats and activity info
- `contact.html` — contact info
- `assets/` — shared CSS, JS, images, and site config
- `data/` — structured data such as tools and content metadata
- `partials/` — shared header/footer include content
- `scripts/build.mjs` — builds generated sections and i18n data
- `notes/` — personal notes/content pages
- `SETUP.md` — deployment and hosting instructions

## Local development

Because this is a static site, you can run it locally with any simple web server:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deployment

This repo is configured for static hosting and includes setup for:
- Vercel
- Firebase Hosting
- GitHub Pages

See `SETUP.md` for the full deployment instructions.

## Notes

The site uses generated content patterns and static assets rather than a framework, which keeps it lightweight and easy to host on simple static infrastructure.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
