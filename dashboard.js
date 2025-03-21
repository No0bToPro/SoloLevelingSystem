document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data if not exists
    initializeUserData();

    // Update UI with user data
    updateUserInterface();

    // Load stats and activity
    loadStats();
    loadRecentActivity();

    // Set up event listeners
    setupEventListeners();

    // Initial layout adjustment
    adjustLayout();
    
    // Listen for window resize events
    window.addEventListener('resize', adjustLayout);
});

// Function to initialize user data
function initializeUserData() {
    if (!localStorage.getItem('userData')) {
        const initialUserData = {
            level: 1,
            xp: 0,
            coins: 50,
            inventory: [],
            stats: {
                goalsCompleted: 0,
                tasksCompleted: 0,
                skillsLearned: 0,
                daysStreak: 1
            },
            activity: []
        };
        localStorage.setItem('userData', JSON.stringify(initialUserData));
    }
}

// Function to update user interface with user data
function updateUserInterface() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        // Update level badge
        document.querySelector('.level-badge').textContent = `Level ${userData.level}`;
        
        // Calculate XP percentage for the current level
        const nextLevelXP = calculateNextLevelXP(userData.level);
        const currentLevelXP = calculateCurrentLevelXP(userData.level);
        const xpForCurrentLevel = userData.xp - currentLevelXP;
        const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
        const xpPercentage = (xpForCurrentLevel / xpNeededForNextLevel) * 100;
        
        // Update XP bar
        document.querySelector('.xp-progress').style.width = `${xpPercentage}%`;
        document.querySelector('.xp-text').textContent = `${userData.xp} / ${nextLevelXP} XP`;
        
        // Update coins
        document.querySelector('.currency-amount').textContent = userData.coins;
    }
}

// Function to load stats
function loadStats() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.stats) {
        const stats = userData.stats;
        
        // Update stats cards
        document.querySelector('#goalsCompleted').textContent = stats.goalsCompleted;
        document.querySelector('#tasksCompleted').textContent = stats.tasksCompleted;
        document.querySelector('#skillsLearned').textContent = stats.skillsLearned;
        document.querySelector('#daysStreak').textContent = stats.daysStreak;
    }
}

