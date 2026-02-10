# 🌌 Nebulla - Hybrid AI Workspace

**Nebulla** adalah aplikasi produktivitas "Hybrid Note-taking" yang menjembatani kesenjangan antara catatan tulisan tangan (Digital Ink) dan dokumen terstruktur (Block-based Editor). Ditenagai oleh **Google Gemini 2.0/1.5**, Nebulla memahami konteks catatan Anda, membantu riset akademis, hingga menyelesaikan persamaan matematika dari tulisan tangan.

![Nebulla Banner](https://placehold.co/1200x400/1313ec/ffffff?text=Nebulla+Workspace)

## ✨ Fitur Utama

*   **Hybrid Editor:** Gabungkan blok teks, kode, tabel, dan kanvas tulisan tangan dalam satu halaman.
*   **Multimodal AI:**
    *   `/ai-search`: Cari referensi akademis (Grounding with Google Search).
    *   `/ai-math`: Selesaikan soal matematika kompleks dan render ke LaTeX.
    *   **Handwriting OCR:** Ubah sketsa atau tulisan tangan di iPad menjadi teks digital.
    *   **Veo Video Gen:** Animasi diagram statis menjadi video penjelasan.
*   **Organisasi Cerdas:** Folder dinamis, tagging, dan pencarian global.
*   **Template Gallery:** Template siap pakai untuk Mahasiswa, Developer, dan Creative.
*   **Lokal & Privat:** Data tersimpan di browser (Local Storage) untuk privasi maksimal.

---

## 🛠️ Prasyarat

Pastikan Anda telah menginstal perangkat lunak berikut:

*   [Node.js](https://nodejs.org/) (Versi 18 atau lebih baru disarankan)
*   [npm](https://www.npmjs.com/) (Biasanya sudah terinstall bersama Node.js)

---

## 🚀 Instalasi & Menjalankan (Local Development)

Ikuti langkah-langkah ini untuk menjalankan Nebulla di komputer Anda:

### 1. Clone atau Unduh Project
Ekstrak folder project Nebulla ke direktori pilihan Anda.

### 2. Install Dependencies
Buka terminal/command prompt, arahkan ke folder project, dan jalankan perintah berikut untuk mengunduh pustaka yang dibutuhkan (React, Vite, Google GenAI SDK, dll):

```bash
npm install
```

### 3. Konfigurasi API Key (PENTING)
Nebulla membutuhkan API Key dari Google Gemini agar fitur AI dapat berfungsi.

1.  Kunjungi [Google AI Studio](https://aistudio.google.com/).
2.  Buat API Key baru (pastikan memilih project yang memiliki billing aktif jika ingin menggunakan fitur Veo/Video, namun tier gratis cukup untuk teks/chat).
3.  Di folder root project Nebulla, buat file baru bernama `.env`.
4.  Masukkan konfigurasi berikut ke dalam file `.env`:

```env
API_KEY=tempelkan_api_key_google_anda_disini
```

> **Catatan:** Jangan gunakan tanda kutip. Pastikan tidak ada spasi di sekitar tanda sama dengan.

### 4. Jalankan Aplikasi
Mulai server pengembangan lokal:

```bash
npm run dev
```

Akses aplikasi melalui browser di alamat yang muncul di terminal, biasanya:
`http://localhost:5173`

---

## 🎮 Cara Menggunakan

### Slash Commands
Ketik `/` di editor untuk memunculkan menu perintah cepat:
*   `/h1`, `/todo`, `/table` : Format dasar.
*   `/ai-search [query]` : Riset topik.
*   `/ai-brainstorm` : Cari ide.

### Menggunakan Apple Pencil / Stylus
1.  Klik tombol **"Draw"** di floating toolbar atau cukup mulai menulis jika menggunakan iPad.
2.  Nebulla akan membuat lapisan *overlay* di atas catatan Anda.
3.  Berhenti menulis sejenak, dan Nebulla akan secara cerdas mengubah coretan Anda menjadi "Ink Block" yang menyatu dengan teks.

### Mengubah Tulisan Tangan ke Teks (OCR)
1.  Klik pada **Ink Block** yang berisi tulisan tangan.
2.  Klik tombol **"Convert to Text"**.
3.  AI akan membaca tulisan Anda dan mengubahnya menjadi blok teks yang dapat diedit.

---

## 🏗️ Teknologi

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI SDK:** Google GenAI SDK (`@google/genai`)
*   **Math Rendering:** KaTeX
*   **Icons:** Material Symbols

---

**Dibuat untuk Tugas Akhir / Proyek Pribadi oleh Naufal Saputra.**
*Nebulla Core v0.9.2*
