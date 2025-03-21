document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data if not exists
    initializeUserData();

    // Update UI with user data
    updateUserInterface();
    
    // Force potions tab to be active initially
    forceActiveTab('potions');

    // Ensure the correct category is visible on page load
    ensureActiveCategoryVisible();

    // Handle shop category selection
    const shopCategories = document.querySelectorAll('.shop-category');
    const categoryItems = document.querySelectorAll('.shop-category-items');
    
    shopCategories.forEach(category => {
        category.addEventListener('click', function() {
            // Remove active class from all categories
            shopCategories.forEach(cat => cat.classList.remove('active'));
            // Add active class to clicked category
            this.classList.add('active');
            
            // Hide all category items
            categoryItems.forEach(item => item.classList.remove('active'));
            
            // Show the selected category items
            const selectedCategory = this.getAttribute('data-category');
            document.getElementById(`${selectedCategory}-items`).classList.add('active');
        });
    });

    // Handle buy buttons
    const buyButtons = document.querySelectorAll('.shop-buy-btn');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.getAttribute('data-item');
            const itemPrice = parseInt(this.parentElement.querySelector('.price-amount').textContent);
            const itemLevel = parseInt(this.closest('.shop-item').querySelector('.shop-item-level').textContent.replace('Required Level: ', ''));
            
            purchaseItem(itemName, itemPrice, itemLevel);
        });
    });

    // Handle modal close buttons
    const closeButtons = document.querySelectorAll('.modal .close, .continue-btn');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Prevent layout shift on window resize
    window.addEventListener('resize', function() {
        maintainShopLayout();
    });

    // Initial layout adjustment
    adjustLayout();
    
    // Listen for window resize events
    window.addEventListener('resize', adjustLayout);
});

// Function to force a specific tab to be active
function forceActiveTab(tabName) {
    const shopCategories = document.querySelectorAll('.shop-category');
    const categoryItems = document.querySelectorAll('.shop-category-items');
    
    // Remove active class from all categories
    shopCategories.forEach(cat => cat.classList.remove('active'));
    
    // Add active class to specified category
    const targetCategory = document.querySelector(`.shop-category[data-category="${tabName}"]`);
    if (targetCategory) {
        targetCategory.classList.add('active');
    }
    
    // Hide all category items
    categoryItems.forEach(item => item.classList.remove('active'));
    
    // Show the specified category items
    const targetItems = document.getElementById(`${tabName}-items`);
    if (targetItems) {
        targetItems.classList.add('active');
    }
}

// Function to ensure the correct category is visible
function ensureActiveCategoryVisible() {
    const activeCategory = document.querySelector('.shop-category.active');
    if (activeCategory) {
        const categoryId = activeCategory.getAttribute('data-category');
        const categoryItems = document.querySelectorAll('.shop-category-items');
        
        categoryItems.forEach(item => item.classList.remove('active'));
        const activeItems = document.getElementById(`${categoryId}-items`);
        if (activeItems) {
            activeItems.classList.add('active');
        }
    }
}

// Function to maintain shop layout consistency
function maintainShopLayout() {
    // Ensure categories maintain their positions
    const shopCategories = document.querySelectorAll('.shop-category');
    const shopItems = document.querySelector('.shop-items');
    
    // Make sure the active category is still visible
    ensureActiveCategoryVisible();
}

// Function to initialize user data
function initializeUserData() {
    if (!localStorage.getItem('userData')) {
        const initialUserData = {
            level: 1,
            xp: 0,
            coins: 1000, // Start with some coins for testing
            inventory: [],
            purchaseHistory: []
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
        document.querySelectorAll('.currency-amount, .currency-value').forEach(el => {
            el.textContent = userData.coins;
        });
    }
}

// Function to purchase an item
function purchaseItem(itemName, price, requiredLevel) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Check if user meets level requirement
    if (userData.level < requiredLevel) {
        showNotification(`You need to be Level ${requiredLevel} to purchase this item!`);
        return;
    }
    
    // Check if user has enough coins
    if (userData.coins < price) {
        // Show insufficient funds modal
        document.getElementById('insufficientFundsModal').style.display = 'block';
        return;
    }
    
    // Process the purchase
    userData.coins -= price;
    
    // Add item to inventory if not already owned
    if (!userData.inventory.includes(itemName)) {
        userData.inventory.push(itemName);
    }
    
    // Add to purchase history
    userData.purchaseHistory.push({
        item: itemName,
        price: price,
        date: new Date().toISOString()
    });
    
    // Save updated user data
    localStorage.setItem('userData', JSON.stringify(userData));
    
    // Update UI
    updateUserInterface();
    
    // Show purchase confirmation modal
    const modal = document.getElementById('purchaseModal');
    modal.querySelector('.purchased-item-name').textContent = itemNameToTitle(itemName);
    modal.querySelector('.purchased-item-description').textContent = getItemDescription(itemName);
    modal.style.display = 'block';
    
    // Apply any item effects
    applyItemEffects(itemName);
}

