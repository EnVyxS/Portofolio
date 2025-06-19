# Exception Dialog System Documentation

## Overview
Sistema dialog pengecualian yang memungkinkan dialog tertentu (warning, punishment, return dialogs) untuk auto-continue tanpa memerlukan interaksi user.

## Files Modified
1. `client/src/constants/dialogExceptions.ts` - Constants dan detection logic
2. `client/src/views/DialogBox.tsx` - Auto-continue behavior implementation
3. `client/src/index.css` - Visual styling untuk exception dialogs

## Exception Dialog Types

### 1. Warning Dialogs
- "What the hell are you staring at?.. Got something to say!?" (FIRST_WARNING)
- "You really gonna keep ignoring me? I'm not in the mood for this." (SECOND_WARNING)
- "You think this is funny?.. Staring at me for nine damn minutes?.. Fuck you!!" (FINAL_WARNING)

### 2. Return Dialog Variations
- "Now what, you little filth!?.. Back for more punishment?" (Base RETURN_DIALOG)
- Plus 20+ variations from dialogModel.ts

### 3. Hover Warnings
- "KEEP PUSHING, AND YOU'LL REGRET IT." (EXCESSIVE_HOVER_WARNING)
- "I'VE HAD ENOUGH OF YOUR GAMES!" (FINAL_HOVER_WARNING)

### 4. Extended Return Dialogs (Ultimatum)
- "You've got two minutes. Or I'll beat you again."
- "Same deal. Two minutes. Mess it up again, I'll finish what I started."
- Plus 8+ variations for experienced users

### 5. Punishment Dialogs
- "YOU ASKED FOR THIS." (PUNCH_USER)

## Behavior

### Auto-Continue Timing
Exception dialogs menggunakan timing yang sama dengan DialogController:
```javascript
const textLength = text.length;
const baseDelay = 2000; // 2 detik base delay
const charDelay = 50; // 50ms per karakter
const delay = Math.min(baseDelay + textLength * charDelay, 8000); // maksimal 8 detik
```

### Visual Indicators
- Next/Skip buttons disembunyikan untuk exception dialogs
- Pesan "⚠️ Auto-continuing..." ditampilkan dengan styling khusus
- Warning pulse animation dengan warna merah

### User Experience
1. Exception dialog muncul dan mulai typing
2. Setelah selesai typing, tidak ada tombol Next/Skip
3. Indikator "⚠️ Auto-continuing..." muncul
4. Auto-continue setelah delay berdasarkan panjang teks
5. Dialog berikutnya atau kembali ke main state

## Implementation Details

### Detection Function
```javascript
export function isExceptionDialog(text: string): boolean {
  if (!text) return false;
  
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  return EXCEPTION_DIALOGS.some(exceptionText => {
    const cleanException = exceptionText.trim().replace(/\s+/g, ' ');
    return cleanText.includes(cleanException) || cleanException.includes(cleanText);
  });
}
```

### Auto-Continue Logic
Exception dialogs diproses di dua tempat:
1. `handleContinue()` - Ketika user menekan Next/Skip (tapi tombol disembunyikan)
2. `useEffect()` auto-continue - Ketika dialog selesai typing

### CSS Styling
```css
.exception-dialog-hint {
  color: #ff6b6b;
  font-weight: bold;
  animation: warning-pulse 1.5s infinite;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
}
```

## Testing
Exception dialogs dapat diuji dengan:
1. Menunggu idle timeout untuk warning dialogs
2. Menggunakan hover berlebihan untuk hover warnings
3. Kembali setelah punishment untuk return dialogs
4. Menggunakan script testing: `test-exception-dialog.js`

## Console Logs
Exception dialogs menghasilkan log khusus:
```
[DialogBox] Exception dialog detected, auto-continuing without user input: "Warning text..."
[DialogBox] Exception dialog auto-continuing: "Warning text..."
```

Sistem ini memastikan experience yang smooth tanpa mengganggu flow dialog sambil memberikan feedback visual yang jelas kepada user bahwa dialog sedang auto-continuing.