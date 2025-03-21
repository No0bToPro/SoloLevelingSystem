document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data if not exists
    initializeUserData();

    // Update UI with user data
    updateUserInterface();

    // Handle category filters in sidebar
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            categoryItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            // Filter resources
            filterResources('category', this.getAttribute('data-category'));
        });
    });

    // Handle skill level filters
    const skillLevelItems = document.querySelectorAll('.skill-level-item');
    skillLevelItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle active class
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                filterResources('level', 'all');
            } else {
                skillLevelItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                filterResources('level', this.getAttribute('data-level'));
            }
        });
    });

    // Handle resource type filters
    const resourceTypeItems = document.querySelectorAll('.resource-type-item');
    resourceTypeItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle active class
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                filterResources('type', 'all');
            } else {
                resourceTypeItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                filterResources('type', this.getAttribute('data-type'));
            }
        });
    });

    // Handle filter buttons at the top
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Filter resources
            filterResources('category', this.getAttribute('data-category'));
            
            // Also update the category sidebar selection
            categoryItems.forEach(item => {
                if (item.getAttribute('data-category') === this.getAttribute('data-category')) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            });
        });
    });

    // Handle search functionality
    const searchInput = document.getElementById('resourceSearch');
    const searchButton = document.querySelector('.search-btn');
    
    searchButton.addEventListener('click', function() {
        searchResources(searchInput.value);
    });
    
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            searchResources(this.value);
        }
    });

    // Handle resource cards click to open modal
    const resourceCards = document.querySelectorAll('.resource-card, .featured-resource');
    const exploreBtn = document.querySelector('.explore-btn');
    const modal = document.getElementById('resourceModal');
    const closeModalBtn = modal.querySelector('.close');
    
    resourceCards.forEach(card => {
        card.addEventListener('click', function() {
            openResourceModal(this);
        });
    });
    
    exploreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        openResourceModal(document.querySelector('.featured-resource'));
    });
    
    closeModalBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Handle community resource view buttons
    const viewResourceBtns = document.querySelectorAll('.view-resource-btn');
    viewResourceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const resourceCard = this.closest('.community-resource-card');
            const resourceTitle = resourceCard.querySelector('h4').textContent;
            const resourceDescription = resourceCard.querySelector('p').textContent;
            
            // Open a simplified modal for community resources
            openCommunityResourceModal(resourceTitle, resourceDescription);
        });
    });

    // Handle AI coach input
    const aiCoachInput = document.getElementById('aiCoachInput');
    const askAiBtn = document.querySelector('.ask-ai-btn');
    
    askAiBtn.addEventListener('click', function() {
        handleAiCoachQuery(aiCoachInput.value);
    });
    
    aiCoachInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            handleAiCoachQuery(this.value);
        }
    });

    // Handle sample questions click
    const sampleQuestions = document.querySelectorAll('.sample-questions li');
    sampleQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const questionText = this.textContent;
            aiCoachInput.value = questionText;
            handleAiCoachQuery(questionText);
        });
    });

    // Resource actions in modal
    const startResourceBtn = document.querySelector('.start-resource-btn');
    const saveResourceBtn = document.querySelector('.save-resource-btn');
    
    startResourceBtn.addEventListener('click', function() {
        const resourceTitle = document.querySelector('.resource-detail-info h2').textContent;
        startResource(resourceTitle);
    });
    
    saveResourceBtn.addEventListener('click', function() {
        const resourceTitle = document.querySelector('.resource-detail-info h2').textContent;
        saveResource(resourceTitle);
    });
});

// Function to initialize user data
function initializeUserData() {
    if (!localStorage.getItem('userData')) {
        const initialUserData = {
            level: 1,
            xp: 0,
            coins: 0,
            savedResources: [],
            inProgressResources: [],
            completedResources: []
        };
        localStorage.setItem('userData', JSON.stringify(initialUserData));
    }
}

// Function to update user interface
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

