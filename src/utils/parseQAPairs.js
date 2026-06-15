// ─── Limpeza de uma linha ─────────────────────────────────────────────────────

function cleanLine(line) {
  return line
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}[,\s]+\d{1,2}:\d{2}/g, '')
    .replace(/%[0-9a-f]{2}/gi, '')
    .replace(/^[-–—]{2,}\s*$/, '')
    .trim();
}

// ─── Parser: divide por "Pergunta:" e "Resposta:" ─────────────────────────────

export function hasQAPairFormat(text) {
  return /\bPergunta\s*:/i.test(text) && /\bResposta\s*:/i.test(text);
}

export function parseQAPairs(rawText) {
  const blocks = rawText.split(/(?=\bPergunta\s*:)/i).filter(Boolean);
  const pairs = [];

  for (const block of blocks) {
    const respostaIdx = block.search(/\bResposta\s*:/i);
    if (respostaIdx === -1) continue;

    const question = block
      .slice(0, respostaIdx)
      .replace(/^\s*\bPergunta\s*:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    const answerRaw = block
      .slice(respostaIdx)
      .replace(/^\s*\bResposta\s*:\s*/i, '');

    const answerLines = answerRaw
      .split('\n')
      .map(cleanLine)
      .filter((l) => l.length > 0);

    const answer = answerLines.join('\n').trim();

    if (question.length > 5 && answer.length > 3) {
      pairs.push({ question, answer });
    }
  }

  return pairs;
}
