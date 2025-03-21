// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation to feature cards on scroll
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.feature-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
});

// CTA Button click handler
document.querySelector('.cta-button').addEventListener('click', function() {
    alert('Thank you for your interest! This feature is coming soon.');
});

// Add active class to navigation links on scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 60) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// DOM Elements
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section');
const addGoalBtn = document.getElementById('addGoalBtn');
const goalModal = document.getElementById('goalModal');
const closeModal = document.querySelector('.close');
const goalForm = document.getElementById('goalForm');
const goalCards = document.querySelector('.goal-cards');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        sections.forEach(section => {
            section.classList.remove('active-section');
            if (section.id === targetId) {
                section.classList.add('active-section');
            }
        });
    });
});

// Goals Management
let goals = JSON.parse(localStorage.getItem('goals')) || [];

function createGoalCard(goal) {
    const card = document.createElement('div');
    card.className = 'dashboard-card';
    card.innerHTML = `
        <h3>${goal.title}</h3>
        <p><strong>Category:</strong> ${goal.category}</p>
        <p><strong>Deadline:</strong> ${new Date(goal.deadline).toLocaleDateString()}</p>
        <div class="progress-bar">
            <div class="progress" style="width: ${goal.progress || 0}%"></div>
        </div>
        <button class="resource-btn update-progress" data-id="${goal.id}">Update Progress</button>
        <button class="resource-btn delete-goal" data-id="${goal.id}" style="background-color: var(--accent-color)">Delete</button>
    `;
    return card;
}

function renderGoals() {
    goalCards.innerHTML = '';
    goals.forEach(goal => {
        goalCards.appendChild(createGoalCard(goal));
    });
    updateStats();
}

function updateStats() {
    const completedGoals = goals.filter(goal => goal.progress === 100).length;
    document.querySelector('.stat-number').textContent = completedGoals;
}

// Modal Management
addGoalBtn.addEventListener('click', () => {
    goalModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    goalModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === goalModal) {
        goalModal.style.display = 'none';
    }
});

// Form Submission
goalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newGoal = {
        id: Date.now(),
        title: document.getElementById('goalTitle').value,
        category: document.getElementById('goalCategory').value,
        deadline: document.getElementById('goalDeadline').value,
        progress: 0
    };
    
    goals.push(newGoal);
    localStorage.setItem('goals', JSON.stringify(goals));
    
    renderGoals();
    goalForm.reset();
    goalModal.style.display = 'none';
});

// Goal Actions
goalCards.addEventListener('click', (e) => {
    if (e.target.classList.contains('update-progress')) {
        const goalId = parseInt(e.target.dataset.id);
        const goal = goals.find(g => g.id === goalId);
        const newProgress = Math.min(100, (goal.progress || 0) + 10);
        
        goals = goals.map(g => g.id === goalId ? {...g, progress: newProgress} : g);
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Show progression animation
        const progressBar = e.target.parentElement.querySelector('.progress');
        progressBar.style.transition = 'width 0.5s ease, box-shadow 0.5s ease';
        progressBar.style.width = `${newProgress}%`;
        
        // Add glow effect for progress
        if (newProgress >= 50 && newProgress < 100) {
            progressBar.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.7)';
        }
        
        // Show a floating message for progression
        showFloatingMessage(e.target, `+10% Progress`, '#2ecc71');
        
        // If goal is completed
        if (newProgress === 100) {
            // Complete task and get reward
            completeTask(`goal_${goalId}`, 'normal');
            
            // Special effect for goal completion
            const card = e.target.parentElement;
            card.classList.add('goal-completed');
            
            // Create the success burst effect
            createSuccessBurst(card);
            
            // Show completion message
            setTimeout(() => {
                showFloatingMessage(card, 'GOAL COMPLETED!', '#f1c40f', true);
            }, 300);
            
            // Apply bonus XP for goal completion
            const bonusXP = 50;
            userState.xp += bonusXP;
            localStorage.setItem('userState', JSON.stringify(userState));
            
            // Show bonus XP message after a delay
            setTimeout(() => {
                showFloatingMessage(card, `+${bonusXP} BONUS XP`, '#f1c40f');
                updateUI();
            }, 1000);
        }
        
        renderGoals();
    }
    
    if (e.target.classList.contains('delete-goal')) {
        const goalId = parseInt(e.target.dataset.id);
        goals = goals.filter(g => g.id !== goalId);
        localStorage.setItem('goals', JSON.stringify(goals));
        renderGoals();
    }
});

