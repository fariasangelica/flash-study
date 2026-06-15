import { ACHIEVEMENTS, xpToNextLevel } from '../utils/gamification';

export function GamificationBar({ gamification, dailyGoal }) {
  const { xp, level, achievements, dailyReviewsToday } = gamification;
  const { current, needed } = xpToNextLevel(xp);
  const pct = Math.round((current / needed) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xl font-black text-indigo-600 dark:text-indigo-300">
            {level}
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">Nível {level}</p>
            <p className="text-xs text-slate-400">{xp} XP total</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Meta diária</p>
          <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">
            {dailyReviewsToday}/{dailyGoal}
          </p>
        </div>
      </div>

      <div className="mb-1 flex justify-between text-xs text-slate-400">
        <span>Progresso do nível</span>
        <span>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
        <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>

      {achievements.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {achievements.slice(-6).map((id) => {
            const a = ACHIEVEMENTS.find((x) => x.id === id);
            if (!a) return null;
            return (
              <span key={id} title={a.desc} className="text-lg cursor-help">{a.icon}</span>
            );
          })}
        </div>
      )}
    </div>
  );
}
