document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data if not exists
    initializeUserData();

    // Update UI with user data
    updateUserInterface();

    // Load tab content
    loadTabContent('overview');

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
            skills: {
                productivity: {
                    level: 1,
                    xp: 0,
                    nextLevelXP: 100,
                    progress: 0
                },
                learning: {
                    level: 1,
                    xp: 0,
                    nextLevelXP: 100,
                    progress: 0
                },
                fitness: {
                    level: 1,
                    xp: 0,
                    nextLevelXP: 100,
                    progress: 0
                },
                creativity: {
                    level: 1,
                    xp: 0,
                    nextLevelXP: 100,
                    progress: 0
                }
            },
            achievements: [
                {
                    id: 'first_goal',
                    title: 'Goal Setter',
                    description: 'Create your first goal',
                    icon: 'fa-bullseye',
                    unlocked: false
                },
                {
                    id: 'first_completion',
                    title: 'Achiever',
                    description: 'Complete your first goal',
                    icon: 'fa-trophy',
                    unlocked: false
                },
                {
                    id: 'three_day_streak',
                    title: 'Consistency',
                    description: 'Log in for 3 days in a row',
                    icon: 'fa-calendar-check',
                    unlocked: false
                },
                {
                    id: 'level_5',
                    title: 'Rising Star',
                    description: 'Reach level 5',
                    icon: 'fa-star',
                    unlocked: false
                },
                {
                    id: 'first_purchase',
                    title: 'Shopper',
                    description: 'Make your first purchase in the shop',
                    icon: 'fa-shopping-cart',
                    unlocked: false
                }
            ],
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
        
        // Update coins
        document.querySelector('.currency-amount').textContent = userData.coins;
    }
}

// Function to load tab content
function loadTabContent(tabName) {
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Show selected tab content
    const selectedTab = document.getElementById(`${tabName}Content`);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        }
    });
    
    // Load specific tab content
    switch(tabName) {
        case 'overview':
            loadOverviewContent();
            break;
        case 'skills':
            loadSkillsContent();
            break;
        case 'achievements':
            loadAchievementsContent();
            break;
        case 'analytics':
            loadAnalyticsContent();
            break;
    }
}

// Function to load overview content
function loadOverviewContent() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
        // Update overview metrics
        const overviewContent = document.getElementById('overviewContent');
        
        // Update XP gained
        const xpGainedElement = overviewContent.querySelector('.metric-value[data-metric="xp-gained"]');
        if (xpGainedElement) {
            xpGainedElement.textContent = userData.xp;
        }
        
        // Update tasks completed
        const tasksCompletedElement = overviewContent.querySelector('.metric-value[data-metric="tasks-completed"]');
        if (tasksCompletedElement) {
            tasksCompletedElement.textContent = userData.stats.tasksCompleted;
        }
        
        // Update goals achieved
        const goalsAchievedElement = overviewContent.querySelector('.metric-value[data-metric="goals-achieved"]');
        if (goalsAchievedElement) {
            goalsAchievedElement.textContent = userData.stats.goalsCompleted;
        }
        
        // Update coins earned
        const coinsEarnedElement = overviewContent.querySelector('.metric-value[data-metric="coins-earned"]');
        if (coinsEarnedElement) {
            coinsEarnedElement.textContent = userData.coins;
        }
        
        // Load timeline
        loadTimeline();
    }
}

