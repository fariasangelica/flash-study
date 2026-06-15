import { useState } from 'react';

export function NewCardsConfig({ limit, remaining, introducedToday, onChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(limit);

  function handleSave() {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 1 && n <= 500) {
      onChange(n);
      setEditing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center justify-between gap-4 text-sm">
      <div className="flex items-center gap-2 text-slate-600">
        <span>🃏</span>
        <span>Cards novos/dia:</span>
        {editing ? (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={1}
              max={500}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-16 border border-indigo-300 rounded-lg px-2 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave} className="text-indigo-600 font-bold hover:text-indigo-800">✓</button>
            <button onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        ) : (
          <button
            onClick={() => { setValue(limit); setEditing(true); }}
            className="font-bold text-indigo-600 underline decoration-dotted hover:text-indigo-800"
          >
            {limit}
          </button>
        )}
      </div>

      <div className="flex gap-3 text-xs text-slate-500">
        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">
          ✅ {introducedToday} hoje
        </span>
        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
          🆕 {remaining} restantes
        </span>
      </div>
    </div>
  );
}