// Function to load recent activity
function loadRecentActivity() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const activityContainer = document.querySelector('.activity-list');
    
    // Clear existing activity
    activityContainer.innerHTML = '';
    
    if (userData && userData.activity && userData.activity.length > 0) {
        // Sort activity by date (newest first)
        const sortedActivity = [...userData.activity].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivity = sortedActivity.slice(0, 5); // Get 5 most recent activities
        
        recentActivity.forEach(activity => {
            const activityItem = createActivityItem(activity);
            activityContainer.appendChild(activityItem);
        });
    } else {
        // If no activity, show a message
        const noActivity = document.createElement('div');
        noActivity.className = 'no-activity';
        noActivity.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>No activity yet. Start completing goals to see your progress here!</p>
        `;
        activityContainer.appendChild(noActivity);
    }
}

// Function to create an activity item
function createActivityItem(activity) {
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    
    // Format date
    const activityDate = new Date(activity.date);
    const formattedDate = activityDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    // Get appropriate icon based on activity type
    const iconClass = getActivityIcon(activity.type);
    
    activityItem.innerHTML = `
        <div class="activity-icon ${activity.type}">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="activity-details">
            <div class="activity-description">${activity.description}</div>
            <div class="activity-time">${formattedDate}</div>
        </div>
        <div class="activity-rewards">
            ${activity.rewards.xp ? `<div class="reward-item"><i class="fas fa-star"></i> ${activity.rewards.xp} XP</div>` : ''}
            ${activity.rewards.coins ? `<div class="reward-item"><i class="fas fa-coins"></i> ${activity.rewards.coins} Coins</div>` : ''}
        </div>
    `;
    
    return activityItem;
}

// Function to get icon for activity type
function getActivityIcon(type) {
    const icons = {
        'goal-completed': 'fa-check-circle',
        'goal-progress': 'fa-chart-line',
        'goal-added': 'fa-plus-circle',
        'skill-learned': 'fa-graduation-cap',
        'item-purchased': 'fa-shopping-cart',
        'level-up': 'fa-arrow-up',
        'default': 'fa-bell'
    };
    
    return icons[type] || icons.default;
}

// Function to set up event listeners
function setupEventListeners() {
    // Navigation click events to ensure they work
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('http')) {
                e.preventDefault();
                window.location.href = href;
            }
        });
    });
    
    // Quick add goal button
    const quickAddGoalBtn = document.querySelector('.quick-add-goal');
    if (quickAddGoalBtn) {
        quickAddGoalBtn.addEventListener('click', function() {
            window.location.href = 'goals.html';
        });
    }
    
    // Profile menu toggle
    const profileMenu = document.querySelector('.profile-menu');
    const userProfile = document.querySelector('.user-profile');
    
    if (userProfile && profileMenu) {
        userProfile.addEventListener('click', function() {
            profileMenu.classList.toggle('show');
        });
        
        // Close the menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!userProfile.contains(e.target) && !profileMenu.contains(e.target)) {
                profileMenu.classList.remove('show');
            }
        });
    }
}

// Add a daily login reward if this is the first visit of the day
function checkDailyReward() {
    const lastLogin = localStorage.getItem('lastLogin');
    const today = new Date().toDateString();
    
    if (lastLogin !== today) {
        const userData = JSON.parse(localStorage.getItem('userData'));
        
        // Add daily reward (10 XP and 5 Coins)
        userData.xp += 10;
        userData.coins += 5;
        
        // Update streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayString = yesterday.toDateString();
        
        if (lastLogin === yesterdayString) {
            // Consecutive day login - increase streak
            userData.stats.daysStreak += 1;
        } else if (lastLogin) {
            // Streak broken - reset to 1
            userData.stats.daysStreak = 1;
        }
        
        // Add to activity
        if (!userData.activity) userData.activity = [];
        userData.activity.push({
            type: 'daily-login',
            description: `Daily Login (Day ${userData.stats.daysStreak})`,
            date: new Date().toISOString(),
            rewards: {
                xp: 10,
                coins: 5
            }
        });
        
        // Save updated user data
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('lastLogin', today);
        
        // Show daily reward notification
        showDailyReward(userData.stats.daysStreak);
        
        // Check for level up
        const nextLevelXP = calculateNextLevelXP(userData.level);
        if (userData.xp >= nextLevelXP) {
            userData.level += 1;
            showLevelUpAnimation(userData.level);
            localStorage.setItem('userData', JSON.stringify(userData));
        }
        
        // Update UI
        updateUserInterface();
        loadStats();
        loadRecentActivity();
    }
}

// Function to show daily reward
function showDailyReward(streak) {
    // Create daily reward element
    const dailyRewardElement = document.createElement('div');
    dailyRewardElement.className = 'daily-reward-notification';
    
    // Calculate bonus for streak
    const streakBonus = Math.min(Math.floor(streak / 5) * 5, 20); // +5 coins for every 5 days, max 20
    
    dailyRewardElement.innerHTML = `
        <div class="daily-reward-content">
            <div class="daily-reward-header">
                <div class="daily-reward-icon"><i class="fas fa-calendar-check"></i></div>
                <h3>Daily Login Reward!</h3>
            </div>
            <div class="daily-reward-streak">Day Streak: ${streak}</div>
            <div class="daily-reward-items">
                <div class="reward-item large">
                    <i class="fas fa-star"></i>
                    <span>10 XP</span>
                </div>
                <div class="reward-item large">
                    <i class="fas fa-coins"></i>
                    <span>5 Coins</span>
                </div>
                ${streakBonus > 0 ? `
                <div class="reward-item large bonus">
                    <i class="fas fa-coins"></i>
                    <span>+${streakBonus} Streak Bonus</span>
                </div>
                ` : ''}
            </div>
            <button class="collect-btn">Collect</button>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(dailyRewardElement);
    
    // Add show class after a small delay
    setTimeout(() => {
        dailyRewardElement.classList.add('show');
    }, 500);
    
    // Handle collect button
    const collectBtn = dailyRewardElement.querySelector('.collect-btn');
    collectBtn.addEventListener('click', () => {
        // Add streak bonus if any
        if (streakBonus > 0) {
            const userData = JSON.parse(localStorage.getItem('userData'));
            userData.coins += streakBonus;
            localStorage.setItem('userData', JSON.stringify(userData));
            updateUserInterface();
        }
        
        // Hide and remove notification
        dailyRewardElement.classList.remove('show');
        setTimeout(() => {
            dailyRewardElement.remove();
        }, 500);
    });
}

