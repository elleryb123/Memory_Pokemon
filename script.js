/**
 * Memory Game - Animal Edition for Kids
 * A simple, functional card matching game using animal emojis
 */

// --- Game Configuration & Constants ---

const GAME_CONFIG = {
  // Card image paths for Paw Patrol and other characters
  CARD_IMAGES: [
    'Images/Chase.png',
    'Images/Everest.png',
    'Images/Green.png',
    'Images/Luigi.png',
    'Images/Mario Racoon.png',
    'Images/Mario.png',
    'Images/Marshall.png',
    'Images/paw patrol gang.png',
    'Images/Rocky.png',
    'Images/rubble.png',
    'Images/Ryder.png',
    'Images/Skye.png',
    'Images/spiderman-png-47353.png',
    'Images/Zuma.png',
    'Images/Paw Patrol Symbol.png'
  ],
  
  // Difficulty levels with grid sizes for mobile display
  DIFFICULTY_LEVELS: [
    { name: "Easy", gridSize: 3, cardsPerRow: 4, pairsCount: 6 },   // 12 cards (6 pairs)
    { name: "Medium", gridSize: 4, cardsPerRow: 5, pairsCount: 10 }, // 20 cards (10 pairs)  
    { name: "Hard", gridSize: 3, cardsPerRow: 4, pairsCount: 12 }    // 24 cards (12 pairs) - 6x4 grid for better phone fit
  ],

  // Timing constants for game logic
  FLIP_DURATION_MS: 600,        // How long a card stays flipped before can flip again
  MATCH_ANIMATION_DELAY_MS: 300,// Delay to show the match animation time
};

// --- Game State Variables ---

let gameState = {
  selectedCards: [],              // Cards currently clicked (max 2 at once)
  matchedPairsCount: 0,           // How many pairs have been found
  totalMatchedPairsNeeded: 6,     // For easy level default
  isLocked: false,                // Prevent clicking while animations playing
  currentLevelIndex: 0,          // Which difficulty level we're on (0=Easy)
};

// --- DOM Elements Selection ---

const gameContainer = document.getElementById('game-container');
const scoreBoard = document.getElementById('score-board');

/**
 * Initialize the entire game when page loads or resets
 */
function initGame() {
  // Reset all state variables to starting values for current difficulty level
  gameState.selectedCards = [];
  gameState.matchedPairsCount = 0;
  gameState.isLocked = false;
  
  const currentLevel = GAME_CONFIG.DIFFICULTY_LEVELS[gameState.currentLevelIndex];
  gameContainer.innerHTML = ''; // Clear container
  
  createGameUI(currentLevel);   // Build the grid layout
}

/**
 * Create the HTML elements for a single card element in our board
 */ 
function createCardElement(cardImage, pairId) {
  const divElement = document.createElement('div');
  
  // Card is hidden initially with this class: not flipped yet, showing back of card design
  divElement.classList.add(
    'memory-card',   // Add base CSS class from style.css file for layout and styles
    'hidden'         // Hide the actual image (we'll show a placeholder instead)
  );
  
  // Store which pair this belongs to and the image path
  divElement.dataset.pairId = pairId;
  divElement.dataset.image = cardImage;
  
  return divElement;
}

/**
 * Main function to build entire grid layout based on selected level configuration
 */