// Function to filter resources
function filterResources(filterType, value) {
    const resourceCards = document.querySelectorAll('.resource-card');
    
    resourceCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        const cardLevel = card.getAttribute('data-level');
        const cardType = card.getAttribute('data-type');
        
        // Show all cards if value is 'all'
        if (value === 'all') {
            card.style.display = 'flex';
            return;
        }
        
        // Otherwise, filter based on filter type
        switch (filterType) {
            case 'category':
                if (cardCategory === value) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                break;
            case 'level':
                if (cardLevel === value) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                break;
            case 'type':
                if (cardType === value) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
                break;
        }
    });
    
    // Also check if featured resource should be displayed
    const featuredResource = document.querySelector('.featured-resource');
    if (filterType === 'category' && value !== 'all' && value !== 'meditation') {
        featuredResource.style.display = 'none';
    } else {
        featuredResource.style.display = 'flex';
    }
}

// Function to search resources
function searchResources(query) {
    if (!query) {
        // If query is empty, show all resources
        filterResources('category', 'all');
        return;
    }
    
    query = query.toLowerCase();
    const resourceCards = document.querySelectorAll('.resource-card');
    const featuredResource = document.querySelector('.featured-resource');
    
    // Check if featured resource matches query
    const featuredTitle = featuredResource.querySelector('h3').textContent.toLowerCase();
    const featuredDesc = featuredResource.querySelector('p').textContent.toLowerCase();
    
    if (featuredTitle.includes(query) || featuredDesc.includes(query)) {
        featuredResource.style.display = 'flex';
    } else {
        featuredResource.style.display = 'none';
    }
    
    // Check each resource card
    resourceCards.forEach(card => {
        const cardTitle = card.querySelector('h3').textContent.toLowerCase();
        const cardDesc = card.querySelector('p').textContent.toLowerCase();
        
        if (cardTitle.includes(query) || cardDesc.includes(query)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Function to open resource modal
function openResourceModal(resourceElement) {
    const modal = document.getElementById('resourceModal');
    const modalTitle = modal.querySelector('.resource-detail-info h2');
    const modalDesc = modal.querySelector('.resource-detail-content p:first-of-type');
    const modalImage = modal.querySelector('.resource-detail-image img');
    
    let title, description, imageSrc;
    
    if (resourceElement.classList.contains('featured-resource')) {
        title = resourceElement.querySelector('h3').textContent;
        description = resourceElement.querySelector('p').textContent;
        imageSrc = resourceElement.querySelector('img').src;
    } else {
        title = resourceElement.querySelector('h3').textContent;
        description = resourceElement.querySelector('p').textContent;
        imageSrc = resourceElement.querySelector('img').src;
    }
    
    modalTitle.textContent = title;
    modalDesc.textContent = description;
    modalImage.src = imageSrc;
    
    // Add Solo Leveling style animation when opening the modal
    modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Glow effect when modal opens
    setTimeout(() => {
        modal.querySelector('.resource-detail').classList.add('glow-effect');
        setTimeout(() => {
            modal.querySelector('.resource-detail').classList.remove('glow-effect');
        }, 1000);
    }, 100);
}

// Function to open community resource modal
function openCommunityResourceModal(title, description) {
    const modal = document.getElementById('resourceModal');
    const modalTitle = modal.querySelector('.resource-detail-info h2');
    const modalDesc = modal.querySelector('.resource-detail-content p:first-of-type');
    
    modalTitle.textContent = title;
    modalDesc.textContent = description;
    
    // Use a default image for community resources
    const modalImage = modal.querySelector('.resource-detail-image img');
    modalImage.src = "https://images.unsplash.com/photo-1456513080666-bbe673c8de8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80";
    
    // Update stats for community resources
    modal.querySelector('.stat:nth-child(1) span').textContent = "Community Resource";
    modal.querySelector('.stat:nth-child(2) span').textContent = "User Recommended";
    
    // Display the modal
    modal.style.display = 'block';
}

// Function to handle AI coach queries
function handleAiCoachQuery(query) {
    if (!query) return;
    
    // Simple mapping of keywords to resources
    const keywordMap = {
        'programming': 'JavaScript Fundamentals',
        'javascript': 'JavaScript Fundamentals',
        'coding': 'JavaScript Fundamentals',
        'web': 'JavaScript Fundamentals',
        'workout': '30-Minute HIIT Workout',
        'fitness': '30-Minute HIIT Workout',
        'exercise': '30-Minute HIIT Workout',
        'hiit': '30-Minute HIIT Workout',
        'meditation': 'Complete Guide to Mindfulness Meditation',
        'mindfulness': 'Complete Guide to Mindfulness Meditation',
        'stress': 'Guided Meditation for Beginners',
        'relax': 'Guided Meditation for Beginners',
        'productivity': 'The 5 Pillars of Productivity',
        'time management': 'The 5 Pillars of Productivity',
        'ai': 'Deep Learning for AI Enthusiasts',
        'deep learning': 'Deep Learning for AI Enthusiasts',
        'strength': 'Advanced Strength Training Program'
    };
    
    // Normalize query
    query = query.toLowerCase();
    
    // Find matching resources
    let matchingResources = [];
    for (const keyword in keywordMap) {
        if (query.includes(keyword)) {
            matchingResources.push(keywordMap[keyword]);
        }
    }
    
    // If no direct matches, try to provide a general recommendation
    if (matchingResources.length === 0) {
        // Check for general categories
        if (query.includes('learn') || query.includes('study') || query.includes('skill')) {
            matchingResources.push('JavaScript Fundamentals', 'Deep Learning for AI Enthusiasts');
        } else if (query.includes('health') || query.includes('body')) {
            matchingResources.push('30-Minute HIIT Workout', 'Advanced Strength Training Program');
        } else if (query.includes('mind') || query.includes('calm') || query.includes('focus')) {
            matchingResources.push('Complete Guide to Mindfulness Meditation', 'Guided Meditation for Beginners');
        } else {
            // Default recommendation
            matchingResources.push('Complete Guide to Mindfulness Meditation', 'The 5 Pillars of Productivity');
        }
    }
    
    // Find resource cards with matching titles
    const resourceCards = Array.from(document.querySelectorAll('.resource-card, .featured-resource'));
    let foundCard = null;
    
    for (const resourceTitle of matchingResources) {
        foundCard = resourceCards.find(card => 
            card.querySelector('h3').textContent === resourceTitle
        );
        
        if (foundCard) break;
    }
    
    // If a matching resource was found, open its modal
    if (foundCard) {
        openResourceModal(foundCard);
        
        // Add a highlight effect to the matching card
        foundCard.classList.add('ai-highlighted');
        setTimeout(() => {
            foundCard.classList.remove('ai-highlighted');
        }, 3000);
        
        // Scroll to the resource
        foundCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
        // If no matching resource was found, show the featured resource
        openResourceModal(document.querySelector('.featured-resource'));
    }
    
    // Clear the input
    document.getElementById('aiCoachInput').value = '';
}

// Function to start a resource
function startResource(resourceTitle) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Check if resource is already in progress
    if (!userData.inProgressResources.includes(resourceTitle)) {
        userData.inProgressResources.push(resourceTitle);
        
        // Save updated user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Close the modal
        document.getElementById('resourceModal').style.display = 'none';
        
        // Show a notification
        showNotification('Resource started! You\'ve earned 5 XP.');
        
        // Award XP for starting a resource
        awardXP(5);
    } else {
        // Resource already in progress
        showNotification('You\'re already working on this resource!');
    }
}

// Function to save a resource for later
function saveResource(resourceTitle) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Check if resource is already saved
    if (!userData.savedResources.includes(resourceTitle)) {
        userData.savedResources.push(resourceTitle);
        
        // Save updated user data
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Close the modal
        document.getElementById('resourceModal').style.display = 'none';
        
        // Show a notification
        showNotification('Resource saved for later!');
    } else {
        // Resource already saved
        showNotification('This resource is already saved!');
    }
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

// Function to award XP
function awardXP(amount) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Add XP
    userData.xp += amount;
    
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
        
        // Create particles
        createParticles(levelUpElement);
        
        // Play sound
        playSound('levelUp');
    }, 100);
    
    // Remove after animation
    setTimeout(() => {
        levelUpElement.classList.remove('show');
        setTimeout(() => {
            levelUpElement.remove();
        }, 500);
    }, 4000);
}

