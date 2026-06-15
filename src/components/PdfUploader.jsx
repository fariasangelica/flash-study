import { useRef, useState } from 'react';

export function PdfUploader({ onFile, isLoading, error, bare = false }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file) {
    if (!file) return;
    if (!file.name.endsWith('.docx') && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      alert('Selecione um arquivo Word (.docx).');
      return;
    }
    onFile(file);
  }

  const wrapperClass = bare
    ? 'p-4 rounded-2xl border border-slate-200 dark:border-slate-600'
    : 'bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6';

  return (
    <div className={wrapperClass}>
      {!bare && <h2 className="text-lg font-bold mb-3 text-indigo-700 dark:text-indigo-300">📄 Importar DOCX</h2>}

      <div
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !isLoading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-300'
        } ${isLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <input ref={inputRef} type="file" accept=".docx" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        {isLoading ? (
          <>
            <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-500">Lendo...</p>
          </>
        ) : (
          <>
            <p className="text-2xl mb-1">📝</p>
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">Arraste DOCX ou clique</p>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-500">⚠️ {error}</p>}
    </div>
  );
}