// Progress Chart
const ctx = document.getElementById('weeklyProgress');
if (ctx) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Hours Spent',
                data: [2, 4, 3, 5, 4, 6, 3],
                borderColor: '#3498db',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Hours'
                    }
                }
            }
        }
    });
}

// Task Management
const taskCheckboxes = document.querySelectorAll('.task-list input[type="checkbox"]');
taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const label = checkbox.nextElementSibling;
        if (checkbox.checked) {
            label.style.textDecoration = 'line-through';
            label.style.color = '#666';
        } else {
            label.style.textDecoration = 'none';
            label.style.color = 'var(--text-color)';
        }
    });
});

// Leveling System Configuration
const LEVELS = {
    1: { name: 'Novice', xp: 0, milestones: [
        { name: 'Beginner', xp: 25 },
        { name: 'Apprentice', xp: 50 },
        { name: 'Junior Apprentice', xp: 100 },
        { name: 'Journeyman', xp: 125 }
    ]},
    2: { name: 'Skilled Journeyman', xp: 150, milestones: [
        { name: 'Expert', xp: 200 },
        { name: 'Accomplished Expert', xp: 250 }
    ]},
    3: { name: 'Master', xp: 300, milestones: [
        { name: 'Advanced Master', xp: 400 },
        { name: 'Grandmaster', xp: 500 },
        { name: 'Renowned Grandmaster', xp: 600 }
    ]},
    4: { name: 'Legend', xp: 750, milestones: [
        { name: 'Living Legend', xp: 1000 },
        { name: 'Immortal', xp: 1100 },
        { name: 'Ascended Immortal', xp: 1250 }
    ]},
    5: { name: 'Divine Being', xp: 1500, milestones: [
        { name: 'Transcendent Being', xp: 2000 }
    ]},
    6: { name: 'Deity', xp: 2500, milestones: [
        { name: 'Supreme Being', xp: 3000 },
        { name: 'Infinite', xp: 3500 }
    ]},
    7: { name: 'Eternal', xp: 4000, milestones: [
        { name: 'Infinite Mastery', xp: 5000 },
        { name: 'Cosmic', xp: 6000 }
    ]},
    8: { name: 'Universal', xp: 7000, milestones: [
        { name: 'Cosmic Overlord', xp: 8000 },
        { name: 'Universal Deity', xp: 9000 }
    ]},
    9: { name: 'Omni-Potent', xp: 10000, milestones: [
        { name: 'Supreme Deity', xp: 12000 },
        { name: 'Infinite Divinity', xp: 14000 }
    ]},
    10: { name: 'Transcendental', xp: 16000, milestones: [] }
};

