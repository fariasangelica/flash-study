export function ExamMode({

  activeCard,

  currentCard,

  totalCards,

  onAnswer,

  onFinish,

  examFinished,

  examAnswers,

  sessionCards,

  expanded = false,

  focusMode = false,

  onToggleFocus,

}) {

  if (examFinished && sessionCards) {

    const correct = examAnswers.filter((a) => a.correct).length;

    const pct = examAnswers.length > 0 ? Math.round((correct / examAnswers.length) * 100) : 0;

    return (

      <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl text-center">

        <p className="text-5xl mb-4">{pct >= 70 ? '🎉' : '📚'}</p>

        <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">Prova finalizada!</h2>

        <p className="text-5xl font-black text-indigo-600 mb-4">{pct}%</p>

        <p className="text-slate-500 mb-6">{correct} de {examAnswers.length} corretas</p>



        <div className="text-left space-y-3 max-h-60 overflow-y-auto mb-6">

          {sessionCards.map((card) => {

            const ans = examAnswers.find((a) => a.cardId === card.id);

            return (

              <div key={card.id} className={`p-3 rounded-xl text-sm ${ans?.correct ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>

                <p className="font-bold text-slate-700 dark:text-slate-200">{card.question}</p>

                <p className="text-emerald-600 dark:text-emerald-400 mt-1">{card.answer}</p>

              </div>

            );

          })}

        </div>

        <button onClick={onFinish} className="w-full py-3 bg-indigo-600 text-white rounded-2xl font-bold">

          Fechar resultados

        </button>

      </div>

    );

  }



  if (!activeCard) return null;



  const isLast = currentCard === totalCards - 1;



  return (

    <div className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-2xl flex flex-col ${

      expanded ? 'min-h-[50vh] sm:min-h-[58vh] p-8 sm:p-12' : 'min-h-[300px] p-8'

    }`}>

      {onToggleFocus && !focusMode && (

        <button

          type="button"

          onClick={onToggleFocus}

          title="Modo foco — tela cheia"

          className="absolute top-4 left-4 text-slate-300 hover:text-indigo-500 transition-colors z-10"

        >

          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

            <path d="M8 3H5a2 2 0 0 0-2 2v3" />

            <path d="M21 8V5a2 2 0 0 0-2-2h-3" />

            <path d="M3 16v3a2 2 0 0 0 2 2h3" />

            <path d="M16 21h3a2 2 0 0 0 2-2v-3" />

          </svg>

        </button>

      )}



      <div className="flex justify-between items-center mb-6">

        <span className="text-sm text-slate-400">📝 Modo Prova — sem revelar resposta</span>

        {!focusMode && (

          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{currentCard + 1}/{totalCards}</span>

        )}

      </div>



      <div className="flex-1 flex items-center justify-center">

        <h2 className={`font-extrabold text-slate-800 dark:text-slate-100 text-center leading-relaxed ${

          expanded ? 'text-3xl sm:text-4xl lg:text-[2.75rem]' : 'text-2xl'

        }`}>

          {activeCard.question}

        </h2>

      </div>



      <p className="text-center text-sm text-slate-400 mb-6">Responda mentalmente, depois avalie:</p>



      <div className="flex gap-3 justify-center">

        <button

          onClick={() => onAnswer(false)}

          className={`bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl font-bold transition-colors ${

            expanded ? 'px-8 py-4 text-base' : 'px-6 py-3'

          }`}

        >

          ❌ Errei

        </button>

        <button

          onClick={() => onAnswer(true)}

          className={`bg-green-100 hover:bg-green-200 text-green-600 rounded-2xl font-bold transition-colors ${

            expanded ? 'px-8 py-4 text-base' : 'px-6 py-3'

          }`}

        >

          ✅ Acertei

        </button>

      </div>



      {isLast && (

        <button onClick={onFinish} className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-colors">

          Ver resultados →

        </button>

      )}

    </div>

  );

}

