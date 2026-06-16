const NUM_CARDS = 5;
const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;

let cards1 = [];
let cards2 = [];
let shuffledDeck1 = [];
let shuffledDeck2 = [];
let discardPile1 = [];
let discardPile2 = [];
let draggedCard = null;
let offset = { x: 0, y: 0 };

const deck1 = document.getElementById('deck1');
const deck2 = document.getElementById('deck2');
const discard1 = document.getElementById('discard1');
const discard2 = document.getElementById('discard2');
const playArea = document.getElementById('playArea');

// Initialisera korten för båda lekarna
function initCards() {
    for (let i = 1; i <= NUM_CARDS; i++) {
        cards1.push(i);
        cards2.push(i);
    }
    shuffleDeck1Func();
    shuffleDeck2Func();
}

// Blanda lek 1
function shuffleDeck1Func() {
    shuffledDeck1 = [...cards1].sort(() => Math.random() - 0.5);
}

// Blanda lek 2
function shuffleDeck2Func() {
    shuffledDeck2 = [...cards2].sort(() => Math.random() - 0.5);
}

// Dra ett kort från lek 1
function drawCard1() {
    if (shuffledDeck1.length === 0) {
        // Frågör om man vill blanda om från discardhögen
        if (confirm('Leken är tom! Vill du blanda om discardkorten och dra igen?')) {
            // Blanda om discardhögen och lägg tillbaka i main deck
            if (discardPile1.length > 0) {
                cards1 = [...discardPile1];
                discardPile1 = [];
                clearDiscardDisplay(discard1);
                shuffleDeck1Func();
            } else {
                alert('Det finns inga kort i discardhögen!');
                return;
            }
        } else {
            return;
        }
    }
    
    const cardNumber = shuffledDeck1.pop();
    const cardElement = createCardElement(cardNumber, 'card1');
    playArea.appendChild(cardElement);
    
    // Slumpmässig position nära högen
    const x = Math.random() * 200 + 50;
    const y = Math.random() * 200;
    cardElement.style.left = x + 'px';
    cardElement.style.top = y + 'px';
}

// Dra ett kort från lek 2
function drawCard2() {
    if (shuffledDeck2.length === 0) {
        // Frågör om man vill blanda om från discardhögen
        if (confirm('Leken är tom! Vill du blanda om discardkorten och dra igen?')) {
            // Blanda om discardhögen och lägg tillbaka i main deck
            if (discardPile2.length > 0) {
                cards2 = [...discardPile2];
                discardPile2 = [];
                clearDiscardDisplay(discard2);
                shuffleDeck2Func();
            } else {
                alert('Det finns inga kort i discardhögen!');
                return;
            }
        } else {
            return;
        }
    }
    
    const cardNumber = shuffledDeck2.pop();
    const cardElement = createCardElement(cardNumber, 'card2');
    playArea.appendChild(cardElement);
    
    // Slumpmässig position nära högen
    const x = Math.random() * 200 + (playArea.offsetWidth - 200 - 150);
    const y = Math.random() * 200;
    cardElement.style.left = x + 'px';
    cardElement.style.top = y + 'px';
}

// Skapa kort-element
function createCardElement(cardNumber, deck) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.card = cardNumber;
    card.dataset.deck = deck;
    card.dataset.drawn = 'true'; // Markera att kortet är redan dragit
    
    const img = document.createElement('img');
    img.src = `${deck}/card${cardNumber}.png`;
    img.alt = `${deck} Card ${cardNumber}`;
    
    card.appendChild(img);
    
    // Desktop drag & drop
    card.addEventListener('mousedown', startDrag);
    
    // Touch drag & drop
    card.addEventListener('touchstart', startTouchDrag, false);
    
    // Dubbelklick för att lägga till i discard
    card.addEventListener('dblclick', () => addToDiscard(card));
    
    return card;
}

// Lägg kort i discardhögen
function addToDiscard(cardElement) {
    const deck = cardElement.dataset.deck;
    const cardNum = parseInt(cardElement.dataset.card);
    
    if (deck === 'card1') {
        discardPile1.push(cardNum);
        updateDiscardDisplay(discard1, 'card1');
    } else if (deck === 'card2') {
        discardPile2.push(cardNum);
        updateDiscardDisplay(discard2, 'card2');
    }
    
    cardElement.remove();
}

// Uppdatera discardhögen visuellt
function updateDiscardDisplay(discardElement, deck) {
    clearDiscardDisplay(discardElement);
    
    const discardPile = (deck === 'card1') ? discardPile1 : discardPile2;
    
    if (discardPile.length > 0) {
        const topCard = discardPile[discardPile.length - 1];
        const card = document.createElement('div');
        card.className = 'card';
        card.style.position = 'static';
        
        const img = document.createElement('img');
        img.src = `${deck}/card${topCard}.png`;
        img.alt = `Discard Card`;
        
        card.appendChild(img);
        discardElement.appendChild(card);
    }
}

// Rensa discardhögen visuellt
function clearDiscardDisplay(discardElement) {
    const card = discardElement.querySelector('.card');
    if (card) {
        card.remove();
    }
}

// Desktop drag - start
function startDrag(e) {
    if (e.button !== 0) return; // Only left mouse button
    
    // Bara tillåt dragging av kort från spelplanen, inte från högen
    if (!this.dataset.drawn) return;
    
    draggedCard = this;
    const rect = this.getBoundingClientRect();
    const playAreaRect = playArea.getBoundingClientRect();
    
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
    
    document.addEventListener('mousemove', moveDrag);
    document.addEventListener('mouseup', endDrag);
    
    e.preventDefault();
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
    // Bara tillåt dragging av kort från spelplanen, inte från högen
    if (!this.dataset.drawn) return;
    
    draggedCard = this;
    const rect = this.getBoundingClientRect();
    const playAreaRect = playArea.getBoundingClientRect();
    
    offset.x = e.touches[0].clientX - rect.left;
    offset.y = e.touches[0].clientY - rect.top;
    
    document.addEventListener('touchmove', moveTouchDrag, false);
    document.addEventListener('touchend', endTouchDrag);
    
    e.preventDefault();
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
    
    e.preventDefault();
}

// Touch drag - end
function endTouchDrag() {
    draggedCard = null;
    document.removeEventListener('touchmove', moveTouchDrag);
    document.removeEventListener('touchend', endTouchDrag);
}

// Event listeners
deck1.addEventListener('click', drawCard1);
deck2.addEventListener('click', drawCard2);

// Starta spelet
initCards();