// Function to convert item ID to display title
function itemNameToTitle(itemName) {
    // Convert snake_case to Title Case
    return itemName.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Function to get item description based on item name
function getItemDescription(itemName) {
    const descriptions = {
        'coding': 'You can now access programming tasks and challenges.',
        'drawing': 'Art challenges are now available to you.',
        'writing': 'Creative writing tasks have been unlocked.',
        'fitness_mastery': 'Your fitness task XP gains are increased by 10%.',
        'meditation_guru': 'Advanced meditation techniques are now available.',
        'small_health_potion': 'Your health has been restored by 25%.',
        'medium_health_potion': 'Your health has been restored by 50%.',
        'large_health_potion': 'Your health has been fully restored!',
        'energy_elixir': 'Your fatigue penalty has been removed for 24 hours.',
        'xp_booster': 'Your XP gain is increased by 25% for the next hour.',
        'coin_magnet': 'Your coin gain is increased by 50% for the next hour.',
        'task_streak_multiplier': 'Completing 5 tasks in a row will now give double XP.',
        'training_weights': 'Your XP gain is permanently increased by 10%.',
        'scholars_tome': 'Your coin gain is permanently increased by 10%.',
        'legendary_mentor': 'You now have access to exclusive secret quests.'
    };
    
    return descriptions[itemName] || 'Item purchased successfully!';
}

// Function to apply item effects
function applyItemEffects(itemName) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    
    // Apply different effects based on the item
    switch(itemName) {
        case 'small_health_potion':
        case 'medium_health_potion':
        case 'large_health_potion':
            // Apply health restoration (in a real app, you'd have a health system)
            showNotification('Health restored!');
            break;
            
        case 'energy_elixir':
            // Remove fatigue penalty (in a real app, you'd have a fatigue system)
            userData.fatigueRemoved = true;
            showNotification('Fatigue penalty removed!');
            break;
            
        case 'xp_booster':
            // Set XP boost expiration time (1 hour from now)
            userData.xpBoostExpiration = new Date(Date.now() + 3600000).toISOString();
            userData.xpBoostMultiplier = 1.25;
            showNotification('XP Boost active for 1 hour!');
            break;
            
        case 'coin_magnet':
            // Set coin boost expiration time (1 hour from now)
            userData.coinBoostExpiration = new Date(Date.now() + 3600000).toISOString();
            userData.coinBoostMultiplier = 1.5;
            showNotification('Coin Boost active for 1 hour!');
            break;
            
        case 'training_weights':
            // Permanent XP gain increase
            userData.permanentXpBoost = (userData.permanentXpBoost || 0) + 0.1;
            showNotification('Permanent XP gain increased by 10%!');
            break;
            
        case 'scholars_tome':
            // Permanent coin gain increase
            userData.permanentCoinBoost = (userData.permanentCoinBoost || 0) + 0.1;
            showNotification('Permanent coin gain increased by 10%!');
            break;
            
        case 'legendary_mentor':
            // Unlock secret quests
            userData.secretQuestsUnlocked = true;
            showNotification('Secret quests unlocked!');
            break;
    }
    
    // Save updated user data
    localStorage.setItem('userData', JSON.stringify(userData));
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

// Add CSS for notifications
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
`;

document.head.appendChild(style);

// Function to adjust layout and maintain consistent dimensions
function adjustLayout() {
    // Standardize shop items
    const shopItems = document.querySelectorAll('.shop-item');
    shopItems.forEach(item => {
        item.style.height = '120px';
    });
    
    // Fix shop item icon dimensions
    const shopItemIcons = document.querySelectorAll('.shop-item-icon');
    shopItemIcons.forEach(icon => {
        icon.style.width = '60px';
        icon.style.height = '60px';
    });
    
    // Ensure consistent shop item price section
    const shopItemPrices = document.querySelectorAll('.shop-item-price');
    shopItemPrices.forEach(price => {
        price.style.width = '120px';
        price.style.height = '100%';
    });
    
    // Fix buy button dimensions
    const buyButtons = document.querySelectorAll('.shop-buy-btn');
    buyButtons.forEach(button => {
        button.style.width = '60px';
        button.style.height = '30px';
    });
    
    // Adjust shop category layout based on screen size
    const shopContainer = document.querySelector('.shop-container');
    if (shopContainer) {
        if (window.innerWidth <= 768) {
            shopContainer.style.flexDirection = 'column';
            
            // Adjust sidebar for mobile
            const shopSidebar = document.querySelector('.shop-sidebar');
            if (shopSidebar) {
                shopSidebar.style.width = '100%';
                shopSidebar.style.height = 'auto';
                shopSidebar.style.marginBottom = '20px';
            }
            
            // Make shop categories horizontal on mobile
            const shopCategories = document.querySelector('.shop-categories');
            if (shopCategories) {
                shopCategories.style.display = 'flex';
                shopCategories.style.flexDirection = 'row';
                shopCategories.style.justifyContent = 'space-between';
                shopCategories.style.width = '100%';
            }
        } else {
            shopContainer.style.flexDirection = 'row';
            
            // Adjust sidebar for desktop
            const shopSidebar = document.querySelector('.shop-sidebar');
            if (shopSidebar) {
                shopSidebar.style.width = '250px';
                shopSidebar.style.height = 'auto';
                shopSidebar.style.marginBottom = '0';
            }
            
            // Make shop categories vertical on desktop
            const shopCategories = document.querySelector('.shop-categories');
            if (shopCategories) {
                shopCategories.style.display = 'flex';
                shopCategories.style.flexDirection = 'column';
                shopCategories.style.width = '100%';
            }
        }
    }
    
    // Switch to grid layout at certain screen widths for shop items
    const shopItems2 = document.querySelector('.shop-items');
    if (shopItems2) {
        if (window.innerWidth >= 1200) {
            shopItems2.style.display = 'grid';
            shopItems2.style.gridTemplateColumns = 'repeat(2, 1fr)';
            shopItems2.style.gap = '20px';
        } else {
            shopItems2.style.display = 'flex';
            shopItems2.style.flexDirection = 'column';
            shopItems2.style.gap = '15px';
        }
    }
} 