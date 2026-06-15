export function StudyFocusOverlay({
  children,
  onExit,
  currentCard,
  totalCards,
  progress,
  isDark,
}) {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col ${
        isDark
          ? 'bg-slate-900 text-slate-100'
          : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-800'
      }`}
    >
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 shrink-0 border-b border-black/5 dark:border-white/10">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {currentCard + 1} / {totalCards}
        </span>
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Sair do modo foco (Esc)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v3a2 2 0 0 1-2 2H3" />
            <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
            <path d="M3 16h3a2 2 0 0 1 2 2v3" />
            <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
          </svg>
          Sair do modo foco
        </button>
      </header>

      <main className="flex-1 flex flex-col justify-center min-h-0 overflow-y-auto px-4 sm:px-8 py-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
          {children}
        </div>
      </main>

      <footer className="px-4 sm:px-6 pb-4 shrink-0">
        <div className="max-w-4xl mx-auto h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </footer>
    </div>
  );
}
