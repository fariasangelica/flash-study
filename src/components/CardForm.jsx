import { useState } from 'react';

export function CardForm({ onAddCard, bare = false }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');

  function handleSubmit() {
    if (!question.trim() || !answer.trim() || !category.trim()) return;
    onAddCard({ question: question.trim(), answer: answer.trim(), category: category.trim() });
    setQuestion('');
    setAnswer('');
    setCategory('');
  }

  const inputClass = 'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm';

  const inner = (
    <div className="space-y-3">
      <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pergunta" className={inputClass} />
      <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Resposta" rows={3} className={`${inputClass} resize-none`} />
      <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Categoria" className={inputClass} />
      <button onClick={handleSubmit} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
        ➕ Adicionar Card
      </button>
    </div>
  );

  if (bare) return inner;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">✨ Criar Flashcard</h2>
      {inner}
    </div>
  );
}