// Hidden Achievements Configuration
const ACHIEVEMENTS = {
    'the_unyielding': {
        name: 'The Unyielding',
        description: 'Complete a task after failing it 5 times',
        icon: 'fas fa-shield-alt',
        hint: 'Failure is just the beginning of mastery. Try again.',
        reward: { xp: 100, coins: 500 }
    },
    'night_walker': {
        name: 'Night Walker',
        description: 'Complete a task between 2 AM - 4 AM',
        icon: 'fas fa-moon',
        hint: 'Some paths are only walked under the moonlight...',
        reward: { xp: 150, coins: 750 }
    },
    'shadow_training': {
        name: 'Shadow Training',
        description: 'Do 10 tasks without claiming rewards',
        icon: 'fas fa-user-ninja',
        hint: 'A true master does not seek immediate recognition.',
        reward: { xp: 200, coins: 1000 }
    },
    'iron_will': {
        name: 'The Iron Will',
        description: 'Fail a high-difficulty task but immediately try again',
        icon: 'fas fa-fist-raised',
        hint: 'Even the strongest fall… but do they rise?',
        reward: { xp: 250, coins: 1250 }
    },
    'beyond_limits': {
        name: 'Beyond Limits',
        description: 'Complete a task rated as "Impossible" by the AI',
        icon: 'fas fa-infinity',
        hint: 'Some barriers are meant to be broken, if one dares to try...',
        reward: { xp: 300, coins: 1500 }
    }
};

// User State
let userState = JSON.parse(localStorage.getItem('userState')) || {
    xp: 0,
    level: 1,
    coins: 0,
    achievements: {},
    taskFailures: {},
    lastTaskTime: null,
    unclaimedTasks: 0
};

// Level Management
function updateLevel() {
    const currentLevel = LEVELS[userState.level];
    const nextLevel = LEVELS[userState.level + 1];
    
    if (nextLevel && userState.xp >= nextLevel.xp) {
        userState.level++;
        showLevelUpAnimation();
        updateUI();
    }
}

function showLevelUpAnimation() {
    const levelNumber = document.querySelector('.level-number');
    levelNumber.classList.add('level-up');
    
    // Add the level up text
    const levelUpText = document.createElement('div');
    levelUpText.className = 'level-up-text';
    levelUpText.textContent = 'LEVEL UP!';
    document.querySelector('.level-details').appendChild(levelUpText);
    
    // Add particle effects
    createParticles(levelNumber);
    
    // Play sound effect
    playSound('level-up');
    
    // Show the level up modal
    showLevelUpModal(userState.level);
    
    // Remove classes after animation completes
    setTimeout(() => {
        levelNumber.classList.remove('level-up');
        if (document.querySelector('.level-up-text')) {
            document.querySelector('.level-up-text').remove();
        }
    }, 2000);
}

function showLevelUpModal(level) {
    const modal = document.getElementById('levelUpModal');
    const levelNumber = modal.querySelector('.new-level-number');
    const levelName = modal.querySelector('.new-level-name');
    const continueBtn = modal.querySelector('.continue-btn');
    
    // Set level details
    levelNumber.textContent = level;
    levelName.textContent = LEVELS[level].name;
    
    // Get unlocked features based on level
    const unlockedList = modal.querySelector('.unlocked-list');
    unlockedList.innerHTML = '';
    
    // Define features for each level
    const levelFeatures = {
        1: [],
        2: [
            'New Daily Challenges',
            'Skill Tree Expansion',
            'Increased XP Gain (5%)'
        ],
        3: [
            'Personalized Goal Recommendations',
            'Advanced Progress Analytics',
            'Exclusive Master Resources'
        ],
        4: [
            'Mentor Connection Feature',
            'Custom Achievement Creation',
            'Legendary Weekly Challenges'
        ],
        5: [
            'Divine Insight AI Predictions',
            'Time Dilation Rewards (2x XP weekends)',
            'Transcendent Resource Library'
        ],
        6: [
            'Reality Manipulation (Custom UI Themes)',
            'Eternal Knowledge Base Access',
            'Deity-level Challenge Creation'
        ],
        7: [
            'Cosmic Pattern Recognition',
            'Time Lord Analytics (Future Predictions)',
            'Eternal Wisdom Vault Access'
        ],
        8: [
            'Universe Creation Tools',
            'All Seeing Analytics Dashboard',
            'Omniscient Guidance System'
        ],
        9: [
            'Reality Bending Capabilities',
            'Omnipotent Resource Generator',
            'Beyond Mortal Challenges'
        ],
        10: [
            'Transcendental Existence Unlocked',
            'Complete System Mastery',
            'Boundless Creation Tools'
        ]
    };
    
    // Add features to the unlocked list
    const features = levelFeatures[level] || [];
    features.forEach(feature => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check-circle"></i> ${feature}`;
        unlockedList.appendChild(li);
    });
    
    // Create the glowing particles for background effect
    createBackgroundParticles(modal);
    
    // Show the modal with animation
    modal.style.display = 'block';
    
    // Add a dramatic screen flash
    const flash = document.createElement('div');
    flash.className = 'screen-flash';
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'rgba(61, 133, 198, 0.3)';
    flash.style.zIndex = '999';
    flash.style.pointerEvents = 'none';
    flash.style.animation = 'screenFlash 0.5s ease-out forwards';
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        document.body.removeChild(flash);
    }, 500);
    
    // Set up continue button
    continueBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    }, { once: true });
    
    // Also close on X click
    modal.querySelector('.close').addEventListener('click', () => {
        modal.style.display = 'none';
    }, { once: true });
}

