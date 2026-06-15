import { exportAppData, importAppData } from '../utils/storage';

export function SettingsPanel({ settings, onUpdate, cards, stats, reviewLog, gamification, sessionHistory, newCardsLimit }) {
  function handleExport() {
    const data = { cards, stats, reviewLog, settings, gamification, sessionHistory, newCardsLimit };
    const blob = new Blob([exportAppData(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flashstudy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importAppData(reader.result);
        window.location.reload();
      } catch {
        alert('Arquivo inválido.');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
      <h3 className="font-bold text-xl text-indigo-700 dark:text-indigo-300">⚙️ Configurações</h3>

      <label className="flex items-center justify-between">
        <span className="text-slate-700 dark:text-slate-200">🌙 Dark mode</span>
        <input type="checkbox" checked={settings.darkMode} onChange={(e) => onUpdate({ darkMode: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
      </label>

      <label className="flex items-center justify-between">
        <span className="text-slate-700 dark:text-slate-200">🚗 Modo mãos livres (TTS)</span>
        <input type="checkbox" checked={settings.handsFree} onChange={(e) => onUpdate({ handsFree: e.target.checked })} className="w-5 h-5 accent-indigo-600" />
      </label>

      <div>
        <label className="text-sm text-slate-600 dark:text-slate-300">Meta diária (revisões)</label>
        <input
          type="number" min={5} max={200} value={settings.dailyGoal}
          onChange={(e) => onUpdate({ dailyGoal: parseInt(e.target.value, 10) || 20 })}
          className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
      </div>

      <div>
        <label className="text-sm text-slate-600 dark:text-slate-300">Chave API Gemini (opcional, para IA)</label>
        <input
          type="password" value={settings.geminiApiKey} placeholder="AIza..."
          onChange={(e) => onUpdate({ geminiApiKey: e.target.value })}
          className="w-full mt-1 p-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
        />
        <p className="text-xs text-slate-400 mt-1">
          Obtenha em{' '}
          <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-indigo-500 underline">
            aistudio.google.com/apikey
          </a>
          {' '}— fica salvo localmente no navegador.
        </p>
      </div>

      <div className="flex gap-3">
        <button onClick={handleExport} className="flex-1 py-3 rounded-xl border border-indigo-300 text-indigo-600 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
          📤 Exportar backup
        </button>
        <label className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-center cursor-pointer">
          📥 Importar backup
          <input type="file" accept=".json" className="hidden" onChange={handleImport} />
        </label>
      </div>
    </div>
  );
}
