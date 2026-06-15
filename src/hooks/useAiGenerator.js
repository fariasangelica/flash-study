import { useState } from 'react';

import { suggestCategory } from '../utils/categorySuggest';



const MODELS = [

  'gemini-2.5-flash',

  'gemini-2.5-flash-lite',

  'gemini-1.5-flash',

];



const CHUNK_SIZE = 6000;



function splitIntoChunks(text, size = CHUNK_SIZE) {

  if (text.length <= size) return [text];



  const chunks = [];

  let start = 0;



  while (start < text.length) {

    let end = Math.min(start + size, text.length);

    if (end < text.length) {

      const breakAt = text.lastIndexOf('\n', end);

      if (breakAt > start + size * 0.5) end = breakAt;

    }

    chunks.push(text.slice(start, end).trim());

    start = end;

  }



  return chunks.filter(Boolean);

}



function estimateCardCount(text) {

  return Math.min(40, Math.max(5, Math.ceil(text.length / 350)));

}



async function callGemini(apiKey, prompt, model) {

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;



  const res = await fetch(url, {

    method: 'POST',

    headers: {

      'Content-Type': 'application/json',

      'x-goog-api-key': apiKey.trim(),

    },

    body: JSON.stringify({

      contents: [{ parts: [{ text: prompt }] }],

      generationConfig: {

        responseMimeType: 'application/json',

        temperature: 0.5,

      },

    }),

  });



  const data = await res.json().catch(() => ({}));



  if (!res.ok) {

    const msg = data?.error?.message ?? `Erro HTTP ${res.status}`;

    const err = new Error(msg);

    err.status = res.status;

    err.isModelError = res.status === 404;

    throw err;

  }



  return data;

}



function parseCardsFromResponse(data) {

  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';



  try {

    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) return parsed;

    if (parsed.cards && Array.isArray(parsed.cards)) return parsed.cards;

  } catch {

    // tenta extrair JSON do texto

  }



  const jsonMatch = raw.match(/\[[\s\S]*\]/);

  if (!jsonMatch) throw new Error('A IA não retornou um formato válido. Tente com mais texto.');



  return JSON.parse(jsonMatch[0]);

}



async function generateChunk(apiKey, text, count) {

  const prompt = `Gere até ${count} flashcards em português a partir do trecho abaixo.

Retorne APENAS um JSON array válido, sem markdown, no formato:

[{"question":"pergunta aqui","answer":"resposta aqui"}]

Cada pergunta deve ser clara e a resposta concisa. Não repita cards.



Texto:

${text}`;



  let lastError = null;



  for (const model of MODELS) {

    try {

      const data = await callGemini(apiKey, prompt, model);

      const parsed = parseCardsFromResponse(data);



      if (!Array.isArray(parsed) || parsed.length === 0) {

        throw new Error('Nenhum card foi gerado neste trecho.');

      }



      return parsed;

    } catch (err) {

      lastError = err;

      if (err.isModelError) continue;

      if (err.status === 400 || err.status === 401 || err.status === 403) break;

    }

  }



  throw lastError ?? new Error('Erro ao gerar cards com a IA.');

}



function toCandidateCards(parsed, prefix) {

  return parsed.map((item, i) => ({

    id: `${prefix}-${i}`,

    question: item.question ?? item.pergunta ?? '',

    answer: item.answer ?? item.resposta ?? '',

    category: suggestCategory((item.question ?? '') + ' ' + (item.answer ?? '')),

    selected: true,

  })).filter((c) => c.question && c.answer);

}



export function useAiGenerator() {

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);

  const [progress, setProgress] = useState(null);



  async function generateFromText(text, apiKey, count) {

    if (!apiKey?.trim()) {

      setError('Configure sua chave da API Gemini em Config → Chave API Gemini.');

      return [];

    }



    const trimmed = text.trim();

    if (!trimmed) return [];



    setIsLoading(true);

    setError(null);

    setProgress(null);



    try {

      const totalCount = count ?? estimateCardCount(trimmed);

      const chunks = splitIntoChunks(trimmed);

      const perChunk = Math.max(3, Math.ceil(totalCount / chunks.length));

      const prefix = `ai-${Date.now()}`;

      const allCards = [];

      const seen = new Set();



      for (let i = 0; i < chunks.length; i++) {

        if (chunks.length > 1) {

          setProgress(`Gerando lote ${i + 1} de ${chunks.length}...`);

        }



        const parsed = await generateChunk(apiKey, chunks[i], perChunk);

        const cards = toCandidateCards(parsed, `${prefix}-${i}`);



        for (const card of cards) {

          const key = `${card.question}::${card.answer}`;

          if (!seen.has(key)) {

            seen.add(key);

            allCards.push(card);

          }

        }

      }



      if (allCards.length === 0) {

        throw new Error('Nenhum card foi gerado. Tente com mais conteúdo.');

      }



      return allCards;

    } catch (err) {

      setError(formatGeminiError(err));

      return [];

    } finally {

      setIsLoading(false);

      setProgress(null);

    }

  }



  return { isLoading, error, progress, generateFromText, setError };

}



function formatGeminiError(err) {

  if (!err) return 'Erro desconhecido ao chamar a API Gemini.';



  const msg = err.message ?? '';



  if (msg.includes('API key') || msg.includes('API_KEY') || err.status === 403) {

    return 'Chave API inválida ou sem permissão. Gere uma nova em aistudio.google.com/apikey';

  }

  if (err.status === 429 || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {

    return 'Limite de uso atingido. Aguarde alguns minutos ou verifique sua cota no Google AI Studio.';

  }

  if (msg.includes('no longer available') || err.status === 404) {

    return 'Modelo indisponível. Atualize o app — os modelos Gemini mudaram recentemente.';

  }

  if (err.message === 'Failed to fetch') {

    return 'Falha de conexão. Verifique sua internet ou se a chave API está correta.';

  }



  return msg;

}

