export const ACHIEVEMENTS = [
  { id: 'first_review', icon: '🎯', title: 'Primeiro passo', desc: 'Revisou o primeiro card' },
  { id: 'streak_3', icon: '🔥', title: 'Em chamas', desc: '3 dias seguidos estudando' },
  { id: 'streak_7', icon: '💪', title: 'Semana forte', desc: '7 dias seguidos estudando' },
  { id: 'retention_90', icon: '🧠', title: 'Memória de elefante', desc: '90% de retenção na 1ª tentativa' },
  { id: 'level_5', icon: '⭐', title: 'Veterano', desc: 'Alcançou nível 5' },
  { id: 'reviews_50', icon: '📚', title: 'Estudioso', desc: '50 revisões totais' },
  { id: 'reviews_100', icon: '🏆', title: 'Mestre', desc: '100 revisões totais' },
  { id: 'daily_goal', icon: '✅', title: 'Meta do dia', desc: 'Bateu a meta diária' },
  { id: 'import_deck', icon: '📄', title: 'Importador', desc: 'Importou um deck' },
];

export function xpForRating(rating) {
  const map = { again: 2, hard: 8, good: 12, easy: 18 };
  return map[rating] ?? 10;
}

export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(xp / 80)) + 1;
}

export function xpToNextLevel(xp) {
  const level = levelFromXp(xp);
  const nextThreshold = level * level * 80;
  const currentThreshold = (level - 1) * (level - 1) * 80;
  return { level, current: xp - currentThreshold, needed: nextThreshold - currentThreshold };
}

export function checkAchievements(ctx) {
  const unlocked = new Set(ctx.achievements);
  const add = (id) => unlocked.add(id);

  if (ctx.totalReviews >= 1) add('first_review');
  if (ctx.streak >= 3) add('streak_3');
  if (ctx.streak >= 7) add('streak_7');
  if (ctx.retentionRate >= 90) add('retention_90');
  if (ctx.level >= 5) add('level_5');
  if (ctx.totalReviews >= 50) add('reviews_50');
  if (ctx.totalReviews >= 100) add('reviews_100');
  if (ctx.dailyReviewsToday >= ctx.dailyGoal) add('daily_goal');
  if (ctx.importedDeck) add('import_deck');

  return [...unlocked];
}
