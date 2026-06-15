const KEYWORDS = {
  marketing: ['marketing', 'engajamento', 'journey', 'cloud', 'salesforce', 'email', 'campanha'],
  tecnologia: ['api', 'código', 'software', 'sistema', 'dados', 'cloud', 'servidor', 'programa'],
  negocios: ['cliente', 'venda', 'receita', 'empresa', 'negócio', 'comercial', 'produto'],
  saude: ['paciente', 'diagnóstico', 'tratamento', 'medic', 'saúde', 'clínica'],
  idiomas: ['verbo', 'substantivo', 'tradução', 'inglês', 'português', 'vocabulário'],
};

export function suggestCategory(text) {
  const lower = text.toLowerCase();
  let best = { category: 'Geral', score: 0 };

  for (const [category, words] of Object.entries(KEYWORDS)) {
    const score = words.filter((w) => lower.includes(w)).length;
    if (score > best.score) best = { category: category.charAt(0).toUpperCase() + category.slice(1), score };
  }

  if (best.score === 0) {
    const firstWords = text.split(/\s+/).slice(0, 3).join(' ');
    if (firstWords.length > 3) return firstWords.slice(0, 30);
  }

  return best.category;
}
