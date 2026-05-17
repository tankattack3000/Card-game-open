const NUM_CARDS = 5;
const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;

let cards = [];
let shuffledDeck = [];
let draggedCard = null;
let offset = { x: 0, y: 0 };

const deck = document.getElementById('deck');
const playArea = document.getElementById('playArea');

// Initialisera korten
function initCards() {
    for (let i = 1; i <= NUM_CARDS; i++) {
        cards.push(i);
    }
    shuffleDeck();
}

// Blanda korten
function shuffleDeck() {
    shuffledDeck = [...cards].sort(() => Math.random() - 0.5);
}

// Dra ett kort från högen
function drawCard() {
    if (shuffledDeck.length === 0) {
        shuffleDeck();
    }
    
    const cardNumber = shuffledDeck.pop();
    const cardElement = createCardElement(cardNumber);
    playArea.appendChild(cardElement);
    
    // Slumpmässig position nära högen
    const x = Math.random() * 200 + 150;
    const y = Math.random() * 200;
    cardElement.style.left = x + 'px';
    cardElement.style.top = y + 'px';
}

// Skapa kort-element
function createCardElement(cardNumber) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.card = cardNumber;
    
    const img = document.createElement('img');
    img.src = `card1/card${cardNumber}.png`;
    img.alt = `Card ${cardNumber}`;
    
    card.appendChild(img);
    
    // Desktop drag & drop
    card.addEventListener('mousedown', startDrag);
    
    // Touch drag & drop
    card.addEventListener('touchstart', startTouchDrag);
    
    return card;
}

// Desktop drag - start
function startDrag(e) {
    if (e.button !== 0) return; // Only left mouse button
    
    draggedCard = this;
    const rect = this.getBoundingClientRect();
    const playAreaRect = playArea.getBoundingClientRect();
    
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
}

// Desktop drag - move
function moveDrag(e) {
    if (!draggedCard) return;
    
    const playAreaRect = playArea.getBoundingClientRect();
    let x = e.clientX - playAreaRect.left - offset.x;
    let y = e.clientY - playAreaRect.top - offset.y;
    
    // Begränsa inom play area
    x = Math.max(0, Math.min(x, playAreaRect.width - CARD_WIDTH));
    y = Math.max(0, Math.min(y, playAreaRect.height - CARD_HEIGHT));
    
    draggedCard.style.left = x + 'px';
    draggedCard.style.top = y + 'px';
}

// Desktop drag - end
function endDrag() {
    draggedCard = null;
    document.removeEventListener('mousemove', moveDrag);
    document.removeEventListener('mouseup', endDrag);
}

// Touch drag - start
function startTouchDrag(e) {
    draggedCard = this;
    const rect = this.getBoundingClientRect();
    const playAreaRect = playArea.getBoundingClientRect();
    
    offset.x = e.touches[0].clientX - rect.left;
    offset.y = e.touches[0].clientY - rect.top;
    
    document.addEventListener('touchmove', moveTouchDrag);
    document.addEventListener('touchend', endTouchDrag);
}

// Touch drag - move
function moveTouchDrag(e) {
    if (!draggedCard) return;
    
    const playAreaRect = playArea.getBoundingClientRect();
    let x = e.touches[0].clientX - playAreaRect.left - offset.x;
    let y = e.touches[0].clientY - playAreaRect.top - offset.y;
    
    // Begränsa inom play area
    x = Math.max(0, Math.min(x, playAreaRect.width - CARD_WIDTH));
    y = Math.max(0, Math.min(y, playAreaRect.height - CARD_HEIGHT));
    
    draggedCard.style.left = x + 'px';
    draggedCard.style.top = y + 'px';
}

// Touch drag - end
function endTouchDrag() {
    draggedCard = null;
    document.removeEventListener('touchmove', moveTouchDrag);
    document.removeEventListener('touchend', endTouchDrag);
}

// Event listeners
deck.addEventListener('click', drawCard);

// Starta spelet
initCards();