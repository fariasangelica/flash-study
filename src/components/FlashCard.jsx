import { useState, useEffect, useRef } from 'react';

function AnswerContent({ answer, expanded = false }) {
  const lines = answer.split('\n').filter(Boolean);
  const isList = lines.length > 1;

  if (!isList) {
    return (
      <p className={`font-semibold text-emerald-700 leading-relaxed text-center ${
        expanded ? 'text-2xl sm:text-3xl' : 'text-xl'
      }`}>
        {answer}
      </p>
    );
  }

  return (
    <ul className="inline-flex flex-col gap-3 text-left">
      {lines.map((line, i) => (
        <li key={i} className={`flex items-start gap-3 text-emerald-700 font-semibold leading-snug ${
          expanded ? 'text-xl sm:text-2xl' : 'text-lg'
        }`}>
          <span className={`rounded-full bg-emerald-400 flex-shrink-0 mt-[6px] ${expanded ? 'w-2.5 h-2.5' : 'w-2 h-2'}`} />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function EditMode({ card, onSave, onCancel }) {
  const [question, setQuestion] = useState(card.question);
  const [answer, setAnswer] = useState(card.answer);
  const [audioUrl, setAudioUrl] = useState(card.audioUrl ?? '');
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);

  useEffect(() => {
    setQuestion(card.question);
    setAnswer(card.answer);
    setAudioUrl(card.audioUrl ?? '');
  }, [card.id]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = (e) => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
    } catch {
      alert('Permita acesso ao microfone para gravar áudio.');
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    setRecording(false);
  }

  function handleSave() {
    if (!question.trim() || !answer.trim()) return;
    onSave({ question: question.trim(), answer: answer.trim(), audioUrl: audioUrl || undefined });
  }

  return (
    <div className="flex flex-col gap-3 w-full" onClick={(e) => e.stopPropagation()}>
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pergunta</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Resposta</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={4}
          className="w-full mt-1 p-3 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Áudio da resposta</label>
        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`px-3 py-2 rounded-xl text-sm font-bold ${recording ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {recording ? '⏹ Parar' : '🎙 Gravar'}
          </button>
          {audioUrl && <audio src={audioUrl} controls className="h-8 flex-1" />}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          Salvar
        </button>
      </div>
    </div>
  );
}

export function FlashCard({
  activeCard,
  flipped,
  currentCard,
  totalCards,
  progress,
  onFlip,
  onPrevious,
  onNext,
  onAgain,
  onHard,
  onGood,
  onEasy,
  onEdit,
  speak,
  handsFree,
  expanded = false,
  focusMode = false,
  onToggleFocus,
  hideProgress = false,
  inStudySession = false,
}) {
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setEditing(false);
  }, [activeCard?.id]);

  useEffect(() => {
    if (!handsFree || !activeCard || !speak) return;
    speak(flipped ? activeCard.answer : activeCard.question);
  }, [activeCard?.id, flipped, handsFree]);

  if (!activeCard) {
    if (inStudySession) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center shadow-2xl">
          <p className="text-5xl mb-4">🎉</p>
          <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-100 mb-2">Sessão concluída!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Carregando...</p>
        </div>
      );
    }
    return (
      <div className="bg-white rounded-3xl p-10 text-center shadow-2xl">
        <h2 className="text-3xl font-bold text-slate-700 mb-4">
          Nenhum card criado 📭
        </h2>
        <p className="text-slate-500">
          Comece adicionando suas perguntas e respostas.
        </p>
      </div>
    );
  }

  function handleSave(updated) {
    onEdit(activeCard.id, updated);
    setEditing(false);
  }

  return (
    <>
      <div
        onClick={!editing ? onFlip : undefined}
        className={`relative bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl flex flex-col select-none overflow-hidden ${
          expanded ? 'min-h-[50vh] sm:min-h-[58vh]' : 'min-h-[380px]'
        } ${!editing ? 'cursor-pointer' : ''}`}
      >
        {onToggleFocus && !focusMode && !editing && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleFocus(); }}
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

        <button
          onClick={(e) => { e.stopPropagation(); setEditing((v) => !v); }}
          title="Editar card"
          className="absolute top-4 right-4 text-slate-300 hover:text-indigo-500 transition-colors z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        {editing ? (
          <div className="flex-1 flex flex-col justify-center px-8 py-6">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide mb-4">Editando card</p>
            <EditMode
              card={activeCard}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          </div>
        ) : (
          <>
        <div className="flex flex-col items-center px-8 pt-7 pb-0 gap-2">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="bg-indigo-50 text-indigo-500 px-4 py-1.5 rounded-full text-xs font-semibold text-center">
              {activeCard.category}
            </span>
            {activeCard.sm2Relearning && (
              <span className="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
                🔄 Reaprendendo
              </span>
            )}
            {(activeCard.sm2Lapses ?? 0) > 0 && (
              <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-[10px] font-semibold">
                {activeCard.sm2Lapses} lapse{activeCard.sm2Lapses > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium">
            {!flipped ? '🧠 Pergunta' : '✨ Resposta'}
          </p>
        </div>

            <div className={`flex-1 flex items-center justify-center py-8 ${expanded ? 'px-8 sm:px-14' : 'px-10'}`}>
              {!flipped ? (
                <h2 className={`font-extrabold text-slate-800 dark:text-slate-100 leading-relaxed text-center ${
                  expanded ? 'text-3xl sm:text-4xl lg:text-[2.75rem]' : 'text-2xl'
                }`}>
                  {activeCard.question}
                </h2>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <AnswerContent answer={activeCard.answer} expanded={expanded} />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 pb-4">
              <button
                onClick={(e) => { e.stopPropagation(); speak?.(activeCard.question); }}
                className="text-xs text-slate-400 hover:text-indigo-500"
              >
                🔊 Pergunta
              </button>
              {flipped && (
                <button
                  onClick={(e) => { e.stopPropagation(); speak?.(activeCard.answer); }}
                  className="text-xs text-slate-400 hover:text-emerald-500"
                >
                  🔊 Resposta
                </button>
              )}
              {activeCard.audioUrl && (
                <audio src={activeCard.audioUrl} controls className="h-6" onClick={(e) => e.stopPropagation()} />
              )}
            </div>
          </>
        )}
      </div>

      {!hideProgress && (
        <div className="w-full bg-white dark:bg-slate-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-indigo-500 to-pink-500 h-3 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Navegação simples — sempre visível */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={onPrevious}
          disabled={currentCard === 0}
          className="bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-3 rounded-2xl font-bold text-slate-600 text-sm transition-colors"
        >
          ⬅️ Voltar
        </button>

        {!flipped ? (
          <button
            onClick={onFlip}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-colors"
          >
            Ver resposta
          </button>
        ) : (
          <button
            onClick={onNext}
            disabled={currentCard === totalCards - 1}
            className="bg-slate-200 hover:bg-slate-300 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-3 rounded-2xl font-bold text-slate-600 text-sm transition-colors"
          >
            ➡️ Pular
          </button>
        )}
      </div>

      {/* Botões de avaliação — só aparecem com a resposta visível */}
      {flipped && (
        <div className="flex flex-col gap-2">
          <p className="text-center text-xs text-slate-400 font-medium">Como foi?</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            <button
              onClick={onAgain}
              className="flex flex-col items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 py-4 px-3 rounded-2xl font-bold text-xs transition-colors"
            >
              <span className="text-lg">😵</span>
              <span>De novo</span>
              <span className="text-red-400 font-normal text-[10px]">&lt;1 dia</span>
            </button>

            <button
              onClick={onHard}
              className="flex flex-col items-center gap-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 py-4 px-3 rounded-2xl font-bold text-xs transition-colors"
            >
              <span className="text-lg">😓</span>
              <span>Difícil</span>
              <span className="text-orange-400 font-normal text-[10px]">intervalo ×1.2</span>
            </button>

            <button
              onClick={onGood}
              className="flex flex-col items-center gap-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-600 py-4 px-3 rounded-2xl font-bold text-xs transition-colors"
            >
              <span className="text-lg">🙂</span>
              <span>Bom</span>
              <span className="text-green-400 font-normal text-[10px]">intervalo ×fator</span>
            </button>

            <button
              onClick={onEasy}
              className="flex flex-col items-center gap-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 py-4 px-3 rounded-2xl font-bold text-xs transition-colors"
            >
              <span className="text-lg">🤩</span>
              <span>Fácil</span>
              <span className="text-blue-400 font-normal text-[10px]">intervalo ×1.3</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