// Function to load timeline
function loadTimeline() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const timelineContainer = document.querySelector('.timeline');
    
    if (!timelineContainer) return;
    
    // Clear existing timeline
    timelineContainer.innerHTML = '';
    
    if (userData && userData.activity && userData.activity.length > 0) {
        // Sort activity by date (newest first)
        const sortedActivity = [...userData.activity].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentActivity = sortedActivity.slice(0, 10); // Get 10 most recent activities
        
        recentActivity.forEach(activity => {
            const timelineItem = createTimelineItem(activity);
            timelineContainer.appendChild(timelineItem);
        });
    } else {
        // If no activity, show a message
        const noActivity = document.createElement('div');
        noActivity.className = 'no-activity';
        noActivity.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>No activity yet. Start completing goals to see your progress here!</p>
        `;
        timelineContainer.appendChild(noActivity);
    }
}

// Function to create a timeline item
function createTimelineItem(activity) {
    const timelineItem = document.createElement('div');
    timelineItem.className = 'timeline-item';
    
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
    
    timelineItem.innerHTML = `
        <div class="timeline-dot ${activity.type}">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="timeline-content">
            <div class="timeline-time">${formattedDate}</div>
            <div class="timeline-title">${activity.description}</div>
            <div class="timeline-rewards">
                ${activity.rewards.xp ? `<div class="reward-item"><i class="fas fa-star"></i> ${activity.rewards.xp} XP</div>` : ''}
                ${activity.rewards.coins ? `<div class="reward-item"><i class="fas fa-coins"></i> ${activity.rewards.coins} Coins</div>` : ''}
            </div>
        </div>
    `;
    
    return timelineItem;
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
        'daily-login': 'fa-calendar-day',
        'achievement': 'fa-trophy',
        'default': 'fa-bell'
    };
    
    return icons[type] || icons.default;
}

// Function to load skills content
function loadSkillsContent() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.skills) {
        const skillsGrid = document.querySelector('.skills-grid');
        
        if (!skillsGrid) return;
        
        // Clear existing skills
        skillsGrid.innerHTML = '';
        
        // Create skill cards for each skill
        for (const [skillName, skillData] of Object.entries(userData.skills)) {
            const skillCard = createSkillCard(skillName, skillData);
            skillsGrid.appendChild(skillCard);
        }
    }
}

// Function to create a skill card
function createSkillCard(skillName, skillData) {
    const skillCard = document.createElement('div');
    skillCard.className = 'skill-card';
    
    // Calculate progress percentage
    const progressPercentage = (skillData.xp / skillData.nextLevelXP) * 100;
    
    // Get skill icon based on skill name
    const skillIcon = getSkillIcon(skillName);
    
    skillCard.innerHTML = `
        <div class="skill-icon">
            <i class="fas ${skillIcon}"></i>
        </div>
        <div class="skill-info">
            <h3 class="skill-name">${capitalizeFirstLetter(skillName)}</h3>
            <div class="skill-level">Level ${skillData.level}</div>
            <div class="skill-progress-container">
                <div class="skill-progress-bar">
                    <div class="skill-progress" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="skill-progress-text">${skillData.xp}/${skillData.nextLevelXP} XP</div>
            </div>
        </div>
    `;
    
    return skillCard;
}

// Function to get icon for skill
function getSkillIcon(skillName) {
    const icons = {
        'productivity': 'fa-tasks',
        'learning': 'fa-book',
        'fitness': 'fa-running',
        'creativity': 'fa-paint-brush',
        'default': 'fa-star'
    };
    
    return icons[skillName.toLowerCase()] || icons.default;
}

// Function to load achievements content
function loadAchievementsContent() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (userData && userData.achievements) {
        // Get achievements containers
        const unlockedContainer = document.querySelector('.unlocked-achievements .achievements-grid');
        const lockedContainer = document.querySelector('.locked-achievements .achievements-grid');
        
        if (!unlockedContainer || !lockedContainer) return;
        
        // Clear existing achievements
        unlockedContainer.innerHTML = '';
        lockedContainer.innerHTML = '';
        
        // Create achievement cards
        userData.achievements.forEach(achievement => {
            const achievementCard = createAchievementCard(achievement);
            
            if (achievement.unlocked) {
                unlockedContainer.appendChild(achievementCard);
            } else {
                lockedContainer.appendChild(achievementCard);
            }
        });
        
        // Update achievement counts
        const unlockedCount = userData.achievements.filter(a => a.unlocked).length;
        const totalCount = userData.achievements.length;
        
        const unlockedCountElement = document.querySelector('.unlocked-count');
        if (unlockedCountElement) {
            unlockedCountElement.textContent = `${unlockedCount}/${totalCount}`;
        }
    }
}

// Function to create an achievement card
function createAchievementCard(achievement) {
    const achievementCard = document.createElement('div');
    achievementCard.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
    
    achievementCard.innerHTML = `
        <div class="achievement-icon">
            <i class="fas ${achievement.icon}"></i>
        </div>
        <div class="achievement-info">
            <h3 class="achievement-title">${achievement.title}</h3>
            <p class="achievement-description">${achievement.description}</p>
        </div>
    `;
    
    return achievementCard;
}

// Function to load analytics content
function loadAnalyticsContent() {
    // For now, this would contain placeholder charts and data visualization
    // In a real implementation, you would use a charting library like Chart.js
    
    const analyticsContent = document.getElementById('analyticsContent');
    
    if (!analyticsContent) return;
    
    // For demonstration, just show placeholder elements
    const placeholderContent = `
        <div class="analytics-notice">
            <i class="fas fa-chart-line"></i>
            <p>Analytics functionality is being built. Check back soon to see your growth metrics and insights!</p>
        </div>
        
        <div class="chart-placeholders">
            <div class="chart-placeholder">
                <div class="chart-title">Daily XP Earned</div>
                <div class="placeholder-chart bar-chart"></div>
            </div>
            
            <div class="chart-placeholder">
                <div class="chart-title">Skill Growth</div>
                <div class="placeholder-chart radar-chart"></div>
            </div>
            
            <div class="chart-placeholder">
                <div class="chart-title">Goal Completion Rate</div>
                <div class="placeholder-chart pie-chart"></div>
            </div>
            
            <div class="chart-placeholder">
                <div class="chart-title">Level Progression</div>
                <div class="placeholder-chart line-chart"></div>
            </div>
        </div>
    `;
    
    analyticsContent.innerHTML = placeholderContent;
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to set up event listeners
function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            if (tabName) {
                loadTabContent(tabName);
            }
        });
    });
    
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

// Add CSS for charts placeholders
const style = document.createElement('style');
style.textContent = `
    .analytics-notice {
        background: rgba(30, 30, 50, 0.5);
        padding: 20px;
        border-radius: 5px;
        margin-bottom: 30px;
        text-align: center;
    }
    
    .analytics-notice i {
        font-size: 30px;
        color: #8a2be2;
        margin-bottom: 10px;
    }
    
    .chart-placeholders {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
    
    .chart-placeholder {
        background: rgba(20, 20, 35, 0.7);
        border-radius: 5px;
        padding: 20px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
    
    .chart-title {
        font-size: 18px;
        color: white;
        margin-bottom: 15px;
        text-align: center;
    }
    
    .placeholder-chart {
        height: 200px;
        background: rgba(30, 30, 50, 0.5);
        border-radius: 5px;
        position: relative;
        overflow: hidden;
    }
    
    .bar-chart::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 10%;
        width: 15px;
        height: 30%;
        background: #8a2be2;
        border-radius: 3px 3px 0 0;
        animation: barPulse 3s infinite;
    }
    
    .bar-chart::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 30%;
        width: 15px;
        height: 60%;
        background: #8a2be2;
        border-radius: 3px 3px 0 0;
        animation: barPulse 3s infinite 0.5s;
    }
    
    .pie-chart::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        background: conic-gradient(#8a2be2 0% 70%, rgba(255, 255, 255, 0.2) 70% 100%);
        border-radius: 50%;
    }
    
    .line-chart::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 2px;
        background: rgba(255, 255, 255, 0.1);
    }
    
    .line-chart::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        width: 100%;
        height: 3px;
        background: linear-gradient(90deg, rgba(138, 43, 226, 0.2), #8a2be2);
        clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%, 0 0, 10% 30%, 20% 50%, 40% 40%, 60% 30%, 80% 10%, 100% 0);
    }
    
    .radar-chart::before {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 70%);
        border-radius: 50%;
    }
    
    .radar-chart::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        background: rgba(138, 43, 226, 0.2);
        clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
    }
    
    @keyframes barPulse {
        0% { height: 30%; }
        50% { height: 60%; }
        100% { height: 30%; }
    }
    
    @media (max-width: 768px) {
        .chart-placeholders {
            grid-template-columns: 1fr;
        }
    }
