import { ACHIEVEMENTS } from '../utils/gamification';
import { HeatmapCalendar } from './HeatmapCalendar';

export function Dashboard({ insights, gamification, streak, categoryRanking, reviewLog }) {
  const { worstCategories, avgSessionMin, recommendation } = insights;
  const difficultCards = insights.difficultCards ?? [];

  return (
    <div className="space-y-6">
      {recommendation && (
        <div className="bg-indigo-600 text-white rounded-3xl p-6 shadow-xl">
          <p className="text-sm opacity-80 mb-1">💡 Recomendação de hoje</p>
          <h2 className="text-2xl font-bold">
            Revise <span className="underline">{recommendation.category}</span>
            {recommendation.due > 0 && ` — ${recommendation.due} cards pendentes`}
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg text-center">
          <p className="text-3xl font-black text-orange-500">{streak}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">🔥 dias seguidos</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg text-center">
          <p className="text-3xl font-black text-blue-500">{avgSessionMin}min</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">⏱️ tempo médio/sessão</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-lg text-center">
          <p className="text-3xl font-black text-purple-500">{gamification.achievements.length}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">🏅 conquistas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-red-600 mb-4">📉 Piores categorias</h3>
          {worstCategories.length === 0 ? (
            <p className="text-slate-400 text-sm">Estude mais para ver insights.</p>
          ) : (
            <div className="space-y-3">
              {worstCategories.map((c) => (
                <div key={c.category} className="flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{c.category}</span>
                  <span className="text-red-500 font-bold">{c.rate}% acerto</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-orange-600 mb-4">📌 Cards com mais erros</h3>
          {difficultCards.length === 0 ? (
            <p className="text-slate-400 text-sm">Nenhum card com erros registrados ainda.</p>
          ) : (
            <div className="space-y-2">
              {difficultCards.map((c) => (
                <div key={c.id} className="text-sm p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{c.question}</p>
                  <p className="text-xs text-slate-400">{c.category} · {c.lapses} erros</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {categoryRanking.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-bold text-lg text-indigo-600 mb-4">🏆 Ranking por categoria</h3>
          <div className="space-y-2">
            {[...categoryRanking].sort((a, b) => b.score - a.score).map((c, i) => (
              <div key={c.category} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <span className="font-black text-indigo-400 w-6">#{i + 1}</span>
                <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">{c.category}</span>
                <span className="text-purple-600 font-bold">⭐ {c.score}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="font-bold text-lg mb-4">🏅 Todas as conquistas</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = gamification.achievements.includes(a.id);
            return (
              <div key={a.id} className={`p-3 rounded-2xl border text-center ${unlocked ? 'border-indigo-200 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-700' : 'border-slate-200 opacity-40 dark:border-slate-600'}`}>
                <p className="text-2xl">{a.icon}</p>
                <p className="text-xs font-bold mt-1 text-slate-700 dark:text-slate-200">{a.title}</p>
                <p className="text-[10px] text-slate-400">{a.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <HeatmapCalendar reviewLog={reviewLog} />
    </div>
  );
}