// Function to calculate XP needed for next level
function calculateNextLevelXP(currentLevel) {
    // Simple formula: 100 * level^2
    return 100 * Math.pow(currentLevel, 2);
}

// Function to calculate XP needed for current level
function calculateCurrentLevelXP(currentLevel) {
    if (currentLevel <= 1) return 0;
    return calculateNextLevelXP(currentLevel - 1);
}

// Function to show level up animation
function showLevelUpAnimation(level) {
    // Create level up element
    const levelUpElement = document.createElement('div');
    levelUpElement.className = 'level-up-notification';
    levelUpElement.innerHTML = `
        <div class="level-up-content">
            <div class="level-up-icon"><i class="fas fa-arrow-up"></i></div>
            <div class="level-up-text">
                <h3>Level Up!</h3>
                <p>You've reached Level ${level}</p>
            </div>
        </div>
    `;
    
    // Add to body
    document.body.appendChild(levelUpElement);
    
    // Add show class after a small delay
    setTimeout(() => {
        levelUpElement.classList.add('show');
    }, 100);
    
    // Remove after animation
    setTimeout(() => {
        levelUpElement.classList.remove('show');
        setTimeout(() => {
            levelUpElement.remove();
        }, 500);
    }, 4000);
}

// Function to show a notification
function showNotification(message) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    // Create container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add notification to container
    notificationContainer.appendChild(notification);
    
    // Show the notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove notification after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS for notifications and other animations
const style = document.createElement('style');
style.textContent = `
    .notification-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    }
    
    .notification {
        background: rgba(20, 20, 35, 0.9);
        color: white;
        padding: 15px 20px;
        margin-bottom: 10px;
        border-radius: 5px;
        box-shadow: 0 0 15px rgba(138, 43, 226, 0.5);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        border-left: 3px solid #8a2be2;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .level-up-notification {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
    }
    
    .level-up-notification.show {
        opacity: 1;
        pointer-events: auto;
    }
    
    .level-up-content {
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.9));
        padding: 40px 60px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 30px #8a2be2;
        animation: glowPulse 2s infinite;
    }
    
    .level-up-icon {
        font-size: 40px;
        color: #8a2be2;
        margin-bottom: 20px;
    }
    
    .level-up-text h3 {
        font-size: 32px;
        margin-bottom: 10px;
        color: #8a2be2;
    }
    
    .level-up-text p {
        font-size: 20px;
        color: white;
    }
    
    .daily-reward-notification {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.5s ease;
    }
    
    .daily-reward-notification.show {
        opacity: 1;
        pointer-events: auto;
    }
    
    .daily-reward-content {
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.9), rgba(20, 20, 40, 0.9));
        padding: 30px;
        border-radius: 10px;
        text-align: center;
        box-shadow: 0 0 30px #8a2be2;
    }
    
    .daily-reward-header {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
    }
    
    .daily-reward-icon {
        font-size: 24px;
        color: gold;
        margin-right: 10px;
    }
    
    .daily-reward-header h3 {
        font-size: 24px;
        color: gold;
        margin: 0;
    }
    
    .daily-reward-streak {
        font-size: 16px;
        color: white;
        margin-bottom: 20px;
    }
    
    .daily-reward-items {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 25px;
    }
    
    .reward-item.large {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 5px;
    }
    
    .reward-item.large i {
        font-size: 24px;
        margin-bottom: 5px;
    }
    
    .reward-item.large.bonus {
        background: rgba(255, 215, 0, 0.2);
        border: 1px solid gold;
    }
    
    .collect-btn {
        background: #8a2be2;
        color: white;
        border: none;
        padding: 10px 25px;
        border-radius: 5px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .collect-btn:hover {
        background: #9b4dff;
        transform: translateY(-2px);
    }
    
    @keyframes glowPulse {
        0% { box-shadow: 0 0 30px rgba(138, 43, 226, 0.6); }
        50% { box-shadow: 0 0 40px rgba(138, 43, 226, 0.9); }
        100% { box-shadow: 0 0 30px rgba(138, 43, 226, 0.6); }
    }
`;

document.head.appendChild(style);

// Check for daily reward when the page loads
checkDailyReward();

