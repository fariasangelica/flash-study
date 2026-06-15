import { useState } from 'react';

const SECTIONS = [
  { id: 'create', label: '✨ Criar', icon: '✨' },
  { id: 'import', label: '📥 Importar', icon: '📥' },
  { id: 'share', label: '🔗 Compartilhar', icon: '🔗' },
];

export function SidebarPanel({ createContent, importContent, shareContent }) {
  const [open, setOpen] = useState('create');

  const content = {
    create: createContent,
    import: importContent,
    share: shareContent,
  }[open];

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-3xl shadow-xl overflow-hidden">
      <div className="flex border-b border-slate-100 dark:border-slate-700">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setOpen(s.id)}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold transition-colors ${
              open === s.id
                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="p-4 sm:p-5 max-h-[70vh] lg:max-h-none overflow-y-auto">
        {content}
      </div>
    </div>
  );
}
