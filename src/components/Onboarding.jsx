export function Onboarding({ onComplete }) {
  const steps = [
    { icon: '📄', title: 'Importe seu DOCX', desc: 'Arraste um arquivo Word com Pergunta: e Resposta: — pronto em 1 minuto.' },
    { icon: '🧠', title: 'Estude com repetição espaçada', desc: 'Algoritmo SM-2 com De novo, Difícil, Bom e Fácil.' },
    { icon: '📊', title: 'Acompanhe seu progresso', desc: 'Heatmap, retenção, XP, conquistas e insights automáticos.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center">
        <p className="text-5xl mb-4">🎓</p>
        <h1 className="text-3xl font-black text-indigo-700 dark:text-indigo-300 mb-8">Bem-vindo ao Flash Study</h1>

        <div className="space-y-4 text-left mb-8">
          {steps.map((s) => (
            <div key={s.title} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{s.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onComplete}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-colors"
        >
          Começar agora →
        </button>
      </div>
    </div>
  );
}
