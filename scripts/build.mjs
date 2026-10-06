import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const check = process.argv.includes('--check');
const read = (path) => readFileSync(path, 'utf8');
const data = JSON.parse(read('data/tools.json'));
const notesData = JSON.parse(read('data/notes.json'));
const site = JSON.parse(read('data/site.json'));
const origin = site.url.replace(/\/$/, '');
const byId = new Map(data.tools.map((tool) => [tool.id, tool]));

const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const iconUrl = (tool) => `${site.iconBase}${tool.icon}.svg`;
const monoClass = (tool) => (tool.mono ? ' class="ico-mono"' : '');
const link = (tool) => `href="${tool.url}" target="_blank" rel="noreferrer"`;

const chip = (tool) =>
  `            <a class="tool-chip" ${link(tool)} aria-label="${tool.name}"><img${monoClass(tool)} src="${iconUrl(tool)}" alt="" width="42" height="42"><span>${esc(tool.name)}</span></a>`;

const card = (tool) => {
  const glyph = tool.icon
    ? `<img${monoClass(tool)} src="${iconUrl(tool)}" alt="" width="22" height="22">`
    : esc(tool.glyph);
  return `          <a class="skill reveal" ${link(tool)} aria-label="${tool.name}" data-skill="${tool.id}"><span class="ico">${glyph}</span><h3 data-i18n="skills.${tool.key}.title">${esc(tool.name)}</h3><p data-i18n="skills.${tool.key}.desc">${esc(tool.desc.en)}</p><span class="bar"><i></i></span></a>`;
};

const group = (g) =>
  [
    '        <div class="section-head">',
    `          <h2 data-i18n="skills.${g.key}.lbl">${esc(g.label.en)}</h2>`,
    `          <span class="meta" data-i18n="skills.${g.key}.sub">${esc(g.sub.en)}</span>`,
    '        </div>',
    `        <div class="skill-grid${g.tools.length % 4 && g.tools.length % 3 === 0 ? ' skill-grid--3' : ''}">`,
    g.tools.map((id) => card(byId.get(id))).join('\n'),
    '        </div>',
  ].join('\n');

const featured = data.featured.map((id) => byId.get(id));

const sortedNotes = [...notesData.notes].sort((a, b) => b.date.localeCompare(a.date));
const mainNotes = sortedNotes.filter((note) => note.featured);
const moreNotes = sortedNotes.filter((note) => !note.featured);
const noteRow = (note, index) =>
  `          <a class="project-row reveal" href="/notes/${note.slug}"><span class="project-num">${String(index).padStart(2, '0')}</span><div class="project-main"><h3 data-i18n="notes.${note.slug}.title">${esc(note.title.en)}</h3><p data-i18n="notes.${note.slug}.desc">${esc(note.desc.en)}</p></div><span class="project-link" data-i18n="notes.read">READ NOTE →</span></a>`;
const mainHtml = mainNotes.map((note, i) => noteRow(note, i + 1)).join('\n');
const moreHtml = moreNotes.map((note, i) => noteRow(note, mainNotes.length + i + 1)).join('\n');

const replaceInner = (src, open, close, body) => {
  const at = src.indexOf(open);
  if (at < 0) return src;
  const start = at + open.length;
  const end = src.indexOf(close, start);
  if (end < 0) throw new Error(`missing ${close} after ${open}`);
  return `${src.slice(0, start)}\n${body}${src.slice(end)}`;
};

const replaceElement = (src, open, close, html) => {
  const at = src.indexOf(open);
  if (at < 0) return src;
  const end = src.indexOf(close, at);
  if (end < 0) throw new Error(`missing ${close} after ${open}`);
  return src.slice(0, at) + html + src.slice(end + close.length);
};

const pages = {
  'index.html': '/',
  'about.html': '/about',
  'skills.html': '/skills',
  'projects.html': '/projects',
  'stats.html': '/stats',
  'contact.html': '/contact',
  '404.html': null,
  'notes/index.html': null,
  'notes/mindustry.html': null,
  'notes/note-02.html': null,
};

const header = read('partials/header.html').trimEnd();
const footer = read('partials/footer.html').trimEnd();
const activate = (html, href) =>
  href ? html.replace(`<a class="nav-link" href="${href}"`, `<a class="nav-link active" href="${href}"`) : html;

