// === 2. DIALOG EXCEPTION (AUTO, NO NEXT/SKIP/WAIT) ===
// Dialog yang otomatis dijalankan tanpa tombol next/skip dan tanpa menunggu input user

export const EXCEPTION_DIALOGS = [
  // Warning dialogs
  "What the hell are you staring at?.. Got something to say!?", // FIRST_WARNING
  "You really gonna keep ignoring me? I'm not in the mood for this.", // SECOND_WARNING
  "You think this is funny?.. Staring at me for nine damn minutes?.. Fuck you!!", // FINAL_WARNING
  
  // Return dialog variations
  "Now what, you little filth!?.. Back for more punishment?", // RETURN_DIALOG
  "[menacing] Now what, you little filth!?.. [threatening] Back for more punishment?",
  "You just don't learn, do you?",
  "Thought you'd had enough. Guess I was wrong.",
  "Back on your feet already? You're persistent, I'll give you that.",
  "I don't have time for this. But if you insist...",
  "Still breathing? Impressive. Stupid, but impressive.",
  "You should've stayed down.",
  "I warned you once. That was your mercy.",
  "You mistake survival for strength. Let me fix that.",
  "Back again? Your pain threshold must be as low as your wit.",
  "This isn't bravery. It's desperation… or stupidity.",
  "You bleed easy. Let's see how long before you break.",
  "Still standing? I'll make that regret last.",
  "You came all this way just to die tired.",
  "You had your chance. Now I take mine.",
  "Last time was a warning. This time, it's a lesson.",
  "You're not a challenge. You're an inconvenience.",
  "You came back. Brave… or foolish?",
  "Some people never know when to quit.",
  "Fine. One more lesson. Then it ends.",
  "Didn't think you'd crawl back so soon. But here we are.",
  
  // Hover warnings
  "KEEP PUSHING, AND YOU'LL REGRET IT.", // EXCESSIVE_HOVER_WARNING
  "I'VE HAD ENOUGH OF YOUR GAMES!", // FINAL_HOVER_WARNING
  
  // Punishment dialogs
  "YOU ASKED FOR THIS.", // PUNCH_USER
  
  // Extended Return Dialogs (ultimatum)
  "You've got two minutes. Or I'll beat you again.",
  "Same deal. Two minutes. Mess it up again, I'll finish what I started.",
  "You've had worse. Two minutes, then we go again.",
  "Two minutes. That's all you get before round two.",
  "Back for punishment? Fine. Two minutes, then I finish this.",
  "You want more? Two minutes. Then it's over.",
  "Two minutes to make your peace. Then we end this.",
  "Still here? Two minutes left before I put you down for good.",
  "Two minutes. Use them wisely, because they're your last.",
  "You came back. Two minutes, then I make sure you don't get up again."
];

// Function to check if a dialog text is an exception dialog
export function isExceptionDialog(text: string): boolean {
  if (!text) return false;
  
  // Clean text for comparison (remove extra spaces, dots, etc.)
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  return EXCEPTION_DIALOGS.some(exceptionText => {
    const cleanException = exceptionText.trim().replace(/\s+/g, ' ');
    return cleanText.includes(cleanException) || cleanException.includes(cleanText);
  });
}

// Dialog exception behavior configuration
export const EXCEPTION_BEHAVIOR = {
  autoPlay: true,
  hideNextButton: true,
  hideSkipButton: true,
  removeWaitForUserInput: true,
  forceShow: true
};