function createBackgroundParticles(modal) {
    const container = modal.querySelector('.level-up-celebration');
    
    // Clear existing particles
    const existingParticles = container.querySelectorAll('.bg-particle');
    existingParticles.forEach(p => p.remove());
    
    // Add new particles
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'bg-particle';
        
        // Random position, size and animation duration
        const size = Math.random() * 10 + 5;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const duration = Math.random() * 10 + 10;
        const delay = Math.random() * 5;
        
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.borderRadius = '50%';
        particle.style.backgroundColor = 'rgba(61, 133, 198, 0.2)';
        particle.style.boxShadow = '0 0 10px rgba(61, 133, 198, 0.5)';
        particle.style.top = `${posY}%`;
        particle.style.left = `${posX}%`;
        particle.style.animation = `floatParticle ${duration}s linear infinite ${delay}s`;
        
        container.appendChild(particle);
    }
}

function createParticles(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Randomize particle properties
        const size = Math.random() * 8 + 4;
        const angle = Math.random() * 360;
        const distance = Math.random() * 100 + 50;
        const duration = Math.random() * 1 + 0.5;
        
        // Set styles
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.background = getRandomColor();
        particle.style.boxShadow = `0 0 ${size}px ${particle.style.background}`;
        
        // Set animation
        particle.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
        particle.style.animation = `particle ${duration}s ease-out forwards`;
        
        document.body.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }
}

