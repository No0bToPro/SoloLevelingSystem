document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data
    initializeUserData();
    
    // Update UI
    updateUserInterface();
    
    // Setup navigation
    setupNavigation();
    
    // Setup profile menu toggle
    setupProfileMenu();
    
    // Setup quick action buttons
    setupQuickActions();
});

/**
 * Initialize user data if it doesn't exist
 */
function initializeUserData() {
    // Check if user data exists in local storage
    if (!localStorage.getItem('userData')) {
        // Default user data
        const defaultUserData = {
            name: 'Adventurer',
            level: 1,
            xp: 20,
            xpToNextLevel: 100,
            coins: 50,
            streak: 7,
            inventory: [],
            goals: [
                {
                    id: 1,
                    title: 'Learn Python Basics',
                    category: 'learning',
                    difficulty: 'medium',
                    deadline: '2023-12-30',
                    progress: 60,
                    completed: false,
                    xpReward: 50,
                    coinReward: 100
                },
                {
                    id: 2,
                    title: 'Daily Meditation',
                    category: 'personal',
                    difficulty: 'easy',
                    deadline: '2023-12-15',
                    progress: 30,
                    completed: false,
                    xpReward: 30,
                    coinReward: 60
                }
            ],
            tasks: [
                {
                    id: 1,
                    title: 'Complete morning meditation',
                    completed: false,
                    time: '5:00 AM'
                },
                {
                    id: 2,
                    title: 'Study machine learning fundamentals',
                    completed: false,
                    time: '1 hour'
                },
                {
                    id: 3,
                    title: 'Work on personal project',
                    completed: false,
                    time: '2 hours'
                },
                {
                    id: 4,
                    title: 'Exercise',
                    completed: false,
                    time: '30 minutes'
                }
            ],
            stats: {
                goalsCompleted: 5,
                tasksCompleted: 42,
                skillsLearned: 3,
                daysStreak: 7
            },
            skills: [
                {
                    name: 'Programming',
                    level: 3,
                    progress: 60,
                    icon: 'fa-code'
                },
                {
                    name: 'Meditation',
                    level: 2,
                    progress: 40,
                    icon: 'fa-brain'
                },
                {
                    name: 'Fitness',
                    level: 4,
                    progress: 80,
                    icon: 'fa-dumbbell'
                }
            ],
            achievements: [
                {
                    id: 1,
                    title: 'First Steps',
                    description: 'Complete your first goal',
                    unlocked: true,
                    icon: 'fa-shoe-prints'
                },
                {
                    id: 2,
                    title: 'Consistency Champion',
                    description: 'Maintain a 7-day streak',
                    unlocked: true,
                    icon: 'fa-calendar-check'
                },
                {
                    id: 3,
                    title: 'Knowledge Seeker',
                    description: 'Complete 5 learning goals',
                    unlocked: false,
                    icon: 'fa-book'
                }
            ],
            activity: [
                {
                    id: 1,
                    type: 'goal_progress',
                    description: 'Updated progress on "Learn Python Basics"',
                    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    xpGained: 10,
                    coinsGained: 15
                },
                {
                    id: 2,
                    type: 'task_completed',
                    description: 'Completed task "Morning Meditation"',
                    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    xpGained: 5,
                    coinsGained: 10
                },
                {
                    id: 3,
                    type: 'achievement_unlocked',
                    description: 'Unlocked "Consistency Champion" achievement',
                    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    xpGained: 30,
                    coinsGained: 50
                }
            ]
        };

        // Save to local storage
        localStorage.setItem('userData', JSON.stringify(defaultUserData));
    }
}

/**
 * Update UI elements based on user data
 */
