// Script untuk mengunduh audio dari ElevenLabs API
// Jalankan dengan: node download-audio.js

require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API key dari .env
const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;

// Voice ID dari Geralt
const VOICE_ID = 'TxGEqnHWrfWFTfGW9XjX'; // Adam voice untuk Geralt

// Output directory
const OUTPUT_DIR = path.join(__dirname, 'client', 'public', 'audio', 'geralt');

// Pastikan directory ada
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Created directory: ${OUTPUT_DIR}`);
}

// Hash function yang sama dengan di aplikasi
function generateSimpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

// Dialog dari dialogModel.ts
const dialogTexts = [
  "...Didn't ask for company.",
  "Tch... Fire's warm. Always brings strays.",
  "Haahhhh... You need something or are you just here to waste my time?",
  ".....",
  "Curiosity?... Hmph... Doesn't pay the bills...",
  ".....",
  "Pfftt... Waiting... Drinking... What else is there?",
  ".....",
  "A job?.., A way out?.., Some miracle?..",
  ".....",
  "Heh... Yeah, real fucking hilarious, isn't it?",
  "...You got a name?",
  ".....",
  "Hm. Not that it matters,",
  "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,",
  ".....",
  "Hmph... why am I even here?..",
  "Anything that keeps me breathing,",
  "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,",
  ".....",
  "Graduated. Computer Science. 2024,",
  "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,",
  ".....",
  "Backend. Java. Databases. Know my way around. Not that anyone cares,",
  "Made a game for my thesis. Thought it'd mean something. It didn't,",
  "Editing too. Years of it. Doesn't put food on the table,",
  "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
  "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,",
  "Used to like puzzles. Now? Just another thing that doesn't pay,",
  ".....",
  "...Leaving this place?",
  "Huhhhh... Like that's so easy,",
  "Go where? With what? Got coin to spare?,",
  "Nothing's free. Not even dreams,",
  ".....",
  "But if the pay's right… maybe,",
  ".....",
  "For now? I drink. Sit. Hope the fire lasts longer than the night,",
  ".....",
  "Hmph... You fight... you bleed... you try...,",
  "And in the end, still nothing,",
  "...Enough about me",
  "What do you want?..",
  "Talk... You got a job, or just wasting my time?.."
];

// Create a silent mp3 file for ellipsis
async function createSilentMP3() {
  const silentPath = path.join(OUTPUT_DIR, 'silent.mp3');
  
  // If silent.mp3 doesn't exist yet, create it (this would normally be done with ffmpeg)
  if (!fs.existsSync(silentPath)) {
    console.log("Creating silent MP3 file...");
    // Generate a minimal MP3 file with some content
    const silentBuffer = Buffer.from([
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    fs.writeFileSync(silentPath, silentBuffer);
    console.log("Created silent MP3 file");
  } else {
    console.log("Silent MP3 file already exists");
  }
}

// Fetch audio from ElevenLabs API
async function fetchAudio(text) {
  if (text.trim() === '.....') {
    console.log("Skipping ellipsis text (will use silent.mp3)");
    return null;
  }
  
  const hash = generateSimpleHash(text);
  const outputPath = path.join(OUTPUT_DIR, `dialog_${hash}.mp3`);
  
  // Skip if already exists
  if (fs.existsSync(outputPath)) {
    console.log(`File already exists for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}" (${outputPath})`);
    return outputPath;
  }
  
  try {
    console.log(`Generating audio for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    const response = await axios({
      method: 'post',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY
      },
      data: {
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75
        }
      },
      responseType: 'arraybuffer'
    });
    
    fs.writeFileSync(outputPath, response.data);
    console.log(`Audio saved to: ${outputPath}`);
    
    // Wait to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return outputPath;
  } catch (error) {
    console.error('Error generating audio:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data.toString());
    }
    return null;
  }
}

// Main function to process all dialogs
async function processAllDialogs() {
  console.log("Starting audio generation process...");
  console.log(`Using API Key: ${API_KEY ? "Yes (masked for security)" : "No (check your .env file)"}`);
  
  // Create silent MP3 first
  await createSilentMP3();
  
  // Filter out duplicate texts
  const uniqueDialogs = [...new Set(dialogTexts)];
  console.log(`Found ${uniqueDialogs.length} unique dialog entries to process`);
  
  // Process each dialog
  for (const text of uniqueDialogs) {
    await fetchAudio(text);
  }
  
  console.log("Audio generation complete!");
}

// Run the main function
processAllDialogs().catch(error => {
  console.error("Fatal error:", error);
});