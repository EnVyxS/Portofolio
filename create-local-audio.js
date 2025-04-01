// Script untuk membuat file audio placeholder lokal
// Jalankan dengan: node create-local-audio.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
function createSilentMP3() {
  const silentPath = path.join(OUTPUT_DIR, 'silent.mp3');
  
  // If silent.mp3 doesn't exist yet, create it
  if (!fs.existsSync(silentPath)) {
    console.log("Creating silent MP3 file...");
    // Create a small buffer with valid MP3 header (this isn't a fully valid MP3 but will work for tests)
    const silentBuffer = Buffer.from([
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      // Repeat a few times to make file larger
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00
    ]);
    fs.writeFileSync(silentPath, silentBuffer);
    console.log("Created silent MP3 file");
  } else {
    console.log("Silent MP3 file already exists");
  }
}

// Create dummy MP3 with MP3 headers for regular dialog
function createDummyMP3(text) {
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
    console.log(`Creating dummy audio for: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
    
    // Create a buffer with valid MP3 headers
    // In a real scenario, we would use a library to generate actual audio
    // This is just a placeholder that browsers can recognize as MP3
    const dummyBuffer = Buffer.from([
      // MP3 header - frame sync
      0xFF, 0xFB, 
      // Bitrate, sample rate, etc.
      0x90, 0x44, 
      // Padding
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00,
      // Repeat a few more times to make the file larger
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00,
      0xFF, 0xFB, 0x90, 0x44, 0x00, 0x00, 0x00, 0x00
    ]);
    
    fs.writeFileSync(outputPath, dummyBuffer);
    console.log(`Audio placeholder saved to: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    console.error('Error creating audio placeholder:', error.message);
    return null;
  }
}

// Main function to process all dialogs
function processAllDialogs() {
  console.log("Starting audio placeholder creation process...");
  
  // Create silent MP3 first
  createSilentMP3();
  
  // Filter out duplicate texts
  const uniqueDialogs = [...new Set(dialogTexts)];
  console.log(`Found ${uniqueDialogs.length} unique dialog entries to process`);
  
  // Process each dialog
  for (const text of uniqueDialogs) {
    createDummyMP3(text);
  }
  
  console.log("Audio placeholder creation complete!");
}

// Run the main function
processAllDialogs();