import { useState } from 'react';
import { encodeDeckForUrl, savePublicDeck, loadPublicDecks } from '../utils/shareDeck';

export function ShareDeck({ cards, onImportDeck, bare = false }) {
  const [shareUrl, setShareUrl] = useState('');
  const [deckName, setDeckName] = useState('Meu Deck');
  const [publicDecks, setPublicDecks] = useState(loadPublicDecks());

  function handleShare() {
    const url = encodeDeckForUrl(cards, deckName);
    setShareUrl(url);
    navigator.clipboard?.writeText(url);
  }

  function handlePublish() {
    savePublicDeck(deckName, cards);
    setPublicDecks(loadPublicDecks());
    alert('Deck publicado na biblioteca local da equipe!');
  }

  const wrapperClass = bare ? 'space-y-3' : 'bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 space-y-4';

  return (
    <div className={wrapperClass}>
      {!bare && <h3 className="font-bold text-indigo-700 dark:text-indigo-300">🔗 Colaboração</h3>}

      <input
        value={deckName} onChange={(e) => setDeckName(e.target.value)}
        placeholder="Nome do deck"
        className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
      />

      <div className="flex gap-2">
        <button onClick={handleShare} disabled={cards.length === 0} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-40">
          📋 Copiar link
        </button>
        <button onClick={handlePublish} disabled={cards.length === 0} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold disabled:opacity-40">
          🌐 Publicar deck
        </button>
      </div>

      {shareUrl && (
        <p className="text-xs text-slate-400 break-all bg-slate-50 dark:bg-slate-700 p-2 rounded-lg">{shareUrl}</p>
      )}

      {publicDecks.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">Decks da equipe (local)</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {publicDecks.map((d) => (
              <button
                key={d.id}
                onClick={() => onImportDeck(d.cards, d.name)}
                className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-sm"
              >
                <span className="font-bold text-slate-700 dark:text-slate-200">{d.name}</span>
                <span className="text-slate-400 ml-2">({d.cards.length} cards)</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