function updateUserInterface() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Update level info
    document.querySelector('.level-badge').textContent = `Level ${userData.level}`;
    document.querySelector('.level-number').textContent = userData.level;
    
    // Update XP bar
    const xpPercent = (userData.xp / userData.xpToNextLevel) * 100;
    document.querySelector('.xp-progress').style.width = `${xpPercent}%`;
    document.querySelector('.xp-text').textContent = `${userData.xp}/${userData.xpToNextLevel} XP`;
    
    // Update current XP and next level XP in the level card
    document.querySelector('.current-xp').textContent = userData.xp;
    document.querySelector('.next-level-xp').textContent = userData.xpToNextLevel;
    
    // Update coins
    document.querySelector('.currency-amount').textContent = userData.coins;
    
    // Update user name
    document.querySelector('.user-name').textContent = userData.name;
    
    // Update dashboard stats
    document.getElementById('goalsCompleted').textContent = userData.stats.goalsCompleted;
    document.getElementById('tasksCompleted').textContent = userData.stats.tasksCompleted;
    document.getElementById('skillsLearned').textContent = userData.stats.skillsLearned;
    document.getElementById('daysStreak').textContent = userData.stats.daysStreak;
    
    // Update streak count
    document.querySelector('.streak-count').textContent = `${userData.streak} Days`;
    
    // Update activity list
    updateActivityList(userData.activity);
    
    // Check tasks status
    updateTaskList(userData.tasks);
    
    // Load achievements
    loadAchievements(userData.achievements);
}

/**
 * Update the recent activity list
 */
