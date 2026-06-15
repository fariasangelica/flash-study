function formatNextReview(dateStr) {
  if (!dateStr) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr <= today) return { label: 'Revisar hoje', color: 'text-amber-600 bg-amber-50' };

  const diff = Math.round((new Date(dateStr) - new Date(today)) / 86400000);
  if (diff === 1) return { label: 'Amanhã', color: 'text-blue-600 bg-blue-50' };
  return { label: `Em ${diff} dias`, color: 'text-slate-500 bg-slate-100' };
}

export function StatsPanel({ stats, cards }) {
  const entries = Object.entries(stats);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 sm:p-6 lg:sticky lg:top-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-indigo-700 dark:text-indigo-300 sticky top-0 bg-white dark:bg-slate-800 pb-3 z-10">
        📊 Estatísticas
      </h2>

      <div className="space-y-4 pr-2">
        {entries.length > 0 ? (
          entries.map(([categoryName, values]) => {
            const categoryCards = cards.filter((c) => c.category === categoryName);

            const nextDates = categoryCards.map((c) => c.sm2NextReview).filter(Boolean).sort();
            const nextReview = nextDates[0] ? formatNextReview(nextDates[0]) : null;

            const totalLapses = categoryCards.reduce((a, c) => a + (c.sm2Lapses ?? 0), 0);
            const leechCount = categoryCards.filter((c) => c.sm2Leech).length;
            const relearningCount = categoryCards.filter((c) => c.sm2Relearning).length;

            const attempted = categoryCards.filter((c) => c.firstAttemptResult !== undefined);
            const firstCorrect = attempted.filter((c) => c.firstAttemptResult === 'correct').length;
            const retention = attempted.length > 0
              ? Math.round((firstCorrect / attempted.length) * 100)
              : null;

            const retentionColor =
              retention === null ? '' :
              retention >= 80 ? 'text-green-600' :
              retention >= 60 ? 'text-yellow-600' :
              'text-red-600';

            return (
              <div
                key={categoryName}
                className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-indigo-700 text-lg">{categoryName}</h3>
                  <span className="bg-purple-100 text-purple-700 font-black text-sm px-3 py-1 rounded-full">
                    ⭐ {values.score} pts
                  </span>
                </div>

                <div className="flex justify-between mb-2">
                  <span className="text-green-600 font-semibold">✅ Acertos</span>
                  <span className="font-bold">{values.correct}</span>
                </div>

                <div className="flex justify-between mb-3">
                  <span className="text-red-600 font-semibold">❌ Erros</span>
                  <span className="font-bold">{values.wrong}</span>
                </div>

                {(values.correct + values.wrong) > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Taxa de acerto geral</span>
                      <span>{Math.round((values.correct / (values.correct + values.wrong)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round((values.correct / (values.correct + values.wrong)) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {retention !== null && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">🎯 Retenção (1ª tentativa)</span>
                      <span className={`font-bold ${retentionColor}`}>{retention}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          retention >= 80 ? 'bg-green-400' :
                          retention >= 60 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${retention}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{firstCorrect} de {attempted.length} cards acertados na 1ª vez</p>
                  </div>
                )}

                {(totalLapses > 0 || relearningCount > 0) && (
                  <div className="flex gap-2 flex-wrap mt-1 mb-2">
                    {relearningCount > 0 && (
                      <span className="bg-orange-50 text-orange-600 text-xs font-semibold px-2 py-1 rounded-lg">
                        🔄 {relearningCount} reaprendendo
                      </span>
                    )}
                    {totalLapses > 0 && (
                      <span className="bg-slate-100 text-slate-500 text-xs font-semibold px-2 py-1 rounded-lg">
                        ↩️ {totalLapses} lapses
                      </span>
                    )}
                    {leechCount > 0 && (
                      <span className="bg-red-50 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">
                        🩸 {leechCount} leech{leechCount > 1 ? 'es' : ''}
                      </span>
                    )}
                  </div>
                )}

                {nextReview && (
                  <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg w-fit ${nextReview.color}`}>
                    <span>🔁</span>
                    <span>{nextReview.label}</span>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-slate-500">Nenhuma estatística disponível ainda.</p>
        )}
      </div>
    </div>
  );
}
