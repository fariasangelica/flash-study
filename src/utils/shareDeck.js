export function encodeDeckForUrl(cards, deckName = 'Meu Deck') {
  const payload = { name: deckName, cards: cards.map(({ question, answer, category }) => ({ question, answer, category })) };
  const json = JSON.stringify(payload);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return `${window.location.origin}${window.location.pathname}?deck=${b64}`;
}

export function decodeDeckFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const deck = params.get('deck');
  if (!deck) return null;
  try {
    const json = decodeURIComponent(escape(atob(deck)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function savePublicDeck(name, cards) {
  const id = `deck_${Date.now()}`;
  const decks = JSON.parse(localStorage.getItem('flashstudy_public_decks') || '{}');
  decks[id] = { id, name, cards, createdAt: new Date().toISOString() };
  localStorage.setItem('flashstudy_public_decks', JSON.stringify(decks));
  return id;
}

export function loadPublicDecks() {
  try {
    return Object.values(JSON.parse(localStorage.getItem('flashstudy_public_decks') || '{}'));
  } catch {
    return [];
  }
}
