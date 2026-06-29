import { useState } from 'react';
import { suggestCategory } from '../utils/categorySuggest';

function normalizeCard(raw, index, fallbackCategory) {
  const question = String(
    raw.question ?? raw.pergunta ?? raw.q ?? ''
  ).trim();
  const answer = String(
    raw.answer ?? raw.resposta ?? raw.a ?? ''
  ).trim();
  const category = String(
    raw.category ?? raw.categoria ?? fallbackCategory ?? ''
  ).trim() || suggestCategory(question + ' ' + answer);

  if (!question || !answer) return null;

  return {
    id: `json-${Date.now()}-${index}`,
    question,
    answer,
    category,
    selected: true,
  };
}

export function parseCardsFromJson(text, fallbackCategory = '') {
  const parsed = JSON.parse(text);
  let items = [];

  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (Array.isArray(parsed.cards)) {
    items = parsed.cards;
  } else if (parsed.deck?.cards && Array.isArray(parsed.deck.cards)) {
    items = parsed.deck.cards;
  } else {
    throw new Error('Formato não reconhecido. Use um array de cards ou { "cards": [...] }.');
  }

  const cards = items
    .map((item, i) => normalizeCard(item, i, fallbackCategory))
    .filter(Boolean);

  if (cards.length === 0) {
    throw new Error('Nenhum card válido encontrado. Cada item precisa de pergunta e resposta.');
  }

  return cards;
}

export function useJsonImporter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function processFile(file) {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const cards = parseCardsFromJson(text);
      setCandidates(cards);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message ?? 'Erro ao ler o JSON. Verifique o formato do arquivo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleCandidate(id) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)));
  }

  function updateAnswer(id, answer) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, answer } : c)));
  }

  function updateQuestion(id, question) {
    setCandidates((prev) => prev.map((c) => (c.id === id ? { ...c, question } : c)));
  }

  function selectAll() {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: true })));
  }

  function deselectAll() {
    setCandidates((prev) => prev.map((c) => ({ ...c, selected: false })));
  }

  function closeModal() {
    setIsModalOpen(false);
    setCandidates([]);
    setError(null);
  }

  return {
    isLoading,
    error,
    candidates,
    isModalOpen,
    processFile,
    toggleCandidate,
    updateAnswer,
    updateQuestion,
    selectAll,
    deselectAll,
    closeModal,
  };
}
