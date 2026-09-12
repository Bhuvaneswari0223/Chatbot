# NexusAI - Professional AI Chatbot Workspace 🤖✨

NexusAI is a full-stack, enterprise-grade AI chatbot web application built with **React**, **TypeScript**, **Tailwind CSS**, and a **Node.js Express streaming backend**.

---

## 🌟 Key Features

- **🚀 Real-Time Token Streaming**: Real-time typewriter streaming response effect with latency & token usage metrics.
- **⚡ Dual AI Engine Mode**:
  - **Nexus Smart Core**: Built-in, zero-config intelligent reasoning engine that works immediately out of the box.
  - **Live API Key Integration**: On-demand custom **Google Gemini API** & **OpenAI API** key support via Settings modal.
- **🎭 Multi-Persona System**: Switch seamlessly between specialized assistant personas:
  - 💻 *Senior Full-Stack Architect*
  - 📊 *Data Scientist & AI Researcher*
  - ✍️ *Creative Content Director*
  - 📈 *Executive Startup Strategist*
  - 🤖 *General Assistant*
- **📝 Rich Markdown & Code Formatting**: Syntax-highlighted code blocks with language badge and one-click **Copy Code** button. Supports math formulas, lists, blockquotes, and tables.
- **🎙️ Voice Dictation & Text-to-Speech**: Web Speech API integration for hands-free voice dictation and audio message playback.
- **📁 Multimedia & Attachment Support**: Drag and drop or attach code files, text documents, and images.
- **🗂️ Conversation History Management**: Search, pin, rename, delete, and export chat conversations as Markdown files.
- **⚙️ Customizable Settings**: Adjust creativity temperature, max output tokens, theme, and API keys.

---

## 📁 Project Architecture

```
ai-chatbot/
├── server/
│   └── index.js              # Express backend server with SSE streaming endpoint
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Top navigation bar & model quick selector
│   │   ├── Sidebar.tsx       # Conversation drawer with search, pin, & rename
│   │   ├── ChatArea.tsx      # Conversation container & prompt suggestion cards
│   │   ├── ChatMessage.tsx   # Message rendering with code copy & speech synthesis
│   │   ├── ChatInput.tsx     # Auto-expanding prompt input, voice dictation, & files
│   │   ├── SettingsModal.tsx # API keys, temperature, & max token settings
│   │   └── PersonaSelectorModal.tsx # Assistant persona manager & system prompts
│   ├── constants/
│   │   └── defaults.ts       # Default models, personas, and default settings
│   ├── services/
│   │   └── aiService.ts      # Streaming AI API consumer & built-in Smart Engine
│   ├── types/
│   │   └── chat.ts           # TypeScript type declarations
│   ├── App.tsx               # Main application orchestration & state management
│   ├── main.tsx              # React entry point
│   └── index.css             # Tailwind CSS & glassmorphism styles
├── index.html                # Main HTML template
├── package.json              # Project dependencies and npm scripts
├── tailwind.config.js        # Tailwind CSS config
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite bundler & server proxy config
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Development Server
```bash
# Start frontend dev server (Vite)
npm run dev
```

### 3. Launch Backend Streaming Server (Optional for backend proxy mode)
```bash
npm run server
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🔑 Setting Up API Keys

Click on the **Settings Gear (⚙️)** in the top right header to enter:
- **Google Gemini API Key** ([Get your Gemini API Key](https://aistudio.google.com/app/apikey))
- **OpenAI API Key** ([Get your OpenAI API Key](https://platform.openai.com/api-keys))

*Note: If no API key is provided, NexusAI automatically runs using the built-in Nexus Smart Engine!*
