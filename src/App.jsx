import { useState, useEffect } from 'react';
import { useFlashcards } from './hooks/useFlashcards';
import { usePdfExtractor } from './hooks/usePdfExtractor';
import { useCsvImporter } from './hooks/useCsvImporter';
import { useJsonImporter } from './hooks/useJsonImporter';
import { decodeDeckFromUrl } from './utils/shareDeck';
import { suggestCategory } from './utils/categorySuggest';
import { StatsBar } from './components/StatsBar';
import { CardForm } from './components/CardForm';
import { CategoryFilter } from './components/CategoryFilter';
import { FlashCard } from './components/FlashCard';
import { StatsPanel } from './components/StatsPanel';
import { PdfReviewModal } from './components/PdfReviewModal';
import { ReviewBanner } from './components/ReviewBanner';
import { NewCardsConfig } from './components/NewCardsConfig';
import { Onboarding } from './components/Onboarding';
import { GamificationBar } from './components/GamificationBar';
import { Dashboard } from './components/Dashboard';
import { StudyModes } from './components/StudyModes';
import { SettingsPanel } from './components/SettingsPanel';
import { ShareDeck } from './components/ShareDeck';
import { ImportHub } from './components/ImportHub';
import { ExamMode } from './components/ExamMode';
import { SidebarPanel } from './components/SidebarPanel';
import { StudyFocusOverlay } from './components/StudyFocusOverlay';

const TABS = [
  { id: 'study', label: '📖 Estudar' },
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'settings', label: '⚙️ Config' },
];

