import { useState } from 'react';
import mammoth from 'mammoth';
import { suggestCategory } from '../utils/categorySuggest';
import { parseQAPairs } from '../utils/parseQAPairs';

// ─── Extração de texto do DOCX ────────────────────────────────────────────────

async function extractRawText(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

function pairsToCandidates(pairs) {
  const ts = Date.now();
  return pairs.map((p, i) => ({
    id: `doc-${ts}-${i}`,
    question: p.question,
    answer: p.answer,
    category: suggestCategory(p.question + ' ' + p.answer),
    selected: true,
  }));
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePdfExtractor() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function openCandidatesFromText(rawText) {
    const pairs = parseQAPairs(rawText);

    if (pairs.length === 0) {
      setError(
        'Nenhum par "Pergunta: / Resposta:" encontrado. ' +
        'Verifique se o arquivo usa exatamente esse formato.'
      );
      return false;
    }

    setCandidates(pairsToCandidates(pairs));
    setIsModalOpen(true);
    return true;
  }

  function processText(rawText) {
    setError(null);
    return openCandidatesFromText(rawText);
  }

  async function processPdf(file) {
    setIsLoading(true);
    setError(null);

    try {
      const rawText = await extractRawText(file);
      openCandidatesFromText(rawText);
    } catch (err) {
      setError('Erro ao ler o arquivo. Verifique se é um DOCX válido.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleCandidate(id) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c))
    );
  }

  function updateAnswer(id, answer) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, answer } : c))
    );
  }

  function updateQuestion(id, question) {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, question } : c))
    );
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

  const selectedCandidates = candidates.filter((c) => c.selected);

  return {
    isLoading,
    error,
    candidates,
    selectedCandidates,
    isModalOpen,
    processPdf,
    processText,
    toggleCandidate,
    updateAnswer,
    updateQuestion,
    selectAll,
    deselectAll,
    closeModal,
  };
}