function getRandomColor() {
    const colors = ['#3d85c6', '#56b6c4', '#2ecc71', '#f1c40f', '#e74c3c'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function playSound(type) {
    // Create the audio context if it doesn't exist
    if (!window.audioContext) {
        try {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported.');
            return;
        }
    }
    
    // Sound configurations
    const sounds = {
        'level-up': { frequency: 440, duration: 0.1, type: 'sine', sequence: [4, 5, 6] },
        'achievement': { frequency: 330, duration: 0.1, type: 'sine', sequence: [1, 3, 5] }
    };
    
    const sound = sounds[type];
    if (!sound) return;
    
    // Play sequence
    sound.sequence.forEach((note, index) => {
        setTimeout(() => {
            const oscillator = window.audioContext.createOscillator();
            const gainNode = window.audioContext.createGain();
            
            oscillator.type = sound.type;
            oscillator.frequency.value = sound.frequency * Math.pow(1.06, note);
            gainNode.gain.value = 0.1;
            
            oscillator.connect(gainNode);
            gainNode.connect(window.audioContext.destination);
            
            oscillator.start();
            
            // Fade out
            gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioContext.currentTime + sound.duration);
            
            // Stop after duration
            setTimeout(() => {
                oscillator.stop();
            }, sound.duration * 1000);
        }, index * 150);
    });
}

function updateUI() {
    // Update level badge
    document.querySelector('.level-badge').textContent = `Level ${userState.level}`;
    
    // Update level card
    const currentLevel = LEVELS[userState.level];
    document.querySelector('.level-number').textContent = userState.level;
    document.querySelector('.level-title').textContent = currentLevel.name;
    
    // Update XP progress
    const nextLevel = LEVELS[userState.level + 1];
    const xpProgress = nextLevel ? 
        ((userState.xp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100 : 100;
    document.querySelector('.xp-progress').style.width = `${xpProgress}%`;
    
    // Update XP display
    document.querySelector('.current-xp').textContent = userState.xp;
    document.querySelector('.next-level-xp').textContent = nextLevel ? nextLevel.xp : '∞';
    
    // Update next milestone
    const nextMilestone = currentLevel.milestones.find(m => m.xp > userState.xp);
    if (nextMilestone) {
        document.querySelector('.milestone-info p').textContent = 
            `${nextMilestone.name} (${nextMilestone.xp} XP)`;
    } else {
        document.querySelector('.milestone-info p').textContent = 'Max Level Reached!';
    }
    
    // Update achievements
    renderAchievements();
}

// Achievement Management
function checkAchievements() {
    // Check The Unyielding
    Object.entries(userState.taskFailures).forEach(([taskId, failures]) => {
        if (failures >= 5 && !userState.achievements.the_unyielding) {
            unlockAchievement('the_unyielding');
        }
    });
    
    // Check Night Walker
    if (userState.lastTaskTime) {
        const hour = new Date(userState.lastTaskTime).getHours();
        if ((hour >= 2 && hour < 4) && !userState.achievements.night_walker) {
            unlockAchievement('night_walker');
        }
    }
    
    // Check Shadow Training
    if (userState.unclaimedTasks >= 10 && !userState.achievements.shadow_training) {
        unlockAchievement('shadow_training');
    }
}

function unlockAchievement(achievementId) {
    const achievement = ACHIEVEMENTS[achievementId];
    userState.achievements[achievementId] = true;
    
    // Add rewards
    userState.xp += achievement.reward.xp;
    userState.coins += achievement.reward.coins;
    
    // Show achievement modal
    showAchievementModal(achievement);
    
    // Save state
    localStorage.setItem('userState', JSON.stringify(userState));
    
    // Update UI
    updateUI();
    checkAchievements();
}

function showAchievementModal(achievement) {
    const modal = document.getElementById('achievementModal');
    const title = modal.querySelector('.achievement-title');
    const description = modal.querySelector('.achievement-description');
    const rewardList = modal.querySelector('.reward-list');
    
    title.textContent = achievement.name;
    description.textContent = achievement.description;
    rewardList.innerHTML = `
        <li><i class="fas fa-coins"></i> ${achievement.reward.coins} Coins</li>
        <li><i class="fas fa-star"></i> ${achievement.reward.xp} XP</li>
    `;
    
    // Play sound effect
    playSound('achievement');
    
    // Add glow effect to the body
    document.body.classList.add('achievement-glow');
    
    // Show the modal with animation
    modal.style.display = 'block';
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
    
    // Remove glow after modal is closed
    modal.querySelector('.close').addEventListener('click', () => {
        document.body.classList.remove('achievement-glow');
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }, { once: true });
}

function renderAchievements() {
    const grid = document.querySelector('.achievements-grid');
    grid.innerHTML = '';
    
    Object.entries(ACHIEVEMENTS).forEach(([id, achievement]) => {
        const unlocked = userState.achievements[id];
        const element = document.createElement('div');
        element.className = `achievement-item ${unlocked ? '' : 'locked'}`;
        
        element.innerHTML = `
            <i class="${achievement.icon} achievement-icon"></i>
            <div class="achievement-name">${achievement.name}</div>
            ${unlocked ? '' : '<div class="achievement-progress"><div class="achievement-progress-bar" style="width: 0%"></div></div>'}
        `;
        
        grid.appendChild(element);
    });
}

// Task Management
function completeTask(taskId, difficulty = 'normal') {
    userState.lastTaskTime = new Date().toISOString();
    
    // Add XP based on difficulty
    const xpReward = {
        easy: 10,
        normal: 25,
        hard: 50,
        impossible: 100
    }[difficulty] || 25;
    
    userState.xp += xpReward;
    
    // Check for achievements
    if (difficulty === 'impossible' && !userState.achievements.beyond_limits) {
        unlockAchievement('beyond_limits');
    }
    
    // Update state and UI
    localStorage.setItem('userState', JSON.stringify(userState));
    updateLevel();
    updateUI();
    checkAchievements();
}

function failTask(taskId) {
    userState.taskFailures[taskId] = (userState.taskFailures[taskId] || 0) + 1;
    localStorage.setItem('userState', JSON.stringify(userState));
    checkAchievements();
}

// Initialize
updateUI();
checkAchievements();

// Add event listeners for task completion
document.querySelectorAll('.task-list input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            completeTask(checkbox.id);
            
            // Show floating XP gain
            showFloatingXP(checkbox, 25);
        }
    });
});

