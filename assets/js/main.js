const LANG_KEY = 'arlingkin-lang';
const path = location.pathname.replace(/\/$/, '') || '/';

/* ── translations ─────────────────────────────────────────────── */
const T = {
  'nav.home':     { en:'home',      id:'beranda' },
  'nav.about':    { en:'about',     id:'tentang' },
  'nav.skills':   { en:'skills',    id:'kemampuan' },
  'nav.projects': { en:'projects',  id:'proyek' },
  'nav.stats':    { en:'stats',     id:'statistik' },
  'nav.contact':  { en:'contact',   id:'kontak' },
  'nav.github':   { en:'github ↗',  id:'github ↗' },
  'footer.copy':  { en:'© 2026 Arlingkin. Built with care & plain HTML.', id:'© 2026 Arlingkin. Dibuat dengan sepenuh hati, pakai HTML murni.' },
  'footer.hello': { en:'say hello ↗', id:'sapa saya ↗' },
  'skip.main':    { en:'Skip to content', id:'Lewati ke konten' },

  'err.eyebrow':  { en:'404 / Not found', id:'404 / Tidak ditemukan' },
  'err.h1':       { en:'This page <em>wandered off.</em>', id:'Halaman ini <em>tersesat.</em>' },
  'err.intro':    { en:"The link may be old, mistyped, or moved. Here's where things actually live.", id:'Tautannya mungkin lama, salah ketik, atau sudah pindah. Ini tempat semuanya berada sekarang.' },
  'err.home':     { en:'BACK HOME →', id:'KEMBALI KE BERANDA →' },
  'err.map.label':{ en:'Where to next', id:'Mau ke mana' },
  'err.map.sub':  { en:'pages that do exist', id:'halaman yang benar-benar ada' },
  'err.game.title':{ en:'Lost anyway? Play snake.', id:'Tersesat juga? Main ular.' },
  'err.game.desc': { en:'Matrix-green, vanilla JS, zero ads. Eat, grow, survive.', id:'Hijau Matrix, JS vanilla, tanpa iklan. Makan, tumbuh, bertahan.' },

  /* home */
  'home.eyebrow':      { en:'Personal notes / 2026',   id:'Catatan pribadi / 2026' },
  'home.h1':           { en:'Making sense of <em>code.</em>',  id:'Menerka makna <em>kode.</em>' },
  'home.intro':        { en:'Welcome to my quiet corner of the internet — building things, learning in public, and staying <strong>curious.</strong>', id:'Selamat datang di sudut sepi internet saya — di sini saya membangun sesuatu, belajar di depan publik, dan tetap <strong>penasaran.</strong>' },
  'home.status':       { en:'vibe code, but with <em>human</em> sense', id:'vibe code, tapi tetap pakai akal <em>manusia</em>' },
  'home.latest.label': { en:'01 / LATEST NOTE', id:'01 / CATATAN TERBARU' },
  'home.latest.link':  { en:'view projects',   id:'lihat proyek' },
  'home.latest.tag':   { en:'PERSONAL NOTE',  id:'CATATAN PRIBADI' },
  'home.latest.title': { en:'Learn to code without letting AI do the thinking.', id:'Belajar coding tanpa membiarkan AI memikirkan semuanya untukmu.' },
  'home.latest.desc':  { en:'A few thoughts on keeping your curiosity sharp when the answers arrive instantly.', id:'Sedikit renungan soal tetap peka dan penasaran, padahal jawabannya datang seketika.' },
  'home.latest.read':  { en:'READ THE NOTE →',  id:'BACA CATATAN →' },
  'note2.h1':    { en:'The moment I stopped <em>watching the chart.</em>', id:'Saat saya berhenti <em>menatap chart.</em>' },
  'note2.meta1': { en:'trading / psychology', id:'trading / psikologi' },
  'note2.meta2': { en:'6 min read', id:'6 menit baca' },
  'note2.meta3': { en:'personal log', id:'catatan pribadi' },
  'note2.lead': { en:"There was a point where checking the chart felt like doing the work. It wasn't.", id:'Pernah ada titik ketika mengecek chart terasa seperti sedang bekerja. Padahal tidak.' },
  'note2.p1': { en:'I used to think more screen time meant more opportunities. More candles, more setups, more chances to catch the move. In reality, I was often just feeding my attention to every little movement.', id:'Dulu saya pikir semakin lama di depan layar berarti semakin banyak peluang. Lebih banyak candle, setup, dan kesempatan menangkap pergerakan. Kenyataannya, saya sering hanya menyerahkan perhatian pada setiap gerakan kecil.' },
  'note2.p2': { en:"A setup doesn't become better because I stare at it longer. A loss doesn't become easier because I immediately hunt for the next trade. And a green candle isn't an invitation.", id:'Sebuah setup tidak menjadi lebih bagus hanya karena saya menatapnya lebih lama. Kerugian tidak menjadi lebih ringan hanya karena saya langsung mencari trade berikutnya. Dan candle hijau bukan berarti sebuah undangan.' },
  'note2.quote': { en:'Sometimes the most disciplined thing I can do is <span>close the chart.</span>', id:'Kadang hal paling disiplin yang bisa saya lakukan adalah <span>menutup chart.</span>' },
  'note2.p3': { en:'That changed how I want to trade. I still study structure, liquidity, entries and risk. But I want the process to survive even when the screen is off. The goal is not to predict every move. The goal is to know my setup, define the invalidation, take the risk I can actually accept, and walk away.', id:'Itu mengubah cara saya ingin trading. Saya tetap belajar structure, liquidity, entry, dan risk. Tapi saya ingin prosesnya tetap berjalan meski layar mati. Tujuannya bukan memprediksi semua gerakan. Tujuannya memahami setup, menentukan invalidation, mengambil risiko yang benar-benar bisa saya terima, lalu pergi.' },
  'note2.p4': { en:"For me, stepping away isn't wasted time. It's part of the system. There is school, prayer, family, exercise, coding, and simply being a person outside the candles. A trading plan that requires me to watch every second is not freedom yet.", id:'Buat saya, menjauh sejenak bukan waktu yang terbuang. Itu bagian dari sistem. Ada sekolah, ibadah, keluarga, olahraga, coding, dan kehidupan sebagai manusia di luar candle. Trading plan yang mengharuskan saya menonton setiap detik belum benar-benar menjadi kebebasan.' },
  'note2.p5': { en:"I'm still learning this. Some days I break my own rule and come back to the screen too quickly. The difference now is that I notice it — and I can reset before one bad decision turns into a whole session.", id:'Saya masih belajar soal ini. Beberapa hari saya masih melanggar aturan sendiri dan kembali ke layar terlalu cepat. Bedanya sekarang, saya menyadarinya — dan bisa reset sebelum satu keputusan buruk berubah menjadi satu sesi penuh.' },
  'note2.back': { en:'← back to projects', id:'← kembali ke proyek' },
  'home.where.label':  { en:'02 / WHERE I AM',  id:'02 / DI MANA SAYA' },
  'home.where.sub':    { en:'based in indonesia, building on the web', id:'tinggal di indonesia, berkarya di web' },
  'home.about.tag':    { en:'ABOUT · 01', id:'TENTANG · 01' },
  'home.about.title':  { en:"Hi, I'm Arlingga", id:'Hai, saya Arlingga' },
  'home.about.desc':   { en:'Web dev, frontend + backend, devops, AI engineering. Follow the journey.', id:'Web dev, frontend + backend, devops, AI engineering — ikuti terus perjalanannya.' },
  'home.skills.tag':   { en:'SKILLS · 02', id:'KEAHLIAN · 02' },
  'home.skills.title': { en:'The toolbox', id:'Kotak perkakas' },
  'home.skills.desc':  { en:'JS, Python, Java, Tailwind, NextJS, Firebase, Supabase & more.', id:'JS, Python, Java, Tailwind, NextJS, Firebase, Supabase & masih banyak lagi.' },
  'home.stats.tag':    { en:'STATS · 03', id:'STATISTIK · 03' },
  'home.stats.title':  { en:'Shipping in public', id:'Berkarya di depan publik' },
  'home.stats.desc':   { en:'Live GitHub metrics, streaks, and the little automation behind them.', id:'Metrik GitHub langsung, deretan streak, dan otomasi kecil yang menyokong semuanya.' },
  'home.now.label':    { en:'03 / RIGHT NOW', id:'03 / SEKARANG' },
  'home.now.h2':       { en:'A few things<br>I\'m <em>into.</em>', id:'Beberapa hal<br>yang saya <em>gemari.</em>' },
  'home.now.1':        { en:'Working on a personal project — one careful feature at a time.', id:'Mengerjakan proyek pribadi — pelan-pelan, satu langkah setiap kalinya.' },
  'home.now.2':        { en:'Studying JavaScript, CSS & HTML the slow, hands-on way.', id:'Belajar JavaScript, CSS & HTML secara santai, sambil langsung praktik.' },
  'home.now.3':        { en:'Trying to make the web feel more personal again.', id:'Berusaha bikin web terasa lebih personal lagi.' },
  'home.now.4':        { en:"Ask me about blue — it's my favorite color.", id:'Tanya soal warna biru — itu favoritku.' },
  'home.toolbox.sub':  { en:'things I build with', id:'alat yang saya gunakan untuk berkarya' },
  'proj.note2.title': { en:'Personal Note — The moment I stopped watching the chart.', id:'Catatan Pribadi — Saat saya berhenti menatap chart.' },
  'proj.note2.desc':  { en:'A note about trading, screen time, and learning that stepping away is part of the process.', id:'Catatan tentang trading, waktu di depan layar, dan belajar bahwa menjauh sejenak juga bagian dari proses.' },
  'proj.note2.link':  { en:'READ NOTE →', id:'BACA CATATAN →' },

  /* about */
  'about.eyebrow':    { en:'01 / About me', id:'01 / Tentang saya' },
  'about.h1':         { en:"Hi, I'm<br><em>Arlingga.</em>", id:'Hai, saya<br><em>Arlingga.</em>' },
  'about.intro':      { en:'Web development across the whole stack — frontend, backend, devops, and AI engineering. Vibes of a maker, instincts of a human.', id:'Web development di semua lini — frontend, backend, devops, sampai AI engineering. Jiwa seorang maker, naluri seorang manusia.' },
  'about.lead':       { en:'I build for the web and learn <em>in public.</em>', id:'Saya membangun untuk web dan belajar <em>di depan umum.</em>' },
  'about.p1':         { en:"I'm a developer based in Indonesia 🇮🇩, working across frontend, backend, devops and AI engineering. Right now I'm active on a personal project, and studying JavaScript, CSS and HTML the slow, hands-on way — because that's how ideas stick.", id:'Saya pengembang yang tinggal di Indonesia 🇮🇩, menggarap frontend, backend, devops, sampai AI engineering. Sekarang ini saya lagi fokus ke proyek pribadi dan belajar JavaScript, CSS, dan HTML secara pelan-pelan sambil praktik langsung — soalnya gitu ilmunya beneran nempel.' },
  'about.p2':         { en:"I believe in shipping small, keeping things simple, and making the web feel personal again. Also — blue is my favorite color, in case you need conversation fuel.", id:'Saya percaya sama kemajuan kecil, kesederhanaan, dan web yang terasa personal lagi. Oh iya — biru itu warna favorit saya, kalau butuh bahan obrolan.' },
  'about.fact.loc':   { en:'location', id:'lokasi' },
  'about.fact.locv':  { en:'Indonesia 🇮🇩', id:'Indonesia 🇮🇩' },
  'about.fact.stat':  { en:'status', id:'status' },
  'about.fact.statv': { en:'active', id:'aktif' },
  'about.fact.work':  { en:'working on', id:'mengerjakan' },
  'about.fact.workv': { en:'personal project', id:'proyek pribadi' },
  'about.fact.open':  { en:'open to', id:'terbuka untuk' },
  'about.fact.openv': { en:'collaborate', id:'berkolaborasi' },
  'about.fact.col':   { en:'favorite color', id:'warna favorit' },
  'about.fact.colv':  { en:'blue 💙', id:'biru 💙' },
  'about.fact.em':    { en:'email', id:'email' },
  'about.fact.emv':   { en:'linggasaja03@gmail.com', id:'linggasaja03@gmail.com' },
  'about.now.label':  { en:'Now', id:'Sekarang' },
  'about.now.h2':     { en:'Currently<br><em>doing.</em>', id:'Saat ini<br><em>sedang dikerjakan.</em>' },
  'about.now.1':      { en:'Building little web experiments with vanilla JavaScript.', id:'Membuat banyak eksperimen web kecil pakai JavaScript vanilla.' },
  'about.now.2':      { en:'Keeping a personal project alive, one careful feature at a time.', id:'Merawat sebuah proyek pribadi agar tetap hidup, fitur demi fitur dengan hati-hati.' },
  'about.now.3':      { en:'Learning the fundamentals before reaching for frameworks.', id:'Belajar fundamental dulu sebelum menyentuh framework.' },
  'about.now.4':      { en:'Looking to collaborate on modern website production.', id:'Terbuka untuk kolaborasi bikin website modern bareng.' },

  /* skills */
  'skills.eyebrow':  { en:'02 / Skills', id:'02 / Keahlian' },
  'skills.h1':       { en:'The <em>toolbox.</em>', id:'Kotak <em>perkakas</em> saya.' },
  'skills.intro':    { en:'A growing collection of languages, frameworks and tools I reach for — and keep getting better at.', id:'Kumpulan bahasa, framework, dan tool yang terus saya pakai dan dalami — makin hari makin matang.' },
  'skills.lang.lbl': { en:'Languages', id:'Bahasa' },
  'skills.lang.sub': { en:'the core', id:'bagian inti' },
  'skills.js.title': { en:'JavaScript', id:'JavaScript' },
  'skills.js.desc':  { en:'Scripting, DOM, ES modules.', id:'Scripting, DOM, ES modules.' },
  'skills.py.title': { en:'Python', id:'Python' },
  'skills.py.desc':  { en:'Logic, automation, tooling.', id:'Logika, otomasi, dan tooling.' },
  'skills.jv.title': { en:'Java', id:'Java' },
  'skills.jv.desc':  { en:'Object-oriented fundamentals.', id:'Dasar-dasar object-oriented.' },
  'skills.html.title': { en:'HTML5', id:'HTML5' },
  'skills.html.desc':  { en:'Semantic, accessible markup.', id:'Markup semantik dan ramah akses.' },
  'skills.fe.lbl':   { en:'Frontend', id:'Frontend' },
  'skills.fe.sub':   { en:'looks & feel', id:'tampilan & nuansa' },
  'skills.tw.title': { en:'TailwindCSS', id:'TailwindCSS' },
  'skills.tw.desc':  { en:'Utility-first styling.', id:'Styling ala utility-first.' },
  'skills.nx.title': { en:'NextJS', id:'NextJS' },
  'skills.nx.desc':  { en:'React-based web apps.', id:'Aplikasi web berbasis React.' },
  'skills.css.title': { en:'CSS', id:'CSS' },
  'skills.css.desc':  { en:'Layout, animation, design.', id:'Layout, animasi, dan desain.' },
  'skills.vsc.title': { en:'VS Code', id:'VS Code' },
  'skills.vsc.desc':  { en:'My daily driver editor.', id:'Editor andalan sehari-hari.' },
  'skills.bp.lbl':   { en:'Backend & Platform', id:'Backend & Platform' },
  'skills.bp.sub':   { en:'ship & run', id:'men-deploy & menjalankan' },
  'skills.fb.title': { en:'Firebase', id:'Firebase' },
  'skills.fb.desc':  { en:'Hosting, auth, realtime data.', id:'Hosting, auth, dan data realtime.' },
  'skills.sb.title': { en:'Supabase', id:'Supabase' },
  'skills.sb.desc':  { en:'Postgres as a service.', id:'Postgres sebagai layanan.' },
  'skills.git.title': { en:'Git', id:'Git' },
  'skills.git.desc':  { en:'Version control & workflows.', id:'Kontrol versi & alur kerja.' },
  'skills.dc.title': { en:'DevOps', id:'DevOps' },
  'skills.dc.desc':  { en:'Deployment, CI/CD, infra.', id:'Deployment, CI/CD, dan infra.' },
  'skills.tools':     { en:'Quick tools index', id:'Indeks tool cepat' },
  'skills.tools.sub': { en:'tap any icon for the docs', id:'ketuk ikon mana pun untuk dokumentasi' },

  /* projects */
  'proj.eyebrow':    { en:'03 / Projects', id:'03 / Proyek' },
  'proj.h1':         { en:'Built, <em>shipping.</em>', id:'Dibuat, <em>langsung rilis.</em>' },
  'proj.intro':      { en:"Things I've made while learning in public — from school projects to small experiments that keep the curiosity sharp.", id:'Semua yang saya buat sambil belajar di depan publik — dari proyek sekolah sampai eksperimen kecil yang bikin penasaran terus.' },
  'proj.feat.label': { en:'Featured', id:'Unggulan' },
  'proj.feat.sub':   { en:'currently the main quest', id:'sekarang jadi misi utama' },
  'proj.feat.tag':   { en:'SCHOOL PROJECT · LIVE', id:'PROYEK SEKOLAH · LIVE' },
  'proj.feat.desc':  { en:"A web project I'm building and maintaining one careful feature at a time — from data to layout to deployment.", id:'Proyek web yang saya garap pelan-pelan, fitur demi fitur — mulai dari data, layout, sampai dideploy.' },
  'proj.feat.link':  { en:'VISIT SITE →', id:'KUNJUNGI SITUS →' },
  'proj.feat2.tag':  { en:'GAME · MATRIX', id:'GAME · MATRIX' },
  'proj.arch.label': { en:'From the archive', id:'Dari arsip' },
  'proj.arch.sub':   { en:'small observations, small builds', id:'build kecil, temuan kecil' },
  'proj.a1.title':   { en:'This portfolio — arlingkin', id:'Portofolio ini — arlingkin' },
  'proj.a1.desc':    { en:'A quiet corner of the internet built with care & plain HTML. Multi-page, clean URLs, dark notebook aesthetic.', id:'Sudut internet yang tenang, dibuat dengan teliti & HTML murni. Multi-halaman, URL rapi, nuansa buku catatan gelap.' },
  'proj.a2.title':   { en:'School project — nufabase', id:'Proyek sekolah — nufabase' },
  'proj.a2.desc':    { en:'The main quest. Building the small version first and letting it grow feature by feature.', id:'Ini misi utamaku. Mulai dari versi kecil dulu, lalu dibiarkan tumbuh, fitur demi fitur.' },
  'proj.a3.title':   { en:'Web experiments', id:'Eksperimen web' },
  'proj.a3.desc':    { en:'Little vanilla JavaScript builds, streak automations, and GitHub metrics — the sandbox where I play.', id:'Eksperimen JavaScript vanilla, otomasi streak, dan metrik GitHub — di sinilah saya main-main kode.' },
  'proj.a4.title':   { en:'About repo (this site)', id:'Repo about (situs ini)' },
  'proj.a4.desc':    { en:'Open source, MIT licensed. Learn to code without letting AI do the thinking.', id:'Open source, berlisensi MIT. Tempat belajar coding tanpa menyerahkan semua pemikiran ke AI.' },
  'proj.a4.link':    { en:'SOURCE ↗', id:'SUMBER ↗' },
  'proj.a5.title':   { en:'Snake-game — matrix edition', id:'Snake-game — edisi matrix' },
  'proj.a5.desc':    { en:"The classic snake game with a glow of Matrix rain. Guide the snake, eat the food, grow longer — and try not to hit the wall. Pure vanilla JS on a neon green grid.", id:'Game ular klasik yang dihiasi nuansa hujan Matrix. Gerakkan ularnya, makan makanannya, badanmu makin panjang — dan jangan sampai nabrak tembok. Dikerjakan murni dengan JavaScript vanilla di atas grid hijau menyala.' },
  'proj.a5.tag':     { en:'GAME · MATRIX', id:'GAME · MATRIX' },
  'proj.a5.link':    { en:'PLAY THE GAME →', id:'MAINKAN GAME →' },
  'proj.a6.title':   { en:'Project — data limit', id:'Proyek — batas data' },
  'proj.a6.desc':    { en:"The latest one — an Android app that keeps your daily data allowance (kuota) in check. Grab the newest APK straight from the GitHub pre-releases.", id:'Yang terbaru — aplikasi Android buat menjaga pemakaian data/kuota harianmu. Ambil APK terbarunya langsung dari pre-release GitHub.' },
  'proj.a6.link':    { en:'GET PRE-RELEASES →', id:'AMBIL PRE-RELEASE →' },
  'proj.opencode.title': { en:'OpenCode', id:'OpenCode' },
  'proj.opencode.desc':  { en:'An open-source AI coding agent for the terminal — built to help you code, inspect, and ship with control.', id:'AI coding agent open-source untuk terminal — membantu coding, inspeksi, dan rilis dengan kontrol tetap di tanganmu.' },
  'proj.opencode.link':  { en:'VISIT OPENCODE →', id:'KUNJUNGI OPENCODE →' },
  'proj.a5.archive.title': { en:'Snake-game — matrix edition', id:'Snake-game — edisi Matrix' },
  'proj.a5.archive.desc':  { en:'A compact Matrix-themed browser game built with vanilla JavaScript — a small experiment in game logic, animation, and interaction.', id:'Game browser bertema Matrix yang ringkas dengan vanilla JavaScript — eksperimen kecil dalam logika game, animasi, dan interaksi.' },
  'skills.oc.title': { en:'OpenCode', id:'OpenCode' },
  'skills.oc.desc': { en:'AI coding agent for terminal workflows.', id:'AI coding agent untuk alur kerja coding di terminal.' },

  /* stats */
  'stats.eyebrow':    { en:'04 / GitHub stats', id:'04 / Statistik GitHub' },
  'stats.h1':         { en:'Shipping <em>in public.</em>', id:'Berkarya <em>di depan publik.</em>' },
  'stats.intro':      { en:'Live metrics rendered fresh on every push — this page is generated by the same automation that powers the repo README.', id:'Metrik yang selalu segar setiap kali ada push — halaman ini digerakkan oleh otomasi yang sama dengan yang ada di README repo.' },
  'stats.live.lbl':   { en:'Live metrics', id:'Metrik langsung' },
  'stats.live.sub':   { en:'auto-updated by github actions', id:'diperbarui otomatis oleh github actions' },
  'stats.streak.lbl': { en:'Current streak', id:'Streak saat ini' },
  'stats.streak.sub': { en:'updated daily', id:'diperbarui setiap hari' },
  'stats.auto1.desc': { en:'A scheduled GitHub Action that compiles my activity into <span class="kbd">github-metrics.svg</span> on every commit.', id:'Sebuah GitHub Action terjadwal yang merangkum aktivitas saya menjadi <span class="kbd">github-metrics.svg</span> setiap kali ada commit.' },
  'stats.auto2.desc': { en:'A live streak card — maintenance means momentum. Badge data comes from the streak API on each run.', id:'Kartu streak langsung — rajin itu segalanya. Data badge diambil dari streak API setiap kali dijalankan.' },
  'stats.auto3.desc': { en:'A small Python script in the repo that keeps the streak automation fed and fresh.', id:'Skrip Python kecil di repo ini yang menjaga otomasi streak tetap hidup dan segar.' },

  /* contact */
  'contact.eyebrow':    { en:'05 / Contact', id:'05 / Kontak' },
  'contact.h1':         { en:'Say <em>hello.</em>', id:'Tinggalkan <em>halo.</em>' },
  'contact.intro':      { en:'Open to collaboration on modern website production, questions about code, or just a chat — especially about blue. 💙', id:'Terbuka untuk kolaborasi bikin website modern, tanya-tanya soal kode, atau sekadar ngobrol — apalagi kalau bahas warna biru. 💙' },
  'contact.email.desc': { en:'For work, projects, or collaboration. I usually reply within a couple of days.', id:'Untuk kerja, proyek, atau kolaborasi. Biasanya saya balas dalam beberapa hari.' },
  'contact.email.btn':  { en:'copy email', id:'salin email' },
  'contact.gh.desc':    { en:'Code, experiments, and everything I ship in public.', id:'Kode, eksperimen, dan semua yang saya rilis di depan publik.' },
  'contact.ig.desc':    { en:'Life behind the code and occasional project peeks.', id:'Keseharian di balik layar kode, plus selintas soal proyek.' },
  'contact.tt.desc':    { en:'Short clips, build stories, and the occasional hot take.', id:'Klip singkat, cerita proses bikin, dan opini yang kadang menohok.' },
  'contact.yt.desc':    { en:'Longer form: tutorials, walkthroughs, and learning in public.', id:'Durasi panjang: tutorial, walkthrough, dan belajar bareng di depan umum.' },
  'contact.tg.desc':    { en:'Quick messages, direct and casual.', id:'Pesan singkat, langsung dan santai.' },
  'contact.coffee.desc':{ en:'If anything here helped or inspired you, a coffee keeps the experiments going.', id:'Kalau ada yang bermanfaat atau menginspirasimu di sini, segelas kopi bikin eksperimen-eksperimen ini tetap jalan.' },
};