const urlPath = (file) => '/' + file.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
const syncHead = (src, file) =>
  src
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${origin}${urlPath(file)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${origin}${urlPath(file)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${origin}/icons/og.png$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${origin}/icons/og.png$2`)
    .replace(/("(?:@id|url|image)": ")https?:\/\/[^\/"]+/g, `$1${origin}`);
const statsOwner = site.statsRepo.split('/')[0];
const syncStats = (src) =>
  src
    .replace(/https:\/\/raw\.githubusercontent\.com\/[^\/]+\/[^\/]+\/refs\/heads\/main\/github-metrics\.svg/, `https://raw.githubusercontent.com/${site.statsRepo}/refs/heads/main/github-metrics.svg`)
    .replace(/(href="https:\/\/github\.com\/)[^\/"]+\/[^\/"]+(\/actions")/, `$1${site.statsRepo}$2`)
    .replace(/(data-src [^>]*>)[^<]*(<\/a>)/, `$1${site.statsRepo} &#8599;$2`)
    .replace(/user=[^&"]+/, `user=${statsOwner}`);

const changed = [];
const write = (path, next) => {
  if (existsSync(path) && read(path) === next) return;
  changed.push(path);
  if (!check) writeFileSync(path, next);
};

for (const [path, active] of Object.entries(pages)) {
  let src = read(path);
  src = replaceElement(src, '<header class="site-header" data-build="header">', '</header>', activate(header, active));
  src = replaceElement(src, '<footer class="site-footer" data-build="footer">', '</footer>', footer);
  src = replaceInner(src, '<div class="tool-marquee-track" data-build="marquee">', '</div>', featured.map(chip).join('\n') + '\n          ');
  src = replaceInner(src, '<section aria-label="Skills grid" data-build="skill-groups">', '</section>', data.groups.map(group).join('\n\n') + '\n      ');
  src = replaceInner(src, '<div data-build="notes-main">', '\n        </div>\n      </section>', mainHtml);
  src = replaceInner(src, '<div data-build="notes-more">', '\n        </div>\n      </section>', moreHtml);
  src = syncHead(src, path);
  if (path === 'stats.html') src = syncStats(src);
  write(path, src);
}

write('sitemap.xml', read('sitemap.xml').replace(/<loc>https?:\/\/[^\/<]+/g, `<loc>${origin}`));
write('robots.txt', read('robots.txt').replace(/(Sitemap: )https?:\/\/[^\/\s]+/, `$1${origin}`));
write('assets/js/stats.js', read('assets/js/stats.js').replace(/const REPO = '[^']*';/, `const REPO = '${site.statsRepo}';`));

const entries = [];
for (const g of data.groups) {
  entries.push([`skills.${g.key}.lbl`, g.label], [`skills.${g.key}.sub`, g.sub]);
}
for (const tool of data.tools) {
  entries.push([`skills.${tool.key}.title`, { en: tool.name, id: tool.name }], [`skills.${tool.key}.desc`, tool.desc]);
}
for (const note of notesData.notes) {
  entries.push([`notes.${note.slug}.title`, note.title], [`notes.${note.slug}.desc`, note.desc]);
}
const i18n = `Object.assign(T, {\n${entries.map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`).join('\n')}\n});\n`;
write('assets/js/tools-i18n.js', i18n);

const xml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const items = sortedNotes
  .map((note) => {
    const url = `${origin}/notes/${note.slug}`;
    return `    <item>\n      <title>${xml(note.title.en)}</title>\n      <link>${url}</link>\n      <guid isPermaLink="true">${url}</guid>\n      <pubDate>${new Date(`${note.date}T00:00:00Z`).toUTCString()}</pubDate>\n      <description>${xml(note.desc.en)}</description>\n    </item>`;
  })
  .join('\n');
const feed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n  <channel>\n    <title>Arlingkin - Notes</title>\n    <link>${origin}/notes</link>\n    <atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>\n    <description>Short notes from Arlingga.</description>\n    <language>en</language>\n    <lastBuildDate>${new Date(`${sortedNotes[0].date}T00:00:00Z`).toUTCString()}</lastBuildDate>\n${items}\n  </channel>\n</rss>\n`;
write('feed.xml', feed);

/* CSP: keep sha256 hashes of the inline scripts (boot + speculation rules) in vercel.json in sync. */
const inline = (re, name) => {
  const m = read('index.html').match(re);
  if (!m) throw new Error(`${name} not found in index.html`);
  for (const page of Object.keys(pages)) if (!read(page).includes(m[1])) throw new Error(`${name} differs in ${page}`);
  return `'sha256-${createHash('sha256').update(m[1]).digest('base64')}'`;
};
const hashes = [
  inline(/<script>(\(function\(\)\{var d=document[\s\S]*?)<\/script>/, 'boot script'),
  inline(/<script type="speculationrules">([\s\S]*?)<\/script>/, 'speculation rules'),
].join(' ');
write('vercel.json', read('vercel.json').replace(/script-src [^;]*;/, `script-src 'self' ${hashes} 'inline-speculation-rules';`));

if (changed.length) console.log(`${check ? 'out of date' : 'updated'}: ${changed.join(', ')}`);
else console.log('up to date');
if (check && changed.length) process.exit(1);
