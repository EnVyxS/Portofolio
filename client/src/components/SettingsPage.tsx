import React from 'react';
import { motion } from 'framer-motion';
import AchievementController from '../controllers/achievementController';

const SettingsPage: React.FC = () => {
  // Fungsi untuk mereset semua achievement
  const resetAllAchievements = () => {
    try {
      // Hapus data achievement dari localStorage
      localStorage.removeItem('diva-juan-achievements');
      localStorage.removeItem('diva-juan-achievement-timestamps');
      
      // Reset juga data di achievementController
      const achievementController = AchievementController.getInstance();
      achievementController.resetAllAchievements();
      
      // Tampilkan pesan berhasil
      alert('Semua achievement berhasil direset!');
      
      // Reload halaman untuk menyegarkan komponen dengan data terbaru
      window.location.reload();
    } catch (error) {
      console.error('Error resetting achievements:', error);
      alert('Gagal mereset achievement. Silakan coba lagi.');
    }
  };
  
  return (
    <div className="settings-page">
      <motion.div 
        className="settings-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="settings-title">Pengaturan</h2>
        
        <div className="settings-section">
          <h3 className="settings-section-title">Reset Data</h3>
          <p className="settings-description">
            Gunakan tombol di bawah untuk menghapus semua achievement yang telah terkumpul.
            <br />
            <span className="settings-warning">Perhatian: Tindakan ini tidak dapat dibatalkan!</span>
          </p>
          
          <motion.button 
            className="reset-button"
            onClick={resetAllAchievements}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reset Semua Achievement
          </motion.button>
        </div>
      </motion.div>
      
      {/* Styles untuk halaman settings */}
      <style dangerouslySetInnerHTML={{ __html: `
        .settings-page {
          padding: 2rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .settings-container {
          background-color: rgba(30, 30, 30, 0.9);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }
        
        .settings-title {
          color: rgba(255, 193, 7, 0.9);
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
          text-align: center;
          border-bottom: 1px solid rgba(255, 193, 7, 0.2);
          padding-bottom: 0.5rem;
        }
        
        .settings-section {
          margin-bottom: 2rem;
        }
        
        .settings-section-title {
          color: rgba(255, 193, 7, 0.8);
          font-size: 1.3rem;
          margin-bottom: 1rem;
          font-weight: 500;
        }
        
        .settings-description {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        
        .settings-warning {
          color: rgba(255, 100, 100, 0.9);
          font-weight: 500;
          display: block;
          margin-top: 0.5rem;
        }
        
        .reset-button {
          background-color: rgba(180, 30, 30, 0.9);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 0 2px 10px rgba(180, 30, 30, 0.4);
          transition: all 0.2s ease;
        }
        
        .reset-button:hover {
          background-color: rgba(200, 40, 40, 0.95);
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;