// Stöd för två separata lekar och korrekt överföring av hela kortobjektet
const NUM_CARDS = 5;
const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;

const playArea = document.getElementById('playArea');
const deck1El = document.getElementById('deck1');
const deck2El = document.getElementById('deck2');
const discard1El = document.getElementById('discard1');
const discard2El = document.getElementById('discard2');

let draggedCard = null;
let offset = { x: 0, y: 0 };
let lastPointer = { x: 0, y: 0 };

// Definiera två decks — bilder väntas ligga i card1/ respektive card2/
const DECKS = {
  deck1: { name: 'card1', cards: [] },
  deck2: { name: 'card2', cards: [] }
};

function initCards() {
  // Fyll varje deck med kortobjekt
  Object.keys(DECKS).forEach((deckKey) => {
    const deck = DECKS[deckKey];
    deck.cards = [];
    for (let i = 1; i <= NUM_CARDS; i++) {
      deck.cards.push({
        id: `${deckKey}-${i}`,          // unikt id per kort
        number: i,                      // kortnummer inom leken
        src: `${deck.name}/card${i}.png`,
        deck: deckKey
      });
    }
    shuffleDeck(deckKey);
  });
}

function shuffleDeck(deckKey) {
  const d = DECKS[deckKey];
  d.cards = d.cards.sort(() => Math.random() - 0.5);
}

// Dra ett kort från angiven deck (deck1 eller deck2)
function drawCard(deckKey) {
  const d = DECKS[deckKey];
  if (!d || d.cards.length === 0) {
    // Om slut, skapa om och blanda
    initCards();
  }
  const cardData = d.cards.pop();
  const cardEl = createCardElement(cardData);
  playArea.appendChild(cardEl);

  const x = Math.random() * 200 + 150;
  const y = Math.random() * 200;
  cardEl.style.left = x + 'px';
  cardEl.style.top = y + 'px';
}

// Skapa DOM-element för ett kort — använd full bildväg från cardData.src
function createCardElement(cardData) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.width = CARD_WIDTH + 'px';
  card.style.height = CARD_HEIGHT + 'px';
  // Sätt dataset så hela metadata följer med
  card.dataset.cardId = cardData.id;
  card.dataset.cardNumber = cardData.number;
  card.dataset.cardSrc = cardData.src;
  card.dataset.originDeck = cardData.deck;

  const img = document.createElement('img');
  img.src = cardData.src;
  img.alt = `Card ${cardData.number} (${cardData.deck})`;
  card.appendChild(img);

  // Drag & Drop events
  card.addEventListener('mousedown', startDrag);
  card.addEventListener('touchstart', startTouchDrag, {passive:false});

  return card;
}

// --- Drag logik ---
function startDrag(e) {
  if (e.button !== undefined && e.button !== 0) return;
  draggedCard = this;
  const rect = this.getBoundingClientRect();
  const playRect = playArea.getBoundingClientRect();

  offset.x = (e.clientX || (e.touches && e.touches[0].clientX)) - rect.left;
  offset.y = (e.clientY || (e.touches && e.touches[0].clientY)) - rect.top;

  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup', endDrag);
}

function moveDrag(e) {
  if (!draggedCard) return;
  const playRect = playArea.getBoundingClientRect();
  const clientX = e.clientX;
  const clientY = e.clientY;

  lastPointer.x = clientX;
  lastPointer.y = clientY;

  let x = clientX - playRect.left - offset.x;
  let y = clientY - playRect.top - offset.y;

  x = Math.max(0, Math.min(x, playRect.width - CARD_WIDTH));
  y = Math.max(0, Math.min(y, playRect.height - CARD_HEIGHT));

  draggedCard.style.left = x + 'px';
  draggedCard.style.top = y + 'px';
}

function endDrag(e) {
  if (!draggedCard) return;

  // Avgör drop-target baserat på senaste pointer-position
  const elementAt = document.elementFromPoint(lastPointer.x, lastPointer.y);
  const discardEl = elementAt && (elementAt.closest('#discard1') || elementAt.closest('#discard2'));

  if (discardEl) {
    // Flytta kortet direkt in i discard (behåll data och bild)
    discardEl.appendChild(draggedCard);
    // Reset position så det ligger snyggt inne i discard
    draggedCard.style.position = 'relative';
    draggedCard.style.left = '';
    draggedCard.style.top = '';
  } else {
    // Om inte discard, låt det ligga i playArea (behåll absoluta positioner)
    // Se till att elementet finns i playArea
    if (draggedCard.parentElement !== playArea) {
      playArea.appendChild(draggedCard);
    }
    draggedCard.style.position = 'absolute';
  }

  draggedCard = null;
  document.removeEventListener('mousemove', moveDrag);
  document.removeEventListener('mouseup', endDrag);
}

// Touch-hantering
function startTouchDrag(e) {
  e.preventDefault();
  draggedCard = this;
  const rect = this.getBoundingClientRect();
  const clientX = e.touches[0].clientX;
  const clientY = e.touches[0].clientY;

  offset.x = clientX - rect.left;
  offset.y = clientY - rect.top;

  lastPointer.x = clientX;
  lastPointer.y = clientY;

  document.addEventListener('touchmove', moveTouchDrag, {passive:false});
  document.addEventListener('touchend', endTouchDrag);
}

function moveTouchDrag(e) {
  if (!draggedCard) return;
  const playRect = playArea.getBoundingClientRect();
  const clientX = e.touches[0].clientX;
  const clientY = e.touches[0].clientY;

  lastPointer.x = clientX;
  lastPointer.y = clientY;

  let x = clientX - playRect.left - offset.x;
  let y = clientY - playRect.top - offset.y;

  x = Math.max(0, Math.min(x, playRect.width - CARD_WIDTH));
  y = Math.max(0, Math.min(y, playRect.height - CARD_HEIGHT));

  // säkerställ absolut position när i playArea
  draggedCard.style.position = 'absolute';
  draggedCard.style.left = x + 'px';
  draggedCard.style.top = y + 'px';
}

function endTouchDrag(e) {
  if (!draggedCard) return;
  const elementAt = document.elementFromPoint(lastPointer.x, lastPointer.y);
  const discardEl = elementAt && (elementAt.closest('#discard1') || elementAt.closest('#discard2'));

  if (discardEl) {
    discardEl.appendChild(draggedCard);
    draggedCard.style.position = 'relative';
    draggedCard.style.left = '';
    draggedCard.style.top = '';
  } else {
    if (draggedCard.parentElement !== playArea) {
      playArea.appendChild(draggedCard);
    }
    draggedCard.style.position = 'absolute';
  }

  draggedCard = null;
  document.removeEventListener('touchmove', moveTouchDrag);
  document.removeEventListener('touchend', endTouchDrag);
}

// Koppla knappar/högar
deck1El.addEventListener('click', () => drawCard('deck1'));
deck2El.addEventListener('click', () => drawCard('deck2'));

// Starta
initCards();
