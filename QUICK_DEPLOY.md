# 🚀 Quick Deploy - Copy & Paste Commands

## Step 1: Git Setup (5 commands)

```bash
# 1. Initialize Git
git init

# 2. Add all files
git add .

# 3. First commit
git commit -m "Initial commit: Nebulla note-taking app"

# 4. Set main branch
git branch -M main

# 5. Connect to GitHub (GANTI <USERNAME> dan <REPO-NAME>!)
git remote add origin https://github.com/<USERNAME>/<REPO-NAME>.git

# 6. Push to GitHub
git push -u origin main
```

---

## Step 2: Environment Variables (Copy ke Cloudflare)

**Cloudflare Pages > Settings > Environment Variables**

```
VITE_SUPABASE_URL=https://pmfhdyzamempllqjwGqr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_qAlBMihdWW3Mcq86kOjkoQ_RB7Bnveo
VITE_GEMINI_API_KEY=AIzaSyD5-SaE80K1JgnxQ73boaJx4RmDkz6HawQ
```

---

## Step 3: Cloudflare Build Settings

```
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Node version: 18
```

---

## ✅ Checklist

- [ ] Buat repo GitHub baru
- [ ] Run Git commands di atas
- [ ] Buka Cloudflare Pages
- [ ] Connect GitHub repo
- [ ] Paste environment variables
- [ ] Deploy!

**Deployment URL:** `https://nebulla-xxx.pages.dev`

**Full guide:** Lihat `DEPLOYMENT.md`
