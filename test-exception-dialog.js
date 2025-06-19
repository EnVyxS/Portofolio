// Test script to verify exception dialog behavior
console.log("Testing exception dialog system...");

// Force trigger first warning to test exception behavior
setTimeout(() => {
  try {
    const idleController = window.idleTimeoutController;
    if (idleController) {
      console.log("Forcing first warning dialog...");
      idleController.forceFirstWarning();
    } else {
      console.log("IdleTimeoutController not found on window");
    }
  } catch (e) {
    console.error("Error testing exception dialog:", e);
  }
}, 2000);

// Test exception dialog detection
const testTexts = [
  "What the hell are you staring at?.. Got something to say!?",
  "You really gonna keep ignoring me? I'm not in the mood for this.",
  "Now what, you little filth!?.. Back for more punishment?",
  "KEEP PUSHING, AND YOU'LL REGRET IT.",
  "You've got two minutes. Or I'll beat you again.",
  "Normal dialog that should not be exception"
];

// Import the function (assuming it's available globally)
setTimeout(() => {
  try {
    if (window.isExceptionDialog) {
      testTexts.forEach(text => {
        const isException = window.isExceptionDialog(text);
        console.log(`"${text.substring(0, 30)}..." -> Exception: ${isException}`);
      });
    }
  } catch (e) {
    console.error("Exception dialog test error:", e);
  }
}, 1000);