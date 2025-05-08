import React from 'react';

// Definisi tipe achievement
export type AchievementType = 
  | 'approach'    // "Approach Him" ditekan
  | 'contract'    // Membuka kontrak
  | 'success'     // Berhasil membuat kontrak (link ditekan)
  | 'document'    // Berhasil membuka dokumen kontrak
  | 'anger'       // Berhasil membuat marah
  | 'nightmare'   // Berhasil masuk ke nightmare
  | 'listener'    // Mendengar semua dialog tanpa interupsi
  | 'patience'    // Diaktifkan setelah 9 menit tidak ada interaksi (FINAL_WARNING)
  | 'return'      // Setelah reset, user menekan APPROACH HIM lagi (RETURN_DIALOG)
  | 'hover'       // Setelah reset, user melakukan hover (HOVER_AFTER_RESET)
  | 'escape'      // Berhasil keluar dari dream.html
  | 'social';     // Membagikan portfolio ke media sosial

// Icon SVG untuk setiap jenis achievement
export const AchievementIcons: Record<AchievementType, React.ReactNode> = {
  approach: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 8l-7-7-7 7v11a2 2 0 002 2h10a2 2 0 002-2V8z" 
        stroke="#FFC107" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M9 15l2 2 4-4" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  contract: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M7 7h10M7 11h10M7 15h6" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 19V5" stroke="currentColor" strokeWidth="0.75" strokeLinecap="round" strokeDasharray="1 2" />
    </svg>
  ),
  document: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Simbol 'magnifier' yang lebih terlihat untuk menunjukkan dokumen yang dapat dilihat */}
      <circle cx="18" cy="20" r="2" stroke="#FFC107" strokeWidth="1.5" fill="none" />
      <path d="M15 17l2 2" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Highlight dokumen */}
      <path d="M9 14h6" stroke="#FFC107" strokeWidth="0.75" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  ),
  success: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" 
        stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 16l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" 
        fill="currentColor" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  ),
  anger: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 8v8M8 12h8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 9l-3-3-3 3M15 15l-3 3-3-3M9 15l-3-3 3-3M15 9l3 3-3 3" 
        stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.7" />
    </svg>
  ),
  nightmare: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2l2.5 5 5.5.5-4 4 1 5.5-5-2.5-5 2.5 1-5.5-4-4 5.5-.5L12 2z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M12 7v5M12 16v.1" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
    </svg>
  ),
  listener: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 1C7.03 1 3 5.03 3 10v7c0 1.66 1.34 3 3 3h5c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3H5V10c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-1c-1.66 0-3 1.34-3 3v4c0 1.66 1.34 3 3 3h5c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
      <path d="M7 15c1.5-1 3.5-1 5 0" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M16 14c1.5-1 3-1 4.5 0" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 12c1-0.7 2-0.7 3 0" stroke="#FFC107" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M17 11c0.7-0.5 1.3-0.5 2 0" stroke="#FFC107" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="9" stroke="#FFC107" strokeWidth="0.5" strokeDasharray="1 2" />
    </svg>
  ),
  patience: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 8v4l3 3" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 12a5 5 0 0110 0" stroke="#FFC107" strokeWidth="1" strokeDasharray="1 1" />
      <path d="M16 16.5a7 7 0 01-8 0" stroke="#FFC107" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  return: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 3h-7a2 2 0 00-2 2v14a2 2 0 002 2h7a2 2 0 002-2V5a2 2 0 00-2-2z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M1 12h12M8 7l-7 5 7 5" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 8v8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="0.5 1.5" />
    </svg>
  ),
  hover: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="14" rx="2" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M8 12h8M12 8v8" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 16l2 2M5 16l-2 2M17 8l2-2M5 8L3 6" 
        stroke="#FFC107" strokeWidth="1" strokeLinecap="round" />
    </svg>
  ),
  escape: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 8l9-5 9 5v8l-9 5-9-5V8z" 
        stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3v9M12 12l9-4M12 12l-9-4" stroke="#FFC107" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 16l-3 3-3-3M12 12v7" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 8l5 4 5-4" stroke="#FFC107" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.5 1.5" />
    </svg>
  ),
  social: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
      <path d="M9 10.5l7.5-3.5M9 13.5l7.5 3.5" stroke="#FFC107" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M17 8l1 1M5 15l1 1M17 16l1-1" stroke="#FFC107" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
};

// Definisi teks untuk setiap jenis achievement
export const AchievementTitles: Record<AchievementType, string> = {
  approach: 'FIRST IMPRESSION',
  contract: 'PORTFOLIO EXPLORER',
  document: 'DOCUMENT VIEWER',
  success: 'CONNECTION ESTABLISHED',
  anger: 'CHALLENGE ACCEPTED',
  nightmare: 'DIGITAL ODYSSEY',
  listener: 'PATIENT LISTENER',
  patience: 'TIME GAZER',
  return: 'UNDETERRED SEEKER',
  hover: 'CURIOUS OBSERVER',
  escape: 'DREAM ESCAPIST',
  social: 'SOCIAL CONNECTOR'
};

// Deskripsi achievement
export const AchievementDescriptions: Record<AchievementType, string> = {
  approach: 'You took the first step to discover this unique portfolio.',
  contract: 'You explored the professional projects and credentials.',
  document: 'You\'ve examined the detailed documents within the contract.',
  success: 'You\'ve successfully connected with the professional profile.',
  anger: 'You tested the limits of the interactive experience.',
  nightmare: 'You discovered the creative side of this digital portfolio.',
  listener: 'You\'ve listened to the full story without interruption.',
  patience: 'You\'ve spent significant time contemplating the possibilities.',
  return: 'Despite challenges, you returned to continue exploring.',
  hover: 'You\'ve shown curiosity in exploring interactive elements.',
  escape: 'You\'ve found your way out of the dream world and returned to reality.',
  social: 'You\'ve shared this interactive experience with your network.'
};

// Kriteria untuk mendapatkan achievement
export const AchievementCriteria: Record<AchievementType, string> = {
  approach: 'Press the "APPROACH HIM" button on the homepage.',
  contract: 'Click on the contract option during the conversation.',
  document: 'View the detailed documents in the contract section.',
  success: 'Complete a successful connection by clicking the contract link.',
  anger: 'Interrupt DIVA JUAN repeatedly during his speech.',
  nightmare: 'Experience the nightmare sequence after making him angry.',
  listener: 'Listen to the entire dialogue without interrupting.',
  patience: 'Stay on the page for over 9 minutes without interaction.',
  return: 'Come back after being thrown out of the conversation.',
  hover: 'Hover over elements after being reset to the approach screen.',
  escape: 'Find and click the "WAKE UP" button to escape from the nightmare.',
  social: 'Share the portfolio on social media using the share button.'
};