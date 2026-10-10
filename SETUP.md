# Setup Firebase Hosting (multi-site)

1. `npm i -g firebase-tools` lalu `firebase login`
2. Buat project di [console.firebase.google.com](https://console.firebase.google.com)
3. Di Firebase Console → Hosting, buat 2 site: satu untuk domain utama, satu untuk subdomain
4. Jalankan dari root repo ini:
   ```
   firebase target:apply hosting main <site-id-domain-utama>
   firebase target:apply hosting app <site-id-subdomain>
   firebase deploy --only hosting
   ```
5. Hubungkan custom domain di Hosting → Add custom domain untuk masing-masing site

## CI/CD (GitHub Actions)

Repo sudah berisi 2 workflow di `.github/workflows/`, aktif tiap push ke `main` dan bisa
dijalankan manual via tab **Actions → Run workflow**.

### Deploy otomatis ke Firebase Hosting
1. Jalankan sekali `firebase login:ci` lalu salin tokennya.
2. Buka repo GitHub → **Settings → Secrets and variables → Actions**.
3. Tambah secret `FIREBASE_TOKEN` dengan nilai token dari `login:ci`.
4. Workflow `firebase-hosting.yml` akan menjalankan `firebase deploy --only hosting`.

### Deploy otomatis ke GitHub Pages
1. Buka repo GitHub → **Settings → Pages** → Source pilih **GitHub Actions**.
2. Workflow `github-pages.yml` menggunakan environment `github-pages` dan
   action resmi `deploy-pages`. Tidak perlu secret tambahan.
3. Setelah deploy pertama, situs tampil di `https://<username>.github.io/about/`.

## Routing (clean URLs)

Site utama adalah multi-halaman statis. `firebase.json` memetakan path ke file HTML:

| Route     | File          |
| --------- | ------------- |
| `/`       | `index.html`  |
| `/about`  | `about.html`  |
| `/skills` | `skills.html` |
| `/projects` | `projects.html` |
| `/stats`  | `stats.html`  |
| `/contact`| `contact.html` |

Semua path lain di-rewrite ke `/`. Style bersama ada di `assets/css/style.css`,
script bersama di `assets/js/main.js` (active nav, reveal animation, copy email).

## Deploy otomatis ke Vercel (arlingkin.vercel.app)

Situs utama sekarang memakai **Vercel** (`https://arlingkin.vercel.app`)
dengan clean URLs (`/about`, `/skills`, ...), bukan lagi `arlingkin.web.app`.

1. Pastikan project Vercel bernama **`arlingkin`** ada di akun kamu
   (Import repo `arlingkin/about` di dashboard, rename project jadi `arlingkin`,
   domain otomatis `arlingkin.vercel.app`).
2. Buat token di [vercel.com/account/tokens](https://vercel.com/account/tokens).
3. Buka repo GitHub → **Settings → Secrets and variables → Actions**.
4. Tambah secret **`VERCEL_TOKEN`** dengan nilai token tadi.
5. Workflow `vercel-deploy.yml` (aktif tiap push ke `main`):
   - `vercel link --project arlingkin` → hubungkan ke project `arlingkin`
   - `vercel pull/build/deploy --prod` → deploy ke production

Build memakai `vercel.json` untuk clean URLs dan cache header.

Catatan: direktori `.vercel/` di-ignore (`.gitignore` + `firebase.json`) agar
setting project-scoped Vercel tidak ikut ter-commit atau ter-upload Firebase.

### Mengatur variabel situs (GitHub Actions variables)
Lihat `assets/js/site-config.js`. Override dari GitHub:
**Settings → Secrets and variables → Actions → Variables** dengan alias:
`SITE_LOCATION`, `SITE_STATUS`, `SITE_WORKING_ON`, `SITE_OPEN_TO`,
`SITE_FAV_COLOR`, `SITE_EMAIL`, `SITE_ROLE`, `SITE_TAGLINE`, `SITE_NOW_1..4`.

## Daftar tool, header, footer (generator)

Daftar tool (marquee beranda, kartu skills) dan header/footer
dibuat oleh `scripts/build.mjs`. Hasilnya di-commit, jadi deploy tetap statis.

- Tambah atau ubah tool: edit `data/tools.json`, taruh ikon di `icons/tools/<id>.svg`.
- Ubah header/footer: edit `partials/header.html` atau `partials/footer.html`.
- Jalankan `node scripts/build.mjs`, lalu commit semua file yang berubah.
- `node scripts/build.mjs --check` dipakai CI (`build-check.yml`) dan gagal kalau hasil belum di-commit.
- Ikon dimuat dari `icons/tools/` (lokal; base ada di `data/site.json`). Saat fork, ubah `data/site.json` lalu jalankan build.

## Nilai skill

Edit angka 0-100 di `assets/js/valueskills.js` (kunci = `id` di `data/tools.json`).
Angka saat ini masih acak 56-87 sebagai placeholder.

## Notes, RSS, email

- Daftar catatan ada di `data/notes.json` (`featured: true` = catatan utama). `node scripts/build.mjs` membuat daftar di `/notes`, `feed.xml`, dan kunci i18n judul/deskripsi.
- Halaman catatan baru: salin `notes/trading.html`, tambahkan kunci teksnya di `assets/js/main.js`, lalu tambahkan entri di `data/notes.json` dan `sitemap.xml`.
- Email dirakit di `assets/js/mail.js` (tidak ada alamat mentah di HTML). Ubah alamat di file itu.
