# Flash Study

App de flashcards com repetição espaçada (algoritmo SM-2), gamificação e importação de conteúdo. Desenvolvido para estudo eficiente de materiais em português.

## Funcionalidades

### Estudo
- **Revisão SM-2** — fila inteligente com cards vencidos, novos (limite diário) e reaprendizado
- **Modo prova** — simula prova sem revelar a resposta; resultado com percentual de acertos
- **Só erros** — revisa cards que você errou ou está reaprendendo
- **Modo foco** — tela cheia para estudar sem distrações (revisão e prova)
- Avaliação com 4 botões: De novo, Difícil, Bom, Fácil

### Conteúdo
- Criar cards manualmente (pergunta, resposta, categoria)
- **Importar DOCX** com formato `Pergunta:` / `Resposta:`
- **Colar texto** — extração automática do formato estruturado ou geração via IA
- **CSV / Excel** — colunas Pergunta, Resposta, Categoria
- **JSON** — array de cards ou `{ "cards": [...] }`
- **Compartilhar deck** — link para importar cards em outro navegador
- Sugestão automática de categoria por palavras-chave

### Extra
- Pontuação por categoria (+10 acerto, −5 erro)
- XP, níveis, metas diárias e conquistas
- Dashboard com insights, heatmap e ranking por categoria
- Dark mode, TTS e modo mãos livres
- Backup e restauração em JSON (Config)
- IA opcional com **Google Gemini** para gerar cards a partir de texto livre

## Tecnologias

- React 18 + Vite
- Tailwind CSS
- [mammoth](https://www.npmjs.com/package/mammoth) — leitura de DOCX
- [xlsx](https://www.npmjs.com/package/xlsx) — CSV e Excel
- API Gemini (opcional)

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm

## Instalação

```bash
git clone https://github.com/fariasangelica/flash-study.git
cd flash-study
npm install
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento em `http://localhost:5173` |
| `npm run dev -- --host` | Expõe na rede local (mesmo Wi‑Fi) |
| `npm run build` | Gera build de produção em `dist/` |
| `npm run preview` | Preview local do build |

## Uso rápido

1. **Criar** — aba lateral *Criar* para adicionar cards
2. **Importar** — DOCX, CSV/Excel, JSON ou colar texto (escolha a categoria antes)
3. **Estudar** — escolha um modo (Revisão, Prova, etc.) e use o **Modo foco** se quiser tela cheia
4. **Config** — chave Gemini, dark mode, backup JSON

### Formato DOCX / texto colado

```
Pergunta: Qual é a capital do Brasil?
Resposta: Brasília

Pergunta: Outra pergunta...
Resposta: Outra resposta
```

### Chave Gemini (opcional — individual por pessoa)

Cada usuário configura **a própria chave gratuita**:

1. Gere uma chave em [Google AI Studio](https://aistudio.google.com/apikey)
2. Cole em **Config → Sua chave Gemini**
3. A chave fica **só no navegador daquela pessoa** — não vai para GitHub, backup ou links de deck
4. Use **Importar → Colar texto** com material livre (sem formato Pergunta/Resposta)

## Publicar na internet

O `localhost` só funciona no seu computador. Para compartilhar com outras pessoas:

1. Suba o código no GitHub (já configurado neste repositório)
2. Conecte o repo na [Vercel](https://vercel.com) ou [Netlify](https://netlify.com)
3. Build: `npm run build` · pasta de saída: `dist`

> Os cards ficam no **localStorage** de cada navegador. A **chave Gemini não vai no backup JSON** — fica isolada no navegador. Para compartilhar conteúdo, use *Compartilhar deck*, envie o DOCX ou exporte o backup (sem chave).

## Estrutura do projeto

```
src/
├── components/   # UI (FlashCard, Dashboard, ImportHub, etc.)
├── hooks/        # Lógica (SM-2, importação, IA)
├── utils/        # Storage, gamificação, insights
└── App.jsx       # Orquestração principal
```

## Licença

Projeto privado — uso pessoal e educacional.