function createGameUI(level) {
  const currentGridConfig = GAME_CONFIG.DIFFICULTY_LEVELS[gameState.currentLevelIndex]; // Level config (grid size, cards per row etc)
  
  // Get only the number of images needed for this difficulty level
  const imagesForLevel = GAME_CONFIG.CARD_IMAGES.slice(0, currentGridConfig.pairsCount);
  gameState.totalMatchedPairsNeeded = currentGridConfig.pairsCount;
  
  let gridElement = document.createElement('div');   // Parent div for our entire card collection
  gridElement.classList.add(
    'memory-grid',      // Add base CSS class from style.css file for layout and styles
    `grid-cols-${currentGridConfig.cardsPerRow}`     // Dynamic columns based on level difficulty setting (mobile responsive!)
  ); 
  
  // Create pairs and shuffle them
  let cardPairs = [];
  imagesForLevel.forEach((image, index) => {
    cardPairs.push({ image, pairId: index });
    cardPairs.push({ image, pairId: index });
  });
  
  const shuffledPairs = shuffleArray(cardPairs);
  
  // Loop through all duplicate image entries - pair them up into individual game pieces
  for (let i = 0; i < shuffledPairs.length; i++) {
    const cardData = shuffledPairs[i];
    const cardEl = createCardElement(cardData.image, cardData.pairId);
    
    // Add a simple placeholder design to the "back" of unflipped cards so it doesn't look blank 
    cardEl.innerHTML = '<div class="card-back"></div>';  // Use innerHTML instead of textContent for this! 
    
    // Attach click event listener on each individual game piece/card (not grid container!)
    cardEl.addEventListener('click', handleCardClick);   // This callback function when user taps one
    
    // Append to the grid
    gridElement.appendChild(cardEl);         // Add card DOM node to the grid!
  }

  gameContainer.appendChild(gridElement);   // Add the entire grid to the container
  updateScoreBoard();   // Refresh score display after building initial grid layout
}


// --- Game Logic Functions - Card Selection and Match Checking ---
/**
 * Handle single click event for any one of game pieces/cards when player taps it manually
 */
function handleCardClick(event) {
  const card = event.currentTarget;      // Get the actual clicked DOM element (the div!) not inner content!
  
  if (gameState.isLocked) return;        // Ignore clicks during animation/lockout period
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return; // Don't click already flipped/matched cards
  
  gameState.selectedCards.push(card);    // Add this one to our array of selected cards
  
  flipCardVisuals(card, true);   // Flip it open visually by adding/removing CSS class
  
  // Check game state after each click
  if (gameState.selectedCards.length === 2) {       // Wait until we have exactly two cards flipped...
    gameState.isLocked = true;            // Prevent clicking more than one at a time or re-clicking same card
    checkForMatch();                      // ...then test them against our stored pairs list! 
    setTimeout(() => resetCardSelection(), 1200);  // Clear selection after delay (wait for non-match flip back)
  }
}

/**
 * Visual function to flip a card over when player clicks/taps on it during gameplay session. 
 */
function flipCardVisuals(cardElement, isFaceUp) {       // Toggle between showing front/back of each game piece/card face  
  if (isFaceUp) {                                       // Show the actual image content stored in data attribute!
    cardElement.classList.add('flipped');              // Add 'flipped' CSS class that rotates it open
    cardElement.innerHTML = `<img src="${cardElement.dataset.image}" alt="card">`;  // Show the image
  } else {                                              // Hide/flip back to show pattern design on reverse side of card element when not face up yet
    cardElement.classList.remove('flipped');           // Remove flipped class from DOM node so user can't see image underneath
    cardElement.innerHTML = '<div class="card-back"></div>'; // Show the back design
  }
}

/**
 * Visual function to flip a card back over, or hide its contents before checking for match condition met.
 */ 
function resetCardSelection() {           // Clear our array of currently selected cards so new ones can be chosen next time!  
  gameState.selectedCards = [];          // Reset selection tracking variable used elsewhere in game logic code below
  gameState.isLocked = false;            // Unlock to allow new selections
}

/**
 * Check if two flipped cards are a matching pair that have been found during gameplay session today. 
 */
function checkForMatch() {     // Use data attributes to verify these belong together as one complete matched set!  
    const firstCard = gameState.selectedCards[0];      // Get the first card in our selection array (index 0)   
    const secondCard = gameState.selectedCards[1];     // Second card in our selection array
    
    // Check if they have different pair IDs
    if (firstCard.dataset.pairId !== secondCard.dataset.pairId) { 
        // Different cards, not a match. Let user see both cards for a moment before flipping back
        setTimeout(() => {
          flipCardVisuals(firstCard, false);     // Flip first card back down
          flipCardVisuals(secondCard, false);    // Flip second card back down
        }, 1000); // Wait 1 second so user can see both cards
    } else {   
      // Match found between this specific pair of cards clicked during gameplay session today      
      gameState.matchedPairsCount++;              // Increment counter for number of pairs completed so far
      markCardsAsMatched(firstCard, secondCard);  // Mark them and keep face up!
      checkWinCondition();                        // Check if game is won
    }
} 

