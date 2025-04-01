/**
 * Script untuk menyalin file audio ke folder yang benar dengan nama yang benar
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi hash yang sama dengan yang digunakan di aplikasi
function generateSimpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

// Dialog texts from the application
const dialogTexts = [
  "...Didn't ask for company.",
  "Tch... Fire's warm. Always brings strays.",
  "Haahhhh... You need something or are you just here to waste my time?",
  ".....",
  "Curiosity?... Hmph... Doesn't pay the bills...",
  "Pfftt... Waiting... Drinking... What else is there?",
  "Hmm... Got a handful of coins and a longsword. That's all a man like me needs...",
  "There's a contract I'll have to deal with come sunrise. Some beast's been picking off villagers near the old mill...",
  "You want to know more about me? Hmmm... Why would you care?",
  "Witcher by trade. Monster hunter. I follow the Path.",
  "I see by your eyes you've heard the tales. Yes, they're all true. The mutations. The training.",
  "Not many of us left. Most don't make it through the Trial of Grasses. I was... lucky. Or cursed. Depends who you ask.",
  "I don't talk much about my past. No point dwelling on what's done.",
  "What's that look for? Expected something more? *grunts* Don't we all...",
  "The Path is a lonely one. That's just how it is.",
  "If you're looking to hire me, I'm not cheap. But I'm good at what I do.",
  "Hmm... I notice you're still here. You're either brave or stupid. Most people keep their distance.",
  "You can find me on the Path. Or through Kaer Morhen, when winter comes.",
  "I've left my mark in several places. Some remember me. Others... prefer to forget.",
  "There are ways to reach me if you truly need a witcher's services. Just follow the rumors of monsters slain.",
  "Or perhaps you'd prefer more direct methods...",
  "There's a code among witchers. We don't kill humans. Not without reason.",
  "Sometimes, though, the monsters look just like you and me.",
  "The fire's dying. And I've said more than I usually do in a month.",
  "Take what you need from our conversation. I'll be here until dawn.",
  "After that, the Path calls again.",
  "Do what you will with my words. Just remember, a witcher never forgets a face.",
  "Now leave me be. I've had enough talk for one night.",
  "Hmm.",
  "*stares into the fire*",
  "*sighs* One last word of advice: in this world, it's rarely about the monsters. It's about the men. Remember that.",
  "Farewell, stranger.",
  "*turns back to the fire*",
  "*end of conversation*"
];

// Mapping antara dialog dan hash
const dialogHashes = {};
dialogTexts.forEach(text => {
  const hash = generateSimpleHash(text);
  dialogHashes[text] = hash;
});

// Kumpulan file MP3 yang ada di attached_assets
// Ini akan memetakan file tersebut ke dialog yang sesuai
const mappingAudioFiles = {
  "...Didn't ask for company.": "01e1b0cacaeb239eedf8d32d858154e0.mp3",
  "Tch... Fire's warm. Always brings strays.": "0a72a92b6b9df96c2127d38c3d6491c9.mp3",
  "Haahhhh... You need something or are you just here to waste my time?": "0a769e966c610659b4ec5601b3ae1d7b.mp3",
  ".....": "0fe4a13d21cc59cc367dec3aea934bd4.mp3",
  "Curiosity?... Hmph... Doesn't pay the bills...": "1d289c8d53a3b706d89083e0eb27dd95.mp3",
  "Pfftt... Waiting... Drinking... What else is there?": "2cc77b4a7b6a824e4652ab5c864926c4.mp3",
  "Hmm... Got a handful of coins and a longsword. That's all a man like me needs...": "2f416346338b769d8a8bcc86a049367e.mp3", 
  "There's a contract I'll have to deal with come sunrise. Some beast's been picking off villagers near the old mill...": "2fdcde828ec080de9b0c75bf0efcc26d.mp3",
  "You want to know more about me? Hmmm... Why would you care?": "3a229d3bfa685bb32fd0925a4265ad5c.mp3",
  "Witcher by trade. Monster hunter. I follow the Path.": "3a50704c3288e2037e8baf0a5faf24d7.mp3",
  "I see by your eyes you've heard the tales. Yes, they're all true. The mutations. The training.": "3c662b9aec8aebddc20f9c77f4512e2b.mp3",
  "Not many of us left. Most don't make it through the Trial of Grasses. I was... lucky. Or cursed. Depends who you ask.": "4a3a979682ecc0f442b44a330251c1de.mp3",
  "I don't talk much about my past. No point dwelling on what's done.": "4a71e69da09b1e97d0965caab0b1f958.mp3",
  "What's that look for? Expected something more? *grunts* Don't we all...": "4d07c8740adce66b135cd742e192a091.mp3",
  "The Path is a lonely one. That's just how it is.": "4f0fa1d367be5c8d53621cbd547be9be.mp3",
  "If you're looking to hire me, I'm not cheap. But I'm good at what I do.": "5c7d8659f077115e62bc0064c94ea671.mp3",
  "Hmm... I notice you're still here. You're either brave or stupid. Most people keep their distance.": "6b75fc7295f448ec458097ef72ce4984.mp3",
  "You can find me on the Path. Or through Kaer Morhen, when winter comes.": "6c8baaf110bcf4a3a953271336d56a22.mp3",
  "I've left my mark in several places. Some remember me. Others... prefer to forget.": "6cdab5ab466d1dd6d9651f1c666a9ec2.mp3",
  "There are ways to reach me if you truly need a witcher's services. Just follow the rumors of monsters slain.": "6ea767120886767d5e24c35af88786b7.mp3",
};

// Buat output directory jika belum ada
const outputDir = path.join(__dirname, 'client/public/audio/geralt');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Salin dan rename file audio sesuai dengan hash dialog
for (const [dialog, sourceFile] of Object.entries(mappingAudioFiles)) {
  const hash = dialogHashes[dialog];
  if (hash) {
    const sourcePath = path.join(__dirname, 'attached_assets', sourceFile);
    const destPath = path.join(outputDir, `dialog_${hash}.mp3`);
    
    if (fs.existsSync(sourcePath)) {
      console.log(`Menyalin ${sourceFile} ke dialog_${hash}.mp3 (${dialog.substring(0, 30)}...)`);
      fs.copyFileSync(sourcePath, destPath);
    } else {
      console.log(`File tidak ditemukan: ${sourcePath}`);
    }
  } else {
    console.log(`Hash tidak ditemukan untuk dialog: ${dialog}`);
  }
}

console.log("Proses selesai.");