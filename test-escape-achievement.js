// Script untuk menghapus achievement 'escape' dari localStorage untuk testing
// Buka console browser dan jalankan script ini untuk test achievement baru

// Function to remove escape achievement for testing
function removeEscapeAchievement() {
    try {
        const ACHIEVEMENTS_KEY = 'diva-juan-achievements';
        const savedData = localStorage.getItem(ACHIEVEMENTS_KEY);
        
        if (savedData) {
            let achievements = JSON.parse(savedData);
            if (Array.isArray(achievements)) {
                // Remove 'escape' achievement
                achievements = achievements.filter(ach => ach !== 'escape');
                localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
                console.log('Escape achievement removed for testing. Current achievements:', achievements);
            }
        } else {
            console.log('No achievements found in localStorage');
        }
    } catch (e) {
        console.error('Error removing escape achievement:', e);
    }
}

// Function to check current achievements
function checkAchievements() {
    try {
        const ACHIEVEMENTS_KEY = 'diva-juan-achievements';
        const savedData = localStorage.getItem(ACHIEVEMENTS_KEY);
        
        if (savedData) {
            const achievements = JSON.parse(savedData);
            console.log('Current achievements in localStorage:', achievements);
            return achievements;
        } else {
            console.log('No achievements found in localStorage');
            return [];
        }
    } catch (e) {
        console.error('Error checking achievements:', e);
        return [];
    }
}

// Export functions for testing
window.removeEscapeAchievement = removeEscapeAchievement;
window.checkAchievements = checkAchievements;

console.log('Test functions loaded:');
console.log('- removeEscapeAchievement() - removes escape achievement for testing');
console.log('- checkAchievements() - shows current achievements');