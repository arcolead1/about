import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const check = process.argv.includes('--check');
const read = (path) => readFileSync(path, 'utf8');
const data = JSON.parse(read('data/tools.json'));
const notesData = JSON.parse(read('data/notes.json'));
const site = JSON.parse(read('data/site.json'));
const projData = JSON.parse(read('data/projects.json'));
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

const escAttr = (text) => esc(text).replace(/"/g, '&quot;');
const norm = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};
const num = (i) => String(i).padStart(2, '0');
const chipButtons = (key, labels, lists) =>
  Object.keys(labels)
    .filter((id) => lists.some((tags) => tags.includes(id)))
    .map((id) => `                <button class="chip chip-btn" type="button" data-filter-tag="${id}" aria-pressed="false" data-i18n="${key}.${id}">${esc(labels[id].en)}</button>`)
    .join('\n');

/* notes */
const noteTags = notesData.tags || {};
const sortedNotes = [...notesData.notes].sort((a, b) => b.date.localeCompare(a.date));
const mainNotes = sortedNotes.filter((note) => note.featured);
const moreNotes = sortedNotes.filter((note) => !note.featured);
const noteRow = (note, index) => {
  const tags = note.tags || [];
  const q = norm([note.slug, note.title.en, note.title.id, note.desc.en, note.desc.id, ...tags.flatMap((t) => [t, noteTags[t].en, noteTags[t].id])].join(' '));
  const chips = tags.map((t) => `<span class="chip" data-tag="${t}" data-i18n="notes.tag.${t}">${esc(noteTags[t].en)}</span>`).join('');
  return `            <a class="project-row reveal" data-item data-q="${escAttr(q)}" data-tags="${tags.join(' ')}" href="/notes/${note.slug}"><span class="project-num">${num(index)}</span><div class="project-main"><h3 data-i18n="notes.${note.slug}.title">${esc(note.title.en)}</h3><p data-i18n="notes.${note.slug}.desc">${esc(note.desc.en)}</p><div class="row-meta"><time datetime="${note.date}" data-date="${note.date}">${shortDate(note.date)}</time>${chips}</div></div><span class="project-link" data-i18n="notes.read">READ NOTE →</span></a>`;
};
const mainHtml = mainNotes.map((note, i) => noteRow(note, i + 1)).join('\n');
const moreHtml = moreNotes.map((note, i) => noteRow(note, mainNotes.length + i + 1)).join('\n');
const noteTagHtml = chipButtons('notes.tag', noteTags, notesData.notes.map((n) => n.tags || []));

/* projects */
const projects = projData.projects;
const projTypes = projData.types;
const projStatus = projData.status;
const featuredProjects = projects.filter((p) => p.featured);
const otherProjects = projects.filter((p) => !p.featured);
const projMeta = (p) => {
  const status = `<span class="chip chip-status s-${p.status}" data-i18n="projects.status.${p.status}">${esc(projStatus[p.status].en)}</span>`;
  const types = p.tags.map((t) => `<span class="chip" data-tag="${t}" data-i18n="projects.type.${t}">${esc(projTypes[t].en)}</span>`);
  const stack = (p.stack || []).map((t) => `<span class="chip chip-stack">${esc(t)}</span>`);
  return `<div class="row-meta">${[status, ...types, ...stack].join('')}</div>`;
};
const projAttrs = (p) => {
  const q = norm([p.slug, p.title.en, p.title.id, p.desc.en, p.desc.id, projStatus[p.status].en, projStatus[p.status].id, ...p.tags.flatMap((t) => [t, projTypes[t].en, projTypes[t].id]), ...(p.stack || [])].join(' '));
  return `data-item data-q="${escAttr(q)}" data-tags="${p.tags.join(' ')}"`;
};
const projLink = (p) => `href="${escAttr(p.url)}"${p.external === false ? '' : ' target="_blank" rel="noreferrer"'}`;
const projArt = (p) => {
  const props = Object.entries(p.art.props)
    .map(([k, v], i, all) => `              &nbsp;&nbsp;<span class="green">${esc(k)}</span>: <span class="purple">'${esc(v)}'</span>${i < all.length - 1 ? ',' : ''}<br>`)
    .join('\n');
  return [
    '            <div class="code-window">',
    '              <div class="dots"><i></i><i></i><i></i></div>',
    `              <span class="pink">const</span> ${esc(p.art.name)} = {<br>`,
    props,
    '              };<br><br>',
    `              <span class="faint">// ${esc(p.art.comment)}</span>`,
    '            </div>',
  ].join('\n');
};
const projFeature = (p) => {
  const matrix = p.theme === 'matrix';
  return [
    `          <article class="feature-card${matrix ? ' matrix' : ''}" ${projAttrs(p)}>`,
    '            <div class="feature-copy reveal">',
    `              <span class="tag ${matrix ? 'matrix' : 'soft'}" data-i18n="projects.${p.slug}.badge">${esc(p.badge.en)}</span>`,
    `              <h3 data-i18n="projects.${p.slug}.title">${esc(p.title.en)}</h3>`,
    `              <p data-i18n="projects.${p.slug}.desc">${esc(p.desc.en)}</p>`,
    `              ${projMeta(p)}`,
    `              <a class="read-link" ${projLink(p)} data-i18n="projects.${p.slug}.cta">${esc(p.cta.en)}</a>`,
    '            </div>',
    '            <div class="code-art reveal" aria-label="Decorative code illustration">',
    projArt(p),
    '            </div>',
    '          </article>',
  ].join('\n');
};
const projRow = (p, index) =>
  `            <a class="project-row reveal" ${projAttrs(p)} ${projLink(p)}><span class="project-num">${num(index)}</span><div class="project-main"><h3 data-i18n="projects.${p.slug}.title">${esc(p.title.en)}</h3><p data-i18n="projects.${p.slug}.desc">${esc(p.desc.en)}</p>${projMeta(p)}</div><span class="project-link" data-i18n="projects.${p.slug}.cta">${esc(p.cta.en)}</span></a>`;
const projFeaturedHtml = featuredProjects.map(projFeature).join('\n');
const projArchiveHtml = otherProjects.map((p, i) => projRow(p, featuredProjects.length + i + 1)).join('\n');
const projTagHtml = chipButtons('projects.type', projTypes, projects.map((p) => p.tags));
const LIST_END = '\n          </div>\n        </section>';

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
  'notes/trading.html': null,
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
  src = replaceInner(src, '<div data-build="notes-main">', LIST_END, mainHtml);
  src = replaceInner(src, '<div data-build="notes-more">', LIST_END, moreHtml);
  src = replaceInner(src, '<span class="chips-gen" data-build="notes-tags">', '</span>', noteTagHtml);
  src = replaceInner(src, '<div data-build="projects-featured">', LIST_END, projFeaturedHtml);
  src = replaceInner(src, '<div data-build="projects-archive">', LIST_END, projArchiveHtml);
  src = replaceInner(src, '<span class="chips-gen" data-build="projects-tags">', '</span>', projTagHtml);
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
for (const [id, label] of Object.entries(noteTags)) entries.push([`notes.tag.${id}`, label]);
for (const [id, label] of Object.entries(projTypes)) entries.push([`projects.type.${id}`, label]);
for (const [id, label] of Object.entries(projStatus)) entries.push([`projects.status.${id}`, label]);
for (const p of projects) {
  entries.push([`projects.${p.slug}.title`, p.title], [`projects.${p.slug}.desc`, p.desc], [`projects.${p.slug}.cta`, p.cta]);
  if (p.badge) entries.push([`projects.${p.slug}.badge`, p.badge]);
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
