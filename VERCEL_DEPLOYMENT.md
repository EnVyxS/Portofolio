# Vercel Deployment Guide

## Persiapan Deployment

Website ini telah dioptimasi untuk deployment di Vercel dengan semua fitur tetap berfungsi.

### 1. File yang Telah Dibuat:
- ✅ `vercel.json` - Konfigurasi Vercel
- ✅ `api/elevenlabs.js` - Serverless function untuk ElevenLabs API
- ✅ `api/generate-all-whispers.js` - Serverless function untuk generate whispers
- ✅ API service telah disesuaikan untuk production

### 2. Langkah Deploy ke Vercel:

#### A. Via GitHub (Recommended):
1. **Push code ke GitHub repository**
2. **Buka [vercel.com](https://vercel.com)**
3. **Import project dari GitHub**
4. **Set Environment Variables di Vercel Dashboard:**
   - `VITE_ELEVENLABS_API_KEY` = your_elevenlabs_api_key
   - `ELEVENLABS_API_KEY` = your_elevenlabs_api_key (backup)
5. **Deploy**

#### B. Via Vercel CLI:
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### C. Manual Upload:
1. **Build project locally:**
   ```bash
   npm run build
   ```
2. **Upload `dist/public` folder ke Vercel**

### 3. Konfigurasi Environment Variables:

Di Vercel Dashboard > Project Settings > Environment Variables, tambahkan:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_ELEVENLABS_API_KEY` | your_api_key | Production |
| `ELEVENLABS_API_KEY` | your_api_key | Production |

### 4. Fitur yang Tetap Berfungsi:

- ✅ **Voice Synthesis** - ElevenLabs API via serverless functions
- ✅ **Achievement System** - Local storage based
- ✅ **Audio Playback** - Background music dan sound effects
- ✅ **Interactive Dialog** - Semua controller tetap berfungsi
- ✅ **Document Viewing** - Contract cards dan PDF viewer
- ✅ **Responsive Design** - Mobile dan desktop
- ✅ **Dramatic Effects** - Animations dan transitions
- ✅ **Easter Eggs** - Rick roll dan achievement rewards

### 5. Performance Optimizations:

- **CDN** - Semua assets di-serve via Vercel Edge CDN
- **Caching** - Audio files di-cache untuk efisiensi
- **Compression** - Automatic gzip compression
- **Global Distribution** - Edge locations worldwide

### 6. Monitoring:

Setelah deploy, cek:
- Website loading dengan benar
- Voice synthesis berfungsi (perlu API key)
- Audio playback berfungsi
- Achievement system menyimpan progress
- Responsive design di mobile

### 7. Troubleshooting:

**Jika Voice Synthesis tidak berfungsi:**
- Cek Environment Variables di Vercel Dashboard
- Pastikan API key ElevenLabs valid
- Cek function logs di Vercel Dashboard

**Jika Assets tidak loading:**
- Cek build output di `dist/public`
- Pastikan routing configuration benar

**Jika Ada Error 404:**
- Cek `vercel.json` routing rules
- Pastikan SPA fallback ke `index.html`

## Estimasi Performa Vercel Free Tier:

- **Bandwidth**: 100GB/month (sangat cukup untuk portfolio)
- **Function Executions**: Unlimited dengan fair use
- **Build Time**: 6000 minutes/month
- **Response Time**: <100ms global average

Portfolio ini akan berjalan lancar di free tier Vercel.