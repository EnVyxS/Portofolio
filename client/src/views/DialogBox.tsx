import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import DialogController from "../controllers/dialogController";
import HoverDialogController from "../controllers/hoverDialogController";
import IdleTimeoutController from "../controllers/idleTimeoutController";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import ElevenLabsService from "../services/elevenlabsService";
import { CONTRACT_RESPONSES } from "../components/ContractCard";

// Import fungsi hash untuk debugging
function generateSimpleHash(text: string): string {
  // Remove emotion tags for consistent hashing
  const cleanText = text.replace(/\[(.*?)\]/g, "").trim();

  let hash = 0;
  for (let i = 0; i < cleanText.length; i++) {
    hash = (hash << 5) - hash + cleanText.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString();
}

// Helper untuk menentukan apakah dialog perlu persistensi (tetap terbuka)
// Versi sederhana: semua dialog autoplay kecuali yang memiliki pola tertentu
function isDialogPersistent(text: string): boolean {
  // Dialog dari dialogModel.ts hampir semua non-persistent
  // kita menggunakan pola false secara default

  // Khusus untuk RETURN_DIALOG dan HOVER_AFTER_RESET - selalu persistent
  if (
    (text.includes("Now what, you little filth") || text.includes("Back for more punishment")) ||
    (text.includes("Hmph... Finally, you decide to move") || text.includes("just get on with signing the damn contract"))
  ) {
    return true;
  }

  // Dialog khusus (dari hover) yang perlu persistent
  if (
    text.includes("?") &&
    (text.includes("credentials") ||
      text.includes("check") ||
      text.includes("want to know") ||
      text.includes("need to") ||
      text.includes("convinced"))
  ) {
    return true;
  }

  // Default: semua dialog regular autoplay (non-persistent)
  return false;
}

interface DialogBoxProps {
  onDialogComplete?: () => void;
}

const DialogBox: React.FC<DialogBoxProps> = ({ onDialogComplete }) => {
  const [text, setText] = useState<string>("");
  const [characterName, setCharacterName] = useState<string>("");
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isDialogFinished, setIsDialogFinished] = useState<boolean>(false);
  const [dialogSource, setDialogSource] = useState<"main" | "hover">("main");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const dialogController = DialogController.getInstance();
  const hoverDialogController = HoverDialogController.getInstance();
  const elevenLabsService = ElevenLabsService.getInstance();
  const idleTimeoutController = IdleTimeoutController.getInstance();

  // Timer reference untuk auto-continue
  const autoPlayTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Fungsi untuk toggle mute
  const toggleMute = useCallback(() => {
    if (isMuted) {
      // Unmute
      elevenLabsService.setApiKey(
        import.meta.env.VITE_ELEVENLABS_API_KEY || "",
      );
      setIsMuted(false);
    } else {
      // Mute
      elevenLabsService.stopSpeaking(); // Hentikan audio yang sedang berjalan
      elevenLabsService.setApiKey(""); // Set API key kosong untuk mencegah request audio baru
      setIsMuted(true);
    }
  }, [isMuted, elevenLabsService]);

  // Handle Continue sebagai useCallback untuk dapat digunakan dalam useEffect
  const handleContinue = useCallback(() => {
    // Reset force show idle warning flag saat user menekan tombol continue
    try {
      // @ts-ignore - akses properti global dari window
      window.__forceShowIdleWarning = false;
      console.log("[DialogBox] Reset force show idle warning flag on user interaction");
    } catch (e) {
      console.error("Could not reset force show idle warning flag:", e);
    }
    
    // Cek apakah ini adalah dialog khusus post-reset dan perlu direset status nya
    if (dialogController.isShowingPostResetDialog()) {
      dialogController.resetPostResetDialogStatus();
    }

    if (dialogSource === "main") {
      // Jika dialog masih dalam proses typing tetapi user menekan tombol SKIP/NEXT
      if (!isComplete) {
        // Hentikan dialog dan audio yang sedang berjalan
        dialogController.skipToFullText();

        // Langsung lanjut ke dialog berikutnya tanpa menunggu user klik lagi
        // Gunakan setTimeout dengan delay singkat untuk memastikan UI diupdate
        setTimeout(() => {
          // Cek apakah user sudah berinteraksi dengan hover dialog
          if (hoverDialogController.hasUserInteractedWithHover()) {
            // Jangan hilangkan dialog box, tetapi tetap jalankan callback jika dibutuhkan
            if (onDialogComplete) onDialogComplete();
            return;
          }

          // Move to the next dialog
          dialogController.nextDialog((text, complete) => {
            setText(text);
            setIsComplete(complete);

            // Get current dialog to display character name
            const currentDialog = dialogController.getCurrentDialog();
            if (currentDialog) {
              setCharacterName(currentDialog.character);
              // Update hover dialog controller with completion status
              hoverDialogController.setDialogCompleted(complete);
            } else {
              // Tandai dialog sudah selesai untuk interaksi hover
              hoverDialogController.setDialogCompleted(true);

              // Tetap menjalankan onDialogComplete jika ada
              if (onDialogComplete) {
                onDialogComplete();
              }
            }
          });
        }, 50); // Delay kecil untuk memastikan UI diupdate dengan benar
      } else {
        // Dialog sudah selesai dan user menekan NEXT
        // Cek apakah user sudah berinteraksi dengan hover dialog
        if (hoverDialogController.hasUserInteractedWithHover()) {
          // Jika user sudah berinteraksi dengan hover dialog
          // Jangan hilangkan dialog box, tetapi tampilkan dialog hover yang sedang berlangsung

          // Hanya panggil onDialogComplete jika dibutuhkan
          if (onDialogComplete) onDialogComplete();
          return;
        }

        // Move to the next dialog
        dialogController.nextDialog((text, complete) => {
          setText(text);
          setIsComplete(complete);

          // Get current dialog to display character name
          const currentDialog = dialogController.getCurrentDialog();
          if (currentDialog) {
            setCharacterName(currentDialog.character);
            // Update hover dialog controller with completion status
            hoverDialogController.setDialogCompleted(complete);
          } else {
            // Tetap tandai dialog sebagai selesai untuk interaksi hover
            hoverDialogController.setDialogCompleted(true);

            // Jangan set isDialogFinished ke true agar tetap menampilkan dialog box
            if (onDialogComplete) {
              onDialogComplete();
            }
          }
        });
      }
    } else if (dialogSource === "hover") {
      // For hover dialogs
      if (!isComplete) {
        // Jika dialog masih dalam proses typing, langsung tampilkan full text
        hoverDialogController.stopTyping();
        setIsComplete(true);
      } else {
        // Jika dialog sudah selesai, user menekan NEXT
        // Reset hover state dan hilangkan dialog box
        hoverDialogController.resetHoverState();
        setIsDialogFinished(true);

        // Jangan kembali ke dialog utama
        // Ini perbaikan utama yang dilakukan
      }
    }
  }, [
    dialogSource,
    isComplete,
    dialogController,
    hoverDialogController,
    onDialogComplete,
    setText,
    setIsComplete,
    setIsDialogFinished,
    setCharacterName,
  ]);

  // Effect untuk auto-continue ketika dialog selesai - dimodifikasi untuk berjalan untuk semua dialog
  useEffect(() => {
    if (isComplete && dialogSource === "main") {
      // Clear any existing timer
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }

      // Mulai timer IDLE_DIALOGS setelah dialog model selesai berbicara
      // Ini adalah perubahan penting untuk memastikan timer baru mulai setelah dialog selesai
      console.log("[DialogBox] Dialog model selesai berbicara, memulai timer IDLE_DIALOGS...");
      idleTimeoutController.startIdleTimerAfterDialogComplete();

      // Cek jika user sudah berinteraksi dengan hover dialog
      if (hoverDialogController.hasUserInteractedWithHover()) {
        return; // Jangan autoplay jika sudah ada interaksi hover
      }

      // Cek apakah ini adalah dialog khusus setelah reset - jangan auto-continue dialog ini
      if (dialogController.isShowingPostResetDialog()) {
        return;
      }

      // Set new timer untuk auto-continue semua dialog
      const currentDialog = dialogController.getCurrentDialog();
      if (currentDialog) {
        // Periksa apakah dialog ini adalah dialog yang membutuhkan respons (persistent)
        const shouldPersist = isDialogPersistent(currentDialog.text);

        if (!shouldPersist) {
          // Untuk dialog yang tidak perlu persistent, auto-dismiss lebih cepat
          const textLength = currentDialog.text.length;
          const baseDelay = 2000; // 2 detik base delay
          const charDelay = 50; // 50ms per karakter
          const autoplayDelay = Math.min(
            baseDelay + textLength * charDelay,
            8000,
          ); // maksimal 8 detik

          // Cek apakah ini adalah dialog terakhir dari dialogModel
          const allDialogs = dialogController.getDialogModel().getAllDialogs();
          const currentIndex = dialogController
            .getDialogModel()
            .getCurrentIndex();
          const isLastDialog = currentIndex >= allDialogs.length - 1;

          if (isLastDialog) {
            // Jika ini dialog terakhir, hilangkan dialog box setelah 3 detik
            autoPlayTimerRef.current = setTimeout(() => {
              setIsDialogFinished(true);
            }, 3000);
          } else {
            // Jika bukan dialog terakhir, lanjutkan ke dialog berikutnya seperti biasa
            autoPlayTimerRef.current = setTimeout(() => {
              handleContinue();
            }, autoplayDelay);
          }
        }
      }
    } else if (isComplete && dialogSource === "hover") {
      // Untuk hover dialog, periksa juga persistensi
      if (!isDialogPersistent(text)) {
        // Hover dialog yang tidak memerlukan respons
        const dismissDelay = 3000; // 3 detik untuk membaca pesan

        autoPlayTimerRef.current = setTimeout(() => {
          // Reset dialog hover state
          hoverDialogController.resetHoverState();

          // Hilangkan dialog box
          setIsDialogFinished(true);
        }, dismissDelay);
      }
    }

    // Cleanup timer when unmounting or when dependencies change
    return () => {
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
    };
  }, [
    isComplete,
    dialogSource,
    text,
    handleContinue,
    dialogController,
    hoverDialogController,
    idleTimeoutController,
    setIsDialogFinished,
  ]);

  useEffect(() => {
    // Expose setText and setIsComplete via window for ContractCard to use
    // @ts-ignore - membuat setter functions global untuk penggunaan di ContractCard
    window.__dialogBoxTextSetter = (value: string) => {
      console.log(`[DialogBox] External call to set dialog text: "${value.substring(0, 30)}..."`);
      
      // Tambahkan pemeriksaan prioritas dialog untuk mencegah bentrok
      // Jika saat ini sedang menampilkan RETURN_DIALOG atau HOVER_AFTER_RESET, prioritaskan dialog tersebut
      if (dialogController.isShowingPostResetDialog()) {
        console.log(`[DialogBox] Dialog post-reset aktif, mengabaikan external call dialog`);
        return;
      }
      
      // Jika saat ini sedang menampilkan dialog dari idle timeout, prioritaskan dialog tersebut
      if (idleTimeoutController.isAnyIdleWarningActive()) {
        console.log(`[DialogBox] Idle warning aktif, mengabaikan external call dialog`);
        return;
      }
      
      setText(value);
      // Also ensure dialog is visible
      setIsDialogFinished(false);
    };
    
    // @ts-ignore - membuat setter functions global untuk penggunaan di ContractCard
    window.__dialogBoxIsCompleteSetter = (value: boolean) => {
      // Tambahkan pemeriksaan prioritas dialog untuk mencegah bentrok
      if (dialogController.isShowingPostResetDialog() || idleTimeoutController.isAnyIdleWarningActive()) {
        console.log(`[DialogBox] Dialog prioritas aktif, mengabaikan external call setIsComplete`);
        return;
      }
      
      setIsComplete(value);
    };
    
    // Add a global setter for the isDialogFinished state - needed for idle warnings
    // @ts-ignore
    window.__dialogBoxIsFinishedSetter = (value: boolean) => {
      console.log(`[DialogBox] External call to set isDialogFinished to ${value}`);
      
      // Jika sedang menampilkan dialog post-reset, jangan izinkan dialog box hilang
      if (value === true && dialogController.isShowingPostResetDialog()) {
        console.log(`[DialogBox] Dialog post-reset aktif, mencegah dialog box hilang`);
        return;
      }
      
      setIsDialogFinished(value);
    };
    
    // Set hover dialog callback terlebih dahulu untuk menangkap hover dialog yang sudah aktif
    hoverDialogController.setHoverTextCallback((text, complete) => {
      // Tambahkan pemeriksaan prioritas dialog untuk mencegah bentrok
      if (dialogController.isShowingPostResetDialog()) {
        console.log(`[DialogBox] Dialog post-reset aktif, mengabaikan hover dialog`);
        return;
      }
      
      // Jika saat ini sedang menampilkan dialog dari idle timeout, prioritaskan dialog tersebut
      if (idleTimeoutController.isAnyIdleWarningActive()) {
        console.log(`[DialogBox] Idle warning aktif, mengabaikan hover dialog`);
        return;
      }
      
      setText(text);
      setIsComplete(complete);
      setDialogSource("hover");
      setCharacterName("DIVA JUAN NUR TAQARRUB"); // Dialog hover dari DIVA JUAN (idle warnings juga)
    });

    // Buat function untuk set dialogSource dari luar komponen
    hoverDialogController.setDialogSource = (source: "main" | "hover") => {
      // Tambahkan pemeriksaan prioritas dialog untuk mencegah bentrok
      if (dialogController.isShowingPostResetDialog() || idleTimeoutController.isAnyIdleWarningActive()) {
        console.log(`[DialogBox] Dialog prioritas aktif, mengabaikan set dialog source`);
        return;
      }
      
      setDialogSource(source);
      if (source === "main") {
        setCharacterName("DIVA JUAN NUR TAQARRUB");
      }
    };

    // Periksa apakah hover dialog sedang aktif (typing)
    const isHoverDialogActive = hoverDialogController.isTypingHoverDialog();

    // Start the dialog sequence hanya jika user belum berinteraksi dengan hover dialog
    // dan tidak ada hover dialog yang sedang aktif
    if (
      !hoverDialogController.hasUserInteractedWithHover() &&
      !isHoverDialogActive
    ) {
      dialogController.startDialog((text, complete) => {
        setText(text);
        setIsComplete(complete);
        setDialogSource("main");

        // Get current dialog to display character name
        const currentDialog = dialogController.getCurrentDialog();
        if (currentDialog) {
          setCharacterName(currentDialog.character);
        }

        // Notify HoverDialogController about dialog completion status
        hoverDialogController.setDialogCompleted(complete);
      });
    }

    // Cleanup on unmount
    return () => {
      dialogController.stopTyping();
      if (autoPlayTimerRef.current) {
        clearTimeout(autoPlayTimerRef.current);
      }
      
      // Clean up global setter functions
      // @ts-ignore
      delete window.__dialogBoxTextSetter;
      // @ts-ignore
      delete window.__dialogBoxIsCompleteSetter;
      // @ts-ignore
      delete window.__dialogBoxIsFinishedSetter;
      
      // Jangan reset hover state saat unmount untuk mempertahankan hover dialog
      // hoverDialogController.resetHoverState(); - dihapus karena mengakibatkan reset dialog
    };
  }, []);

  // Dialog box akan tetap muncul meskipun dialog selesai
  // JANGAN return null di sini agar dialog box tetap ditampilkan
  // Tambahan: pastikan dialog kontrak juga tetap terlihat
  
  // Periksa apakah dialog kontrak sedang aktif
  // @ts-ignore - akses properti global dari window yang disimpan di ContractCard
  const isContractDialogActive = window.__contractDialogActive === true;
  
  // Periksa juga apakah ada teks kontrak khusus yang perlu ditampilkan
  // @ts-ignore - akses properti global dari window yang disimpan di ContractCard
  const contractResponseText = window.__contractResponseText;
  
  // Periksa apakah flag untuk memaksa menampilkan dialog box aktif (untuk idle warnings)
  // @ts-ignore - akses properti global dari window yang diatur oleh IdleTimeoutController
  const forceShowIdleWarning = window.__forceShowIdleWarning === true;
  
  // Jika ada flag force show idle warning, log untuk debugging
  if (forceShowIdleWarning) {
    console.log("[DialogBox] Force show idle warning flag is active, dialog box will remain visible");
  }
  
  // Kita menghilangkan bagian yang membuat dialog kontrak muncul penuh
  // Sekarang, saat contractDialogActive, kita biarkan efek typewriter berjalan
  // tanpa mengubah teks secara manual
  // Kita tetapkan bahwa ini adalah kontrak dialog berdasarkan flag __contractDialogActive
  // dan bukan berdasarkan teks lengkap (tidak menggunakan contractResponseText)
  
  // Tambahkan log explisit untuk membantu debugging
  console.log(`[DialogBox] Dialog status check - isDialogFinished: ${isDialogFinished}, text empty: ${text === ""}, contract active: ${isContractDialogActive}, forceShow: ${forceShowIdleWarning}`);
  
  if (forceShowIdleWarning) {
    // Jika flag force show aktif, pastikan dialog box selalu ditampilkan
    // Reset isDialogFinished jika perlu untuk memastikan dialog box muncul kembali
    if (isDialogFinished) {
      console.log("[DialogBox] Force resetting isDialogFinished to false to show idle warning dialog");
      setIsDialogFinished(false);
    }
  }
  
  if (isDialogFinished && text === "" && !isContractDialogActive && !forceShowIdleWarning) {
    // Debug untuk membantu melihat status dialog
    console.log("[DialogBox] Dialog finished with empty text, hiding dialog box");
    return null; // Hanya return null jika tidak ada teks sama sekali dan bukan dialog kontrak dan bukan force show
  }
  
  // Periksa apakah ini adalah dialog kontrak (CONTRACT_RESPONSES) berdasarkan teks
  const isContractResponse = text.includes("I've never lied to you") || 
                          text.includes("seen the proof") ||
                          text.includes("real qualifications") ||
                          text.includes("answer your questions about my background") ||
                          text.includes("I'm the real deal");
  
  // Log khusus untuk dialog kontrak
  if (isContractResponse) {
    console.log(`[DialogBox] CONTRACT RESPONSE dialog active: "${text.substring(0, 30)}..."`);
  }
  
  // Tambahkan log untuk membantu debug tampilan dialog
  if (!isDialogFinished) {
    console.log(`[DialogBox] Showing dialog - Text: "${text.substring(0, 30)}..." Source: ${dialogSource}`);
  }

  return (
    <motion.div
      className="dialog-box-container"
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: 1, 
        y: 0
      }}
      transition={{ 
        duration: 0.5, 
        ease: "easeOut"
      }}
    >
      <div
        className={`dialog-box ${dialogSource === "hover" ? "hover-dialog" : ""}`}
        data-angry={text.includes("fuck") || text.includes("ENOUGH") || text.includes("GET OUT") || text.includes("ASKED FOR THIS")}
      >
        <div
          className={`character-name ${dialogSource === "hover" ? "hover-character" : ""}`}
        >
          {characterName}
          {dialogSource === "hover" && (
            <span className="hover-indicator">⟳</span>
          )}
        </div>
        <div className="dialog-text">{text}</div>
        <div className="dialog-actions">
          <div className="dialog-hints">
            {isComplete &&
              (isDialogPersistent(text) ? (
                <div className="waiting-interaction-hint">
                  Waiting for your action...
                </div>
              ) : // Only show auto-continue hint for main dialog and not for other types
              // Check if it's not a hover dialog, idle warning, or contract response
              dialogSource === "main" &&
                !text.includes("fuck") && // Idle timeout and angry dialog phrases
                !text.includes("ENOUGH") &&
                !text.includes("GET OUT") &&
                !text.includes("ASKED FOR THIS") &&
                !text.includes("KEEP PUSHING") &&
                !text.includes("Staring at me") &&
                !text.includes("throw") &&
                !text.includes("punch") &&
                !text.includes("I've never lied to you") && // Contract responses specific phrases
                !text.includes("seen the proof") &&
                !text.includes("real qualifications") &&
                !text.includes("answer your questions about my background") &&
                !text.includes("I'm the real deal") ? (
                <div className="auto-continue-hint">
                  Auto-continues in a moment...
                </div>
              ) : null)}
          </div>

          <div className="dialog-controls">
            {/* Tombol mute untuk karakter */}
            <button
              className="voice-mute-button"
              onClick={toggleMute}
              title={isMuted ? "Unmute character" : "Mute character"}
            >
              {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
            </button>

            {/* Tentukan apakah tombol NEXT/SKIP harus ditampilkan */}
            {(() => {
              // Untuk dialog hover, tidak perlu menampilkan tombol NEXT/SKIP
              if (dialogSource === "hover") {
                return null;
              }

              // Untuk dialog terakhir dari dialogModel, tidak perlu menampilkan tombol NEXT/SKIP
              if (dialogSource === "main") {
                const allDialogs = dialogController
                  .getDialogModel()
                  .getAllDialogs();
                const currentIndex = dialogController
                  .getDialogModel()
                  .getCurrentIndex();
                const isLastDialog = currentIndex >= allDialogs.length - 1;

                if (isLastDialog) {
                  return null;
                }
              }

              // Cek apakah ini adalah dialog marah
              const isAngryDialog = text.includes("fuck") || 
                                  text.includes("ENOUGH") || 
                                  text.includes("GET OUT") || 
                                  text.includes("ASKED FOR THIS") ||
                                  text.includes("KEEP PUSHING");
                                  
              // Jika dialog marah, tidak menampilkan tombol
              if (isAngryDialog) {
                return null;
              }
              
              // Untuk dialog lainnya, tampilkan tombol NEXT/SKIP seperti biasa
              return isComplete ? (
                <button
                  className="just-text-button next-button"
                  onClick={handleContinue}
                >
                  <span className="button-icon">→</span>
                  <span className="button-text">NEXT</span>
                </button>
              ) : (
                <button
                  className="just-text-button skip-button"
                  onClick={handleContinue}
                >
                  <span className="button-icon">▶</span>
                  <span className="button-text">SKIP</span>
                </button>
              );
            })()}
          </div>
        </div>
      </div>

      <style>{`
        .dialog-box-container {
          position: fixed;
          bottom: 2rem;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 50;
          pointer-events: none;
          padding: 0 1rem;
        }
        
        .dialog-box {
          background: rgba(15, 12, 10, 0.7);
          border: 1px solid rgba(150, 130, 100, 0.3);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
          border-radius: 0;
          width: 100%;
          max-width: 800px;
          padding: 1.8rem 2rem;
          position: relative;
          pointer-events: auto;
          backdrop-filter: blur(5px);
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        /* Efek untuk dialog marah */
        .dialog-box[data-angry="true"] {
          background: rgba(25, 8, 5, 0.92);
          border-color: rgba(255, 30, 0, 0.6);
          box-shadow: 
            0 0 25px rgba(255, 0, 0, 0.4),
            inset 0 0 15px rgba(255, 50, 0, 0.3);
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both, 
                     glow 2s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes shake {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          10%, 90% { transform: translate3d(-2px, -1px, 0) rotate(-0.5deg); }
          20%, 80% { transform: translate3d(3px, 2px, 0) rotate(0.5deg); }
          30%, 50%, 70% { transform: translate3d(-5px, -2px, 0) rotate(-1deg); }
          40%, 60% { transform: translate3d(5px, 1px, 0) rotate(1deg); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 25px rgba(255, 0, 0, 0.4), inset 0 0 15px rgba(255, 50, 0, 0.3); }
          50% { box-shadow: 0 0 35px rgba(255, 0, 0, 0.6), inset 0 0 25px rgba(255, 50, 0, 0.5); }
        }

        .dialog-box[data-angry="true"] .dialog-text {
          color: #fff;
          text-shadow: 
            0 0 8px rgba(255, 50, 0, 0.8),
            0 0 12px rgba(255, 0, 0, 0.4);
          animation: textPulse 2s ease-in-out infinite;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        @keyframes textPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .dialog-box[data-angry="true"] .character-name {
          background: rgba(40, 10, 5, 0.95);
          border-color: rgba(255, 30, 0, 0.6);
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.3);
          animation: nameGlow 2s ease-in-out infinite;
        }

        @keyframes nameGlow {
          0%, 100% { text-shadow: 0 0 8px rgba(255, 50, 0, 0.8); }
          50% { text-shadow: 0 0 12px rgba(255, 0, 0, 1); }
        }
        

        
        /* Tambahkan pseudo-element untuk inner border ornament */
        .dialog-box::before {
          content: '';
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border: 1px solid rgba(150, 130, 100, 0.15);
          pointer-events: none;
        }
        
        .character-name {
          position: absolute;
          top: -1.2rem;
          left: 1rem;
          background: rgba(30, 25, 20, 0.9); /* Warna gelap */
          color: #d4c9a8; /* Warna emas redup */
          padding: 0.35rem 1.2rem;
          border-radius: 0; /* No rounded corners */
          font-weight: 500;
          font-size: 0.9rem;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(150, 130, 100, 0.4);
        }
        
        .dialog-text {
          color: #e8e0cf; /* Warna text emas pucat */
          font-family: 'Garamond', 'Times New Roman', serif; /* Font serif untuk dialog */
          font-size: clamp(1rem, 2.5vw, 1.1rem);
          line-height: 1.7;
          margin-bottom: 1.2rem;
          min-height: 3rem; /* Ensure consistent height but not too tall */
          max-height: 8rem; /* Limit maximum height */
          overflow-y: auto; /* Add scrolling for very long text */
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
          letter-spacing: 0.3px;
          padding-right: 0.5rem; /* Space for potential scrollbar */
        }
        
        .dialog-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          border-top: 1px solid rgba(150, 130, 100, 0.15);
          padding-top: 0.5rem;
          margin-top: 0.5rem;
          height: 30px; /* Reduced height untuk tombol */
        }
        
        .dialog-hints {
          flex: 1;
          display: flex;
          align-items: center;
          max-width: 70%; /* Make sure hints don't overlap with button */
          overflow: hidden; /* Hide overflow text */
        }
        
        .auto-continue-hint {
          font-size: 0.8rem;
          color: rgba(180, 160, 120, 0.5);
          font-style: italic;
          animation: pulse 2s infinite;
          padding-left: 1rem;
        }
        
        .waiting-interaction-hint {
          font-size: 0.8rem;
          color: rgba(200, 180, 100, 0.7);
          font-weight: bold;
          animation: pulse 1.5s infinite;
          padding-left: 1rem;
        }
        
        /* Ornamen dekoratif untuk tombol continue */
        .dialog-actions::before {
          content: '';
          position: absolute;
          top: -2px;
          right: 45px;
          width: 40px;
          height: 3px;
          background: rgba(150, 130, 100, 0.2);
        }
        
        .dialog-controls-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        
        .dialog-continue {
          position: relative;
          background: rgba(30, 25, 20, 0.9);
          color: #d4c9a8; /* Warna emas redup */
          border: 1px solid rgba(150, 130, 100, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          text-transform: uppercase;
          letter-spacing: 1px;
          cursor: pointer;
          padding: 0.4rem 1rem;
          min-width: 6rem;
          border-radius: 0;
          transition: all 0.3s ease;
          overflow: hidden;
          z-index: 1;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.4), inset 0 0 3px rgba(255, 220, 150, 0.1);
        }
        
        .dialog-button-inner {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        
        .dialog-button-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
        }
        
        .dialog-button-text {
          font-size: 0.9rem;
          font-weight: 500;
          line-height: 1;
        }
        
        .dialog-button-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(220, 190, 120, 0.05), rgba(150, 130, 100, 0.05));
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }
        
        /* Button hover effect */
        .dialog-continue:hover {
          color: #f0eadc; /* Warna emas yang lebih terang */
          border-color: rgba(180, 160, 120, 0.8);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.6), inset 0 0 8px rgba(255, 220, 150, 0.2);
          text-shadow: 0 0 4px rgba(220, 190, 140, 0.8);
        }
        
        .dialog-continue:hover .dialog-button-glow {
          opacity: 1;
          animation: pulse-glow 2s infinite;
        }
        
        /* Specific styling for next vs skip */
        .dialog-next {
          background: rgba(40, 35, 30, 0.95);
          border-color: rgba(170, 150, 110, 0.5);
          position: relative;
        }
        
        /* Styling untuk tombol */
        .dialog-skip {
          background: rgba(35, 30, 25, 0.9);
          border-color: rgba(150, 130, 100, 0.4);
        }
        
        /* Dark Souls button styling */
        .dark-souls-button {
          background: transparent;
          color: #d4c9a8;
          border: none;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          position: relative; /* Change from absolute to relative */
          margin-left: auto; /* Push to right side */
          padding: 0.3rem 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          cursor: pointer;
          min-width: 60px;
          height: 24px;
          justify-content: center;
          box-sizing: border-box;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
        }
        
        .next-button {
          color: rgba(255, 235, 190, 0.9);
        }
        
        .skip-button {
          color: rgba(210, 190, 150, 0.85);
        }
        
        .button-icon {
          font-size: 0.8rem;
          line-height: 1;
          margin-right: 0.15rem;
        }
        
        .button-text {
          font-weight: 500;
          font-size: 0.7rem;
          line-height: 1;
          text-align: center;
        }
        
        /* Hover/active states */
        .hover-continue {
          opacity: 0.9;
        }
        
        .hover-continue:hover {
          opacity: 1;
        }
        
        .dark-souls-button:hover,
        .just-text-button:hover {
          color: #fff;
          text-shadow: 0 0 5px rgba(255, 220, 150, 0.6);
        }
        
        /* Styling for voice mute button */
        .dialog-controls {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .voice-mute-button {
          background: transparent;
          border: none;
          color: #d4c9a8;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0.8;
        }
        
        .voice-mute-button:hover {
          color: #fff;
          text-shadow: 0 0 5px rgba(255, 220, 150, 0.6);
          opacity: 1;
        }
        
        /* Styling for pure text buttons (no box/border) */
        .just-text-button {
          background: transparent;
          border: none;
          color: #d4c9a8;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          text-transform: uppercase;
          cursor: pointer;
          display: flex;
          align-items: center;
          font-size: 0.7rem;
          padding: 0.3rem;
          text-shadow: 0 0 3px rgba(0, 0, 0, 0.5);
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: inset 0 0 5px rgba(255, 220, 150, 0.1);
          }
          50% {
            box-shadow: inset 0 0 10px rgba(255, 220, 150, 0.3);
          }
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.3;
          }
        }
        
        /* Styling for hover dialogs - konsisten dengan tema */
        .hover-dialog {
          background: rgba(15, 12, 10, 0.7); /* Konsisten dengan dialog utama */
          border: 1px solid rgba(150, 130, 100, 0.3);
          box-shadow: 0 0 15px rgba(0, 0, 0, 0.4);
        }
        
        .hover-character {
          background: rgba(30, 25, 20, 0.9); /* Konsisten dengan dialog utama */
          color: #d4c9a8;
          font-family: 'Trajan Pro', 'Cinzel', 'Garamond', serif;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(150, 130, 100, 0.4);
        }
        
        .hover-indicator {
          font-size: 0.8rem;
          animation: spin 2s linear infinite;
          display: inline-block;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .dialog-box-container {
            bottom: 1rem;
            padding: 0 0.5rem;
          }
          
          .dialog-box {
            padding: 0.8rem 1rem;
            max-width: 100%;
          }
          
          .dialog-text {
            min-height: 2.5rem;
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
            line-height: 1.5;
            max-height: 6rem;
          }
          
          .character-name {
            font-size: 0.75rem;
            padding: 0.25rem 0.7rem;
            top: -1rem;
            letter-spacing: 1px;
          }
          
          .dialog-actions {
            padding-top: 0.4rem;
            margin-top: 0.5rem;
            height: 24px;
          }
          
          .dialog-continue {
            font-size: 0.8rem;
            padding: 0.3rem 0.5rem;
            min-width: 5rem;
          }
          
          .dialog-button-text {
            font-size: 0.8rem;
          }
          
          .dialog-button-icon svg {
            width: 14px;
            height: 14px;
          }
          
          .auto-continue-hint,
          .waiting-interaction-hint {
            font-size: 0.7rem;
            padding-left: 0.5rem;
          }
          
          .just-text-button {
            font-size: 0.7rem;
            padding: 0.2rem 0.4rem;
            min-width: 50px;
            height: 22px;
          }
          
          .button-text {
            margin-left: 2px;
          }
          
          .voice-mute-button {
            width: 28px;
            height: 28px;
          }
        }
        
        /* Extra small devices */
        @media (max-width: 480px) {
          .dialog-box-container {
            bottom: 0.5rem;
            padding: 0 0.5rem; /* Narrower padding */
          }
          
          .dialog-box {
            padding: 1rem 0.8rem; /* More vertical padding, less horizontal */
            max-width: 100%; /* Full width */
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5); /* Stronger shadow */
          }
          
          .dialog-text {
            font-size: 0.95rem; /* Slightly larger text for readability */
            line-height: 1.5;
            min-height: 2.5rem;
            max-height: 6.5rem;
            margin-bottom: 0.8rem; /* Reduced space at bottom */
          }
          
          .character-name {
            top: -0.9rem;
            left: 0.5rem;
            font-size: 0.75rem;
            padding: 0.2rem 0.6rem;
            font-weight: 600; /* Slightly bolder */
          }
          
          .dialog-actions {
            margin-top: 0.4rem; /* Reduced space */
          }
          
          .just-text-button {
            padding: 0.3rem 0.5rem; /* Smaller buttons, more touch-friendly */
            min-width: 60px; /* Wider touch target */
          }
          
          .dialog-hints {
            max-width: 60%; /* Ensure hints don't overlap buttons on mobile */
          }
          
          .voice-mute-button {
            width: 24px;
            height: 24px;
          }
        }
        
        /* Landscape mode */
        @media (max-height: 500px) and (orientation: landscape) {
          .dialog-box-container {
            bottom: 0.5rem;
          }
          
          .dialog-box {
            padding: 0.6rem 0.8rem;
            max-width: 90%;
          }
          
          .dialog-text {
            min-height: 2rem;
            max-height: 5rem; /* Shorter for landscape mode */
            margin-bottom: 0.3rem;
            font-size: 0.85rem;
            line-height: 1.4;
          }
          
          .dialog-actions {
            height: 30px; /* Smaller height for actions in landscape */
          }
          
          .dialog-hints {
            max-width: 50%; /* More space for buttons */
          }
          
          .auto-continue-hint,
          .waiting-interaction-hint {
            font-size: 0.65rem; /* Smaller text */
          }
        }
      `}</style>
    </motion.div>
  );
};

export default DialogBox;