function showFloatingXP(element, amount) {
    const rect = element.getBoundingClientRect();
    const xpElement = document.createElement('div');
    xpElement.className = 'floating-xp';
    xpElement.textContent = `+${amount} XP`;
    xpElement.style.position = 'fixed';
    xpElement.style.left = `${rect.right + 10}px`;
    xpElement.style.top = `${rect.top}px`;
    xpElement.style.color = '#56b6c4';
    xpElement.style.fontWeight = 'bold';
    xpElement.style.textShadow = '0 0 5px rgba(86, 182, 196, 0.5)';
    xpElement.style.zIndex = '1000';
    xpElement.style.pointerEvents = 'none';
    xpElement.style.animation = 'floatUp 1.5s forwards';
    
    document.body.appendChild(xpElement);
    
    setTimeout(() => {
        document.body.removeChild(xpElement);
    }, 1500);
}

// Add floating XP animation
const floatingXPStyle = document.createElement('style');
floatingXPStyle.textContent = `
    @keyframes floatUp {
        0% { opacity: 0; transform: translateY(0); }
        10% { opacity: 1; }
        100% { opacity: 0; transform: translateY(-30px); }
    }
`;
document.head.appendChild(floatingXPStyle);

// Create a burst effect animation when a goal is completed
function createSuccessBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create burst container
    const burstContainer = document.createElement('div');
    burstContainer.className = 'burst-container';
    burstContainer.style.position = 'fixed';
    burstContainer.style.left = `${centerX}px`;
    burstContainer.style.top = `${centerY}px`;
    burstContainer.style.width = '0';
    burstContainer.style.height = '0';
    burstContainer.style.zIndex = '1000';
    burstContainer.style.pointerEvents = 'none';
    
    document.body.appendChild(burstContainer);
    
    // Create burst rays
    const rayCount = 12;
    for (let i = 0; i < rayCount; i++) {
        const ray = document.createElement('div');
        ray.className = 'burst-ray';
        
        const angle = (i / rayCount) * 360;
        const length = Math.random() * 50 + 100;
        
        ray.style.position = 'absolute';
        ray.style.width = '2px';
        ray.style.height = `${length}px`;
        ray.style.backgroundColor = '#f1c40f';
        ray.style.boxShadow = '0 0 10px rgba(241, 196, 15, 0.8)';
        ray.style.transformOrigin = 'bottom center';
        ray.style.transform = `rotate(${angle}deg) translateY(-${length / 2}px)`;
        ray.style.opacity = '0';
        ray.style.animation = `rayBurst 0.6s ease-out forwards ${i * 0.02}s`;
        
        burstContainer.appendChild(ray);
    }
    
    // Create particles
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'burst-particle';
        
        const size = Math.random() * 6 + 2;
        const angle = Math.random() * 360;
        const distance = Math.random() * 200 + 50;
        const duration = Math.random() * 1 + 0.5;
        const delay = Math.random() * 0.2;
        
        particle.style.position = 'absolute';
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.backgroundColor = '#f1c40f';
        particle.style.borderRadius = '50%';
        particle.style.boxShadow = '0 0 5px rgba(241, 196, 15, 0.8)';
        particle.style.transform = 'scale(0)';
        particle.style.animation = `particleBurst ${duration}s ease-out forwards ${delay}s`;
        particle.style.opacity = '0';
        
        // Set end position based on angle and distance
        particle.style.setProperty('--end-x', `${Math.cos(angle * Math.PI / 180) * distance}px`);
        particle.style.setProperty('--end-y', `${Math.sin(angle * Math.PI / 180) * distance}px`);
        
        burstContainer.appendChild(particle);
    }
    
    // Remove the burst container after animation completes
    setTimeout(() => {
        document.body.removeChild(burstContainer);
    }, 2000);
}

