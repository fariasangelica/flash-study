export function StudyModes({ onStartReview, onStartErrors, onStartLeeches, onStartPomodoro, onStartExam, counts, studyMode, pomodoroRemaining, onStop }) {
  const modes = [
    { id: 'review', label: 'Revisão SM-2', icon: '🔁', count: counts.due, action: onStartReview, color: 'bg-indigo-500' },
    { id: 'errors', label: 'Só erros', icon: '❌', count: counts.errors, action: onStartErrors, color: 'bg-red-500' },
    { id: 'leeches', label: 'Só leeches', icon: '🩸', count: counts.leeches, action: onStartLeeches, color: 'bg-orange-500' },
    { id: 'pomodoro', label: 'Pomodoro 25min', icon: '⏱️', count: counts.due, action: onStartPomodoro, color: 'bg-purple-500' },
    { id: 'exam', label: 'Modo prova', icon: '📝', count: counts.total, action: onStartExam, color: 'bg-emerald-500' },
  ];

  const pomodoroMin = pomodoroRemaining ? Math.ceil(pomodoroRemaining / 60000) : null;

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

      {pomodoroMin !== null && studyMode === 'pomodoro' && (
        <div className="mb-4 text-center p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/30">
          <p className="text-3xl font-black text-purple-600">{pomodoroMin} min</p>
          <p className="text-xs text-slate-400">restantes</p>
        </div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 sm:grid sm:grid-cols-3 xl:grid-cols-5 sm:overflow-visible">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={m.action}
            disabled={m.count === 0 && m.id !== 'exam'}
            className={`flex-shrink-0 w-[110px] sm:w-auto ${m.color} hover:opacity-90 disabled:opacity-30 text-white rounded-2xl p-4 text-center transition-all`}
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
