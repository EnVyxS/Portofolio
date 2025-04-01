# Panduan Mengunduh Audio Menggunakan Model ElevenLabs Tertentu

Jika Anda ingin menggunakan model suara ID tertentu dari ElevenLabs untuk semua dialog, ikuti panduan di bawah ini.

## Memahami Model ID
Anda menyebutkan ingin menggunakan model ID "b2FFMFMuLlPlyWk5NuQW". Model ID ini harus digunakan saat membuat request ke API ElevenLabs.

## Opsi 1: Mengunduh Melalui API (Memerlukan Coding)

Jika Anda nyaman dengan coding, Anda dapat menggunakan API ElevenLabs secara langsung:

```javascript
// Contoh kode untuk mengunduh audio dari model tertentu
async function downloadAudio(text, filename, modelId = "b2FFMFMuLlPlyWk5NuQW") {
  try {
    const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + modelId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": "API_KEY_ANDA", // Ganti dengan API key Anda
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate audio");
    }

    const blob = await response.blob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading audio:", error);
  }
}

// Contoh penggunaan:
// downloadAudio("Teks dialog di sini", "dialog_1234567.mp3");
```

## Opsi 2: Mengunduh Melalui Web UI ElevenLabs

ElevenLabs memiliki antarmuka web yang lebih mudah digunakan:

1. Login ke akun ElevenLabs Anda di https://elevenlabs.io
2. Navigasi ke bagian "Text to Speech" atau "Voice Library"
3. Pilih model suara dengan ID "b2FFMFMuLlPlyWk5NuQW" dari daftar suara Anda
   - Jika tidak terlihat, Anda mungkin perlu menambahkannya ke perpustakaan suara Anda terlebih dahulu
4. Masukkan teks dialog di area teks
5. Atur pengaturan suara sesuai preferensi Anda
6. Klik tombol "Generate" untuk membuat audio
7. Unduh file MP3 yang dihasilkan
8. Ganti nama file sesuai dengan nama yang diperlukan (lihat `dialog-download-list.html`)

## Opsi 3: Menggunakan API Endpoint Yang Sudah Dibuat

Aplikasi ini sudah memiliki endpoint API untuk teks-ke-suara di `/api/elevenlabs/text-to-speech`. Jika Anda ingin menggunakan ini:

1. Buat file JavaScript baru bernama `generate-all-audio.js` di folder `client/public` dengan kode berikut:

```javascript
// File: generate-all-audio.js
async function generateAndDownloadAll() {
  const dialogs = [
    "...Didn't ask for company.",
    "Tch... Fire's warm. Always brings strays.",
    // Tambahkan semua dialog di sini...
  ];
  
  function generateSimpleHash(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }
  
  const apiKey = prompt("Masukkan API Key ElevenLabs Anda:");
  if (!apiKey) return;
  
  const voiceId = prompt("Masukkan Voice ID yang ingin digunakan:", "b2FFMFMuLlPlyWk5NuQW");
  if (!voiceId) return;
  
  const results = document.createElement("div");
  results.innerHTML = "<h3>Hasil:</h3>";
  document.body.appendChild(results);
  
  for (let i = 0; i < dialogs.length; i++) {
    const dialog = dialogs[i];
    const hash = generateSimpleHash(dialog);
    const filename = `dialog_${hash}.mp3`;
    
    const status = document.createElement("p");
    status.textContent = `(${i+1}/${dialogs.length}) Menghasilkan: ${filename}...`;
    results.appendChild(status);
    
    try {
      const response = await fetch("/api/elevenlabs/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          text: dialog,
          voice_id: voiceId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.textContent = `Unduh ${filename}`;
      a.style.display = "block";
      a.style.marginBottom = "5px";
      
      status.textContent = `(${i+1}/${dialogs.length}) Berhasil: ${filename}`;
      status.appendChild(document.createElement("br"));
      status.appendChild(a);
      
    } catch (error) {
      status.textContent = `(${i+1}/${dialogs.length}) Gagal: ${filename} - ${error.message}`;
      status.style.color = "red";
    }
    
    // Jeda singkat untuk menghindari rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  const completeMsg = document.createElement("p");
  completeMsg.textContent = "Selesai! Unduh semua file dan pindahkan ke folder client/public/audio/geralt/";
  completeMsg.style.fontWeight = "bold";
  results.appendChild(completeMsg);
}

// Tambahkan tombol ke halaman
const button = document.createElement("button");
button.textContent = "Hasilkan Semua Audio Dialog";
button.style.padding = "10px 20px";
button.style.fontSize = "16px";
button.style.margin = "20px 0";
button.onclick = generateAndDownloadAll;

document.body.innerHTML = `
  <h1>Generator Audio Dialog</h1>
  <p>Klik tombol di bawah untuk mulai menghasilkan semua file audio dialog. Pastikan Anda memiliki API key ElevenLabs yang valid.</p>
`;
document.body.appendChild(button);
```

2. Buka file ini di browser, dan ikuti instruksi di layar

## Catatan Penting

1. **API Key**: Anda memerlukan API key ElevenLabs yang aktif dengan kredit yang cukup
2. **Rate Limits**: ElevenLabs memiliki batasan pada jumlah request yang dapat Anda buat, terutama di paket gratis
3. **Nama File**: Pastikan untuk mengganti nama file yang diunduh sesuai dengan format yang diperlukan (lihat file `dialog-download-list.html`)
4. **Penempatan File**: Semua file MP3 harus ditempatkan di folder `client/public/audio/geralt/`