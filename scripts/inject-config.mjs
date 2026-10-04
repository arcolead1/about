import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'assets/js/site-config.js';

const entries = {
  '__SITE_LOCATION__':      process.env.SITE_LOCATION,
  '__SITE_STATUS__':        process.env.SITE_STATUS,
  '__SITE_WORKING_ON__':    process.env.SITE_WORKING_ON,
  '__SITE_OPEN_TO__':       process.env.SITE_OPEN_TO,
  '__SITE_FAV_COLOR__':     process.env.SITE_FAV_COLOR,
  '__SITE_EMAIL__':         process.env.SITE_EMAIL,
  '__SITE_ROLE__':          process.env.SITE_ROLE,
  '__SITE_TAGLINE__':       process.env.SITE_TAGLINE,
  '__SITE_NOW_1__':         process.env.SITE_NOW_1,
  '__SITE_NOW_2__':         process.env.SITE_NOW_2,
  '__SITE_NOW_3__':         process.env.SITE_NOW_3,
  '__SITE_NOW_4__':         process.env.SITE_NOW_4,
};

let src = readFileSync(FILE, 'utf8');
let injected = 0;

for (const [placeholder, val] of Object.entries(entries)) {
  if (!val) continue;
  src = src.split(`'${placeholder}'`).join(JSON.stringify(val));
  injected += 1;
}

writeFileSync(FILE, src);
console.log(`site-config.js injected from ${injected} GitHub variables.`);