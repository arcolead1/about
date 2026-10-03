import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const check = process.argv.includes('--check');
const read = (path) => readFileSync(path, 'utf8');
const data = JSON.parse(read('data/tools.json'));
const byId = new Map(data.tools.map((tool) => [tool.id, tool]));

const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const iconUrl = (tool) => `${data.base}${tool.icon}.svg`;
const monoClass = (tool) => (tool.mono ? ' class="ico-mono"' : '');
const link = (tool) => `href="${tool.url}" target="_blank" rel="noreferrer"`;

const chip = (tool) =>
  `            <a class="tool-chip" ${link(tool)} aria-label="${tool.name}"><img${monoClass(tool)} src="${iconUrl(tool)}" alt="" width="42" height="42"><span>${esc(tool.name)}</span></a>`;

const quick = (tool) =>
  `          <a ${link(tool)} class="icon-card reveal" aria-label="${tool.name}"><img${monoClass(tool)} src="${iconUrl(tool)}" alt="${tool.name}" width="36" height="36"><span>${esc(tool.name)}</span></a>`;

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
    '        <div class="skill-grid">',
    g.tools.map((id) => card(byId.get(id))).join('\n'),
    '        </div>',
  ].join('\n');

const featured = data.featured.map((id) => byId.get(id));

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
  'notes/note-02.html': null,
};

const header = read('partials/header.html').trimEnd();
const footer = read('partials/footer.html').trimEnd();
const activate = (html, href) =>
  href ? html.replace(`<a class="nav-link" href="${href}"`, `<a class="nav-link active" href="${href}"`) : html;

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
  src = replaceInner(src, '<div class="icon-grid" data-build="quick">', '</div>', featured.map(quick).join('\n') + '\n        ');
  src = replaceInner(src, '<section aria-label="Skills grid" data-build="skill-groups">', '</section>', data.groups.map(group).join('\n\n') + '\n      ');
  write(path, src);
}

const entries = [];
for (const g of data.groups) {
  entries.push([`skills.${g.key}.lbl`, g.label], [`skills.${g.key}.sub`, g.sub]);
}
for (const tool of data.tools) {
  entries.push([`skills.${tool.key}.title`, { en: tool.name, id: tool.name }], [`skills.${tool.key}.desc`, tool.desc]);
}
const i18n = `Object.assign(T, {\n${entries.map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`).join('\n')}\n});\n`;
write('assets/js/tools-i18n.js', i18n);

if (changed.length) console.log(`${check ? 'out of date' : 'updated'}: ${changed.join(', ')}`);
else console.log('up to date');
if (check && changed.length) process.exit(1);
