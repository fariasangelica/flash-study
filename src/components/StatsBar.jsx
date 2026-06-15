function RetentionGauge({ rate }) {
  const color = rate >= 80 ? 'text-green-500' : rate >= 60 ? 'text-yellow-500' : 'text-red-500';
  const fillColor = rate >= 80 ? 'bg-green-400' : rate >= 60 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="flex-shrink-0 w-[140px] sm:w-auto sm:min-w-[150px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 flex flex-col justify-between">
      <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">🎯 Retenção</p>
      <p className={`text-2xl sm:text-3xl font-black ${color}`}>{rate}%</p>
      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 mt-1">
        <div className={`h-1.5 rounded-full ${fillColor}`} style={{ width: `${rate}%` }} />
      </div>
    </div>
  );
}

function StatCard({ label, value, color, small }) {
  return (
    <div className="flex-shrink-0 w-[130px] sm:w-auto sm:min-w-[140px] bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4">
      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{label}</p>
      <p className={`font-black ${color} ${small ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'}`}>
        {value}
      </p>
    </div>
  );
}

export function StatsBar({ totalCorrect, totalWrong, totalCards, progress, totalScore, retentionRate }) {
  const items = [
    { label: '✅ Acertos', value: totalCorrect, color: 'text-green-500' },
    { label: '❌ Erros', value: totalWrong, color: 'text-red-500' },
    { label: '📚 Cards', value: totalCards, color: 'text-indigo-600 dark:text-indigo-400' },
    { label: '🚀 Progresso', value: `${progress}%`, color: 'text-yellow-500', small: true },
    { label: '⭐ Pontos', value: totalScore, color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="mb-6 -mx-1 px-1 overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex gap-3 sm:gap-4 min-w-max sm:min-w-0 sm:grid sm:grid-cols-3 xl:grid-cols-6">
        {items.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
        {retentionRate !== null && <RetentionGauge rate={retentionRate} />}
      </div>
    </div>
  );
}