export default function App() {
  const [tab, setTab] = useState('study');
  const [modalSource, setModalSource] = useState(null);
  const [importCategory, setImportCategory] = useState('');
  const [focusMode, setFocusMode] = useState(false);

  const fc = useFlashcards();
  const docImporter = usePdfExtractor();
  const csvImporter = useCsvImporter();
  const jsonImporter = useJsonImporter();
  const importers = { doc: docImporter, csv: csvImporter, json: jsonImporter };
  const modal = importers[modalSource] ?? docImporter;
  const isImportModalOpen = docImporter.isModalOpen || csvImporter.isModalOpen || jsonImporter.isModalOpen;

  useEffect(() => {
    const shared = decodeDeckFromUrl();
    if (shared?.cards?.length) {
      fc.addCards(shared.cards.map((c) => ({
        ...c,
        category: c.category || suggestCategory(c.question),
      })), true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!fc.activeCard) setFocusMode(false);
  }, [fc.activeCard]);

  useEffect(() => {
    if (fc.sessionComplete) setFocusMode(false);
  }, [fc.sessionComplete]);

  useEffect(() => {
    if (!focusMode) return undefined;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setFocusMode(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [focusMode]);

  function handleConfirm(category) {
    const selected = modal.candidates.filter((c) => c.selected && c.answer.trim());
    fc.addCards(selected.map((c) => ({
      question: c.question.trim(),
      answer: c.answer.trim(),
      category: category || c.category || suggestCategory(c.question),
    })), true);
    modal.closeModal();
    setModalSource(null);
  }

  function handleAiGenerate(cards, category) {
    const fallback = category || suggestCategory(cards[0]?.question ?? '');
    fc.addCards(cards.map((c) => ({
      question: c.question,
      answer: c.answer,
      category: category || c.category || fallback,
    })), true);
  }

  const isDark = fc.settings.darkMode;
  const bg = isDark
    ? 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100'
    : 'bg-gradient-to-br from-pink-50 via-indigo-50 to-cyan-50 text-slate-800';

  const studyActive = !!fc.studyMode;
  const showExam = fc.studyMode === 'exam';

  const flashCardProps = {
    activeCard: fc.activeCard,
    flipped: fc.flipped,
    currentCard: fc.currentCard,
    totalCards: fc.sessionCards.length,
    progress: fc.progress,
    onFlip: fc.toggleFlip,
    onPrevious: fc.goToPrevious,
    onNext: fc.goToNext,
    onAgain: fc.markAgain,
    onHard: fc.markHard,
    onGood: fc.markGood,
    onEasy: fc.markEasy,
    onEdit: fc.editCard,
    speak: fc.speak,
    handsFree: fc.settings.handsFree,
    inStudySession: !!fc.studyMode && fc.studyMode !== 'exam',
    onToggleFocus: fc.activeCard && !fc.examFinished
      ? () => setFocusMode(true)
      : undefined,
  };

  const examModeProps = {
    activeCard: fc.activeCard,
    currentCard: fc.currentCard,
    totalCards: fc.sessionCards.length,
    onAnswer: fc.recordExamAnswer,
    onFinish: fc.finishExam,
    examFinished: false,
    examAnswers: fc.examAnswers,
    sessionCards: fc.sessionCards,
    onToggleFocus: fc.activeCard && !fc.examFinished
      ? () => setFocusMode(true)
      : undefined,
  };

  const studyContent = fc.examFinished ? (
    <ExamMode examFinished examAnswers={fc.examAnswers} sessionCards={fc.sessionCards} onFinish={fc.closeExamResults} />
  ) : showExam ? (
    <ExamMode {...examModeProps} />
  ) : studyActive && fc.sessionComplete ? (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center shadow-xl">
      <p className="text-5xl mb-4">🎉</p>
      <h2 className="text-2xl font-bold mb-2 dark:text-slate-100">Sessão concluída!</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
        {fc.dueCards.length === 0
          ? 'Todos os cards de hoje foram revisados.'
          : `${fc.dueCards.length} card(s) ainda pendente(s) para outra sessão.`}
      </p>
      <button onClick={fc.stopReview} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold mt-2 hover:bg-indigo-700 transition-colors">
        Voltar
      </button>
    </div>
  ) : (
    <FlashCard {...flashCardProps} />
  );

  return (
    <div className={`min-h-screen ${bg} transition-colors`}>
      {!fc.settings.onboardingDone && <Onboarding onComplete={fc.completeOnboarding} />}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <header className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-4xl font-black text-indigo-700 dark:text-indigo-300">🎓 Flash Study</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Repetição espaçada inteligente</p>
          </div>
          <nav className="flex gap-2 p-1 rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur shadow-sm">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === t.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-700/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {tab === 'study' && (
          <div className="space-y-6 lg:space-y-8">
            <StatsBar
              totalCorrect={fc.totalCorrect}
              totalWrong={fc.totalWrong}
              totalCards={fc.filteredCards.length}
              progress={fc.progress}
              totalScore={fc.totalScore}
              retentionRate={fc.retentionRate}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
              <GamificationBar gamification={fc.gamification} dailyGoal={fc.settings.dailyGoal} />
              <StudyModes
                onStartReview={fc.startReview}
                onStartErrors={fc.startErrors}
                onStartExam={fc.startExam}
                studyMode={fc.studyMode}
                onStop={fc.stopReview}
                counts={{
                  due: fc.dueCards.length,
                  errors: fc.errorCards.length,
                  total: fc.filteredCards.length,
                }}
              />
            </div>

            {fc.filteredCards.length > 0 && !studyActive && (
              <div className="space-y-3">
                <NewCardsConfig
                  limit={fc.newCardsLimit}
                  remaining={fc.newCardsRemaining}
                  introducedToday={fc.newIntroducedToday}
                  onChange={fc.setNewCardsLimit}
                />
                <ReviewBanner
                  dueReviewCount={fc.dueCards.filter((c) => c.sm2IntroducedDate && !c.sm2Relearning).length}
                  newCount={fc.dueCards.filter((c) => !c.sm2IntroducedDate).length}
                  relearningCount={fc.relearningCards.length}
                  reviewMode={fc.reviewMode}
                  onStart={fc.startReview}
                  onStop={fc.stopReview}
                />
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Mobile: estudo primeiro; Desktop: sidebar | estudo | stats */}
              <aside className="xl:col-span-3 order-2 xl:order-1">
                <SidebarPanel
                  createContent={<CardForm onAddCard={fc.addCard} bare />}
                  importContent={
                    <ImportHub
                      bare
                      onDocFile={(f) => { setModalSource('doc'); docImporter.processPdf(f); }}
                      docLoading={docImporter.isLoading}
                      docError={docImporter.error}
                      onCsvFile={(f) => { setModalSource('csv'); csvImporter.processFile(f); }}
                      csvLoading={csvImporter.isLoading}
                      csvError={csvImporter.error}
                      onJsonFile={(f) => { setModalSource('json'); jsonImporter.processFile(f); }}
                      jsonLoading={jsonImporter.isLoading}
                      jsonError={jsonImporter.error}
                      onTextParse={(text, category) => {
                        setModalSource('doc');
                        setImportCategory(category);
                        return docImporter.processText(text);
                      }}
                      onAiGenerate={handleAiGenerate}
                      existingCategories={fc.categories}
                      settings={fc.settings}
                    />
                  }
                  shareContent={
                    <ShareDeck
                      bare
                      cards={fc.filteredCards}
                      onImportDeck={(deckCards, name) => {
                        fc.addCards(deckCards.map((c) => ({
                          ...c,
                          category: c.category || name,
                        })), true);
                      }}
                    />
                  }
                />
              </aside>

              <section className="xl:col-span-6 order-1 xl:order-2 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CategoryFilter
                    categories={fc.categories}
                    selectedCategory={fc.selectedCategory}
                    onChange={fc.changeCategory}
                  />
                  {studyActive && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                        {fc.currentCard + 1} / {fc.sessionCards.length}
                      </span>
                      {fc.activeCard && !fc.examFinished && (
                        <button
                          type="button"
                          onClick={() => setFocusMode(true)}
                          className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1 rounded-full transition-colors"
                          title="Estudar em tela cheia"
                        >
                          ⛶ Modo foco
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {!(focusMode && fc.activeCard) && studyContent}
              </section>

              <aside className="xl:col-span-3 order-3">
                <StatsPanel stats={fc.stats} cards={fc.filteredCards} />
              </aside>
            </div>
          </div>
        )}

        {tab === 'dashboard' && (
          <Dashboard
            insights={fc.insights}
            gamification={fc.gamification}
            streak={fc.streak}
            categoryRanking={fc.insights.categoryRanking}
            reviewLog={fc.reviewLog}
          />
        )}

        {tab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <SettingsPanel
              settings={fc.settings}
              onUpdate={fc.updateSettings}
              cards={fc.cards}
              stats={fc.stats}
              reviewLog={fc.reviewLog}
              gamification={fc.gamification}
              sessionHistory={fc.sessionHistory}
              newCardsLimit={fc.newCardsLimit}
            />
          </div>
        )}
      </div>

      {focusMode && fc.activeCard && !fc.sessionComplete && tab === 'study' && !fc.examFinished && (
        <StudyFocusOverlay
          onExit={() => setFocusMode(false)}
          currentCard={fc.currentCard}
          totalCards={fc.sessionCards.length}
          progress={fc.progress}
          isDark={isDark}
        >
          {showExam ? (
            <ExamMode
              {...examModeProps}
              expanded
              focusMode
              onToggleFocus={() => setFocusMode(false)}
            />
          ) : (
            <FlashCard
              {...flashCardProps}
              expanded
              focusMode
              hideProgress
              onToggleFocus={() => setFocusMode(false)}
            />
          )}
        </StudyFocusOverlay>
      )}

      {isImportModalOpen && (
        <PdfReviewModal
          candidates={modal.candidates}
          onToggle={modal.toggleCandidate}
          onUpdateAnswer={modal.updateAnswer}
          onUpdateQuestion={modal.updateQuestion}
          onSelectAll={modal.selectAll}
          onDeselectAll={modal.deselectAll}
          onConfirm={handleConfirm}
          onClose={() => { modal.closeModal(); setModalSource(null); setImportCategory(''); }}
          existingCategories={fc.categories}
          defaultCategory={importCategory}
        />
      )}
    </div>
  );
}