/* ── language ─────────────────────────────────────────────────── */
function getLang() { return localStorage.getItem(LANG_KEY) || 'en'; }

function applyLang(lang) {
  document.documentElement.setAttribute('data-lang', lang);
  localStorage.setItem(LANG_KEY, lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const entry = T[key];
    if (!entry) return;

    // About fact labels keep their configurable value in a nested <b> element.
    // Build that value as text so injected repository variables are displayed
    // safely and survive each language switch.
    const factValue = T[`${key}v`];
    if (key.startsWith('about.fact.') && factValue) {
      el.textContent = entry[lang] || entry.en;
      const value = document.createElement('b');
      value.textContent = factValue[lang] || factValue.en;
      el.append(value);
      return;
    }
    el.innerHTML = entry[lang] || entry.en;
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle('on', active);
    btn.setAttribute('aria-pressed', String(active));
  });
  /* update <html lang> */
  document.documentElement.lang = lang === 'id' ? 'id' : 'en';
}

function initLangSwitch() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
}

/* ── site config (CI-injectable overrides) ────────────────────── */
function applyConfig() {
  const c = window.SITE_CONFIG;
  if (!c) return;
  // An unset GitHub variable leaves its __SITE_*__ alias in site-config.js.
  // Treat it (and null / blank values) as absent so the existing About copy
  // remains visible rather than exposing an alias or an empty fact value.
  const valueOrDefault = (value, fallback) => {
    if (typeof value !== 'string') return fallback;
    const valueTrimmed = value.trim();
    return valueTrimmed && !valueTrimmed.startsWith('__') ? valueTrimmed : fallback;
  };
  const esc = s => s.replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
  const override = (key, value) => {
    const v = valueOrDefault(value, null);
    if (v !== null) T[key] = { en: esc(v), id: esc(v) };
  };
  override('home.eyebrow', c.role);
  override('home.status', c.tagline);
  [1, 2, 3, 4].forEach(n => override(`home.now.${n}`, c[`now_${n}`]));
  Object.assign(T, {
    'about.fact.locv':  { en: valueOrDefault(c.location,       T['about.fact.locv'].en),  id: valueOrDefault(c.location,       T['about.fact.locv'].id)  },
    'about.fact.statv': { en: valueOrDefault(c.status,         T['about.fact.statv'].en), id: valueOrDefault(c.status,         T['about.fact.statv'].id) },
    'about.fact.workv': { en: valueOrDefault(c.working_on,     T['about.fact.workv'].en), id: valueOrDefault(c.working_on,     T['about.fact.workv'].id) },
    'about.fact.openv': { en: valueOrDefault(c.open_to,        T['about.fact.openv'].en), id: valueOrDefault(c.open_to,        T['about.fact.openv'].id) },
    'about.fact.colv':  { en: valueOrDefault(c.favorite_color, T['about.fact.colv'].en),  id: valueOrDefault(c.favorite_color, T['about.fact.colv'].id)  },
    'about.fact.emv':   { en: valueOrDefault(c.email,          T['about.fact.emv'].en),   id: valueOrDefault(c.email,          T['about.fact.emv'].id)   },
  });
}

