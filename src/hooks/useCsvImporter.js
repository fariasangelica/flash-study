import { useState } from 'react';
import * as XLSX from 'xlsx';
import { suggestCategory } from '../utils/categorySuggest';

function parseRows(rows) {
  const pairs = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;
    const [q, a, cat] = row.map((c) => String(c ?? '').trim());
    if (!q || !a) continue;
    if (i === 0 && /pergunta|question/i.test(q)) continue;
    pairs.push({
      id: `csv-${Date.now()}-${i}`,
      question: q,
      answer: a,
      category: cat || suggestCategory(q + ' ' + a),
      selected: true,
    });
  }
  return pairs;
}

export function useCsvImporter() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function processFile(file) {
    setIsLoading(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      let rows = [];

      if (file.name.endsWith('.csv')) {
        const text = new TextDecoder().decode(buffer);
        rows = text.split('\n').map((line) => line.split(/[,;]/).map((c) => c.replace(/^"|"$/g, '').trim()));
      } else {
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      }

      const pairs = parseRows(rows);
      if (pairs.length === 0) {
        setError('Nenhum par pergunta/resposta encontrado. Use colunas: Pergunta, Resposta, Categoria (opcional).');
        return;
      }
      setCandidates(pairs);
      setIsModalOpen(true);
    } catch (err) {
      setError('Erro ao ler arquivo. Verifique o formato CSV ou Excel.');
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
  function selectAll() { setCandidates((prev) => prev.map((c) => ({ ...c, selected: true }))); }
  function deselectAll() { setCandidates((prev) => prev.map((c) => ({ ...c, selected: false }))); }
  function closeModal() { setIsModalOpen(false); setCandidates([]); setError(null); }

  return { isLoading, error, candidates, isModalOpen, processFile, toggleCandidate, updateAnswer, updateQuestion, selectAll, deselectAll, closeModal };
}
