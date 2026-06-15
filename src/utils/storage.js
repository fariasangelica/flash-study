const STORAGE_KEY = 'flashstudy_app_v1';
const GEMINI_KEY_STORAGE = 'flashstudy_gemini_key_v1';

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

/** Remove dados sensíveis antes de salvar, exportar ou compartilhar. */
export function stripSensitiveSettings(settings = {}) {
  const { geminiApiKey, ...safe } = settings;
  return safe;
}

export function loadGeminiApiKey() {
  try {
    return localStorage.getItem(GEMINI_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function saveGeminiApiKey(key) {
  try {
    if (key?.trim()) {
      localStorage.setItem(GEMINI_KEY_STORAGE, key.trim());
    } else {
      localStorage.removeItem(GEMINI_KEY_STORAGE);
    }
  } catch (e) {
    console.error('Erro ao salvar chave Gemini:', e);
  }
}

function migrateLegacyGeminiKey(settings) {
  const legacyKey = settings?.geminiApiKey?.trim();
  if (!legacyKey) return settings;

  saveGeminiApiKey(legacyKey);
  return stripSensitiveSettings(settings);
}

export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    const safeSettings = migrateLegacyGeminiKey(data.settings ?? {});

    if (data.settings?.geminiApiKey) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, settings: safeSettings }));
    }

    return {
      ...data,
      settings: {
        ...DEFAULT_SETTINGS,
        ...safeSettings,
        geminiApiKey: loadGeminiApiKey(),
      },
    };
  } catch {
    return null;
  }
}

export function saveAppData(data) {
  try {
    const geminiKey = data.settings?.geminiApiKey;
    if (geminiKey !== undefined) {
      saveGeminiApiKey(geminiKey);
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...data,
        settings: stripSensitiveSettings(data.settings),
      })
    );
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

export function exportAppData(data) {
  return JSON.stringify(
    {
      ...data,
      settings: stripSensitiveSettings(data.settings),
    },
    null,
    2
  );
}

export function importAppData(json) {
  const parsed = JSON.parse(json);
  // Nunca importa chave de outra pessoa — mantém só a chave local deste dispositivo
  const safeSettings = stripSensitiveSettings(parsed.settings ?? {});

  saveAppData({
    ...parsed,
    settings: safeSettings,
  });

  return {
    ...parsed,
    settings: {
      ...DEFAULT_SETTINGS,
      ...safeSettings,
      geminiApiKey: loadGeminiApiKey(),
    },
  };
}

/** Chave Gemini: exclusiva deste navegador/dispositivo. Não entra em backup, deck ou GitHub. */
export function isGeminiKeyConfigured() {
  return loadGeminiApiKey().trim().length > 0;
}
