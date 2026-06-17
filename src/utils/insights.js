export function computeInsights({ cards, stats, reviewLog, sessionHistory }) {
  const categories = [...new Set(cards.map((c) => c.category).filter(Boolean))];

  const categoryRanking = categories
    .map((cat) => {
      const s = stats[cat] ?? { correct: 0, wrong: 0, score: 0 };
      const total = s.correct + s.wrong;
      const rate = total > 0 ? Math.round((s.correct / total) * 100) : 100;
      const catCards = cards.filter((c) => c.category === cat);
      const due = catCards.filter((c) => {
        if (!c.sm2IntroducedDate) return true;
        if (c.sm2Relearning) return true;
        const today = new Date();
        const todayLocal = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return c.sm2NextReview && c.sm2NextReview <= todayLocal;
      }).length;
      return { category: cat, rate, wrong: s.wrong, correct: s.correct, due, score: s.score };
    })
    .sort((a, b) => a.rate - b.rate);

  const worstCategories = categoryRanking.slice(0, 3).filter((c) => c.correct + c.wrong > 0);

  const difficultCards = cards
    .filter((c) => (c.sm2Lapses ?? 0) > 0)
    .sort((a, b) => (b.sm2Lapses ?? 0) - (a.sm2Lapses ?? 0))
    .slice(0, 5)
    .map((c) => ({
      id: c.id,
      question: c.question.slice(0, 60) + (c.question.length > 60 ? '...' : ''),
      category: c.category,
      lapses: c.sm2Lapses ?? 0,
    }));

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentSessions = (sessionHistory ?? []).filter(
    (s) => new Date(s.date) >= weekAgo
  );
  const avgSessionMin =
    recentSessions.length > 0
      ? Math.round(
          recentSessions.reduce((a, s) => a + s.durationMs, 0) /
            recentSessions.length /
            60000
        )
      : 0;

  const recommendation = categoryRanking.find((c) => c.due > 0) ?? categoryRanking[0];

  const totalReviews = Object.values(reviewLog).reduce((a, b) => a + b, 0);

  return {
    worstCategories,
    difficultCards,
    avgSessionMin,
    recommendation,
    totalReviews,
    categoryRanking,
  };
}
