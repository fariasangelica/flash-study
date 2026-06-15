export function ReviewBanner({ dueReviewCount, newCount, relearningCount, reviewMode, onStart, onStop }) {
  const total = dueReviewCount + newCount + relearningCount;

  if (reviewMode) {
    return (
      <div className="flex items-center justify-between bg-indigo-600 text-white rounded-2xl px-5 py-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔁</span>
          <span className="font-bold">Modo revisão ativo</span>
          <span className="text-indigo-200 text-sm">— mostrando apenas cards pendentes</span>
        </div>
        <button
          onClick={onStop}
          className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors"
        >
          Sair da revisão
        </button>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 rounded-2xl px-5 py-3">
        <span className="text-lg">✅</span>
        <span className="font-semibold text-sm">Nenhum card para estudar hoje. Volte amanhã!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⏰</span>
          <span className="font-bold text-amber-800">Para estudar hoje</span>
        </div>
        <div className="flex gap-2 text-xs flex-wrap">
          {relearningCount > 0 && (
            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-semibold">
              🔄 {relearningCount} reaprendendo
            </span>
          )}
          {dueReviewCount > 0 && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
              🔁 {dueReviewCount} revisões
            </span>
          )}
          {newCount > 0 && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
              🆕 {newCount} novos
            </span>
          )}
        </div>
      </div>
      <button
        onClick={onStart}
        className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-1.5 rounded-xl text-sm font-bold transition-colors"
      >
        Iniciar sessão
      </button>
    </div>
  );
}