// Function to adjust layout for responsive design
function adjustLayout() {
    // Fix container widths for desktop
    const container = document.querySelector('.container');
    if (container) {
        container.style.maxWidth = '1400px';
        container.style.margin = '0 auto';
    }
    
    // Fix header and navigation
    const header = document.querySelector('header');
    if (header) {
        header.style.width = '100%';
        header.style.maxWidth = '1400px';
        header.style.margin = '0 auto';
    }
    
    // Ensure main content is centered and properly sized
    const main = document.querySelector('main');
    if (main) {
        main.style.width = '100%';
        main.style.maxWidth = '1400px';
        main.style.margin = '0 auto';
    }
    
    // Fix dashboard grid layout
    const dashboardGrid = document.querySelector('.dashboard-grid');
    if (dashboardGrid) {
        if (window.innerWidth >= 1200) {
            dashboardGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            dashboardGrid.style.gap = '30px';
        } else if (window.innerWidth >= 768) {
            dashboardGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            dashboardGrid.style.gap = '20px';
        } else {
            dashboardGrid.style.gridTemplateColumns = '1fr';
            dashboardGrid.style.gap = '20px';
        }
    }
    
    // Fix dashboard cards
    const dashboardCards = document.querySelectorAll('.dashboard-card');
    dashboardCards.forEach(card => {
        card.style.height = '350px';
        card.style.width = '100%';
        card.style.overflow = 'hidden';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        
        // Ensure card content is scrollable if content overflows
        const cardContent = card.querySelector('.dashboard-card-content');
        if (cardContent) {
            cardContent.style.flex = '1';
            cardContent.style.overflowY = 'auto';
            cardContent.style.padding = '20px';
        }
    });
    
    // Fix tasks list heights
    const tasksList = document.querySelector('.tasks-list');
    if (tasksList) {
        tasksList.style.maxHeight = '250px';
        tasksList.style.overflowY = 'auto';
    }
    
    // Fix welcome banner 
    const welcomeBanner = document.querySelector('.welcome-banner');
    if (welcomeBanner) {
        welcomeBanner.style.width = '100%';
        welcomeBanner.style.maxWidth = '1200px';
        welcomeBanner.style.margin = '0 auto 30px auto';
        welcomeBanner.style.padding = '20px';
    }
    
    // Ensure streak display is properly sized
    const streakDisplay = document.querySelector('.streak-display');
    if (streakDisplay) {
        streakDisplay.style.display = 'flex';
        streakDisplay.style.flexDirection = 'column';
        streakDisplay.style.alignItems = 'center';
        streakDisplay.style.justifyContent = 'center';
        streakDisplay.style.margin = '20px 0';
    }
    
    // Fix achievement items layout
    const achievementItems = document.querySelectorAll('.achievement-item');
    achievementItems.forEach(item => {
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.padding = '10px';
        item.style.marginBottom = '10px';
    });
    
    // Fix footer layout
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.width = '100%';
        footer.style.maxWidth = '1400px';
        footer.style.margin = '0 auto';
    }
}

// Set up modal functionality
function setupModals() {
    // Get all modals
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Add event listeners to close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modals.forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    // Close modal when clicking outside of modal content
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Set up add goal modal
    const addTaskBtn = document.querySelector('.add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            document.getElementById('addGoalModal').style.display = 'block';
        });
    }
}

// Set up task functionality
function setupTasks() {
    const taskCheckboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    
    taskCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Add completed class to parent
                this.parentElement.classList.add('completed');
                
                // Random chance to trigger achievement modal
                if (Math.random() < 0.2) { // 20% chance
                    setTimeout(() => {
                        document.getElementById('achievementModal').style.display = 'block';
                    }, 1000);
                }
                
                // Check if enough tasks completed to level up
                let completedTasks = document.querySelectorAll('.task-item input[type="checkbox"]:checked').length;
                if (completedTasks >= 3) {
                    // 30% chance to level up after 3 completed tasks
                    if (Math.random() < 0.3) {
                        setTimeout(() => {
                            document.getElementById('levelUpModal').style.display = 'block';
                        }, 1500);
                    }
                }
            } else {
                // Remove completed class
                this.parentElement.classList.remove('completed');
            }
        });
    });
}

// Initialize dashboard animations
function initializeAnimations() {
    // Add subtle animations to dashboard cards for visual appeal
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
    
    // Animate streak value
    const streakValue = document.querySelector('.streak-value');
    if (streakValue) {
        let count = 0;
        const targetValue = 7;
        const duration = 1000; // 1 second
        const interval = duration / targetValue;
        
        const timer = setInterval(() => {
            count++;
            streakValue.textContent = count;
            if (count === targetValue) {
                clearInterval(timer);
            }
        }, interval);
    }
} 