`;

document.head.appendChild(style);

// Ensure consistent layout across devices
function adjustLayout() {
    // Fix overview card dimensions
    const overviewCards = document.querySelectorAll('.overview-card');
    overviewCards.forEach(card => {
        card.style.height = '180px';
    });
    
    // Fix chart containers to maintain consistent height
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.height = '350px';
    });
    
    // Fix skill card dimensions
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach(card => {
        card.style.height = '220px';
    });
    
    // Fix achievement card dimensions
    const achievementCards = document.querySelectorAll('.achievement-card');
    achievementCards.forEach(card => {
        card.style.height = '180px';
    });
    
    // Fix analytic card dimensions
    const analyticCards = document.querySelectorAll('.analytic-card');
    analyticCards.forEach(card => {
        card.style.height = '350px';
    });
    
    // Adjust skill card grid based on screen width
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
        if (window.innerWidth >= 1200) {
            skillsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (window.innerWidth >= 768) {
            skillsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            skillsGrid.style.gridTemplateColumns = '1fr';
        }
    }
    
    // Adjust analytics grid based on screen width
    const analyticsGrid = document.querySelector('.analytics-grid');
    if (analyticsGrid) {
        if (window.innerWidth >= 1200) {
            analyticsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            analyticsGrid.style.gridTemplateColumns = '1fr';
        }
    }
    
    // Fix timeline item heights for consistency
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => {
        item.style.minHeight = '120px';
    });
    
    // Ensure tabs have consistent sizing
    const progressTabs = document.querySelectorAll('.progress-tab');
    progressTabs.forEach(tab => {
        tab.style.height = '40px';
        tab.style.minWidth = '100px';
    });
    
    // Redraw charts if they exist to ensure proper sizing
    if (window.weeklyGrowthChart) window.weeklyGrowthChart.resize();
    if (window.categoryChart) window.categoryChart.resize();
    if (window.productivityTimeChart) window.productivityTimeChart.resize();
    if (window.completionRateChart) window.completionRateChart.resize();
    if (window.xpGrowthChart) window.xpGrowthChart.resize();
    if (window.skillDistributionChart) window.skillDistributionChart.resize();
} 