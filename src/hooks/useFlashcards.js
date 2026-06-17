import { useState, useEffect, useCallback, useRef } from 'react';
import { loadAppData, saveAppData, saveGeminiApiKey, DEFAULT_SETTINGS, DEFAULT_GAMIFICATION } from '../utils/storage';
import { xpForRating, levelFromXp, checkAchievements } from '../utils/gamification';
import { computeInsights } from '../utils/insights';

const DEFAULT_EASE = 2.5;
const MIN_EASE = 1.3;
const DEFAULT_NEW_LIMIT = 20;

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  const nd = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

/** Garante que o card não volte na fila do mesmo dia após acerto. */
function ensureNotDueToday(dateStr) {
  const today = todayStr();
  if (!dateStr || dateStr <= today) return addDays(today, 1);
  return dateStr;
}

function calcInterval(reps, prevInterval, ease) {
  if (reps === 1) return 1;
  if (reps === 2) return 6;
  return Math.max(1, Math.round(prevInterval * ease));
}

function applyAgain(card) {
  const wasLearned = (card.sm2Reps ?? 0) > 0 && (card.sm2Interval ?? 1) > 1;
  const lapses = (card.sm2Lapses ?? 0) + (wasLearned ? 1 : 0);
  return {
    ...card,
    sm2Reps: 0,
    sm2Ease: Math.max(MIN_EASE, (card.sm2Ease ?? DEFAULT_EASE) - 0.20),
    sm2Interval: 1,
    sm2NextReview: todayStr(),
    sm2Lapses: lapses,
    sm2Relearning: wasLearned,
  };
}

function applyHard(card) {
  const ease = card.sm2Ease ?? DEFAULT_EASE;
  const reps = Math.max(1, (card.sm2Reps ?? 0) + 1);
  const prev = card.sm2Interval ?? 1;
  const interval = Math.max(1, Math.round(calcInterval(reps, prev, ease) * 1.2));
  return { ...card, sm2Reps: reps, sm2Ease: Math.max(MIN_EASE, ease - 0.15), sm2Interval: interval, sm2NextReview: ensureNotDueToday(addDays(todayStr(), interval)), sm2Relearning: false };
}

function applyGood(card) {
  const ease = card.sm2Ease ?? DEFAULT_EASE;
  const reps = (card.sm2Reps ?? 0) + 1;
  const prev = card.sm2Interval ?? 1;
  const interval = calcInterval(reps, prev, ease);
  return { ...card, sm2Reps: reps, sm2Ease: ease, sm2Interval: interval, sm2NextReview: ensureNotDueToday(addDays(todayStr(), interval)), sm2Relearning: false };
}

function applyEasy(card) {
  const ease = card.sm2Ease ?? DEFAULT_EASE;
  const reps = (card.sm2Reps ?? 0) + 1;
  const prev = card.sm2Interval ?? 1;
  const interval = Math.round(calcInterval(reps, prev, ease) * 1.3);
  return { ...card, sm2Reps: reps, sm2Ease: Math.min(3.0, ease + 0.15), sm2Interval: interval, sm2NextReview: ensureNotDueToday(addDays(todayStr(), interval)), sm2Relearning: false };
}

function isNew(card) { return !card.sm2IntroducedDate; }
function isDueReview(card) { if (isNew(card)) return false; return card.sm2NextReview <= todayStr(); }

