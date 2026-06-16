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
            // Kombinera båda discard-högar
            let allDiscardCards = [...discardPile1, ...discardPile2];
            if (allDiscardCards.length > 0) {
                cards1 = allDiscardCards;
                discardPile1 = [];
                discardPile2 = [];
                clearDiscardDisplay(discard1);
                clearDiscardDisplay(discard2);
                shuffleDeck1Func();
            } else {
                alert('Det finns inga kort i discardhögarna!');
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
            // Kombinera båda discard-högar
            let allDiscardCards = [...discardPile1, ...discardPile2];
            if (allDiscardCards.length > 0) {
                cards2 = allDiscardCards;
                discardPile1 = [];
                discardPile2 = [];
                clearDiscardDisplay(discard1);
                clearDiscardDisplay(discard2);
                shuffleDeck2Func();
            } else {
                alert('Det finns inga kort i discardhögarna!');
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
    
    return card;
}

// Uppdatera discardhögen visuellt
function updateDiscardDisplay(discardElement, deck) {
    clearDiscardDisplay(discardElement);
    
    let topCard = null;
    if (discardPile1.length > 0 || discardPile2.length > 0) {
        // Visa översta kort från vilken höga som helst
        if (discardPile1.length > 0 && discardPile2.length > 0) {
            topCard = discardPile1[discardPile1.length - 1];
            deck = 'card1';
        } else if (discardPile1.length > 0) {
            topCard = discardPile1[discardPile1.length - 1];
            deck = 'card1';
        } else {
            topCard = discardPile2[discardPile2.length - 1];
            deck = 'card2';
        }
    }
    
    if (topCard) {
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

// Visa modal med alla kort i discard-högarna
function showDiscardModal() {
    const allCards = [...discardPile1, ...discardPile2];
    
    if (allCards.length === 0) {
        alert('Discardhögarna är tomma!');
        return;
    }
    
    // Skapa modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        border-radius: 10px;
        padding: 20px;
        max-width: 500px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Kort i Discardhögarna';
    title.style.marginBottom = '20px';
    content.appendChild(title);
    
    const list = document.createElement('div');
    list.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
        gap: 10px;
    `;
    
    // Lägg till varje kort som en liten thumbnail
    allCards.forEach((cardNum, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.style.cssText = `
            border: 2px solid #ddd;
            border-radius: 5px;
            overflow: hidden;
            background: white;
        `;
        
        const img = document.createElement('img');
        img.style.cssText = `
            width: 100%;
            height: auto;
            display: block;
        `;
        
        // Försök att avgöra vilken deck kortet kommer från (enkel heuristic)
        let deck = (index < discardPile1.length) ? 'card1' : 'card2';
        
        img.src = `${deck}/card${cardNum}.png`;
        img.alt = `Card ${cardNum}`;
        
        cardDiv.appendChild(img);
        list.appendChild(cardDiv);
    });
    
    content.appendChild(list);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Stäng';
    closeBtn.style.cssText = `
        margin-top: 20px;
        padding: 10px 20px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1em;
    `;
    closeBtn.addEventListener('click', () => modal.remove());
    content.appendChild(closeBtn);
    
    modal.appendChild(content);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
}

// Kontrollera om punkt är inom discard-högen
function isOverDiscardPile(x, y, discardElement) {
    const rect = discardElement.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
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
    
    draggedCard.style.opacity = '0.8';
    draggedCard.style.zIndex = '1001';
    
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
    
    // Tillåt att kortet dras utanför play area för discard-högen
    draggedCard.style.left = x + 'px';
    draggedCard.style.top = y + 'px';
}

// Desktop drag - end
function endDrag(e) {
    if (!draggedCard) return;
    
    const deck = draggedCard.dataset.deck;
    const cardNum = parseInt(draggedCard.dataset.card);
    
    // Kontrollera vilken discard-höga kort dras över
    let droppedInDiscard = false;
    
    if (isOverDiscardPile(e.clientX, e.clientY, discard1)) {
        discardPile1.push(cardNum);
        updateDiscardDisplay(discard1);
        updateDiscardDisplay(discard2);
        droppedInDiscard = true;
    } else if (isOverDiscardPile(e.clientX, e.clientY, discard2)) {
        discardPile2.push(cardNum);
        updateDiscardDisplay(discard1);
        updateDiscardDisplay(discard2);
        droppedInDiscard = true;
    }
    
    if (droppedInDiscard) {
        draggedCard.remove();
    } else {
        // Begränsa inom play area om inte över discard
        const playAreaRect = playArea.getBoundingClientRect();
        let x = parseFloat(draggedCard.style.left);
        let y = parseFloat(draggedCard.style.top);
        
        x = Math.max(0, Math.min(x, playAreaRect.width - CARD_WIDTH));
        y = Math.max(0, Math.min(y, playAreaRect.height - CARD_HEIGHT));
        
        draggedCard.style.left = x + 'px';
        draggedCard.style.top = y + 'px';
    }
    
    draggedCard.style.opacity = '1';
    draggedCard.style.zIndex = '1';
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
    
    draggedCard.style.opacity = '0.8';
    draggedCard.style.zIndex = '1001';
    
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
    
    draggedCard.style.left = x + 'px';
    draggedCard.style.top = y + 'px';
    
    e.preventDefault();
}

// Touch drag - end
function endTouchDrag(e) {
    if (!draggedCard) return;
    
    const deck = draggedCard.dataset.deck;
    const cardNum = parseInt(draggedCard.dataset.card);
    const touch = e.changedTouches[0];
    
    // Kontrollera vilken discard-höga kort dras över
    let droppedInDiscard = false;
    
    if (isOverDiscardPile(touch.clientX, touch.clientY, discard1)) {
        discardPile1.push(cardNum);
        updateDiscardDisplay(discard1);
        updateDiscardDisplay(discard2);
        droppedInDiscard = true;
    } else if (isOverDiscardPile(touch.clientX, touch.clientY, discard2)) {
        discardPile2.push(cardNum);
        updateDiscardDisplay(discard1);
        updateDiscardDisplay(discard2);
        droppedInDiscard = true;
    }
    
    if (droppedInDiscard) {
        draggedCard.remove();
    } else {
        // Begränsa inom play area om inte över discard
        const playAreaRect = playArea.getBoundingClientRect();
        let x = parseFloat(draggedCard.style.left);
        let y = parseFloat(draggedCard.style.top);
        
        x = Math.max(0, Math.min(x, playAreaRect.width - CARD_WIDTH));
        y = Math.max(0, Math.min(y, playAreaRect.height - CARD_HEIGHT));
        
        draggedCard.style.left = x + 'px';
        draggedCard.style.top = y + 'px';
    }
    
    draggedCard.style.opacity = '1';
    draggedCard.style.zIndex = '1';
    draggedCard = null;
    
    document.removeEventListener('touchmove', moveTouchDrag);
    document.removeEventListener('touchend', endTouchDrag);
}

// Event listeners
deck1.addEventListener('click', drawCard1);
deck2.addEventListener('click', drawCard2);
discard1.addEventListener('click', showDiscardModal);
discard2.addEventListener('click', showDiscardModal);

// Starta spelet
initCards();