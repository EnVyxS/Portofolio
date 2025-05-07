import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaScroll,
  FaSearchPlus,
  FaSearchMinus,
  FaArrowLeft,
  FaArrowRight,
  FaFilePdf,
} from "react-icons/fa";
import DialogController from "../controllers/dialogController";
import HoverDialogController from "../controllers/hoverDialogController";
import AchievementController from "../controllers/achievementController";
import { useAudio } from "../context/AudioManager";

// Responses for contract interactions - moved from DialogBox.tsx and made more natural
export const CONTRACT_RESPONSES = [
  "Now you've seen the proof. Are we good to continue, or do you need more convincing?",
  "That should answer your questions about my background. Ready to talk about something else now?",
  "There's everything you needed to see. I'm the real deal. What would you like to discuss next?",
];

// Import sounds
import swipeSoundSrc from "@assets/Screen swipe sound effect (mp3cut.net).m4a";
import footstepSoundSrc from "@assets/footsteps sound effect - walking sound effect - copyright free sound effects (mp3cut.net) (1).m4a";

// Import gambar sertifikat
import ijazah from "@assets/Ijazah.jpg";
import transkrip1 from "@assets/Transkrip Nilai_page-0001.jpg";
import transkrip2 from "@assets/Transkrip Nilai_page-0002.jpg";
import universitas from "@assets/111202012560mhs.dinus.ac.id_page-0001.jpg";
import bnsp1 from "@assets/BNSP_page-0001.jpg";
import bnsp2 from "@assets/BNSP_page-0002.jpg";
import kampusMerdeka from "@assets/Backend Java MSIB_page-0001.jpg";
import studentReport1 from "@assets/KM 4_SR_BEJ2302KM4009_DIVA JUAN NUR TAQARRUB_2_page-0001.jpg";
import studentReport2 from "@assets/KM 4_SR_BEJ2302KM4009_DIVA JUAN NUR TAQARRUB_2_page-0002.jpg";

// Path ke file dokumen
const CONTRACT_IMAGES = [
  ijazah,
  transkrip1,
  transkrip2,
  universitas,
  bnsp1,
  bnsp2,
  kampusMerdeka,
  studentReport1,
  studentReport2,
];

// Untuk menampilkan nama file yang lebih pendek
const IMAGE_TITLES = [
  "Ijazah",
  "Transkrip Nilai - Page 1",
  "Transkrip Nilai - Page 2",
  "Universitas Dian Nuswantoro",
  "Sertifikat Kompetensi BNSP",
  "Daftar Unit Kompetensi BNSP",
  "Sertifikat Kampus Merdeka",
  "Student Report - Page 1",
  "Student Report - Page 2",
];

// Mendapatkan nama file yang lebih pendek untuk ditampilkan
const getDocumentName = (path: string) => {
  const fileName = path.split("/").pop() || "";
  // Jika filename terlalu panjang, potong
  return fileName.length > 20 ? fileName.substring(0, 17) + "..." : fileName;
};

