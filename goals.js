document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data if not exists
    initializeUserData();

    // Update UI with user data
    updateUserInterface();

    // Load goals from local storage or initialize with examples
    loadGoals();

    // Set up event listeners
    setupEventListeners();

    // Initial layout adjustment when the page loads
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
            coins: 0,
            inventory: [],
            goals: []
        };
        localStorage.setItem('userData', JSON.stringify(initialUserData));
    }

    // Initialize goals if needed
    if (!localStorage.getItem('goals')) {
        const initialGoals = [
            {
                id: 1,
                title: "Master JavaScript Fundamentals",
                category: "learning",
                difficulty: "hard",
                deadline: "2023-05-15",
                progress: 65,
                rewards: {
                    xp: 50,
                    coins: 100
                },
                completed: false
            },
            {
                id: 2,
                title: "Run 5k in Under 30 Minutes",
                category: "fitness",
                difficulty: "medium",
                deadline: "2023-06-30",
                progress: 25,
                rewards: {
                    xp: 40,
                    coins: 80
                },
                completed: false
            },
            {
                id: 3,
                title: "Read 10 Books This Year",
                category: "personal",
                difficulty: "easy",
                deadline: "2023-12-31",
                progress: 100,
                rewards: {
                    xp: 30,
                    coins: 60
                },
                completed: true
            }
        ];
        localStorage.setItem('goals', JSON.stringify(initialGoals));
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

// Function to load goals from storage and display them
function loadGoals() {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const goalCardsContainer = document.querySelector('.goal-cards');
    
    // Clear existing goals
    goalCardsContainer.innerHTML = '';
    
    // Add each goal to the container
    goals.forEach(goal => {
        const goalCard = createGoalCard(goal);
        goalCardsContainer.appendChild(goalCard);
    });
}

// Function to create a goal card element
function createGoalCard(goal) {
    const goalCard = document.createElement('div');
    goalCard.className = `goal-card${goal.completed ? ' completed' : ''}`;
    goalCard.setAttribute('data-id', goal.id);
    goalCard.setAttribute('data-category', goal.category);
    
    // Format the deadline date
    const deadlineDate = new Date(goal.deadline);
    const formattedDeadline = deadlineDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    goalCard.innerHTML = `
        <div class="goal-category ${goal.category}">
            <i class="fas ${getCategoryIcon(goal.category)}"></i>
        </div>
        <div class="goal-content">
            <h3 class="goal-title">${goal.title}</h3>
            <div class="goal-details">
                <div class="goal-deadline">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Deadline: ${formattedDeadline}</span>
                </div>
                <div class="goal-difficulty">
                    <i class="fas fa-fire"></i>
                    <span>${capitalizeFirstLetter(goal.difficulty)}</span>
                </div>
            </div>
            <div class="goal-progress-container">
                <div class="goal-progress-bar">
                    <div class="goal-progress" style="width: ${goal.progress}%"></div>
                </div>
                <span class="goal-progress-text">${goal.completed ? 'Completed!' : `${goal.progress}%`}</span>
            </div>
            <div class="goal-rewards">
                <div class="reward-item ${goal.completed ? 'collected' : ''}">
                    <i class="fas fa-star"></i>
                    <span>${goal.rewards.xp} XP</span>
                </div>
                <div class="reward-item ${goal.completed ? 'collected' : ''}">
                    <i class="fas fa-coins"></i>
                    <span>${goal.rewards.coins} Coins</span>
                </div>
            </div>
            <div class="goal-actions">
                ${!goal.completed ? `
                <button class="goal-action-btn update-progress" data-id="${goal.id}">
                    <i class="fas fa-chart-line"></i> Update Progress
                </button>
                ` : ''}
                <button class="goal-action-btn delete-goal" data-id="${goal.id}">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </div>
    `;
    
    return goalCard;
}

// Function to get icon class for goal category
function getCategoryIcon(category) {
    const icons = {
        'learning': 'fa-graduation-cap',
        'fitness': 'fa-running',
        'personal': 'fa-heart',
        'career': 'fa-briefcase',
        'default': 'fa-check-circle'
    };
    
    return icons[category] || icons.default;
}

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to set up event listeners
function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter goals
            const filter = this.getAttribute('data-filter');
            filterGoals(filter);
        });
    });
    
    // Add goal button
    const addGoalBtn = document.getElementById('addGoalBtn');
    const goalModal = document.getElementById('goalModal');
    const closeButtons = document.querySelectorAll('.modal .close');
    
    addGoalBtn.addEventListener('click', function() {
        // Reset form
        document.getElementById('goalForm').reset();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('goalDeadline').value = today;
        
        // Update reward preview based on default values
        updateRewardPreview('easy');
        
        // Display modal
        goalModal.style.display = 'block';
    });
    
    // Close buttons for modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // When clicking outside a modal, close it
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Goal form submission
    const goalForm = document.getElementById('goalForm');
    goalForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addNewGoal();
    });
    
    // Update reward preview when difficulty changes
    const goalDifficulty = document.getElementById('goalDifficulty');
    goalDifficulty.addEventListener('change', function() {
        updateRewardPreview(this.value);
    });
    
    // Event delegation for dynamically created elements
    document.querySelector('.goal-cards').addEventListener('click', function(event) {
        // Handle update progress button
        if (event.target.closest('.update-progress')) {
            const goalId = event.target.closest('.update-progress').getAttribute('data-id');
            openUpdateProgressModal(goalId);
        }
        
        // Handle delete goal button
        if (event.target.closest('.delete-goal')) {
            const goalId = event.target.closest('.delete-goal').getAttribute('data-id');
            deleteGoal(goalId);
        }
    });
    
    // Handle suggested goal buttons
    const addSuggestedBtns = document.querySelectorAll('.add-suggested-btn');
    addSuggestedBtns.forEach(button => {
        button.addEventListener('click', function() {
            const goalKey = this.getAttribute('data-goal');
            addSuggestedGoal(goalKey);
        });
    });
    
    // Continue button in the completion modal
    const continueBtn = document.querySelector('#goalCompletedModal .continue-btn');
    continueBtn.addEventListener('click', function() {
        document.getElementById('goalCompletedModal').style.display = 'none';
    });
}