function updateActivityList(activities) {
    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = '';
    
    // Sort activities by date (newest first)
    const sortedActivities = [...activities].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Display only the most recent 5 activities
    const recentActivities = sortedActivities.slice(0, 5);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = '<p class="no-activity">No recent activity found.</p>';
        return;
    }
    
    recentActivities.forEach(activity => {
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
        
        // Get icon based on activity type
        const icon = getActivityIcon(activity.type);
        
        activityItem.innerHTML = `
            <div class="activity-icon"><i class="${icon}"></i></div>
            <div class="activity-details">
                <div class="activity-description">${activity.description}</div>
                <div class="activity-date">${formattedDate}</div>
            </div>
            <div class="activity-rewards">
                ${activity.xpGained ? `<span class="xp-reward">+${activity.xpGained} XP</span>` : ''}
                ${activity.coinsGained ? `<span class="coin-reward">+${activity.coinsGained} <i class="fas fa-coins"></i></span>` : ''}
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

/**
 * Get the appropriate icon class based on activity type
 */
function getActivityIcon(type) {
    switch (type) {
        case 'goal_progress':
            return 'fas fa-bullseye';
        case 'goal_completed':
            return 'fas fa-flag-checkered';
        case 'task_completed':
            return 'fas fa-check-circle';
        case 'achievement_unlocked':
            return 'fas fa-medal';
        case 'level_up':
            return 'fas fa-arrow-up';
        case 'item_purchased':
            return 'fas fa-shopping-cart';
        default:
            return 'fas fa-star';
    }
}

/**
 * Update the task list with current status
 */
function updateTaskList(tasks) {
    // Update task checkboxes
    tasks.forEach((task, index) => {
        const checkbox = document.getElementById(`task${index + 1}`);
        if (checkbox) {
            checkbox.checked = task.completed;
            
            // Add click handler
            checkbox.addEventListener('change', function() {
                completeTask(index);
            });
        }
    });
}

/**
 * Mark a task as complete
 */
function completeTask(taskIndex) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Toggle completion status
    userData.tasks[taskIndex].completed = !userData.tasks[taskIndex].completed;
    
    if (userData.tasks[taskIndex].completed) {
        // Increment task count
        userData.stats.tasksCompleted++;
        
        // Add XP and coins
        const xpGained = 5;
        const coinsGained = 10;
        userData.xp += xpGained;
        userData.coins += coinsGained;
        
        // Add to activity
        userData.activity.unshift({
            id: Date.now(),
            type: 'task_completed',
            description: `Completed task "${userData.tasks[taskIndex].title}"`,
            date: new Date().toISOString(),
            xpGained: xpGained,
            coinsGained: coinsGained
        });
        
        // Show notification
        showNotification(`Task completed! +${xpGained} XP, +${coinsGained} coins`);
        
        // Check for level up
        checkForLevelUp(userData);
    } else {
        // Decrement task count if unchecking
        userData.stats.tasksCompleted = Math.max(0, userData.stats.tasksCompleted - 1);
        
        // Remove XP and coins
        const xpLost = 5;
        const coinsLost = 10;
        userData.xp = Math.max(0, userData.xp - xpLost);
        userData.coins = Math.max(0, userData.coins - coinsLost);
    }
    
    // Save updated data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    updateUserInterface();
}

/**
 * Check if user has leveled up
 */
function checkForLevelUp(userData) {
    if (userData.xp >= userData.xpToNextLevel) {
        // Level up!
        userData.level++;
        userData.xp -= userData.xpToNextLevel;
        userData.xpToNextLevel = calculateXpForNextLevel(userData.level);
        
        // Add to activity
        userData.activity.unshift({
            id: Date.now(),
            type: 'level_up',
            description: `Leveled up to Level ${userData.level}!`,
            date: new Date().toISOString(),
            xpGained: 0,
            coinsGained: userData.level * 50 // Bonus coins for leveling up
        });
        
        // Add coins for leveling up
        userData.coins += userData.level * 50;
        
        // Save updated data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Show level up modal
        showLevelUpModal(userData.level);
    }
}

/**
 * Calculate XP needed for the next level
 */
function calculateXpForNextLevel(level) {
    // Formula: 100 * level * 1.5
    return Math.floor(100 * level * 1.5);
}

/**
 * Setup navigation functionality
 */
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // No need to prevent default for normal navigation
        });
    });
}

/**
 * Setup profile menu toggle
 */
function setupProfileMenu() {
    const avatar = document.querySelector('.avatar');
    const profileMenu = document.querySelector('.profile-menu');
    
    avatar.addEventListener('click', function() {
        profileMenu.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!avatar.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.remove('show');
        }
    });
}

/**
 * Setup quick action buttons
 */
function setupQuickActions() {
    // Quick add goal button
    const quickAddGoalBtn = document.querySelector('.quick-add-goal');
    if (quickAddGoalBtn) {
        quickAddGoalBtn.addEventListener('click', function() {
            // Show goal modal
            document.getElementById('goalModal').style.display = 'block';
        });
    }
    
    // Daily challenge button
    const dailyChallengeBtn = document.querySelector('.daily-challenge');
    if (dailyChallengeBtn) {
        dailyChallengeBtn.addEventListener('click', function() {
            // Generate a random daily challenge
            generateDailyChallenge();
        });
    }
    
    // Add task button
    const addTaskBtn = document.querySelector('.add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function() {
            addNewTask();
        });
    }
    
    // Close buttons for modals
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Goal form submission
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewGoal();
        });
    }
}

/**
 * Generate a daily challenge
 */
function generateDailyChallenge() {
    const challenges = [
        {
            title: "Mindfulness Meditation",
            description: "Complete a 15-minute meditation session",
            xpReward: 15,
            coinReward: 25
        },
        {
            title: "Knowledge Expansion",
            description: "Read an article or watch a video on a new topic",
            xpReward: 20,
            coinReward: 30
        },
        {
            title: "Physical Activity",
            description: "Complete a 30-minute workout or 10,000 steps",
            xpReward: 25,
            coinReward: 35
        },
        {
            title: "Skill Practice",
            description: "Practice your main skill for at least 1 hour",
            xpReward: 30,
            coinReward: 40
        },
        {
            title: "Digital Detox",
            description: "Spend 2 hours without using social media",
            xpReward: 15,
            coinReward: 20
        }
    ];
    
    // Select a random challenge
    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    
    // Add to tasks
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    const newTask = {
        id: Date.now(),
        title: `[DAILY] ${randomChallenge.title}: ${randomChallenge.description}`,
        completed: false,
        time: 'Today',
        isChallenge: true,
        xpReward: randomChallenge.xpReward,
        coinReward: randomChallenge.coinReward
    };
    
    userData.tasks.push(newTask);
    
    // Save updated data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    updateUserInterface();
    
    // Show notification
    showNotification(`Daily Challenge added: ${randomChallenge.title}`);
}

/**
 * Add a new task
 */
function addNewTask() {
    // For a full app, this would show a modal to collect task details
    const taskTitle = prompt("Enter task title:");
    if (!taskTitle) return;
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    const newTask = {
        id: Date.now(),
        title: taskTitle,
        completed: false,
        time: 'Today'
    };
    
    userData.tasks.push(newTask);
    
    // Save updated data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    updateUserInterface();
    
    // Show notification
    showNotification("New task added!");
}

/**
 * Add a new goal
 */
function addNewGoal() {
    const goalTitle = document.getElementById('goalTitle').value;
    const goalCategory = document.getElementById('goalCategory').value;
    const goalDifficulty = document.getElementById('goalDifficulty').value;
    const goalDeadline = document.getElementById('goalDeadline').value;
    
    if (!goalTitle || !goalDeadline) return;
    
    // Calculate rewards based on difficulty
    let xpReward = 30;
    let coinReward = 60;
    
    switch (goalDifficulty) {
        case 'easy':
            xpReward = 20;
            coinReward = 40;
            break;
        case 'medium':
            xpReward = 40;
            coinReward = 80;
            break;
        case 'hard':
            xpReward = 60;
            coinReward = 120;
            break;
        case 'impossible':
            xpReward = 100;
            coinReward = 200;
            break;
    }
    
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    const newGoal = {
        id: Date.now(),
        title: goalTitle,
        category: goalCategory,
        difficulty: goalDifficulty,
        deadline: goalDeadline,
        progress: 0,
        completed: false,
        xpReward: xpReward,
        coinReward: coinReward
    };
    
    userData.goals.push(newGoal);
    
    // Add to activity
    userData.activity.unshift({
        id: Date.now(),
        type: 'goal_added',
        description: `Added new goal: "${goalTitle}"`,
        date: new Date().toISOString(),
        xpGained: 5,
        coinsGained: 10
    });
    
    // Add small reward for creating a goal
    userData.xp += 5;
    userData.coins += 10;
    
    // Save updated data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    updateUserInterface();
    
    // Close modal
    document.getElementById('goalModal').style.display = 'none';
    
    // Reset form
    document.getElementById('goalForm').reset();
    
    // Show notification
    showNotification(`New goal added! +5 XP, +10 coins`);
    
    // Check for level up
    checkForLevelUp(userData);
}

/**
 * Load achievements in the dashboard
 */
function loadAchievements(achievements) {
    const unlockedContainer = document.querySelector('.unlocked-achievements .achievements-grid');
    const lockedContainer = document.querySelector('.locked-achievements .achievements-grid');
    
    if (!unlockedContainer || !lockedContainer) return;
    
    // Clear containers
    unlockedContainer.innerHTML = '';
    lockedContainer.innerHTML = '';
    
    // Filter achievements
    const unlocked = achievements.filter(a => a.unlocked);
    const locked = achievements.filter(a => !a.unlocked);
    
    // Show unlocked achievements (up to 3)
    unlocked.slice(0, 3).forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = 'achievement-card unlocked';
        achievementCard.innerHTML = `
            <div class="achievement-icon"><i class="fas ${achievement.icon}"></i></div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        unlockedContainer.appendChild(achievementCard);
    });
    
    // Show locked achievements (up to 3)
    locked.slice(0, 3).forEach(achievement => {
        const achievementCard = document.createElement('div');
        achievementCard.className = 'achievement-card locked';
        achievementCard.innerHTML = `
            <div class="achievement-icon"><i class="fas ${achievement.icon}"></i></div>
            <div class="achievement-info">
                <div class="achievement-title">${achievement.title}</div>
                <div class="achievement-description">${achievement.description}</div>
            </div>
        `;
        lockedContainer.appendChild(achievementCard);
    });
}

