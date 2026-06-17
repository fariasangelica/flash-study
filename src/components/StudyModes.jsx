export function StudyModes({ onStartReview, onStartErrors, onStartExam, counts, studyMode, onStop }) {
  const modes = [
    { id: 'review', label: 'Revisão SM-2', icon: '🔁', count: counts.due, action: onStartReview, color: 'bg-indigo-500' },
    { id: 'errors', label: 'Só erros', icon: '❌', count: counts.errors, action: onStartErrors, color: 'bg-red-500' },
    { id: 'exam', label: 'Modo prova', icon: '📝', count: counts.total, action: onStartExam, color: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-indigo-700 dark:text-indigo-300">🎯 Modos de estudo</h3>
        {studyMode && (
          <button onClick={onStop} className="text-xs text-red-500 font-semibold hover:underline">
            Sair do modo
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={m.action}
            disabled={m.count === 0 && m.id !== 'exam'}
            className={`${m.color} hover:opacity-90 disabled:opacity-30 text-white rounded-2xl p-4 text-center transition-all`}
          >
            <p className="text-2xl">{m.icon}</p>
            <p className="text-xs font-bold mt-2 leading-tight">{m.label}</p>
            <p className="text-[10px] opacity-80 mt-1">{m.count} cards</p>
          </button>
        ))}
      </div>
    </div>
  );
}
