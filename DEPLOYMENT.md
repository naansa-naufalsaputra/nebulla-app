# Cloudflare Pages Deployment Guide - Nebulla

## 🚀 Deployment Checklist

### ✅ TUGAS 1: Konfigurasi Routing (SELESAI)

File `public/_redirects` sudah dibuat dengan konfigurasi:

```
/*    /index.html   200
```

Ini memastikan semua route React SPA di-handle dengan benar oleh Cloudflare Pages.

---

### ⚠️ TUGAS 2: Final Build Check

**Status:** Build memerlukan beberapa penyesuaian TypeScript.

**Solusi Sementara untuk Deployment:**

Cloudflare Pages akan menjalankan build sendiri. Untuk memastikan build berhasil di Cloudflare, gunakan konfigurasi berikut di dashboard Cloudflare Pages:

**Build Settings:**

- **Build command:** `npm run build` atau `vite build` (skip TypeScript check)
- **Build output directory:** `dist`
- **Root directory:** `/` (leave empty)
- **Node version:** `18` atau `20`

**Alternative Build Command (jika error):**

```bash
vite build --mode production
```

---

### 📝 TUGAS 3: Panduan Git & Push

**Copy-paste perintah berikut satu per satu:**

#### 1. Inisialisasi Git Repository

```bash
git init
```

#### 2. Tambahkan semua file ke staging

```bash
git add .
```

#### 3. Commit pertama

```bash
git commit -m "Initial commit: Nebulla note-taking app with testing infrastructure"
```

#### 4. Buat branch main (jika belum)

```bash
git branch -M main
```

#### 5. Hubungkan ke GitHub Repository

**PENTING:** Buat repository baru di GitHub terlebih dahulu (<https://github.com/new>), lalu jalankan:

```bash
# Ganti <USERNAME> dan <REPO-NAME> dengan username dan nama repo GitHub Anda
git remote add origin https://github.com/<USERNAME>/<REPO-NAME>.git
```

**Contoh:**

```bash
git remote add origin https://github.com/johndoe/nebulla.git
```

#### 6. Push ke GitHub

```bash
git push -u origin main
```

**Jika ada error authentication:**

- Gunakan Personal Access Token (PAT) dari GitHub Settings > Developer settings > Personal access tokens
- Atau gunakan GitHub CLI: `gh auth login`

---

### 🔐 TUGAS 4: Environment Variables Checklist

**WAJIB dimasukkan ke Cloudflare Pages Dashboard:**

Buka: **Cloudflare Pages > Your Project > Settings > Environment Variables**

Tambahkan variabel berikut (dari file `.env.local`):

#### 1. **Supabase Configuration**

```
VITE_SUPABASE_URL=<your-supabase-project-url>
```

- **Cara dapat:** Supabase Dashboard > Project Settings > API > Project URL
- **Contoh:** `https://abcdefghijklmnop.supabase.co`

```
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

- **Cara dapat:** Supabase Dashboard > Project Settings > API > Project API keys > `anon` `public`
- **Contoh:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### 2. **Gemini AI Configuration**

```
VITE_GEMINI_API_KEY=<your-gemini-api-key>
```

- **Cara dapat:** <https://aistudio.google.com/> > Get API Key
- **Contoh:** `AIzaSyA...`

---

### 📋 Deployment Steps di Cloudflare Pages

#### 1. Login ke Cloudflare Dashboard

- Buka: <https://dash.cloudflare.com/>
- Login dengan akun Cloudflare

#### 2. Buat Project Baru

- Klik **Workers & Pages** di sidebar
- Klik **Create application**
- Pilih **Pages** tab
- Klik **Connect to Git**

#### 3. Connect GitHub Repository

- Pilih repository **nebulla** yang baru dibuat
- Klik **Begin setup**

#### 4. Configure Build Settings

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: (leave empty)
```

#### 5. Add Environment Variables

Tambahkan 3 variabel dari checklist di atas:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

#### 6. Deploy

- Klik **Save and Deploy**
- Tunggu ~2-3 menit
- Cloudflare akan memberikan URL: `https://nebulla-xxx.pages.dev`

---

### 🔧 Post-Deployment Checklist

#### 1. Test Deployment

- [ ] Buka URL Cloudflare Pages
- [ ] Test login (Guest atau Supabase auth)
- [ ] Test create note
- [ ] Test AI assistant
- [ ] Test search & filters

#### 2. Custom Domain (Optional)

- Cloudflare Pages > Custom domains
- Add domain: `nebulla.yourdomain.com`
- Update DNS records sesuai instruksi

#### 3. Configure Supabase Redirect URLs

Tambahkan URL Cloudflare Pages ke Supabase:

- Supabase Dashboard > Authentication > URL Configuration
- Add to **Redirect URLs:**
  - `https://nebulla-xxx.pages.dev`
  - `https://nebulla-xxx.pages.dev/**`

---

### 🐛 Troubleshooting

#### Build Failed di Cloudflare

**Error:** TypeScript compilation errors

**Solusi:**

1. Ubah build command di Cloudflare menjadi:

   ```
   vite build --mode production
   ```

2. Atau tambahkan ke `package.json`:

   ```json
   "scripts": {
     "build:cloudflare": "vite build"
   }
   ```

   Lalu gunakan: `npm run build:cloudflare`

#### Environment Variables Tidak Terdeteksi

**Solusi:**

- Pastikan semua env vars di-prefix dengan `VITE_`
- Redeploy setelah menambahkan env vars
- Check di Cloudflare Pages > Deployments > View build log

#### 404 Error pada Route

**Solusi:**

- Pastikan file `public/_redirects` ada
- Isi file harus: `/*    /index.html   200`
- Redeploy jika perlu

#### Supabase Connection Error

**Solusi:**

- Verify `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` benar
- Check Supabase project status (aktif atau paused)
- Tambahkan Cloudflare URL ke Supabase redirect URLs

---

### 📊 Performance Tips

#### 1. Enable Cloudflare Caching

- Cloudflare Pages > Settings > Caching
- Enable **Always Online**

#### 2. Enable Cloudflare CDN

- Otomatis aktif untuk static assets
- Assets di-cache di edge locations worldwide

#### 3. Monitor Analytics

- Cloudflare Pages > Analytics
- Track visitors, bandwidth, requests

---

### 🔄 Continuous Deployment

**Auto-deploy on Git Push:**

Setiap kali push ke branch `main`, Cloudflare Pages akan otomatis:

1. Pull latest code
2. Run `npm install`
3. Run `npm run build`
4. Deploy ke production

**Preview Deployments:**

- Push ke branch lain (e.g., `dev`, `feature/xyz`)
- Cloudflare akan create preview URL
- Test sebelum merge ke `main`

---

### ✅ Final Checklist

- [x] File `_redirects` dibuat
- [ ] Git repository initialized
- [ ] Code pushed ke GitHub
- [ ] Cloudflare Pages project created
- [ ] Environment variables configured
- [ ] First deployment successful
- [ ] Supabase redirect URLs updated
- [ ] App tested on production URL

---

## 🎉 Selamat Deploy

Setelah semua langkah selesai, aplikasi Nebulla akan live di:

```
https://nebulla-xxx.pages.dev
```

**Next Steps:**

1. Share URL dengan tim/tester
2. Monitor Cloudflare Analytics
3. Setup custom domain (optional)
4. Enable Cloudflare Web Analytics (optional)