/**
 * Show the level up modal
 */
function showLevelUpModal(level) {
    const levelUpModal = document.getElementById('levelUpModal');
    const levelNumber = levelUpModal.querySelector('.new-level-number');
    const levelName = levelUpModal.querySelector('.new-level-name');
    
    // Update level information
    levelNumber.textContent = level;
    levelName.textContent = getLevelTitle(level);
    
    // Display the modal
    levelUpModal.style.display = 'block';
    
    // Play sound/animation
    playLevelUpAnimation();
}

/**
 * Get the title for a level
 */
function getLevelTitle(level) {
    const titles = [
        'Novice',
        'Apprentice',
        'Adept',
        'Skilled Journeyman',
        'Expert',
        'Master',
        'Grandmaster',
        'Legendary',
        'Mythic',
        'Transcendent'
    ];
    
    return titles[Math.min(level - 1, titles.length - 1)];
}

/**
 * Play level up animation
 */
function playLevelUpAnimation() {
    // In a full application, this would trigger sound effects and animations
    console.log('Playing level up animation');
}

/**
 * Show a notification
 */
function showNotification(message) {
    // Check if notification container exists
    let notificationContainer = document.querySelector('.notification-container');
    
    if (!notificationContainer) {
        // Create notification container
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-message">${message}</div>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
} 