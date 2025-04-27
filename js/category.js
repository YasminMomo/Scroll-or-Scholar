// category.js - Category selection functionality

document.addEventListener("DOMContentLoaded", () => {
    const categoryCards = document.querySelectorAll('.category-card');
    const startGameBtn = document.querySelector('.category-btn .btn');
    
    // Default to the first category if none is selected
    let selectedCategory = 'breaking-news';
    
    // Add selected class to first card by default
    if (categoryCards.length > 0) {
      categoryCards[0].classList.add('selected');
    }
    
    // Handle category selection
    categoryCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        // Remove selected class from all cards
        categoryCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        card.classList.add('selected');
        
        // Set selected category based on index
        selectedCategory = index === 0 ? 'breaking-news' : 'pinoy-memes';
        
        // Store selection in session storage
        saveToSessionStorage('selectedCategory', selectedCategory);
      });
    });
    
    // Handle start game button
    if (startGameBtn) {
      startGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Store the selected category in session storage
        saveToSessionStorage('selectedCategory', selectedCategory);
        
        // Navigate to quiz page
        window.location.href = 'quiz.html';
      });
    }
  });