function calcStreak(reviewLog) {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const d = cursor.toISOString().slice(0, 10);
    if (!reviewLog[d]) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function buildDueCards(filteredCards, newCardsRemaining, today) {
  const relearningCards = filteredCards.filter((c) => c.sm2Relearning === true);
  const dueReviewCards = filteredCards.filter((c) => !c.sm2Relearning && isDueReview(c));
  const newCardsForToday = filteredCards.filter(isNew).slice(0, newCardsRemaining);
  return [...relearningCards, ...dueReviewCards, ...newCardsForToday];
}

export function useFlashcards() {
  const saved = loadAppData();
  const [cards, setCards] = useState(saved?.cards ?? []);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [stats, setStats] = useState(saved?.stats ?? {});
  const [studyMode, setStudyMode] = useState(null);
  const [sessionQueue, setSessionQueue] = useState([]);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [newCardsLimit, setNewCardsLimit] = useState(saved?.newCardsLimit ?? DEFAULT_NEW_LIMIT);
  const [reviewLog, setReviewLog] = useState(saved?.reviewLog ?? {});
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...saved?.settings });
  const [gamification, setGamification] = useState({ ...DEFAULT_GAMIFICATION, ...saved?.gamification });
  const [sessionHistory, setSessionHistory] = useState(saved?.sessionHistory ?? []);
  const [examAnswers, setExamAnswers] = useState([]);
  const [examFinished, setExamFinished] = useState(false);
  const sessionStartRef = useRef(null);

  const today = todayStr();
  const POINTS_CORRECT = 10;
  const POINTS_WRONG = 5;

  useEffect(() => {
    saveAppData({ cards, stats, reviewLog, settings, gamification, sessionHistory, newCardsLimit });
  }, [cards, stats, reviewLog, settings, gamification, sessionHistory, newCardsLimit]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const categories = ['Todos', ...new Set(cards.map((c) => c.category).filter(Boolean))];
  const filteredCards = selectedCategory === 'Todos' ? cards : cards.filter((c) => c.category === selectedCategory);

  const newIntroducedToday = filteredCards.filter((c) => c.sm2IntroducedDate === today).length;
  const newCardsRemaining = Math.max(0, newCardsLimit - newIntroducedToday);
  const dueCards = buildDueCards(filteredCards, newCardsRemaining, today);
  const relearningCards = filteredCards.filter((c) => c.sm2Relearning === true);
  const errorCards = filteredCards.filter((c) => c.firstAttemptResult === 'wrong' || c.sm2Relearning);

  function cardsForMode(mode) {
    switch (mode) {
      case 'review':
        return dueCards;
      case 'errors':
        return errorCards;
      case 'exam':
        return filteredCards;
      default:
        return filteredCards;
    }
  }

  const sessionCards = studyMode === 'exam'
    ? filteredCards
    : sessionQueue.map((id) => cards.find((c) => c.id === id)).filter(Boolean);

  const sessionComplete = sessionFinished
    || (studyMode && studyMode !== 'exam' && sessionQueue.length > 0 && currentCard >= sessionCards.length);

  const activeCard = sessionComplete ? null : (sessionCards[currentCard] ?? null);
  const reviewMode = studyMode === 'review';

  const totalCorrect = Object.values(stats).reduce((a, i) => a + i.correct, 0);
  const totalWrong = Object.values(stats).reduce((a, i) => a + i.wrong, 0);
  const totalScore = Object.values(stats).reduce((a, i) => a + i.score, 0);
  const totalReviews = Object.values(reviewLog).reduce((a, b) => a + b, 0);
  const streak = calcStreak(reviewLog);

  const attemptedCards = cards.filter((c) => c.firstAttemptResult !== undefined);
  const retentionRate = attemptedCards.length > 0
    ? Math.round((attemptedCards.filter((c) => c.firstAttemptResult === 'correct').length / attemptedCards.length) * 100)
    : null;

  const progress = sessionCards.length > 0
    ? Math.round(((Math.min(currentCard + 1, sessionCards.length)) / sessionCards.length) * 100)
    : 0;

  const insights = computeInsights({ cards, stats, reviewLog, sessionHistory });

  function initSm2Fields(card) {
    return { sm2Reps: 0, sm2Ease: DEFAULT_EASE, sm2Interval: 1, sm2NextReview: todayStr(), ...card };
  }

  function addCard({ question, answer, category }) {
    const newCard = initSm2Fields({ id: Date.now(), question, answer, category });
    setCards((prev) => [...prev, newCard]);
    setStats((prev) => ({ ...prev, [category]: prev[category] ?? { correct: 0, wrong: 0, score: 0 } }));
  }

  function addCards(newCards, markImported = false) {
    const ts = Date.now();
    const prepared = newCards.map((c, i) => initSm2Fields({ ...c, id: ts + i }));
    setCards((prev) => [...prev, ...prepared]);
    setStats((prev) => {
      const updated = { ...prev };
      for (const c of prepared) {
        if (!updated[c.category]) updated[c.category] = { correct: 0, wrong: 0, score: 0 };
      }
      return updated;
    });
    if (markImported) {
      setGamification((g) => {
        const achievements = checkAchievements({ ...g, achievements: g.achievements, importedDeck: true, totalReviews, streak, retentionRate: retentionRate ?? 0, dailyGoal: settings.dailyGoal, dailyReviewsToday: g.dailyReviewsToday, level: g.level, reviewedLeech: false });
        return { ...g, achievements };
      });
    }
  }

  function editCard(id, updates) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }

  function goToNext() {
    setFlipped(false);
    if (studyMode === 'exam' && currentCard < sessionCards.length - 1) {
      setCurrentCard((p) => p + 1);
    } else if (studyMode !== 'exam') {
      setCurrentCard((p) => (p < sessionCards.length - 1 ? p + 1 : p));
    }
  }

  function goToPrevious() {
    setFlipped(false);
    setCurrentCard((p) => (p > 0 ? p - 1 : p));
  }

  function changeCategory(category) {
    setSelectedCategory(category);
    setCurrentCard(0);
    setFlipped(false);
  }

  function toggleFlip() {
    if (studyMode === 'exam') return;
    setFlipped((p) => !p);
  }

  function endSession() {
    if (sessionStartRef.current) {
      const durationMs = Date.now() - sessionStartRef.current;
      const reviewed = sessionFinished ? sessionQueue.length : currentCard + 1;
      setSessionHistory((prev) => [...prev, { date: new Date().toISOString(), durationMs, mode: studyMode, cardsReviewed: reviewed }]);
      sessionStartRef.current = null;
    }
    setStudyMode(null);
    setSessionQueue([]);
    setSessionFinished(false);
    setCurrentCard(0);
    setFlipped(false);
    setExamFinished(false);
    setExamAnswers([]);
  }

  function startMode(mode) {
    const queue = cardsForMode(mode).map((c) => c.id);
    setStudyMode(mode);
    setSessionQueue(mode === 'exam' ? [] : queue);
    setSessionFinished(false);
    setCurrentCard(0);
    setFlipped(false);
    setExamFinished(false);
    setExamAnswers([]);
    sessionStartRef.current = Date.now();
  }

  const startReview = () => startMode('review');
  const startErrors = () => startMode('errors');
  const startExam = () => startMode('exam');
  const stopReview = endSession;

  function finishExam() {
    if (sessionStartRef.current) {
      const durationMs = Date.now() - sessionStartRef.current;
      setSessionHistory((prev) => [...prev, { date: new Date().toISOString(), durationMs, mode: 'exam', cardsReviewed: examAnswers.length + 1 }]);
      sessionStartRef.current = null;
    }
    setExamFinished(true);
    setStudyMode(null);
  }

  function closeExamResults() {
    setExamFinished(false);
    setExamAnswers([]);
    setCurrentCard(0);
  }

  function recordExamAnswer(correct) {
    if (!activeCard) return;
    setExamAnswers((prev) => [...prev, { cardId: activeCard.id, correct }]);
    goToNext();
  }

  function applyGamification(rating, isCorrect) {
    const xpGain = xpForRating(rating);
    setGamification((g) => {
      const isNewDay = g.lastStudyDate !== today;
      const dailyReviewsToday = isNewDay ? 1 : g.dailyReviewsToday + 1;
      const xp = g.xp + xpGain;
      const level = levelFromXp(xp);
      const achievements = checkAchievements({
        achievements: g.achievements,
        totalReviews: totalReviews + 1,
        streak,
        retentionRate: retentionRate ?? 0,
        dailyGoal: settings.dailyGoal,
        dailyReviewsToday,
        level,
        reviewedLeech: false,
        importedDeck: false,
      });
      return { ...g, xp, level, dailyReviewsToday, lastStudyDate: today, achievements };
    });
  }

  function rate(applyFn, isCorrect, rating) {
    if (!activeCard || studyMode === 'exam' || sessionComplete) return;

    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== activeCard.id) return c;
        const updated = applyFn(c);
        if (!c.sm2IntroducedDate) updated.sm2IntroducedDate = today;
        if (c.firstAttemptResult === undefined) updated.firstAttemptResult = isCorrect ? 'correct' : 'wrong';
        return updated;
      })
    );

    setReviewLog((prev) => ({ ...prev, [today]: (prev[today] ?? 0) + 1 }));
    setStats((prev) => {
      const cur = prev[activeCard.category] ?? { correct: 0, wrong: 0, score: 0 };
      return {
        ...prev,
        [activeCard.category]: {
          correct: cur.correct + (isCorrect ? 1 : 0),
          wrong: cur.wrong + (isCorrect ? 0 : 1),
          score: Math.max(0, cur.score + (isCorrect ? POINTS_CORRECT : -POINTS_WRONG)),
        },
      };
    });

    applyGamification(rating, isCorrect);

    const isLast = currentCard >= sessionCards.length - 1;
    if (isLast) {
      setSessionFinished(true);
      setFlipped(false);
    } else {
      goToNext();
    }
  }

  const markAgain = () => rate(applyAgain, false, 'again');
  const markHard = () => rate(applyHard, true, 'hard');
  const markGood = () => rate(applyGood, true, 'good');
  const markEasy = () => rate(applyEasy, true, 'easy');
  const markCorrect = markGood;
  const markWrong = markAgain;

  function updateSettings(partial) {
    if ('geminiApiKey' in partial) {
      saveGeminiApiKey(partial.geminiApiKey ?? '');
    }
    setSettings((s) => ({ ...s, ...partial }));
  }

  function completeOnboarding() {
    updateSettings({ onboardingDone: true });
  }

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'pt-BR';
    utter.rate = settings.handsFree ? 0.9 : 1;
    window.speechSynthesis.speak(utter);
  }, [settings.handsFree]);

  return {
    activeCard, filteredCards, sessionCards, dueCards, categories, selectedCategory,
    currentCard, flipped, stats, totalCorrect, totalWrong, totalScore, progress,
    reviewMode, studyMode, sessionFinished, sessionComplete, newCardsLimit, newCardsRemaining, newIntroducedToday,
    setNewCardsLimit, reviewLog, retentionRate, relearningCards, errorCards,
    addCard, addCards, editCard, goToNext, goToPrevious,
    markAgain, markHard, markGood, markEasy, markCorrect, markWrong,
    changeCategory, toggleFlip, startReview, stopReview,
    startErrors, startExam, finishExam,
    examAnswers, examFinished, recordExamAnswer, closeExamResults,
    settings, updateSettings, completeOnboarding,
    gamification, insights, streak, totalReviews, sessionHistory,
    speak,
  };
}
