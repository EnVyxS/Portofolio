// File untuk menyimpan semua respons dialog yang digunakan di aplikasi

import { Dialog } from "../models/dialogModel";

// Export responses for contract interactions - moved from DialogBox.tsx
export const CONTRACT_RESPONSES = [
  "Didn't lie. Never have, never will. Maybe next time, use your damn brain before throwing accusations.",
  "Not a liar. Never was. Maybe next time, don't waste my time with your doubts.",
  "Told you the truth. Always do. Maybe next time, keep your mouth shut until you know better.",
  "Didn't lie. Don't need to. Maybe next time, think twice before making a fool of yourself.",
  "Believe me now? Thought so. Next time, don't question what you don't understand.",
];

// Dialog yang akan ditampilkan pada timeout tertentu - moved from idleTimeoutController.ts
export const IDLE_DIALOGS = {
  // Dialog setelah 2 menit tidak ada interaksi
  FIRST_WARNING: "What the hell are you staring at?.. Got something to say!?",

  // Dialog setelah 5 menit tidak ada interaksi
  SECOND_WARNING:
    "You really gonna keep ignoring me? I'm not in the mood for this.",

  // Dialog setelah 9 menit tidak ada interaksi
  FINAL_WARNING:
    "You think this is funny?.. Staring at me for nine damn minutes?.. Fuck you!!",

  // Dialog setelah user menekan APPROACH HIM lagi
  RETURN_DIALOG: "Now what, you little filth!?..",

  // Dialog setelah user melakukan hover
  HOVER_AFTER_RESET:
    "Hmph... Finally, you decide to move... Suit yourself. You want to check it or just get on with signing the damn contract?",

  // Dialog untuk hover berlebihan
  EXCESSIVE_HOVER_WARNING: "KEEP PUSHING, AND YOU'LL REGRET IT.",

  // Dialog terakhir sebelum 'diusir'
  FINAL_HOVER_WARNING: "I'VE HAD ENOUGH OF YOUR GAMES!",
};

// Dialog untuk efek punch - moved from idleTimeoutController.ts
export const PUNCH_TEXT = "YOU ASKED FOR THIS.";

// Dialog untuk efek throw - moved from idleTimeoutController.ts
export const THROW_TEXT = "That's it. GET OUT OF MY SIGHT!";

// Dialog khusus untuk situasi setelah reset - moved from dialogModel.ts
export const RETURN_DIALOG: Dialog = {
  id: 1001,
  character: "DIVA JUAN NUR TAQARRUB",
  text: "Now what, you little filth!? Back for more punishment?",
  voiceId: "dBynzNhvSFj0l1D7I9yV",
  persistent: true
};