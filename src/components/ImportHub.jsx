import { useState } from 'react';
import { PdfUploader } from './PdfUploader';
import { useAiGenerator } from '../hooks/useAiGenerator';
import { hasQAPairFormat } from '../utils/parseQAPairs';
import { CategoryPicker, getActiveCategory } from './CategoryPicker';

export function ImportHub({
  onDocFile,
  docLoading,
  docError,
  onCsvFile,
  csvLoading,
  csvError,
  onAiGenerate,
  onTextParse,
  existingCategories = [],
  settings,
  bare = false,
}) {
  const [aiText, setAiText] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const { isLoading: aiLoading, error: aiError, progress: aiProgress, generateFromText, setError } = useAiGenerator();

  const activeCategory = getActiveCategory(category, customCategory);
  const hasStructuredFormat = hasQAPairFormat(aiText);
  const hasText = aiText.trim().length > 0;
  const hasCategory = activeCategory.length > 0;
  const canExtract = hasStructuredFormat && hasText && hasCategory;
  const canUseAi = !hasStructuredFormat && hasText && hasCategory && settings.geminiApiKey;

  async function handleTextImport() {
    const text = aiText.trim();
    if (!text || !activeCategory) return;

    if (hasQAPairFormat(text)) {
      const ok = onTextParse?.(text, activeCategory);
      if (!ok) setError('Nenhum par "Pergunta: / Resposta:" encontrado no texto.');
      return;
    }

    if (!settings.geminiApiKey?.trim()) {
      setError('Configure sua chave da API Gemini em Config, ou use o formato Pergunta:/Resposta:.');
      return;
    }

    const cards = await generateFromText(text, settings.geminiApiKey);
    if (cards.length > 0) onAiGenerate(cards, activeCategory);
  }

  const sectionClass = bare
    ? 'p-4 rounded-2xl border border-slate-200 dark:border-slate-600'
    : 'bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6';

  const isBusy = aiLoading || docLoading;

  let buttonLabel = '✨ Gerar com IA';
  if (aiLoading) buttonLabel = aiProgress ?? 'Gerando...';
  else if (canExtract || (hasStructuredFormat && hasText)) buttonLabel = '📋 Extrair todas as perguntas';

  const inputClass = 'w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white resize-y text-sm min-h-[120px]';

  return (
    <div className="space-y-4">
      <PdfUploader onFile={onDocFile} isLoading={docLoading} error={docError} bare={bare} />

      <div className={sectionClass}>
        {!bare && <h2 className="text-lg font-bold mb-3 text-indigo-700 dark:text-indigo-300">📊 CSV / Excel</h2>}
        <label className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-5 text-center cursor-pointer hover:border-indigo-300 block">
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => onCsvFile(e.target.files[0])} />
          <p className="text-2xl mb-1">📈</p>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">CSV ou Excel</p>
          <p className="text-xs text-slate-400 mt-1">Pergunta, Resposta, Categoria</p>
        </label>
        {csvLoading && <p className="text-xs text-slate-400 mt-2">Lendo...</p>}
        {csvError && <p className="text-xs text-red-500 mt-2">⚠️ {csvError}</p>}
      </div>

      <div className={sectionClass}>
        <h2 className="text-lg font-bold mb-1 text-indigo-700 dark:text-indigo-300">📝 Colar texto</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          {hasStructuredFormat
            ? 'Formato Pergunta:/Resposta: detectado — extração instantânea de todos os cards.'
            : 'Cole material de estudo livre para a IA gerar cards (requer chave Gemini em Config).'}
        </p>

        <textarea
          value={aiText}
          onChange={(e) => { setAiText(e.target.value); setError(null); }}
          placeholder="Cole aqui o conteúdo do documento..."
          rows={5}
          className={inputClass}
        />

        <div className="mt-3">
          <CategoryPicker
            existingCategories={existingCategories}
            category={category}
            customCategory={customCategory}
            onCategoryChange={setCategory}
            onCustomCategoryChange={setCustomCategory}
            label="Categoria dos cards"
            compact
          />
        </div>

        <button
          onClick={handleTextImport}
          disabled={isBusy || (!canExtract && !canUseAi)}
          className={`mt-3 w-full py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 ${
            hasStructuredFormat && hasText
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          }`}
        >
          {buttonLabel}
        </button>

        {hasText && !hasCategory && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Escolha uma categoria antes de importar.
          </p>
        )}
        {!hasStructuredFormat && !settings.geminiApiKey && hasText && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            Para texto livre, configure a chave Gemini em Config. Ou use Importar DOCX acima.
          </p>
        )}
        {aiError && <p className="text-xs text-red-500 mt-2">⚠️ {aiError}</p>}
      </div>
    </div>
  );
}
