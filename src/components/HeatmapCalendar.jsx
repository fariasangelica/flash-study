import { useState } from 'react';

const WEEKS = 26; // ~6 meses
const DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function toDateStr(date) {
  return date.toISOString().slice(0, 10);
}

function buildGrid(reviewLog) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Começa no domingo da semana de 26 semanas atrás
  const start = new Date(today);
  start.setDate(start.getDate() - WEEKS * 7 + 1);
  start.setDate(start.getDate() - start.getDay()); // recua até domingo

  const grid = []; // grid[col][row] = { date, count }
  let cursor = new Date(start);

  while (cursor <= today) {
    const col = [];
    for (let row = 0; row < 7; row++) {
      const dateStr = toDateStr(cursor);
      const isFuture = cursor > today;
      col.push({
        date: dateStr,
        count: isFuture ? -1 : (reviewLog[dateStr] ?? 0),
        isFuture,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    grid.push(col);
  }

  return { grid, start };
}

function getColor(count) {
  if (count < 0) return 'bg-transparent';
  if (count === 0) return 'bg-slate-100';
  if (count <= 5) return 'bg-indigo-200';
  if (count <= 15) return 'bg-indigo-400';
  if (count <= 30) return 'bg-indigo-600';
  return 'bg-indigo-800';
}

function getMonthLabels(grid) {
  const labels = [];
  let lastMonth = -1;
  grid.forEach((col, colIdx) => {
    const month = new Date(col[0].date).getMonth();
    if (month !== lastMonth) {
      labels.push({ colIdx, label: MONTHS[month] });
      lastMonth = month;
    }
  });
  return labels;
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function HeatmapCalendar({ reviewLog }) {
  const [tooltip, setTooltip] = useState(null);

  const { grid } = buildGrid(reviewLog);
  const monthLabels = getMonthLabels(grid);

  const totalReviews = Object.values(reviewLog).reduce((a, b) => a + b, 0);
  const activeDays = Object.values(reviewLog).filter((v) => v > 0).length;

  const today = toDateStr(new Date());
  const streak = (() => {
    let count = 0;
    let cursor = new Date();
    while (true) {
      const d = toDateStr(cursor);
      if (!reviewLog[d]) break;
      count++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  })();

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-indigo-700">📅 Histórico de Revisões</h2>
        <div className="flex gap-3 text-sm">
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">{streak}</p>
            <p className="text-xs text-slate-400">dias seguidos 🔥</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">{activeDays}</p>
            <p className="text-xs text-slate-400">dias ativos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-indigo-600">{totalReviews}</p>
            <p className="text-xs text-slate-400">revisões totais</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1 min-w-max">

          {/* Rótulos dos meses */}
          <div className="flex gap-[3px] ml-6">
            {grid.map((_, colIdx) => {
              const label = monthLabels.find((l) => l.colIdx === colIdx);
              return (
                <div key={colIdx} className="w-[14px] text-[10px] text-slate-400 font-medium">
                  {label ? label.label : ''}
                </div>
              );
            })}
          </div>

          {/* Grade de dias */}
          <div className="flex gap-[2px]">
            {/* Rótulos dos dias da semana */}
            <div className="flex flex-col gap-[3px] mr-1">
              {DAYS.map((d, i) => (
                <div key={i} className="w-4 h-[14px] text-[10px] text-slate-300 font-medium leading-[14px]">
                  {i % 2 === 1 ? d : ''}
                </div>
              ))}
            </div>

            {/* Colunas (semanas) */}
            {grid.map((col, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-[3px]">
                {col.map((cell) => (
                  <div
                    key={cell.date}
                    className={`w-[14px] h-[14px] rounded-[3px] cursor-default transition-opacity ${getColor(cell.count)} ${cell.isFuture ? '' : 'hover:ring-1 hover:ring-indigo-400'}`}
                    onMouseEnter={() => !cell.isFuture && setTooltip(cell)}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legenda */}
          <div className="flex items-center gap-2 mt-2 ml-6">
            <span className="text-xs text-slate-400">Menos</span>
            {[0, 3, 10, 20, 35].map((v) => (
              <div key={v} className={`w-[14px] h-[14px] rounded-[3px] ${getColor(v)}`} />
            ))}
            <span className="text-xs text-slate-400">Mais</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div className="mt-3 text-center text-sm text-slate-600 bg-slate-50 rounded-xl py-2 px-4">
          {tooltip.count === 0
            ? `${formatDate(tooltip.date)} — nenhuma revisão`
            : `${formatDate(tooltip.date)} — ${tooltip.count} card${tooltip.count > 1 ? 's' : ''} revisado${tooltip.count > 1 ? 's' : ''}`}
        </div>
      )}
    </div>
  );
}
