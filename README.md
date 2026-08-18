# Agent Ask

> A privacy-first PWA that turns vague ideas into crystal-clear prompts. Bring your own API key — no server, no signup, no data collection.

**Live Demo: [agent-ask.pages.dev](https://agent-ask.pages.dev/)**

---

## What It Does

Agent Ask is an AI-powered requirements clarification assistant. Instead of writing prompts directly, you describe a rough idea and the AI asks you targeted questions one at a time. After a few rounds of Q&A, type **Accept** to receive a polished, ready-to-use prompt.

**The flow:**

1. Describe what you want to build
2. AI asks a focused clarification question with selectable options
3. Pick an option (or write your own answer)
4. Repeat until requirements are clear
5. Type `Accept` to get the optimized prompt + implementation notes

---

## Key Features

- **Zero Backend** — Pure static PWA. Your browser talks directly to the LLM provider. No proxy, no middleman.
- **Bring Your Own Key** — Your API key never leaves your browser (stored in localStorage). No account required.
- **Multi-Provider Support** — DeepSeek, OpenAI, Qwen, or any OpenAI-compatible endpoint.
- **True SSE Streaming** — Token-by-token rendering via fetch + ReadableStream (no Socket.IO).
- **Privacy First** — No analytics, no telemetry, no server-side logging. Your conversations stay in your browser.
- **PWA Installable** — Add to home screen on mobile/desktop. Works offline (cached shell).
- **File Attachments** — Drag and drop PDF, DOCX, or TXT files as context.

---

## Quick Start

### Prerequisites

- Node.js 18+ and npm

### Development

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Build for Production

```bash
cd frontend
npm run build
```

Output is in `frontend/dist/` — a fully static site ready to deploy anywhere.

---

## First-Time Setup

When you first open the app, the Settings dialog will prompt you to:

1. **Choose a provider** — DeepSeek, OpenAI, Qwen, or Custom
2. **Select a model** — Each provider has preset models to pick from
3. **Enter your API key** — Get one from the provider's platform (link provided in Settings)
4. **Test connection** — Verify everything works before saving

After that, you can start chatting immediately.

---

## Supported Providers

| Provider | API Endpoint | Preset Models | Get API Key |
|----------|-------------|---------------|-------------|
| DeepSeek | `api.deepseek.com` | deepseek-v4-flash, deepseek-v4-pro | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| OpenAI | `api.openai.com` | gpt-4o, gpt-4o-mini, gpt-4.1, o3-mini | [platform.openai.com](https://platform.openai.com/api-keys) |
| Qwen | `dashscope.aliyuncs.com/compatible-mode` | qwen-plus, qwen-max, qwen-turbo, qwq-32b | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/apiKey) |
| Custom | Your base URL | Your model ID | — |

All providers use the standard OpenAI `/v1/chat/completions` format. The Custom option works with any OpenAI-compatible API.

---

## Deployment

Since Agent Ask is a static PWA, you can host it on any static hosting platform.

### Cloudflare Pages (recommended)

The project includes a one-command deploy script:

```bash
cd frontend
npm run deploy
```

This runs `npm run build` followed by `wrangler pages deploy dist --project-name=agent-ask`. The first time you run it, you'll need to authenticate with `npx wrangler login`.

### Other platforms

| Platform | Command | Notes |
|----------|---------|-------|
| GitHub Pages | Push `frontend/dist/` to `gh-pages` branch | Set `base` in `vite.config.ts` if not deploying to root domain |
| Vercel | `vercel --prod` in `frontend/` | Zero config |
| Netlify | Drag `frontend/dist/` folder | Zero config |

---

## Tech Stack

**Frontend:**
- React 19 + TypeScript
- Vite 7 (build tool + dev server)
- Zustand (state management)
- Tailwind CSS (styling)
- vite-plugin-pwa (service worker + manifest)

**LLM Integration:**
- Native `fetch` + `ReadableStream` for SSE streaming
- No SDK dependency — just plain HTTP calls to OpenAI-compatible APIs

**No backend. No database. No server-side code.**

---

## Project Structure

```
agent_ask/
├── frontend/                  # The entire application (PWA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── chat/          # Chat UI (messages, input, loading)
│   │   │   ├── layout/        # Header
│   │   │   ├── settings/      # Settings modal
│   │   │   └── ui/            # Shared UI components
│   │   ├── services/
│   │   │   ├── llm.ts         # fetch + SSE streaming
│   │   │   ├── providers.ts   # Provider configurations
│   │   │   ├── promptTemplate.ts  # System prompt builder
│   │   │   └── fileParser.ts  # PDF/DOCX/TXT parsing
│   │   ├── store/
│   │   │   ├── chatStore.ts   # Chat state + streaming logic
│   │   │   └── settingsStore.ts   # Settings + localStorage
│   │   ├── types/
│   │   │   └── index.ts       # TypeScript type definitions
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/                # Static assets (icons)
│   ├── vite.config.ts         # Vite + PWA config
│   └── package.json
└── README.md
```

> The PWA in `frontend/` is fully self-contained — no backend, no server-side code.

---

## How It Works

```
┌──────────────────────────────────────────┐
│              Browser (PWA)               │
│                                          │
│  ┌──────────┐    ┌───────────────────┐   │
│  │ React UI │───▶│  LLM Service      │   │
│  │          │    │  (fetch + SSE)    │   │
│  └──────────┘    └────────┬──────────┘   │
│                           │              │
└───────────────────────────┼──────────────┘
                            │ HTTPS
                            ▼
               ┌────────────────────────┐
               │  LLM Provider API      │
               │  (DeepSeek/OpenAI/...) │
               └────────────────────────┘
```

1. User types a message
2. `buildApiMessages()` constructs the OpenAI-format messages array (system prompt + history)
3. `streamChat()` sends a POST request with `stream: true`
4. Response streams back via SSE — each token is rendered immediately
5. User can abort mid-stream (Stop button)

---

## Privacy

- Your API key is stored in `localStorage` on your device only
- All LLM requests go directly from your browser to the provider
- No proxy server, no analytics, no tracking
- Conversations exist only in browser memory (not persisted)

---

## License

MIT
---
> 🔒 **Available for freelance** — AI agents, LLM automation, Python/FastAPI backends, and full product builds. Reach me: [flint2026support@gmail.com](mailto:flint2026support@gmail.com)
