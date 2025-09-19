# DOCX Viewer & Editor (Static Web, GitHub Pages Ready)

Website statis berbasis HTML/CSS/JS untuk membuka, melihat, mengedit, dan mengekspor dokumen Word (.docx).
Semua berjalan di sisi klien (tanpa server). Cocok untuk GitHub Pages.

## Fitur
- Buka `.docx` dari komputer (file picker & drag-drop) atau dari URL (butuh CORS).
- Preview hasil konversi DOCX → HTML (menggunakan Mammoth).
- Edit WYSIWYG (Quill): bold, italic, underline, heading, list, align, link, image.
- Ekspor: **DOCX (mapping HTML→docx)**, **PDF** (html2pdf), **HTML**.
- Auto-save ke `localStorage` tiap 5 detik, tombol Clear Draft.
- Tema gelap/terang.

## Cara Pakai (Lokal)
1. Buka `index.html` di browser modern (Chrome/Edge/Firefox).
2. Klik **Buka Dokumen** atau tarik-lepas file `.docx` ke area drop.
3. Edit di tab **Edit**. Lihat di **Preview**.
4. Ekspor via tombol **Export DOCX/PDF/HTML**.

> Catatan: Memuat dari **URL** hanya bisa jika server asal mengizinkan **CORS**.

## Deploy ke GitHub Pages
1. Push folder proyek ke GitHub.
2. Settings → Pages → pilih branch `main` dan folder root.
3. Akses halaman sesuai URL GitHub Pages repo Anda.

## Batasan & Catatan Teknis
- Fidelity konversi dari Word tidak 100% (fitur kompleks seperti header/footer, footnote, section break, style kustom belum didukung).
- Ekspor DOCX saat ini mendukung: paragraf, heading (h1–h3), **bold/italic/underline**, list bertingkat (maks 3 level), tabel sederhana, dan **gambar base64** (default Quill saat insert image).
- Jika **library docx** gagal termuat (kendala CDN), perbarui URL CDN di `index.html` atau gunakan bundling manual.
