/**
 * Utility script untuk melihat hash dari dialog model
 * Ini akan membantu untuk menempatkan file audio yang benar untuk setiap dialog
 */

function generateSimpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

// Dialog model extracted from dialogModel.ts
const dialogs = [
  {
    id: 1,
    character: "Diva Juan Nur Taqarrub",
    text: "...Didn't ask for company.",
    voiceId: "geralt",
  },
  {
    id: 2,
    character: "Diva Juan Nur Taqarrub",
    text: "Tch... Fire's warm. Always brings strays.",
    voiceId: "geralt",
  },
  {
    id: 3,
    character: "Diva Juan Nur Taqarrub",
    text: "Haahhhh... You need something or are you just here to waste my time?",
    voiceId: "geralt",
  },
  {
    id: 4,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 5,
    character: "Diva Juan Nur Taqarrub",
    text: "Curiosity?... Hmph... Doesn't pay the bills...",
    voiceId: "geralt",
  },
  {
    id: 6,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 7,
    character: "Diva Juan Nur Taqarrub",
    text: "Pfftt... Waiting... Drinking... What else is there?",
    voiceId: "geralt",
  },
  {
    id: 8,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 9,
    character: "Diva Juan Nur Taqarrub",
    text: "A job?.., A way out?.., Some miracle?..",
    voiceId: "geralt",
  },
  {
    id: 10,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 11,
    character: "Diva Juan Nur Taqarrub",
    text: "Heh... Yeah, real fucking hilarious, isn't it?",
    voiceId: "geralt",
  },
  {
    id: 12,
    character: "Diva Juan Nur Taqarrub",
    text: "...You got a name?",
    voiceId: "geralt",
  },
  {
    id: 13,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 14,
    character: "Diva Juan Nur Taqarrub",
    text: "Hm. Not that it matters,",
    voiceId: "geralt",
  },
  {
    id: 15,
    character: "Diva Juan Nur Taqarrub",
    text: "Diva Juan Nur Taqarrub , , Call me what you want. Doesn't do shit,",
    voiceId: "geralt",
  },
  {
    id: 16,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 17,
    character: "Diva Juan Nur Taqarrub",
    text: "Hmph... why am I even here?..",
    voiceId: "geralt",
  },
  {
    id: 18,
    character: "Diva Juan Nur Taqarrub",
    text: "Anything that keeps me breathing,",
    voiceId: "geralt",
  },
  {
    id: 19,
    character: "Diva Juan Nur Taqarrub",
    text: "Hunting work's like hunting a ghost. No signs, no tracks, just hope and a headache,",
    voiceId: "geralt",
  },
  {
    id: 20,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 21,
    character: "Diva Juan Nur Taqarrub",
    text: "Graduated. Computer Science. 2024,",
    voiceId: "geralt",
  },
  {
    id: 22,
    character: "Diva Juan Nur Taqarrub",
    text: "Yeah... Cum laude. Thought it'd mean something.. Turns out it's worth less than a stiff drink,",
    voiceId: "geralt",
  },
  {
    id: 23,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 24,
    character: "Diva Juan Nur Taqarrub",
    text: "Backend. Java. Databases. Know my way around. Not that anyone cares,",
    voiceId: "geralt",
  },
  {
    id: 25,
    character: "Diva Juan Nur Taqarrub",
    text: "Made a game for my thesis. Thought it'd mean something. It didn't,",
    voiceId: "geralt",
  },
  {
    id: 26,
    character: "Diva Juan Nur Taqarrub",
    text: "Editing too. Years of it. Doesn't put food on the table,",
    voiceId: "geralt",
  },
  {
    id: 27,
    character: "Diva Juan Nur Taqarrub",
    text: "Vegas Pro. After Effects. Cut, stitch, fix. Life's not that simple,",
    voiceId: "geralt",
  },
  {
    id: 28,
    character: "Diva Juan Nur Taqarrub",
    text: "SQL... PostgreSQL... MySQL... Data's just numbers. Like debts. Like failures,",
    voiceId: "geralt",
  },
  {
    id: 29,
    character: "Diva Juan Nur Taqarrub",
    text: "Used to like puzzles. Now? Just another thing that doesn't pay,",
    voiceId: "geralt",
  },
  {
    id: 30,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 31,
    character: "Diva Juan Nur Taqarrub",
    text: "...Leaving this place?",
    voiceId: "geralt",
  },
  {
    id: 32,
    character: "Diva Juan Nur Taqarrub",
    text: "Huhhhh... Like that's so easy,",
    voiceId: "geralt",
  },
  {
    id: 33,
    character: "Diva Juan Nur Taqarrub",
    text: "Go where? With what? Got coin to spare?,",
    voiceId: "geralt",
  },
  {
    id: 34,
    character: "Diva Juan Nur Taqarrub",
    text: "Nothing's free. Not even dreams,",
    voiceId: "geralt",
  },
  {
    id: 35,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 36,
    character: "Diva Juan Nur Taqarrub",
    text: "But if the pay's right… maybe,",
    voiceId: "geralt",
  },
  {
    id: 37,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 38,
    character: "Diva Juan Nur Taqarrub",
    text: "For now? I drink. Sit. Hope the fire lasts longer than the night,",
    voiceId: "geralt",
  },
  {
    id: 39,
    character: "Diva Juan Nur Taqarrub",
    text: ".....",
    voiceId: "geralt",
  },
  {
    id: 40,
    character: "Diva Juan Nur Taqarrub",
    text: "Hmph... You fight... you bleed... you try...,",
    voiceId: "geralt",
  },
  {
    id: 41,
    character: "Diva Juan Nur Taqarrub",
    text: "And in the end, still nothing,",
    voiceId: "geralt",
  },
  {
    id: 42,
    character: "Diva Juan Nur Taqarrub",
    text: "...Enough about me",
    voiceId: "geralt",
  },
  {
    id: 43,
    character: "Diva Juan Nur Taqarrub",
    text: "What do you want?..",
    voiceId: "geralt",
  },
  {
    id: 44,
    character: "Diva Juan Nur Taqarrub",
    text: "Talk... You got a job, or just wasting my time?..",
    voiceId: "geralt",
  },
];

console.log("Audio file hash mapping for dialog model:");
console.log("========================================");

// Using Set to automatically filter out duplicate texts
const uniqueDialogs = new Set();

// Prepare command to download audio files
let curlCommands = [];
let mkdirCommands = [
  'mkdir -p client/public/audio/geralt'
];

dialogs.forEach((dialog) => {
  const text = dialog.text;
  
  // Skip duplicate texts
  if (uniqueDialogs.has(text)) {
    return;
  }
  uniqueDialogs.add(text);
  
  const hash = generateSimpleHash(text);
  console.log(`Dialog #${dialog.id}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
  console.log(`Character: ${dialog.character}`);
  console.log(`Hash: ${hash}`);
  console.log(`Filename: dialog_${hash}.mp3`);
  console.log(`Audio path: /audio/geralt/dialog_${hash}.mp3`);
  console.log("--------------------");
  
  // Generate curl command for this dialog
  // This is just a placeholder since we don't actually download from ElevenLabs API
  const curlCommand = `echo "Creating empty audio file for Dialog #${dialog.id}" && touch client/public/audio/geralt/dialog_${hash}.mp3`;
  curlCommands.push(curlCommand);
});

console.log("\nCommands to prepare directories:");
console.log(mkdirCommands.join('\n'));

console.log("\nCommands to fetch audio files:");
console.log(curlCommands.join('\n'));

document.body.innerHTML = `
<h1>Dialog Hash Generator from Model</h1>
<p>Check the console for audio file mapping</p>
`;