/**
 * Function to permanently disable clicking on two already-matched card elements that form complete pair found during playtest. 
 */  
function markCardsAsMatched(card1, card2) {       // Apply "matched" visual styling after successful matching!      
  card1.classList.add('matched');                 // CSS class name representing successfully completed match
  card2.classList.add('matched');
  card1.removeEventListener('click', handleCardClick);
  card2.removeEventListener('click', handleCardClick);
  // Cards stay face up on screen with yellow background - no removal animation
}

/**
 * Function to remove non-matching cards with fade-out animation
 */
function removeCardsWithAnimation(card1, card2) {
  // Add disappear animation class
  card1.classList.add('disappear');
  card2.classList.add('disappear');
  
  // Remove cards from DOM after animation completes (500ms)
  setTimeout(() => {
    card1.remove();
    card2.remove();
  }, 500);
} 

/**
 * Update the scoreboard display with current game progress information for player feedback purposes. 
 */  
function updateScoreBoard() {     
    const levelName = GAME_CONFIG.DIFFICULTY_LEVELS[gameState.currentLevelIndex].name;  // Get difficulty setting from config file   
    scoreBoard.textContent = `${levelName} - Pairs Found: ${gameState.matchedPairsCount} / ${gameState.totalMatchedPairsNeeded}`;
}

/**
 * Check if all card pairs have been found, then trigger win state accordingly! 
 */  
function checkWinCondition() {      // Show victory message and end game properly when complete set collected during gameplay session.      
    updateScoreBoard();              // Update score display
    if (gameState.matchedPairsCount === gameState.totalMatchedPairsNeeded) {
        gameState.isLocked = true;   // Disable clicking since we've matched everything now
        alert('Congratulations! You won!');
    }
}

// --- Utility Functions - Shuffling Arrays for Random Pair Distribution During Gameplay Testing Sessions Only! ---
/**
 * Fisher-Yates shuffle algorithm to randomize array in place (used BEFORE duplicating it into pairs!) 
 */  
function shuffleArray(array) {      // Return new shuffled copy without modifying original input reference pointer location directly anywhere inside current running instance of browser application itself at runtime.      
    for (let i = array.length - 1; i > 0; i--) {       
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
} 

// --- Event Listeners and Initialization Setup When Page First Loads Successfully Into Browser Cache Memory Area Only! ---
/**
 * Listen for keyboard shortcuts like Escape key to reset game state or restart level immediately without reloading page itself manually. 
 */  
document.addEventListener('keydown', (event) => {      
    if (event.key === 'Escape') {  // Reset all cards back down when Esc pressed anywhere on window object globally!      
        initGame();                // Rebuild entire board fresh with new shuffled arrangement of animals displayed this time around
    }
}); 

/**
 * Expose function so users can trigger restart anytime without reloading page themselves manually every single time needed. 
 */  
window.resetMemoryGame = () => {    
    initGame();                                 // Rebuild game from scratch with new shuffled cards
}; 

// --- Game Initialization on Page Load Complete Successfully After All Scripts Have Been Loaded Into Browser Memory Space Only Please Wait Until Then Before Continuing Any Further Steps Below This Line Now Thanks Very Much!

window.addEventListener('load', () => {      
    // Don't automatically start the game - wait for difficulty selection
    document.querySelector('[data-level="0"]').classList.add('active'); // Mark Easy as default visually
});

/**
 * Handle difficulty level selection - start the game
 */
document.querySelectorAll('.difficulty-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Update active button styling
    document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    // Set the difficulty level
    gameState.currentLevelIndex = parseInt(e.target.dataset.level);
    
    // Switch to game screen
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    // Start the game
    initGame();
  });
});

/**
 * Handle restart button click - go back to start screen
 */
document.getElementById('restart-btn').addEventListener('click', () => {
  document.getElementById('game-screen').classList.remove('active');
  document.getElementById('start-screen').classList.add('active');
}); 