/* ── nav ──────────────────────────────────────────────────────── */
function setActiveNav() {
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('http')) return;
    const target = href.split('#')[0];
    if ((path === '/' && target === '/') || (path !== '/' && path === target)) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

/* ── reveal ───────────────────────────────────────────────────── */
function revealOnScroll() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => {
    if (el.dataset.delay) el.style.setProperty('--d', `${el.dataset.delay}ms`);
    io.observe(el);
  });
}

/* ── copy email ───────────────────────────────────────────────── */
function initCopyEmail() {
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const val = btn.getAttribute('data-copy');
      try { await navigator.clipboard.writeText(val); } catch {
        const t = document.createElement('textarea');
        t.value = val; document.body.appendChild(t); t.select();
        document.execCommand('copy'); t.remove();
      }
      const orig = btn.textContent;
      btn.textContent = 'copied ✓';
      setTimeout(() => { btn.textContent = orig; }, 1600);
    });
  });
}

/* ── backdrop parallax ────────────────────────────────────────── */
function initBgParallax() {
  const finePointer = matchMedia('(pointer: fine)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!finePointer.matches || reduced.matches) return;

  const root = document.documentElement.style;
  let raf = null, mx = 0, my = 0;

  const apply = () => {
    root.setProperty('--mx', `${mx}px`);
    root.setProperty('--my', `${my}px`);
    raf = null;
  };
  const onMove = e => {
    mx = (e.clientX / innerWidth - .5) * 30;
    my = (e.clientY / innerHeight - .5) * 30;
    if (raf === null) raf = requestAnimationFrame(apply);
  };
  const onLeave = () => {
    mx = 0; my = 0;
    if (raf === null) raf = requestAnimationFrame(apply);
  };

  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('pointerleave', onLeave, { passive: true });

  reduced.addEventListener('change', e => {
    if (!e.matches) return;
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerleave', onLeave);
    if (raf !== null) cancelAnimationFrame(raf);
    root.setProperty('--mx', '0px');
    root.setProperty('--my', '0px');
  });
}

/* ── boot ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initBgParallax();
  applyConfig();
  revealOnScroll();
  initCopyEmail();
  initLangSwitch();
  applyLang(getLang());
  initNoteTypography();
}, { once: true });


/* ── dynamic note typography ─────────────────────────────────── */
function initNoteTypography() {
  const targets = document.querySelectorAll('[data-note-fonts]');
  if (!targets.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let index = 0, timer = null;
  const tick = () => {
    targets.forEach(el => {
      el.classList.remove('note-font-0','note-font-1','note-font-2','note-font-3','note-font-4');
      el.classList.add(`note-font-${index}`);
      el.classList.toggle('font-shifted', index % 2 === 1);
    });
    index = (index + 1) % 5;
  };
  const start = () => { if (timer === null) timer = setInterval(tick, 3600); };
  const stop = () => { clearInterval(timer); timer = null; };
  tick();
  start();
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  addEventListener('pagehide', stop, { once: true });
}