// Function to create particles
function createParticles(element) {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    element.appendChild(particleContainer);
    
    // Create multiple particles
    for (let i = 0; i < 30; i++) {
        createParticle(particleContainer);
    }
}

// Function to create a single particle
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 10 + 5;
    const color = getRandomColor();
    const angle = Math.random() * 360;
    const distance = Math.random() * 100 + 50;
    const duration = Math.random() * 2 + 1;
    const delay = Math.random() * 0.5;
    
    // Set styles
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.backgroundColor = color;
    particle.style.boxShadow = `0 0 10px ${color}`;
    particle.style.transform = `rotate(${angle}deg) translateY(-${distance}px)`;
    particle.style.opacity = '0';
    particle.style.animation = `particle-fade ${duration}s ease-out ${delay}s`;
    
    // Add to container
    container.appendChild(particle);
    
    // Remove after animation
    setTimeout(() => {
        particle.remove();
    }, (duration + delay) * 1000);
}

// Function to get a random color
function getRandomColor() {
    const colors = [
        '#8a2be2', // BlueViolet
        '#ff1493', // DeepPink
        '#00ced1', // DarkTurquoise
        '#32cd32', // LimeGreen
        '#ff8c00', // DarkOrange
        '#1e90ff'  // DodgerBlue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Function to play a sound
function playSound(type) {
    // In a real implementation, you would play actual sound files
    console.log(`Playing ${type} sound`);
}

// Add CSS for notifications and level up animations
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
        box-shadow: 0 0 15px rgba(var(--accent-rgb), 0.5);
        transform: translateX(120%);
        transition: transform 0.3s ease;
        border-left: 3px solid var(--accent-color);
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
        box-shadow: 0 0 30px var(--accent-color);
        animation: pulse 2s infinite;
    }
    
    .level-up-icon {
        font-size: 40px;
        color: var(--accent-color);
        margin-bottom: 20px;
    }
    
    .level-up-text h3 {
        font-size: 32px;
        margin-bottom: 10px;
        color: var(--accent-color);
    }
    
    .level-up-text p {
        font-size: 20px;
        color: white;
    }
    
    .particle-container {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
    }
    
    .particle {
        position: absolute;
        top: 0;
        left: 0;
        border-radius: 50%;
        pointer-events: none;
    }
    
    @keyframes particle-fade {
        0% {
            opacity: 1;
            transform: scale(0) rotate(0deg) translateY(0);
        }
        100% {
            opacity: 0;
            transform: scale(1) rotate(360deg) translateY(-100px);
        }
    }
    
    @keyframes pulse {
        0% { box-shadow: 0 0 30px var(--accent-color); }
        50% { box-shadow: 0 0 50px var(--accent-color); }
        100% { box-shadow: 0 0 30px var(--accent-color); }
    }
    
    .ai-highlighted {
        animation: highlight-pulse 1.5s ease-in-out;
    }
    
    @keyframes highlight-pulse {
        0% { box-shadow: 0 0 0 rgba(var(--accent-rgb), 0); }
        50% { box-shadow: 0 0 30px rgba(var(--accent-rgb), 0.8); }
        100% { box-shadow: 0 0 0 rgba(var(--accent-rgb), 0); }
    }
`;

document.head.appendChild(style); 