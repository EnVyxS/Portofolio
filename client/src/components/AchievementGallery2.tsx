import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AchievementType,
  AchievementDescriptions,
  AchievementTitles,
  AchievementIcons,
  AchievementCriteria,
} from "../constants/achievementConstants";
import AchievementController from "../controllers/achievementController";
import AchievementSharing from "./AchievementSharing";

// Easter egg yang muncul ketika semua achievement terbuka
const EASTER_EGG_MESSAGE = "You have conquered all the Diva Juan challenges!";

// Teks misterius untuk achievement yang belum terbuka
const MYSTERIOUS_TITLE = "???";
const MYSTERIOUS_DESCRIPTION =
  "This achievement is still hidden. Keep exploring to find it...";

const AchievementGallery: React.FC = () => {
  // State untuk menyimpan achievement yang terbuka
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    AchievementType[]
  >([]);
  const [selectedAchievement, setSelectedAchievement] =
    useState<AchievementType | null>(null);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  
  // State untuk hover tooltip
  const [hoveredAchievement, setHoveredAchievement] = useState<AchievementType | null>(null);

  // Daftar semua achievement yang mungkin
  const allAchievements: AchievementType[] = [
    "approach",
    "contract",
    "document",
    "success",
    "anger",
    "nightmare",
    "listener",
    "patience",
    "return",
    "hover",
    "escape",
    "social",
  ];

  // Load achievement saat komponen dimuat
  useEffect(() => {
    const achievementController = AchievementController.getInstance();
    // Load achievement yang sudah terbuka
    const unlocked = achievementController.getUnlockedAchievements();
    setUnlockedAchievements(unlocked);

    // Cek apakah semua achievement sudah terbuka menggunakan method baru
    const hasAllAchievements = achievementController.hasAllAchievements();
    
    if (hasAllAchievements) {
      setShowEasterEgg(true);
    }
  }, []);

  // Mengecek apakah achievement sudah di-unlock
  const isUnlocked = (type: AchievementType): boolean => {
    return unlockedAchievements.includes(type);
  };

  // Render ikon achievement - yang terbuka atau misterius
  const renderAchievementIcon = (type: AchievementType) => {
    if (isUnlocked(type)) {
      return (
        <div className="achievement-icon-container unlocked">
          {AchievementIcons[type]}
        </div>
      );
    } else {
      // Ikon misterius untuk achievement yang belum terbuka
      return (
        <div className="achievement-icon-container locked">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="mysterious-icon"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="2"
              y="2"
              width="20"
              height="20"
              rx="3"
              stroke="rgba(255, 193, 7, 0.4)"
              strokeWidth="1.5"
              fill="rgba(30, 30, 30, 0.6)"
            />
            <circle
              cx="12"
              cy="12"
              r="7"
              stroke="rgba(255, 193, 7, 0.5)"
              strokeWidth="1"
              fill="rgba(20, 20, 20, 0.4)"
            />
            <text
              x="12"
              y="16"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              fill="rgba(255, 193, 7, 0.7)"
              className="question-mark"
            >
              ?
            </text>
            <path
              className="mysterious-glow"
              d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"
              stroke="rgba(255, 193, 7, 0.4)"
              strokeOpacity="0.6"
              strokeWidth="0.5"
              strokeDasharray="1 2"
            />
          </svg>
        </div>
      );
    }
  };

  // Menangani klik pada achievement
  const handleAchievementClick = (type: AchievementType) => {
    // Selalu set selected achievement, apakah terbuka atau tidak
    setSelectedAchievement(type);
  };

  // Menampilkan detail achievement yang dipilih
  const renderAchievementDetail = () => {
    if (!selectedAchievement) return null;

    const isUnlocked = unlockedAchievements.includes(selectedAchievement);

    return (
      <motion.div
        className={`achievement-detail ${isUnlocked ? "unlocked" : "mysterious"}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-amber-100 text-sm font-semibold mb-1">
          {isUnlocked
            ? AchievementTitles[selectedAchievement]
            : MYSTERIOUS_TITLE}
        </h3>
        <p className="text-amber-300/70 text-xs mb-2">
          {isUnlocked
            ? AchievementDescriptions[selectedAchievement]
            : MYSTERIOUS_DESCRIPTION}
        </p>
        
        {isUnlocked && (
          <div className="achievement-criteria">
            <div className="criteria-title">How to unlock:</div>
            <div className="criteria-content">{AchievementCriteria[selectedAchievement]}</div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="achievement-gallery-container">
      <h2 className="text-amber-100 text-lg font-bold mb-4 text-center">
        Achievements
        <div className="achievement-title-underline"></div>
      </h2>

      {/* Tampilkan easter egg jika semua achievement terbuka */}
      {showEasterEgg && (
        <motion.div
          className="easter-egg-message"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.8,
            delay: 0.5,
            type: "spring",
            stiffness: 100,
          }}
        >
          <p className="text-amber-400 text-sm font-semibold text-center my-2">
            {EASTER_EGG_MESSAGE}
          </p>
          <div className="easter-egg-glow"></div>
          <motion.div
            className="easter-egg-crown"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.5 }}
          >
            👑
          </motion.div>
          
          {/* Tombol Reward Easter Egg */}
          <motion.button
            className="reward-button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 2.0 }}
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Rick Roll Easter Egg - redirect ke Never Gonna Give You Up
              window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
            }}
          >
            <span className="reward-text">🎁 CLAIM YOUR REWARD</span>
            <div className="reward-sparkles">✨</div>
          </motion.button>
        </motion.div>
      )}

      {/* Progress bar */}
      <motion.div className="achievement-progress mb-6">
        <div className="progress-label">
          <span className="progress-title">Achievement Progress</span>
          <span className="progress-count">{unlockedAchievements.length} / {allAchievements.length}</span>
        </div>
        <div className="progress-bar-container">
          <motion.div
            className="progress-bar"
            initial={{ width: 0 }}
            animate={{
              width: `${(unlockedAchievements.length / allAchievements.length) * 100}%`,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          ></motion.div>
        </div>
        <div className="progress-percentage">
          {Math.round((unlockedAchievements.length / allAchievements.length) * 100)}% Complete
        </div>
      </motion.div>

      {/* Grid achievement */}
      <div className="achievement-grid">
        {allAchievements.map((achievement, index) => (
          <motion.div
            key={achievement}
            className={`achievement-item ${isUnlocked(achievement) ? "unlocked" : "locked"}`}
            data-achievement={achievement}
            onClick={() => handleAchievementClick(achievement)}
            onMouseEnter={() => setHoveredAchievement(achievement)}
            onMouseLeave={() => setHoveredAchievement(null)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.95 }}
          >
            {renderAchievementIcon(achievement)}
            <div className="achievement-name">
              {isUnlocked(achievement)
                ? AchievementTitles[achievement]
                : MYSTERIOUS_TITLE}
            </div>
            
            {/* Tooltip untuk kriteria unlocking */}
            {hoveredAchievement === achievement && (
              <motion.div 
                className="achievement-tooltip"
                initial={{ opacity: 0, scale: 0.8, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="tooltip-title">How to unlock:</div>
                <div className="tooltip-content">
                  {isUnlocked(achievement) 
                    ? AchievementCriteria[achievement]
                    : "This achievement is still locked. Continue exploring!"}
                </div>
                <div className="tooltip-arrow"></div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Detail achievement yang dipilih */}
      {renderAchievementDetail()}
      


      {/* Custom styling for mysterious achievements */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        /* General styling for achievement grid */
        .achievement-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .achievement-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: rgba(30, 30, 30, 0.6);
          padding: 12px 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
          cursor: pointer;
          border: 1px solid rgba(255, 193, 7, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .achievement-item.unlocked {
          border-color: rgba(255, 193, 7, 0.6);
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.25);
        }
        
        .achievement-item.unlocked:hover {
          transform: translateY(-3px) scale(1.03);
          box-shadow: 0 8px 20px rgba(255, 193, 7, 0.3);
        }
        
        .achievement-name {
          margin-top: 10px;
          font-size: 12px;
          text-align: center;
          color: rgba(255, 215, 0, 0.95);
          font-weight: 600;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          max-width: 100%;
          padding: 0 5px;
        }
        
        .achievement-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 70px;
          height: 70px;
          padding: 10px;
          border-radius: 50%;
          background: rgba(20, 20, 20, 0.4);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
        }
        
        /* Fix untuk icon achievement yang bermasalah */
        .achievement-icon-container svg {
          width: 48px;
          height: 48px;
          color: rgba(255, 215, 0, 0.7);
        }
        
        .achievement-icon-container.unlocked svg path,
        .achievement-icon-container.unlocked svg rect,
        .achievement-icon-container.unlocked svg circle {
          fill: rgba(255, 215, 0, 0.2);
          stroke: rgba(255, 215, 0, 0.8);
        }
        
        /* Spesifik untuk achievement yang bermasalah */
        .achievement-item.unlocked .achievement-icon-container svg {
          filter: drop-shadow(0 0 3px rgba(255, 215, 0, 0.5));
        }
        
        /* Fixes khusus untuk tiap achievement yang bermasalah */
        .achievement-item[data-achievement="patience"] .achievement-icon-container svg path,
        .achievement-item[data-achievement="patience"] .achievement-icon-container svg circle,
        .achievement-item[data-achievement="return"] .achievement-icon-container svg path,
        .achievement-item[data-achievement="hover"] .achievement-icon-container svg path,
        .achievement-item[data-achievement="hover"] .achievement-icon-container svg rect,
        .achievement-item[data-achievement="escape"] .achievement-icon-container svg path,
        .achievement-item[data-achievement="social"] .achievement-icon-container svg path,
        .achievement-item[data-achievement="social"] .achievement-icon-container svg circle {
          fill: rgba(255, 215, 0, 0.2) !important;
          stroke: #FFC107 !important;
          stroke-width: 1.5 !important;
        }
        
        /* Styling untuk achievement yang misterius */
        .achievement-item.locked {
          opacity: 0.7;
          filter: brightness(0.7) blur(0.3px);
          border: 1px dashed rgba(255, 193, 7, 0.25);
          background: rgba(20, 20, 20, 0.7);
          box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
        }
        
        .achievement-item.locked:hover {
          opacity: 0.85;
          filter: brightness(0.85) blur(0px);
          transform: translateY(-2px);
          border-color: rgba(255, 193, 7, 0.4);
        }
        
        .achievement-item.locked .achievement-name {
          color: rgba(255, 193, 7, 0.5);
          text-shadow: 0 0 5px rgba(255, 193, 7, 0.3);
          font-style: italic;
        }
        
        .achievement-title-underline {
          margin: 5px auto 0;
          height: 2px;
          width: 100px;
          background: linear-gradient(90deg, transparent, rgba(255, 193, 7, 0.6), transparent);
          border-radius: 2px;
        }
        
        .mysterious-icon {
          height: 48px;
          width: 48px;
          opacity: 0.6;
          filter: drop-shadow(0 0 2px rgba(255, 193, 7, 0.3));
          animation: pulse 3s infinite alternate;
        }
        
        @keyframes pulse {
          0% {
            opacity: 0.5;
            transform: scale(0.97);
          }
          100% {
            opacity: 0.7;
            transform: scale(1.03);
          }
        }
        
        .question-mark {
          animation: questionPulse 2s infinite alternate;
          opacity: 0.8;
        }
        
        @keyframes questionPulse {
          0% {
            fill: rgba(255, 193, 7, 0.5);
            font-size: 9px;
          }
          100% {
            fill: rgba(255, 193, 7, 0.8);
            font-size: 11px;
          }
        }
        
        .mysterious-glow {
          animation: glowPulse 4s infinite alternate;
        }
        
        @keyframes glowPulse {
          0% {
            stroke: rgba(255, 193, 7, 0.3);
            stroke-width: 0.5;
          }
          100% {
            stroke: rgba(255, 193, 7, 0.6);
            stroke-width: 1;
          }
        }
        
        .achievement-detail.mysterious {
          background: rgba(30, 30, 30, 0.7);
          border: 1px dashed rgba(255, 193, 7, 0.3);
          border-radius: 4px;
          padding: 12px;
          margin-top: 12px;
          text-align: center;
        }
        
        .achievement-detail.mysterious h3 {
          font-size: 14px;
          letter-spacing: 3px;
          animation: mysteriousPulse 3s infinite alternate;
        }
        
        @keyframes mysteriousPulse {
          0% {
            color: rgba(255, 193, 7, 0.6);
            text-shadow: 0 0 3px rgba(255, 193, 7, 0.3);
          }
          100% {
            color: rgba(255, 193, 7, 0.8);
            text-shadow: 0 0 6px rgba(255, 193, 7, 0.5);
          }
        }
        
        /* Achievement light effects */
        .achievement-item.unlocked::before {
          content: '';
          position: absolute;
          top: -30%;
          left: -30%;
          width: 160%;
          height: 160%;
          background: radial-gradient(ellipse at center, rgba(255, 193, 7, 0.15) 0%, rgba(255, 193, 7, 0) 70%);
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .achievement-item.unlocked:hover::before {
          opacity: 1;
        }
        
        .achievement-item.unlocked::after {
          content: '';
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: 4px;
          background: linear-gradient(135deg, rgba(255, 193, 7, 0.4) 0%, rgba(255, 193, 7, 0) 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }
        
        .achievement-item.unlocked:hover::after {
          opacity: 0.5;
        }
        
        /* Easter egg styling */
        .easter-egg-message {
          position: relative;
          background: rgba(40, 35, 15, 0.7);
          border: 1px solid rgba(255, 193, 7, 0.5);
          border-radius: 4px;
          padding: 16px;
          margin: 0 auto 20px;
          max-width: 90%;
          box-shadow: 0 0 15px rgba(255, 193, 7, 0.2);
          overflow: hidden;
        }
        
        .easter-egg-message::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(
              circle at top right, 
              rgba(255, 215, 0, 0.1) 0%, 
              transparent 60%
            ),
            radial-gradient(
              circle at bottom left, 
              rgba(255, 215, 0, 0.1) 0%, 
              transparent 60%
            );
          z-index: -1;
        }
        
        .easter-egg-crown {
          font-size: 24px;
          display: block;
          text-align: center;
          margin-top: 5px;
          filter: drop-shadow(0 0 5px rgba(255, 215, 0, 0.6));
          animation: crownFloat 3s ease-in-out infinite;
        }
        
        @keyframes crownFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .easter-egg-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.15) 0%, transparent 70%);
          z-index: -1;
          opacity: 0.7;
          animation: glowPulseEgg 4s infinite alternate;
        }
        
        @keyframes glowPulseEgg {
          0% { opacity: 0.5; transform: scale(0.98); }
          100% { opacity: 0.7; transform: scale(1.02); }
        }
        
        /* Progress bar styling */
        .achievement-progress {
          margin-bottom: 24px;
        }
        
        .progress-label {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }
        
        .progress-title {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 215, 0, 0.9);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .progress-count {
          font-size: 14px;
          font-weight: 700;
          color: rgba(255, 215, 0, 0.8);
          background: linear-gradient(to bottom, rgba(255, 215, 0, 0.9), rgba(255, 180, 0, 0.7));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .progress-bar-container {
          height: 10px;
          background: rgba(30, 25, 15, 0.6);
          border-radius: 5px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(to right, rgba(255, 193, 7, 0.8), rgba(255, 215, 0, 1));
          box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
          border-radius: 5px;
          position: relative;
          overflow: hidden;
        }
        
        .progress-percentage {
          text-align: center;
          font-size: 12px;
          color: rgba(255, 215, 0, 0.7);
          margin-top: 5px;
          font-weight: 500;
        }
        
        /* Tooltip styling */
        .achievement-tooltip {
          position: absolute;
          bottom: calc(100% + 10px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(255, 215, 0, 0.5);
          border-radius: 6px;
          padding: 10px 12px;
          width: 180px;
          z-index: 100;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.2);
          pointer-events: none;
        }
        
        .tooltip-title {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 215, 0, 0.9);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .tooltip-content {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.4;
        }
        
        .tooltip-arrow {
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 6px;
          overflow: hidden;
        }
        
        .tooltip-arrow::after {
          content: '';
          position: absolute;
          top: -6px;
          left: 0;
          width: 12px;
          height: 12px;
          background: rgba(20, 20, 20, 0.95);
          border: 1px solid rgba(255, 215, 0, 0.5);
          transform: rotate(45deg);
          border-radius: 2px;
        }
        
        /* Animation for tooltip */
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(5px) translateX(-50%); }
          to { opacity: 1; transform: translateY(0) translateX(-50%); }
        }
        
        .achievement-item.locked .achievement-tooltip .tooltip-content {
          font-style: italic;
          color: rgba(255, 215, 0, 0.6);
        }
        
        /* Styles for criteria in achievement detail */
        .achievement-criteria {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px dashed rgba(255, 215, 0, 0.3);
        }
        
        .criteria-title {
          font-size: 10px;
          font-weight: 600;
          color: rgba(255, 215, 0, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        
        .criteria-content {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.85);
          line-height: 1.4;
          font-style: italic;
        }
        
        /* Achievement Sharing Section */
        .achievement-sharing-section {
          margin-top: 30px;
        }
        
        .section-divider {
          position: relative;
          text-align: center;
          margin-bottom: 20px;
          height: 20px;
        }
        
        .section-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, 
            rgba(255, 215, 0, 0.1), 
            rgba(255, 215, 0, 0.5) 50%, 
            rgba(255, 215, 0, 0.1)
          );
          z-index: 1;
        }
        
        .divider-text {
          position: relative;
          z-index: 2;
          background: rgba(30, 30, 30, 0.95);
          padding: 0 15px;
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 215, 0, 0.8);
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }
        
        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, 
            rgba(255, 255, 255, 0) 0%, 
            rgba(255, 255, 255, 0.3) 50%, 
            rgba(255, 255, 255, 0) 100%
          );
          animation: progressShine 3s infinite;
        }
        
        @keyframes progressShine {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        /* Reward Button Styling */
        .reward-button {
          position: relative;
          background: linear-gradient(135deg, 
            rgba(255, 193, 7, 0.8) 0%, 
            rgba(255, 215, 0, 0.9) 50%, 
            rgba(255, 193, 7, 0.8) 100%
          );
          border: 2px solid rgba(255, 215, 0, 0.9);
          border-radius: 8px;
          padding: 12px 20px;
          margin: 16px auto 0;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 
            0 4px 15px rgba(255, 193, 7, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          overflow: hidden;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(20, 20, 20, 0.9);
          font-size: clamp(11px, 2.5vw, 14px);
          width: 100%;
          max-width: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .reward-button:hover {
          background: linear-gradient(135deg, 
            rgba(255, 215, 0, 0.9) 0%, 
            rgba(255, 193, 7, 1) 50%, 
            rgba(255, 215, 0, 0.9) 100%
          );
          box-shadow: 
            0 6px 20px rgba(255, 193, 7, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .reward-button:active {
          transform: translateY(0);
          box-shadow: 
            0 2px 10px rgba(255, 193, 7, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        
        .reward-text {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          text-align: center;
          line-height: 1.2;
        }
        
        .reward-sparkles {
          position: absolute;
          top: -5px;
          right: -5px;
          font-size: 14px;
          animation: sparkle 2s infinite;
          z-index: 3;
        }
        
        .reward-button::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, 
            transparent 30%, 
            rgba(255, 255, 255, 0.3) 50%, 
            transparent 70%
          );
          transform: rotate(45deg);
          animation: rewardShine 3s infinite;
          z-index: 1;
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.7; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes rewardShine {
          0% { left: -200%; }
          100% { left: 200%; }
        }
        
        /* Responsive styling untuk easter egg dan reward button */
        @media (max-width: 768px) {
          .easter-egg-message {
            margin: 10px;
            padding: 16px;
          }
          
          .easter-egg-message p {
            font-size: 12px !important;
            line-height: 1.4;
          }
          
          .easter-egg-crown {
            font-size: 20px;
          }
          
          .reward-button {
            padding: 10px 16px;
            font-size: 11px;
            letter-spacing: 0.5px;
            max-width: 250px;
          }
          
          .reward-sparkles {
            font-size: 12px;
            top: -3px;
            right: -3px;
          }
        }
        
        @media (max-width: 480px) {
          .easter-egg-message {
            margin: 8px;
            padding: 12px;
          }
          
          .easter-egg-message p {
            font-size: 11px !important;
          }
          
          .reward-button {
            padding: 8px 12px;
            font-size: 10px;
            max-width: 220px;
            border-radius: 6px;
          }
          
          .reward-text {
            gap: 4px;
          }
        }
        
        @media (min-width: 1024px) {
          .easter-egg-message {
            max-width: 400px;
            margin: 0 auto;
          }
          
          .reward-button {
            max-width: 300px;
            font-size: 13px;
            padding: 14px 24px;
          }
        }
      `,
        }}
      />
    </div>
  );
};

export default AchievementGallery;
