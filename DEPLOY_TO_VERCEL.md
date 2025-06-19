# Deploy ke Vercel - Tutorial Lengkap

## API Key Sudah Siap ✅
API key ElevenLabs: `sk_4b8b0d124618ba1dc624db8081859a5ab3684b0304c1b27e` sudah dikonfigurasi.

## Langkah Deploy:

### 1. Push ke GitHub (Jika belum)
```bash
git init
git add .
git commit -m "Ready for Vercel deployment"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

### 2. Deploy di Vercel
1. Buka [vercel.com](https://vercel.com)
2. Login dengan GitHub
3. Klik **"New Project"**
4. Import repository ini
5. Set **Environment Variables**:
   - `ELEVENLABS_API_KEY` = `sk_4b8b0d124618ba1dc624db8081859a5ab3684b0304c1b27e`
   - `VITE_ELEVENLABS_API_KEY` = `sk_4b8b0d124618ba1dc624db8081859a5ab3684b0304c1b27e`
6. Klik **"Deploy"**

### 3. Vercel CLI (Alternatif)
```bash
npm install -g vercel
vercel login
vercel --prod
```

Saat diminta environment variables, masukkan:
- `ELEVENLABS_API_KEY=sk_4b8b0d124618ba1dc624db8081859a5ab3684b0304c1b27e`
- `VITE_ELEVENLABS_API_KEY=sk_4b8b0d124618ba1dc624db8081859a5ab3684b0304c1b27e`

### 4. Manual Upload
1. Build project:
   ```bash
   npm run build
   ```
2. Drag folder `dist/public` ke Vercel dashboard

## Hasil Setelah Deploy:
- Website akan dapat URL `.vercel.app`
- Voice synthesis akan berfungsi
- Semua fitur interactive portfolio aktif
- Global CDN untuk performa cepat

## Test Setelah Deploy:
1. Buka URL Vercel
2. Approach DIVA JUAN
3. Test voice synthesis berfungsi
4. Cek achievement system
5. Test responsive di mobile

Website siap production dengan semua fitur lengkap!