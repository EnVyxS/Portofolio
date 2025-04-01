/**
 * Utilitas untuk men-generate filename berdasarkan hash teks dialog
 * Buka file ini di browser dan lihat hasil di console
 */

function generateSimpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString();
}

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

console.log("Audio file hash mapping:");
console.log("=======================");

const mapping = {};
dialogTexts.forEach((text, index) => {
  const hash = generateSimpleHash(text);
  console.log(`Dialog #${index + 1}: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`);
  console.log(`Hash: ${hash}`);
  console.log(`Filename: dialog_${hash}.mp3`);
  console.log("--------------------");
  
  mapping[text] = `dialog_${hash}.mp3`;
});

console.log("\nJSON mapping for file:");
console.log(JSON.stringify(mapping, null, 2));

document.body.innerHTML = `
<h1>Dialog Hash Generator</h1>
<p>Lihat hasilnya di console browser</p>
`;