// Function to filter goals
function filterGoals(filter) {
    const goalCards = document.querySelectorAll('.goal-card');
    
    goalCards.forEach(card => {
        switch(filter) {
            case 'all':
                card.style.display = 'flex';
                break;
            case 'active':
                if (card.classList.contains('completed')) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                }
                break;
            case 'completed':
                if (card.classList.contains('completed')) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                break;
        }
    });
}

// Function to open the update progress modal (simplified, you would create this modal dynamically)
function openUpdateProgressModal(goalId) {
    // For now, we'll just prompt for the new progress value
    const newProgress = prompt('Enter new progress (0-100):', '');
    
    if (newProgress !== null) {
        const progress = parseInt(newProgress);
        if (!isNaN(progress) && progress >= 0 && progress <= 100) {
            updateGoalProgress(goalId, progress);
        } else {
            alert('Please enter a valid number between 0 and 100');
        }
    }
}

// Function to update goal progress
function updateGoalProgress(goalId, progress) {
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    const goalIndex = goals.findIndex(goal => goal.id.toString() === goalId.toString());
    
    if (goalIndex !== -1) {
        const goal = goals[goalIndex];
        const wasCompleted = goal.completed;
        
        // Update progress
        goal.progress = progress;
        
        // Check if goal is now completed
        if (progress >= 100 && !wasCompleted) {
            goal.completed = true;
            goal.progress = 100;
            
            // Award rewards
            awardRewards(goal.rewards);
            
            // Show completion modal
            showCompletionModal(goal);
        }
        
        // Save updated goals
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Refresh the goals display
        loadGoals();
    }
}

// Function to delete a goal
function deleteGoal(goalId) {
    if (confirm('Are you sure you want to delete this goal?')) {
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        const updatedGoals = goals.filter(goal => goal.id.toString() !== goalId.toString());
        
        // Save updated goals
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
        
        // Refresh the goals display
        loadGoals();
    }
}

// Function to add a new goal
function addNewGoal() {
    const goalTitle = document.getElementById('goalTitle').value;
    const goalCategory = document.getElementById('goalCategory').value;
    const goalDifficulty = document.getElementById('goalDifficulty').value;
    const goalDeadline = document.getElementById('goalDeadline').value;
    
    const goals = JSON.parse(localStorage.getItem('goals')) || [];
    
    // Generate a new unique ID
    const newId = goals.length > 0 ? Math.max(...goals.map(goal => goal.id)) + 1 : 1;
    
    // Calculate rewards based on difficulty
    const rewards = calculateRewards(goalDifficulty);
    
    // Create new goal object
    const newGoal = {
        id: newId,
        title: goalTitle,
        category: goalCategory,
        difficulty: goalDifficulty,
        deadline: goalDeadline,
        progress: 0,
        rewards: rewards,
        completed: false
    };
    
    // Add to goals array
    goals.push(newGoal);
    
    // Save updated goals
    localStorage.setItem('goals', JSON.stringify(goals));
    
    // Close modal
    document.getElementById('goalModal').style.display = 'none';
    
    // Refresh the goals display
    loadGoals();
    
    // Show notification
    showNotification('New goal added!');
}

