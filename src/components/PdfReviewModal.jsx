import { useEffect, useState } from 'react';
import { CategoryPicker, getActiveCategory } from './CategoryPicker';

export function PdfReviewModal({
  candidates,
  onToggle,
  onUpdateAnswer,
  onUpdateQuestion,
  onSelectAll,
  onDeselectAll,
  onConfirm,
  onClose,
  existingCategories,
  defaultCategory = '',
}) {
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');

  const activeCategory = getActiveCategory(category, customCategory);
  const selectedCount = candidates.filter((c) => c.selected).length;
  const canConfirm = selectedCount > 0 && activeCategory.length > 0;

  useEffect(() => {
    if (!defaultCategory) return;
    const known = existingCategories.filter((c) => c !== 'Todos');
    if (known.includes(defaultCategory)) {
      setCategory(defaultCategory);
      setCustomCategory('');
    } else {
      setCategory('__custom__');
      setCustomCategory(defaultCategory);
    }
  }, [defaultCategory, existingCategories]);

  function handleConfirm() {
    if (!canConfirm) return;
    onConfirm(activeCategory.trim());
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-2xl font-bold text-indigo-700">
              📄 Perguntas detectadas
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-slate-500">
            {candidates.length} candidatas encontradas · {selectedCount} selecionadas
          </p>
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mt-2">
            💡 Pergunta e resposta foram extraídas automaticamente. Revise, desmarque o que não quiser e escolha a categoria.
          </p>
        </div>

        <div className="p-6 border-b border-slate-100">
          <CategoryPicker
            existingCategories={existingCategories}
            category={category}
            customCategory={customCategory}
            onCategoryChange={setCategory}
            onCustomCategoryChange={setCustomCategory}
            label="Categoria para os cards importados"
          />
        </div>

        <div className="px-6 py-3 border-b border-slate-100 flex gap-3">
          <button
            onClick={onSelectAll}
            className="text-sm text-indigo-600 hover:underline font-medium"
          >
            Selecionar todas
          </button>
          <span className="text-slate-300">|</span>
          <button
            onClick={onDeselectAll}
            className="text-sm text-slate-500 hover:underline font-medium"
          >
            Desmarcar todas
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`rounded-2xl border p-4 transition-colors ${
                candidate.selected
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={candidate.selected}
                  onChange={() => onToggle(candidate.id)}
                  className="mt-1 w-4 h-4 accent-indigo-600 cursor-pointer flex-shrink-0"
                />

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Pergunta
                      </label>
                      {candidate.type === 'definition' && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">definição</span>
                      )}
                      {candidate.type === 'list' && (
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">lista</span>
                      )}
                      {candidate.type === 'explicit' && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">explícita</span>
                      )}
                    </div>
                    <textarea
                      value={candidate.question}
                      onChange={(e) => onUpdateQuestion(candidate.id, e.target.value)}
                      rows={2}
                      className="w-full p-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-white"
                    />

                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Resposta
                      </label>
                      <textarea
                        value={candidate.answer}
                        onChange={(e) => onUpdateAnswer(candidate.id, e.target.value)}
                        placeholder="Escreva a resposta..."
                        rows={Math.min(10, Math.max(2, (candidate.answer.match(/\n/g) || []).length + 2))}
                        className="w-full mt-1 p-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                      />
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-2xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ➕ Adicionar {selectedCount > 0 ? `${selectedCount} card${selectedCount > 1 ? 's' : ''}` : 'cards'}
          </button>
        </div>
      </div>
    </div>
  );
}
