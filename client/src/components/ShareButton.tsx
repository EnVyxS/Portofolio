import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp } from 'react-icons/fa';
import AchievementController from '../controllers/achievementController';

interface ShareButtonProps {
  className?: string;
  title?: string;
  text?: string;
  url?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  className = '', 
  title = 'Check out this amazing interactive portfolio!',
  text = 'I discovered this creative interactive portfolio by Diva Juan. Take a look!',
  url = window.location.href
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  
  // Fungsi untuk membagikan menggunakan Web Share API
  const handleShare = async () => {
    // Coba gunakan Web Share API jika tersedia
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
        });
        
        // Unlock achievement setelah berhasil membagikan
        const achievementController = AchievementController.getInstance();
        achievementController.unlockAchievement('social');
        
        console.log('Shared successfully');
      } catch (error) {
        console.log('Error sharing', error);
        // Jika user membatalkan sharing, buka modal share sebagai fallback
        setIsShareModalOpen(true);
      }
    } else {
      // Jika Web Share API tidak tersedia, tampilkan modal share
      setIsShareModalOpen(true);
    }
  };
  
  // Fungsi untuk membagikan ke media sosial tertentu
  const shareToSocial = (platform: string) => {
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        shareUrl = '';
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
      
      // Unlock achievement saat berhasil membagikan
      const achievementController = AchievementController.getInstance();
      achievementController.unlockAchievement('social');
      
      // Tutup modal setelah membagikan
      setIsShareModalOpen(false);
    }
  };
  
  // Fungsi untuk menyalin link ke clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess('Link copied!');
      setTimeout(() => setCopySuccess(''), 2000);
      
      // Unlock achievement setelah menyalin link
      const achievementController = AchievementController.getInstance();
      achievementController.unlockAchievement('social');
    }, (err) => {
      console.error('Could not copy text: ', err);
      setCopySuccess('Failed to copy');
    });
  };
  
  return (
    <>
      <button 
        onClick={handleShare}
        className={`share-button ${className}`}
        aria-label="Share this portfolio"
        title="Share this portfolio"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 10.5l7.5-3.5M9 13.5l7.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span>Share</span>
      </button>
      
      {/* Modal Share */}
      <AnimatePresence>
        {isShareModalOpen && (
          <motion.div 
            className="share-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsShareModalOpen(false)}
          >
            <motion.div 
              className="share-modal"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="share-modal-header">
                <h3>Share this portfolio</h3>
                <button 
                  className="close-button"
                  onClick={() => setIsShareModalOpen(false)}
                  aria-label="Close share modal"
                >
                  ×
                </button>
              </div>
              
              <div className="share-options">
                <button 
                  className="share-option twitter"
                  onClick={() => shareToSocial('twitter')}
                  aria-label="Share on Twitter"
                >
                  <div className="share-icon twitter-icon">𝕏</div>
                  <span>Twitter</span>
                </button>
                
                <button 
                  className="share-option facebook"
                  onClick={() => shareToSocial('facebook')}
                  aria-label="Share on Facebook"
                >
                  <div className="share-icon facebook-icon">f</div>
                  <span>Facebook</span>
                </button>
                
                <button 
                  className="share-option linkedin"
                  onClick={() => shareToSocial('linkedin')}
                  aria-label="Share on LinkedIn"
                >
                  <div className="share-icon linkedin-icon">in</div>
                  <span>LinkedIn</span>
                </button>
                
                <button 
                  className="share-option whatsapp"
                  onClick={() => shareToSocial('whatsapp')}
                  aria-label="Share on WhatsApp"
                >
                  <div className="share-icon whatsapp-icon">
                    <FaWhatsapp />
                  </div>
                  <span>WhatsApp</span>
                </button>
              </div>
              
              <div className="copy-link-container">
                <div className="link-input-container">
                  <input 
                    type="text"
                    value={url}
                    readOnly
                    className="link-input"
                    aria-label="Portfolio link to copy"
                  />
                  <button 
                    className="copy-link-button"
                    onClick={copyToClipboard}
                    aria-label="Copy link to clipboard"
                  >
                    {copySuccess || 'Copy'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* CSS styles */}
      <style>{`
        .share-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(30, 30, 30, 0.8);
          color: rgba(255, 215, 0, 0.9);
          border: 1px solid rgba(255, 215, 0, 0.4);
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }
        
        .share-button:hover {
          background: rgba(40, 40, 40, 0.9);
          border-color: rgba(255, 215, 0, 0.7);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
        
        .share-button svg {
          height: 20px;
          width: 20px;
        }
        
        .share-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(3px);
        }
        
        .share-modal {
          background: rgba(30, 30, 30, 0.95);
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          padding: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 215, 0, 0.3);
        }
        
        .share-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .share-modal-header h3 {
          font-size: 1.2rem;
          color: rgba(255, 215, 0, 0.9);
          margin: 0;
          font-weight: 500;
        }
        
        .close-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        
        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.9);
        }
        
        .share-options {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        
        .share-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          color: #fff;
          padding: 10px;
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        
        .share-option:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }
        
        .share-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          font-weight: bold;
        }
        
        .twitter-icon {
          background: #000;
          border: 1px solid #333;
        }
        
        .facebook-icon {
          background: #1877f2;
        }
        
        .linkedin-icon {
          background: #0077b5;
        }
        
        .whatsapp-icon {
          background: #25d366;
        }
        
        .share-option span {
          font-size: 0.8rem;
        }
        
        .copy-link-container {
          margin-top: 20px;
        }
        
        .link-input-container {
          display: flex;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .link-input {
          flex: 1;
          background: rgba(20, 20, 20, 0.8);
          border: none;
          padding: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .copy-link-button {
          background: rgba(255, 215, 0, 0.7);
          border: none;
          padding: 10px 16px;
          cursor: pointer;
          color: #000;
          font-weight: 500;
          min-width: 80px;
          transition: all 0.2s ease;
        }
        
        .copy-link-button:hover {
          background: rgba(255, 215, 0, 0.9);
        }
        
        @media (max-width: 768px) {
          .share-modal {
            width: 95%;
            max-width: none;
            margin: 0 auto;
            padding: 20px;
            border-radius: 16px;
          }
          
          .share-modal-header h3 {
            font-size: 1.1rem;
          }
          
          .share-options {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          
          .share-option {
            padding: 12px 8px;
            border-radius: 12px;
            gap: 6px;
          }
          
          .share-icon {
            width: 44px;
            height: 44px;
            font-size: 1.3rem;
          }
          
          .share-option span {
            font-size: 0.85rem;
            font-weight: 500;
          }
          
          .copy-link-button {
            padding: 12px 16px;
            font-size: 0.9rem;
            min-width: 70px;
          }
          
          .link-input {
            padding: 12px;
            font-size: 0.85rem;
          }
        }
        
        @media (max-width: 480px) {
          .share-modal {
            width: 96%;
            padding: 16px;
            border-radius: 12px;
          }
          
          .share-modal-header {
            margin-bottom: 16px;
          }
          
          .share-modal-header h3 {
            font-size: 1rem;
          }
          
          .share-options {
            gap: 8px;
            margin-bottom: 16px;
          }
          
          .share-option {
            padding: 10px 6px;
            gap: 4px;
          }
          
          .share-icon {
            width: 40px;
            height: 40px;
            font-size: 1.1rem;
          }
          
          .share-option span {
            font-size: 0.75rem;
          }
          
          .copy-link-container {
            margin-top: 16px;
          }
          
          .copy-link-button {
            padding: 10px 12px;
            font-size: 0.8rem;
            min-width: 60px;
          }
          
          .link-input {
            padding: 10px;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
};

export default ShareButton;