const ContractCard: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(0.8); // Default zoom 80%
  const [currentIndex, setCurrentIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Posisi untuk panning/dragging
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false); // Track if user has already dragged
  const dialogController = DialogController.getInstance();
  const { setVolume, currentVolume } = useAudio();

  // Audio references for sounds
  const swipeSoundRef = useRef<HTMLAudioElement | null>(null);
  const footstepSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements on component mount
  useEffect(() => {
    // Initialize swipe sound
    swipeSoundRef.current = new Audio(swipeSoundSrc);
    swipeSoundRef.current.volume = 0.7; // Meningkatkan dari 0.3 menjadi 0.7 untuk mobile

    // Initialize footstep sound
    footstepSoundRef.current = new Audio(footstepSoundSrc);
    footstepSoundRef.current.volume = 0.8; // Meningkatkan dari 0.4 menjadi 0.8 untuk mobile

    // Clean up
    return () => {
      if (swipeSoundRef.current) {
        swipeSoundRef.current.pause();
        swipeSoundRef.current = null;
      }
      if (footstepSoundRef.current) {
        footstepSoundRef.current.pause();
        footstepSoundRef.current = null;
      }
    };
  }, []);

  // Play swipe sound function
  const playSwipeSound = () => {
    try {
      if (swipeSoundRef.current) {
        swipeSoundRef.current.currentTime = 0; // Reset to start
        swipeSoundRef.current
          .play()
          .catch((e) => console.error("Error playing swipe sound:", e));
      }
    } catch (err) {
      console.error("Error playing swipe sound:", err);
    }
  };

  // Animasi transisi seperti buku untuk swipe next
  const [pageDirection, setPageDirection] = useState<"next" | "prev" | null>(
    null,
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Track original volume to restore later
  const [originalVolume, setOriginalVolume] = useState<number | null>(null);

  const handleContractClick = () => {
    if (!isOpen) {
      // Saat kontrak dibuka, tidak perlu dialog yang menggangu
      // Setiap dialog yang saat ini berjalan harus dihentikan
      dialogController.stopTyping();

      // Mencegah dialog ditampilkan saat kontrak terbuka dengan cara
      // memindahkan indeks dialog ke dialog terakhir
      const dialogs = dialogController.getDialogModel().getAllDialogs();
      const lastDialogIndex = dialogs.length - 1;
      dialogController.getDialogModel().setCurrentDialogIndex(lastDialogIndex);

      // Simpan volume asli sebelum dikurangi
      setOriginalVolume(currentVolume);

      // Kurangi volume musik ambient
      if (currentVolume) {
        setVolume(currentVolume * 0.5); // Kurangi volume menjadi 50% dari volume saat ini
      }

      // Unlock achievement for opening contract
      try {
        const achievementController = AchievementController.getInstance();
        achievementController.unlockAchievement('contract');
      } catch (error) {
        console.error("Failed to unlock contract achievement:", error);
      }

      // Set flag for contract dialog active - this will be checked in IdleTimeoutController
      try {
        // @ts-ignore - setting global property on window
        window.__contractDialogActive = true;
        console.log("[ContractCard] Set contract dialog active flag to true");
      } catch (e) {
        console.error("Could not set contract dialog active flag:", e);
      }

      setIsOpen(true);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newScale = Math.min(scale + 0.2, 3); // Maksimal zoom 3x
    setScale(newScale);

    // Reset posisi jika skalanya berubah dari 1 ke lebih besar (pertama kali zoom in)
    if (scale <= 1 && newScale > 1) {
      setPosition({ x: 0, y: 0 }); // Reset posisi
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newScale = Math.max(scale - 0.2, 0.5); // Minimal zoom 0.5x
    setScale(newScale);

    // Reset posisi jika skala ≤ 1 (saat tidak bisa drag lagi)
    if (newScale <= 1) {
      setPosition({ x: 0, y: 0 }); // Reset posisi
    }
  };

  const handleNextDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex < CONTRACT_IMAGES.length - 1 && !isAnimating) {
      // Mulai animasi dan putar suara
      setIsAnimating(true);
      setPageDirection("next");
      playSwipeSound();

      // Tunggu animasi selesai sebelum update index - dipercepat ke 30ms
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setScale(0.8); // Reset zoom ke 80%
        setPosition({ x: 0, y: 0 }); // Reset posisi saat ganti halaman
        
        // Langsung reset animasi state
        setIsAnimating(false);
        setPageDirection(null);
      }, 30); // Dipercepat dari 50ms menjadi 30ms
    }
  };

  const handlePrevDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentIndex > 0 && !isAnimating) {
      // Mulai animasi dan putar suara
      setIsAnimating(true);
      setPageDirection("prev");
      playSwipeSound();

      // Tunggu animasi selesai sebelum update index - dipercepat ke 30ms
      setTimeout(() => {
        setCurrentIndex((prev) => prev - 1);
        setScale(0.8); // Reset zoom ke 80%
        setPosition({ x: 0, y: 0 }); // Reset posisi saat ganti halaman
        // Tidak mereset hasDragged sehingga tooltip tetap tersembunyi jika pernah digunakan

        // Beri jeda sedikit sebelum mengizinkan animasi lagi - dipercepat ke 30ms
        setTimeout(() => {
          setIsAnimating(false);
          setPageDirection(null);
        }, 30); // Dipercepat dari 50ms menjadi 30ms
      }, 30); // Dipercepat dari 100ms menjadi 30ms untuk animasi flip
    }
  };

  // Play footsteps sound function
  const playFootstepSound = () => {
    try {
      if (footstepSoundRef.current) {
        footstepSoundRef.current.currentTime = 0; // Reset to start
        footstepSoundRef.current
          .play()
          .catch((e) => console.error("Error playing footstep sound:", e));
      }
    } catch (err) {
      console.error("Error playing footstep sound:", err);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Kembalikan volume saat kontrak ditutup
    if (originalVolume !== null) {
      setVolume(originalVolume);
    }
    
    // Reset contract dialog active flag
    try {
      // @ts-ignore - reset global property on window
      window.__contractDialogActive = false;
      console.log("[ContractCard] Reset contract dialog active flag to false when closing contract");
    } catch (e) {
      console.error("Could not reset contract dialog active flag:", e);
    }

    // Display a random CONTRACT_RESPONSE dialog
    const randomIndex = Math.floor(Math.random() * CONTRACT_RESPONSES.length);
    const randomResponse = CONTRACT_RESPONSES[randomIndex];

    // Jangan putar suara footstep saat menutup kontrak

    // Hentikan dialog yang sedang berjalan
    dialogController.stopTyping();

    // Pastikan dialog model tidak menampilkan dialog lagi setelah dialog custom
    // dengan cara memindahkan indeks ke dialog terakhir
    const dialogs = dialogController.getDialogModel().getAllDialogs();
    const lastDialogIndex = dialogs.length - 1;
    dialogController.getDialogModel().setCurrentDialogIndex(lastDialogIndex);

    // Show custom dialog with the selected response setelah semua preset
    setTimeout(() => {
      // Dapatkan instance HoverDialogController untuk set source
      const hoverDialogController = HoverDialogController.getInstance();

      // Set dialog source ke 'main' SEBELUM memanggil showCustomDialog
      // Ini penting karena showCustomDialog akan mengubahnya ke 'hover' di dalamnya
      if (hoverDialogController.setDialogSource) {
        console.log(
          "[ContractCard] Setting dialog source to 'main' before showing custom dialog",
        );
        hoverDialogController.setDialogSource("main");
      }

      // Pastikan isDialogFinished di DialogBox diatur ke false terlebih dahulu
      // Gunakan objek window untuk menyimpan state terkait kontrak
      // @ts-ignore - tambahkan properti global untuk komunikasi antar komponen
      window.__contractDialogActive = true;

      // Sebelum menampilkan dialog custom, reset dialogController dulu
      dialogController.stopTyping();

      // Dapatkan handler dari DialogBox untuk setText dan setIsComplete
      // Kita TIDAK menggunakan __contractResponseText disini karena itu membuat teks muncul penuh
      // sebelum efek typewriter. Sebagai gantinya, kita hanya menandai bahwa dialog kontrak sedang aktif
      // tanpa menyimpan teks lengkapnya.

      // @ts-ignore - untuk mendapatkan akses ke textSetter di DialogBox jika tersedia
      const textSetter = window.__dialogBoxTextSetter;
      // @ts-ignore - untuk mendapatkan akses ke isCompleteSetter di DialogBox jika tersedia
      const isCompleteSetter = window.__dialogBoxIsCompleteSetter;

      // PENTING: Dialog custom harus selalu menjadi dialog aktif dan utama
      dialogController.showCustomDialog(randomResponse, (text, isComplete) => {
        // Callback ini dipanggil setiap karakter (saat dialog sedang berjalan dan setelah selesai)
        // Pastikan dialog source tetap 'main' dan dialog box ditampilkan
        if (hoverDialogController.setDialogSource) {
          hoverDialogController.setDialogSource("main");
        }

        // Tambahkan logging untuk membantu debug
        console.log(
          `[ContractCard] Dialog callback - Text: "${text.substring(0, 20)}..." isComplete: ${isComplete}`,
        );

        // Langsung update text di DialogBox jika setter tersedia
        if (typeof textSetter === "function") {
          console.log(`[ContractCard] Updating DialogBox text directly`);
          textSetter(text);
        }

        // Update isComplete di DialogBox jika setter tersedia
        if (typeof isCompleteSetter === "function") {
          isCompleteSetter(isComplete);
        }

        // Pada akhir dialog (isComplete = true), tandai bahwa dialog kontrak telah selesai
        if (isComplete) {
          // @ts-ignore - hapus properti global ketika dialog selesai
          setTimeout(() => {
            // @ts-ignore
            window.__contractDialogActive = false;
            // @ts-ignore
            window.__contractResponseText = null;
          }, 5000); // Beri waktu 5 detik untuk dialog tetap terlihat
        }
      });
    }, 300);

    setIsOpen(false);
    setCurrentIndex(0);
    setScale(0.8); // Kembalikan ke default zoom 80%
    setPosition({ x: 0, y: 0 }); // Reset posisi
    setHasDragged(false); // Reset status drag agar tooltip muncul kembali saat user membuka dokumen baru
  };

  const openImageInNewTab = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Berikan achievement 'document' saat double-click pada gambar kontrak
    try {
      const achievementController = AchievementController.getInstance();
      achievementController.unlockAchievement('document');
      
      // Buka gambar kontrak di tab baru setelah jeda singkat untuk melihat achievement
      setTimeout(() => {
        window.open(CONTRACT_IMAGES[currentIndex], "_blank");
        console.log("Opening contract image in new tab after showing document achievement");
      }, 1500); // 1.5 detik delay untuk melihat achievement
    } catch (error) {
      console.error("Failed to unlock document achievement:", error);
      // Jika terjadi error, tetap buka gambar kontrak
      window.open(CONTRACT_IMAGES[currentIndex], "_blank");
    }
  };

  return (
    <>
      {/* Kontrak Card tersembunyi di sisi kiri layar */}
      <motion.div
        className="contract-card"
        initial={{ x: -10 }}
        animate={{ x: isOpen ? -120 : -10 }}
        onClick={handleContractClick}
      >
        <FaScroll size={24} />
        <span className="contract-label">CONTRACT</span>
      </motion.div>

      {/* Overlay Modal untuk menampilkan dokumen */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="contract-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            <motion.div
              className="contract-modal"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="contract-controls">
                <button
                  onClick={handleClose}
                  className="control-button close-button"
                >
                  ×
                </button>
                <div className="zoom-controls">
                  <button onClick={handleZoomIn} className="control-button">
                    <FaSearchPlus />
                  </button>
                  <button onClick={handleZoomOut} className="control-button">
                    <FaSearchMinus />
                  </button>
                </div>
                <div className="navigation-controls">
                  <button
                    onClick={handlePrevDoc}
                    className={`control-button ${currentIndex === 0 ? "disabled" : ""}`}
                    disabled={currentIndex === 0}
                  >
                    <FaArrowLeft />
                  </button>
                  <span className="page-indicator">
                    {currentIndex + 1}/{CONTRACT_IMAGES.length}
                  </span>
                  <button
                    onClick={handleNextDoc}
                    className={`control-button ${currentIndex === CONTRACT_IMAGES.length - 1 ? "disabled" : ""}`}
                    disabled={currentIndex === CONTRACT_IMAGES.length - 1}
                  >
                    <FaArrowRight />
                  </button>
                </div>
              </div>

              <div className="contract-document-container">
                <div
                  className={`document-content ${pageDirection ? `page-flip-${pageDirection}` : ""} ${isDragging ? "dragging" : ""} ${hasDragged ? "has-dragged" : ""}`}
                  style={{
                    transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                    cursor:
                      scale > 1
                        ? isDragging
                          ? "grabbing"
                          : "grab"
                        : "default",
                    userSelect: "none", // Prevent text selection during drag
                    touchAction: "none", // Improve touch interactions
                  }}
                  onMouseDown={(e) => {
                    // Hanya aktifkan dragging jika zoom lebih dari 1x
                    if (scale > 1) {
                      setIsDragging(true);
                      setDragStart({
                        x: e.clientX - position.x,
                        y: e.clientY - position.y,
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isDragging && scale > 1) {
                      // Batas pergerakan - semakin tinggi zoom, semakin luas area gerak
                      const maxMove = (scale - 1) * 300;

                      const newX = e.clientX - dragStart.x;
                      const newY = e.clientY - dragStart.y;

                      // Batasi pergerakan dalam batas tertentu
                      const clampedX = Math.max(
                        Math.min(newX, maxMove),
                        -maxMove,
                      );
                      const clampedY = Math.max(
                        Math.min(newY, maxMove),
                        -maxMove,
                      );

                      // Set hasDragged saat pengguna benar-benar melakukan drag (sudah bergerak)
                      if (
                        !hasDragged &&
                        (Math.abs(clampedX) > 5 || Math.abs(clampedY) > 5)
                      ) {
                        setHasDragged(true);
                      }

                      setPosition({ x: clampedX, y: clampedY });
                    }
                  }}
                  onMouseUp={() => {
                    setIsDragging(false);
                  }}
                  onMouseLeave={() => {
                    setIsDragging(false);
                  }}
                >
                  <div className="document-header">
                    <h3 className="document-title">
                      {IMAGE_TITLES[currentIndex]}
                    </h3>
                  </div>
                  <div className="book-container">
                    <div
                      className={`page-shadow ${pageDirection ? "active" : ""}`}
                    ></div>
                    <img
                      src={CONTRACT_IMAGES[currentIndex]}
                      alt={IMAGE_TITLES[currentIndex]}
                      className="document-image"
                      onDoubleClick={openImageInNewTab}
                      title="Double-click to open in new tab"
                      draggable="false" // Cegah drag default image
                    />
                    <div
                      className={`page-fold ${pageDirection ? "active" : ""} ${pageDirection || ""}`}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .contract-card {
          position: fixed;
          left: 25px; /* Diposisikan lebih ke kanan untuk sempurna */
          top: 14px; /* Diturunkan sedikit lagi */
          background: rgba(30, 25, 20, 0.92);
          color: #e5d9b8;
          padding: 12px 16px 12px 14px;
          border-radius: 6px;
          border: 1px solid rgba(170, 150, 120, 0.5);
          display: flex;
          flex-direction: row;
          align-items: center;
          cursor: pointer;
          z-index: 40;
          transition: all 0.3s ease;
          box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4), 0 0 5px rgba(255, 220, 150, 0.1);
        }

        .contract-card:hover {
          transform: translateY(-1px);
          background: rgba(45, 40, 35, 0.97);
          border-color: rgba(200, 180, 140, 0.7);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 220, 150, 0.25);
        }

        .contract-label {
          margin-left: 10px;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          font-weight: 500;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
        }

        .contract-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.88);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 100;
          backdrop-filter: blur(5px);
        }

        .contract-modal {
          background: rgba(25, 20, 18, 0.97);
          border: 2px solid rgba(170, 150, 120, 0.4);
          border-radius: 4px;
          width: 92%;
          max-width: 950px;
          height: 88vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.7), 0 0 20px rgba(0, 0, 0, 0.5), 0 0 8px rgba(255, 220, 150, 0.15);
          position: relative;
        }

        .contract-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: rgba(35, 30, 25, 0.95);
          border-bottom: 2px solid rgba(170, 150, 120, 0.35);
          flex-wrap: wrap;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
          position: relative;
          z-index: 5;
        }

        .zoom-controls, .navigation-controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .control-button {
          background: rgba(45, 40, 35, 0.9);
          color: #e5d9b8;
          border: 1px solid rgba(170, 150, 120, 0.4);
          border-radius: 4px;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        }

        .control-button:hover {
          background: rgba(55, 50, 45, 0.95);
          border-color: rgba(200, 180, 140, 0.7);
          color: #f5eeda;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4), 0 0 5px rgba(255, 220, 150, 0.2);
        }

        .control-button:active {
          transform: translateY(0px);
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.3);
        }

        .control-button.disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .close-button {
          font-size: 24px;
          font-weight: bold;
          color: #f0e6cc;
          background: rgba(60, 40, 30, 0.9);
          transition: all 0.25s ease;
        }
        
        .close-button:hover {
          background: rgba(80, 50, 40, 0.95);
          color: #fff;
        }

        .contract-document-container {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          background: rgba(20, 16, 14, 0.9);
          position: relative;
        }

        .document-content {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-origin: center;
          width: 100%;
          height: 100%;
          padding: 0 10px; /* Tambah padding horizontal */
          margin: 0 auto; /* Pastikan berada di tengah layar */
          position: relative;
        }
        
        .document-content.dragging {
          transition: none; /* Hapus transisi saat melakukan drag untuk responsivitas langsung */
          cursor: grabbing !important;
        }
        
        .document-content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255, 255, 255, 0.05);
          z-index: 9;
          opacity: 0;
          pointer-events: none;
          border-radius: 8px;
          transition: opacity 0.2s ease;
        }
        
        .document-content[style*="scale(1.2)"]::before,
        .document-content[style*="scale(1.4)"]::before,
        .document-content[style*="scale(1.6)"]::before,
        .document-content[style*="scale(1.8)"]::before,
        .document-content[style*="scale(2)"]::before,
        .document-content[style*="scale(2.2)"]::before,
        .document-content[style*="scale(2.4)"]::before,
        .document-content[style*="scale(2.6)"]::before,
        .document-content[style*="scale(2.8)"]::before,
        .document-content[style*="scale(3)"]::before {
          content: '✥ Click and drag to navigate document ✥';
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 220, 150, 0.9);
          font-size: 16px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
          font-family: 'Trajan Pro', serif;
          letter-spacing: 1px;
          font-weight: bold;
          padding: 10px 20px;
          background: rgba(60, 40, 30, 0.4);
          border-radius: 6px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(200, 180, 140, 0.3);
          opacity: 0.85;
          animation: pulseTip 2s infinite alternate ease-in-out;
          transform: translateY(-20px);
        }
        
        @keyframes pulseTip {
          0% { opacity: 0.85; transform: translateY(-20px) scale(1); }
          100% { opacity: 0.95; transform: translateY(-20px) scale(1.05); }
        }
        
        .document-content.dragging::before,
        .document-content.has-dragged::before {
          opacity: 0;
        }
        
        .document-header {
          margin-bottom: 20px;
          text-align: center;
          width: 100%; /* Full width */
          padding: 15px 10px 5px;
          background: rgba(20, 16, 14, 0.7);
          border-bottom: 1px solid rgba(170, 150, 120, 0.3);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .document-title {
          font-family: 'Trajan Pro', 'Cinzel', serif;
          color: #f0e6cc;
          font-size: 1.4rem;
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 0 0 4px rgba(255, 220, 150, 0.2);
          letter-spacing: 1.8px;
          margin: 0;
          position: relative;
          padding-bottom: 8px;
          font-weight: 500;
        }
        
        .document-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 2px;
          background: linear-gradient(90deg, rgba(170, 150, 120, 0), rgba(200, 180, 140, 0.8), rgba(170, 150, 120, 0));
        }

        .document-image {
          max-width: 96%;
          max-height: 84%;
          object-fit: contain;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.6), 0 0 10px rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(170, 150, 120, 0.5);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: zoom-in;
          display: block;
          margin: 0 auto; /* Center horizontally */
          border-radius: 2px;
          filter: brightness(1.1) contrast(1.05);
          position: relative;
        }
        
        .document-image::after {
          content: 'Double click to open in new tab';
          position: absolute;
          bottom: -30px;
          left: 0;
          right: 0;
          text-align: center;
          font-size: 0.75rem;
          color: rgba(170, 150, 120, 0.7);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .document-image:hover::after {
          opacity: 1;
        }
        
        .document-image:hover {
          transform: scale(1.025) translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.7), 0 0 12px rgba(255, 220, 150, 0.25);
          border-color: rgba(200, 180, 140, 0.8);
          filter: brightness(1.15) contrast(1.08);
        }
        
        /* Animasi transisi buku */
        .book-container {
          position: relative;
          perspective: 1500px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          margin: 0 auto; /* Pastikan berada di tengah */
          text-align: center; /* Membantu posisi elemen-elemen dalam container */
          overflow: hidden; /* Mencegah overflow */
          max-width: 1000px;
          left: 50%;
          transform: translateX(-50%);
        }
        
        .page-flip-next .book-container {
          animation: flipNext 0.07s ease-out; /* Dipercepat dari 0.1s menjadi 0.07s */
          transform: translateX(-50%); /* Pertahankan posisi center saat animasi */
          perspective-origin: left center; /* Animasi dari kiri ke kanan */
        }
        
        .page-flip-prev .book-container {
          animation: flipPrev 0.07s cubic-bezier(0.25, 0.1, 0.25, 1.0); /* Dipercepat dari 0.2s menjadi 0.07s */
          transform: translateX(-50%); /* Pertahankan posisi center saat animasi */
          perspective-origin: right center; /* Animasi dari kanan ke kiri */
        }
        
        .page-shadow {
          position: absolute;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%);
          transition: opacity 0.2s ease;
          z-index: -1;
          transform: translateZ(-10px);
        }
        
        .page-shadow.active {
          opacity: 0.4;
        }
        
        .page-fold {
          position: absolute;
          top: 0;
          width: 0;
          height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0.15), rgba(30,25,20,0.4));
          box-shadow: -5px 0 20px rgba(0,0,0,0.35);
          z-index: 2;
          opacity: 0;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-origin: left center;
          transform: skewX(2deg);
        }
        
        .page-fold.active {
          opacity: 1;
          width: 40px; /* Lebar lipatan saat aktif */
          animation: foldPulse 0.2s ease-in-out; /* Dipercepat dari 0.35s menjadi 0.2s */
        }
        
        @keyframes foldPulse {
          0% { width: 0; opacity: 0; transform: skewX(0deg); }
          20% { width: 20px; opacity: 0.4; transform: skewX(3deg); }
          50% { width: 60px; opacity: 1; transform: skewX(1deg); }
          80% { width: 45px; opacity: 0.9; transform: skewX(2deg); }
          100% { width: 40px; opacity: 1; transform: skewX(2deg); }
        }
        
        .page-fold.next {
          left: 0;
          transform-origin: left center;
          transform: skewX(2deg);
        }
        
        .page-fold.prev {
          right: 0;
          transform-origin: right center;
          transform: skewX(-2deg);
          background: linear-gradient(to left, rgba(255,255,255,0.15), rgba(30,25,20,0.4));
          box-shadow: 5px 0 20px rgba(0,0,0,0.35);
        }
        
        @keyframes flipNext {
          0% { 
            transform: translateX(-50%) rotateY(0deg);
            filter: brightness(1);
          }
          40% { 
            transform: translateX(-51%) rotateY(-15deg);
            filter: brightness(0.95);
          }
          100% { 
            transform: translateX(-50%) rotateY(0deg);
            filter: brightness(1);
          }
        }
        
        @keyframes flipPrev {
          0% { 
            transform: translateX(-50%) rotateY(0deg); 
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); 
            filter: brightness(1);
          }
          25% { 
            transform: translateX(-48%) rotateY(12deg); 
            box-shadow: 10px 5px 25px rgba(0, 0, 0, 0.45); 
            filter: brightness(0.95);
          }
          60% { 
            transform: translateX(-52%) rotateY(18deg); 
            box-shadow: 15px 5px 30px rgba(0, 0, 0, 0.5); 
            filter: brightness(0.93);
          }
          100% { 
            transform: translateX(-50%) rotateY(0deg); 
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3); 
            filter: brightness(1);
          }
        }

        .pdf-container {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .pdf-preview {
          background: white;
          width: 80%;
          max-width: 500px;
          padding: 40px 30px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pdf-icon {
          font-size: 72px;
          color: #d12123;
          margin-bottom: 20px;
        }

        .pdf-title {
          font-size: 1.4rem;
          color: #333;
          margin-bottom: 10px;
          word-break: break-word;
        }

        .pdf-desc {
          font-size: 1rem;
          color: #666;
          margin-bottom: 20px;
        }

        .pdf-open-button {
          background: #d12123;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pdf-open-button:hover {
          background: #e63e3e;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        .page-indicator {
          color: #d4c9a8;
          font-family: 'Trajan Pro', 'Cinzel', serif;
          font-size: 0.8rem;
          min-width: 40px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .contract-card {
            top: 6px;
            left: 22px; /* Konsisten dengan posisi desktop */
            padding: 11px 14px 11px 12px;
          }
          
          .contract-label {
            font-size: 0.65rem;
            letter-spacing: 1.2px;
          }
          
          .contract-modal {
            width: 95%;
            height: 88vh;
            margin-top: 15px;
          }
          
          .contract-controls {
            flex-direction: row;
            justify-content: space-between;
            gap: 10px;
            padding: 12px 15px;
          }
          
          .control-button {
            width: 32px;
            height: 32px;
          }
          
          .zoom-controls, .navigation-controls {
            gap: 8px;
          }
          
          .page-indicator {
            font-size: 0.7rem;
            min-width: 32px;
            letter-spacing: 0.5px;
          }
          
          .document-title {
            font-size: 1.2rem;
            padding-bottom: 6px;
          }
          
          .document-header {
            padding: 12px 8px 3px;
            margin-bottom: 15px;
          }
          
          .document-title::after {
            width: 50px;
            height: 1.5px;
          }
          
          .document-image {
            max-width: 95%;
            max-height: 82%;
          }
          
          .pdf-preview {
            width: 85%;
            padding: 20px 15px;
          }
          
          .pdf-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          
          .pdf-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </>
  );
};

export default ContractCard;