// Display a floating message
function showFloatingMessage(element, message, color, isLarge = false) {
    const rect = element.getBoundingClientRect();
    const messageElement = document.createElement('div');
    messageElement.className = 'floating-message';
    messageElement.textContent = message;
    messageElement.style.position = 'fixed';
    messageElement.style.left = `${rect.left + rect.width / 2}px`;
    messageElement.style.top = `${rect.top - 20}px`;
    messageElement.style.transform = 'translate(-50%, 0)';
    messageElement.style.color = color;
    messageElement.style.fontWeight = 'bold';
    messageElement.style.fontSize = isLarge ? '24px' : '16px';
    messageElement.style.textShadow = `0 0 10px ${color}`;
    messageElement.style.zIndex = '2000';
    messageElement.style.pointerEvents = 'none';
    messageElement.style.animation = 'floatUpAndFade 1.5s forwards';
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        document.body.removeChild(messageElement);
    }, 1500);
}

// Add burst animation styles
const burstStyles = document.createElement('style');
burstStyles.textContent = `
    @keyframes rayBurst {
        0% { opacity: 1; transform: rotate(var(--angle)) translateY(0); }
        100% { opacity: 0; transform: rotate(var(--angle)) translateY(-100px); }
    }
    
    @keyframes particleBurst {
        0% { opacity: 1; transform: scale(1) translate(0, 0); }
        100% { opacity: 0; transform: scale(0) translate(var(--end-x), var(--end-y)); }
    }
    
    @keyframes floatUpAndFade {
        0% { opacity: 0; transform: translate(-50%, 10px); }
        10% { opacity: 1; transform: translate(-50%, 0); }
        70% { opacity: 1; }
        100% { opacity: 0; transform: translate(-50%, -30px); }
    }
    
    .goal-completed {
        animation: goalCompletedPulse 1s;
    }
    
    @keyframes goalCompletedPulse {
        0% { box-shadow: 0 0 0 rgba(241, 196, 15, 0); }
        50% { box-shadow: 0 0 30px rgba(241, 196, 15, 0.8); }
        100% { box-shadow: 0 0 0 rgba(241, 196, 15, 0); }
    }
`;
document.head.appendChild(burstStyles);

// Add styles for the level up modal effects
const levelUpStyles = document.createElement('style');
levelUpStyles.textContent = `
    @keyframes screenFlash {
        0% { opacity: 1; }
        100% { opacity: 0; }
    }
    
    @keyframes floatParticle {
        0% { 
            transform: translateY(0) translateX(0); 
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% { 
            transform: translateY(-100px) translateX(20px); 
            opacity: 0;
        }
    }
    
    .bg-particle {
        pointer-events: none;
        z-index: 0;
    }
    
    .level-up-celebration {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(levelUpStyles); 