// Function to add a suggested goal
function addSuggestedGoal(goalKey) {
    const suggestedGoals = {
        'learn_new_language': {
            title: 'Learn a New Programming Language',
            category: 'learning',
            difficulty: 'hard',
            rewards: {
                xp: 100,
                coins: 200
            }
        },
        'workout_challenge': {
            title: '30-Day Workout Challenge',
            category: 'fitness',
            difficulty: 'medium',
            rewards: {
                xp: 75,
                coins: 150
            }
        },
        'read_book': {
            title: 'Read a Personal Development Book',
            category: 'personal',
            difficulty: 'easy',
            rewards: {
                xp: 40,
                coins: 80
            }
        }
    };
    
    if (suggestedGoals[goalKey]) {
        const goals = JSON.parse(localStorage.getItem('goals')) || [];
        
        // Generate a new unique ID
        const newId = goals.length > 0 ? Math.max(...goals.map(goal => goal.id)) + 1 : 1;
        
        // Set deadline to 30 days from now
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 30);
        const formattedDeadline = deadline.toISOString().split('T')[0];
        
        // Create new goal object from suggested goal
        const newGoal = {
            id: newId,
            title: suggestedGoals[goalKey].title,
            category: suggestedGoals[goalKey].category,
            difficulty: suggestedGoals[goalKey].difficulty,
            deadline: formattedDeadline,
            progress: 0,
            rewards: suggestedGoals[goalKey].rewards,
            completed: false
        };
        
        // Add to goals array
        goals.push(newGoal);
        
        // Save updated goals
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Refresh the goals display
        loadGoals();
        
        // Show notification
        showNotification('Suggested goal added!');
    }
}

// Function to calculate rewards based on difficulty
function calculateRewards(difficulty) {
    switch(difficulty) {
        case 'easy':
            return { xp: 30, coins: 60 };
        case 'medium':
            return { xp: 50, coins: 100 };
        case 'hard':
            return { xp: 100, coins: 200 };
        case 'impossible':
            return { xp: 200, coins: 400 };
        default:
            return { xp: 30, coins: 60 };
    }
}

// Function to update reward preview
function updateRewardPreview(difficulty) {
    const rewards = calculateRewards(difficulty);
    document.getElementById('xpReward').textContent = `${rewards.xp} XP`;
    document.getElementById('coinReward').textContent = `${rewards.coins} Coins`;
}

// Function to award rewards
function awardRewards(rewards) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Add XP and coins
    userData.xp += rewards.xp;
    userData.coins += rewards.coins;
    
    // Check if level up
    const nextLevelXP = calculateNextLevelXP(userData.level);
    if (userData.xp >= nextLevelXP) {
        userData.level += 1;
        showLevelUpAnimation(userData.level);
    }
    
    // Save updated user data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    updateUserInterface();
}

// Function to show completion modal
function showCompletionModal(goal) {
    const modal = document.getElementById('goalCompletedModal');
    modal.querySelector('.goal-completion-name').textContent = goal.title;
    
    const rewardsList = modal.querySelector('.rewards-list');
    rewardsList.innerHTML = `
        <div class="reward-item large">
            <i class="fas fa-star"></i>
            <span>${goal.rewards.xp} XP</span>
        </div>
        <div class="reward-item large">
            <i class="fas fa-coins"></i>
            <span>${goal.rewards.coins} Coins</span>
        </div>
    `;
    
    modal.style.display = 'block';
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

// Add CSS for notifications and level up animation
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
`;

document.head.appendChild(style);

// Function to adjust layout and maintain consistent dimensions
function adjustLayout() {
    // Fix goal card dimensions
    const goalCards = document.querySelectorAll('.goal-card');
    goalCards.forEach(card => {
        card.style.height = '300px';
    });
    
    // Fix suggested goals container dimensions
    const suggestedGoals = document.querySelectorAll('.suggested-goal');
    suggestedGoals.forEach(goal => {
        goal.style.height = '180px';
    });
    
    // Force goal progress bars to maintain fixed height
    const progressBars = document.querySelectorAll('.goal-progress-bar');
    progressBars.forEach(bar => {
        bar.style.height = '12px';
    });
    
    // Fix goal rewards section height
    const goalRewards = document.querySelectorAll('.goal-rewards');
    goalRewards.forEach(reward => {
        reward.style.height = '40px';
    });
    
    // Adjust goal cards grid layout based on screen width
    const goalCardsGrid = document.querySelector('.goal-cards');
    if (goalCardsGrid) {
        if (window.innerWidth >= 1200) {
            goalCardsGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (window.innerWidth >= 768) {
            goalCardsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            goalCardsGrid.style.gridTemplateColumns = '1fr';
        }
    }
    
    // Adjust suggested goals container based on screen width
    const suggestedContainer = document.querySelector('.suggested-goals-container');
    if (suggestedContainer) {
        if (window.innerWidth >= 992) {
            suggestedContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        } else if (window.innerWidth >= 768) {
            suggestedContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
        } else {
            suggestedContainer.style.gridTemplateColumns = '1fr';
        }
    }
    
    // Fix category icon dimensions
    const categoryIcons = document.querySelectorAll('.goal-category');
    categoryIcons.forEach(icon => {
        icon.style.width = '60px';
        icon.style.height = '60px';
    });
} 