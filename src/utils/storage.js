const STORAGE_KEY = 'flashstudy_app_v1';

export const DEFAULT_SETTINGS = {
  darkMode: false,
  dailyGoal: 20,
  geminiApiKey: '',
  onboardingDone: false,
  handsFree: false,
};

export const DEFAULT_GAMIFICATION = {
  xp: 0,
  level: 1,
  achievements: [],
  dailyReviewsToday: 0,
  lastStudyDate: null,
};

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

export function exportAppData(data) {
  return JSON.stringify(data, null, 2);
}

export function importAppData(json) {
  const parsed = JSON.parse(json);
  saveAppData(parsed);
  return parsed;
}
