// Script untuk menambahkan achievement "patience" yang seharusnya sudah didapat
// Jalankan di browser console

(function() {
    const ACHIEVEMENTS_KEY = "portfolio_achievements";
    
    // Load existing achievements
    let achievements = [];
    try {
        const savedData = localStorage.getItem(ACHIEVEMENTS_KEY);
        if (savedData) {
            achievements = JSON.parse(savedData);
        }
    } catch (e) {
        console.error('Error loading achievements:', e);
    }
    
    // Add "patience" if not already present
    if (!achievements.includes("patience")) {
        achievements.push("patience");
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
        console.log('Added "patience" achievement to localStorage');
        console.log('Updated achievements:', achievements);
        
        // Refresh page to see the new achievement
        window.location.reload();
    } else {
        console.log('"patience" achievement already exists');
    }
})();