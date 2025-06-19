# Deployment Guide

## Environment Variables

Untuk menjalankan aplikasi ini, Anda perlu mengatur environment variables berikut:

### Required Environment Variables

```bash
# ElevenLabs API Configuration (Optional - untuk text-to-speech)
VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
VITE_ELEVENLABS_DEFAULT_VOICE_ID=dBynzNhvSFj0l1D7I9yV
```

### Cara Mendapatkan ElevenLabs API Key

1. Daftar di [ElevenLabs](https://elevenlabs.io/)
2. Masuk ke dashboard
3. Pergi ke bagian "API Keys"
4. Generate API key baru
5. Copy API key yang dimulai dengan `sk_`

### Setup untuk Deployment

1. **Copy file .env.example ke .env:**
   ```bash
   cp .env .env.local
   ```

2. **Edit file .env dan isi API key:**
   ```bash
   VITE_ELEVENLABS_API_KEY=sk_your_actual_api_key_here
   ELEVENLABS_API_KEY=sk_your_actual_api_key_here
   ```

3. **Build aplikasi:**
   ```bash
   npm install
   npm run build
   ```

4. **Jalankan aplikasi:**
   ```bash
   npm run dev
   ```

### Platform Deployment

#### Vercel
- Upload project ke GitHub
- Connect repository di Vercel
- Tambahkan environment variables di Vercel dashboard

#### Netlify
- Upload project ke GitHub
- Connect repository di Netlify
- Tambahkan environment variables di Netlify dashboard

#### VPS/Server Manual
- Clone repository
- Install dependencies: `npm install`
- Setup environment variables di `.env`
- Build: `npm run build`
- Start: `npm start`

### Catatan Penting

- Jika tidak menggunakan ElevenLabs API key, website akan tetap berfungsi dengan audio lokal
- Pastikan API key tidak pernah di-commit ke repository
- Selalu gunakan HTTPS untuk production deployment