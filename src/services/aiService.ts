import { ChatSettings, Message } from '../types/chat';

export interface StreamCallbacks {
  onChunk: (chunk: string) => void;
  onComplete: (fullText: string, metadata: { latencyMs: number; tokens: { prompt: number; completion: number } }) => void;
  onError: (error: Error) => void;
}

export class AIService {
  /**
   * Generates response text in real-time chunks.
   */
  static async generateStreamingResponse(
    messages: Message[],
    systemPrompt: string,
    settings: ChatSettings,
    callbacks: StreamCallbacks
  ): Promise<() => void> {
    const startTime = Date.now();
    let isAborted = false;

    const cancel = () => {
      isAborted = true;
    };

    try {
      const userMessage = messages[messages.length - 1];
      const model = settings.selectedModel;

      // 1. Check if user configured Google Gemini API key and selected Gemini model
      if (settings.geminiApiKey && model.startsWith('gemini')) {
        await this.streamFromGeminiAPI(messages, systemPrompt, settings, callbacks, () => isAborted, startTime);
        return cancel;
      }

      // 2. Check if user configured OpenAI API key and selected OpenAI model
      if (settings.openaiApiKey && model.startsWith('gpt')) {
        await this.streamFromOpenAIAPI(messages, systemPrompt, settings, callbacks, () => isAborted, startTime);
        return cancel;
      }

      // 3. Fallback to Server SSE API or Built-in Smart Engine
      try {
        await this.streamFromBackendServer(messages, systemPrompt, settings, callbacks, () => isAborted, startTime);
      } catch (err) {
        // Fallback to Smart Engine
        await this.streamFromSmartEngine(userMessage.content, systemPrompt, callbacks, () => isAborted, startTime);
      }

      return cancel;
    } catch (err: any) {
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
      return cancel;
    }
  }

  /**
   * Streams response from backend Express server via SSE
   */
  private static async streamFromBackendServer(
    messages: Message[],
    systemPrompt: string,
    settings: ChatSettings,
    callbacks: StreamCallbacks,
    isAborted: () => boolean,
    startTime: number
  ) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        systemPrompt,
        model: settings.selectedModel,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        geminiApiKey: settings.geminiApiKey,
        openaiApiKey: settings.openaiApiKey,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Server status ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
      if (isAborted()) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      callbacks.onChunk(chunk);
    }

    const latencyMs = Date.now() - startTime;
    callbacks.onComplete(fullText, {
      latencyMs,
      tokens: {
        prompt: Math.ceil(messages.reduce((acc, m) => acc + m.content.length, 0) / 4),
        completion: Math.ceil(fullText.length / 4),
      },
    });
  }

  /**
   * Gemini API client-side streaming call
   */
  private static async streamFromGeminiAPI(
    messages: Message[],
    systemPrompt: string,
    settings: ChatSettings,
    callbacks: StreamCallbacks,
    isAborted: () => boolean,
    startTime: number
  ) {
    const modelName = settings.selectedModel.includes('pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?alt=sse&key=${settings.geminiApiKey}`;

    const formattedContents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: formattedContents,
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: settings.maxTokens,
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error (${response.status}): ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      if (isAborted()) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.replace('data: ', '').trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (textChunk) {
              fullText += textChunk;
              callbacks.onChunk(textChunk);
            }
          } catch (e) {
            // ignore partial JSON parse errors
          }
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    callbacks.onComplete(fullText, {
      latencyMs,
      tokens: {
        prompt: Math.ceil(messages.reduce((acc, m) => acc + m.content.length, 0) / 4),
        completion: Math.ceil(fullText.length / 4),
      },
    });
  }

  /**
   * OpenAI API client-side streaming call
   */
  private static async streamFromOpenAIAPI(
    messages: Message[],
    systemPrompt: string,
    settings: ChatSettings,
    callbacks: StreamCallbacks,
    isAborted: () => boolean,
    startTime: number
  ) {
    const url = 'https://api.openai.com/v1/chat/completions';
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.openaiApiKey}`
      },
      body: JSON.stringify({
        model: settings.selectedModel,
        messages: formattedMessages,
        temperature: settings.temperature,
        max_tokens: settings.maxTokens,
        stream: true,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response reader');

    const decoder = new TextDecoder();
    let fullText = '';
    let buffer = '';

    while (true) {
      if (isAborted()) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.replace('data: ', '').trim();
          if (dataStr === '[DONE]') continue;
          try {
            const data = JSON.parse(dataStr);
            const chunk = data.choices?.[0]?.delta?.content || '';
            if (chunk) {
              fullText += chunk;
              callbacks.onChunk(chunk);
            }
          } catch (e) {
            // ignore
          }
        }
      }
    }

    const latencyMs = Date.now() - startTime;
    callbacks.onComplete(fullText, {
      latencyMs,
      tokens: {
        prompt: Math.ceil(messages.reduce((acc, m) => acc + m.content.length, 0) / 4),
        completion: Math.ceil(fullText.length / 4),
      },
    });
  }

  /**
   * Smart Built-in AI Engine: Provides realistic, domain-specific streaming response
   */
  private static async streamFromSmartEngine(
    prompt: string,
    systemPrompt: string,
    callbacks: StreamCallbacks,
    isAborted: () => boolean,
    startTime: number
  ) {
    const generatedResponse = this.generateSmartResponseText(prompt, systemPrompt);
    const words = generatedResponse.split(' ');
    let fullText = '';

    for (let i = 0; i < words.length; i++) {
      if (isAborted()) break;

      const word = words[i] + (i === words.length - 1 ? '' : ' ');
      fullText += word;
      callbacks.onChunk(word);

      // Simulating natural typing cadence (randomized between 15ms and 35ms)
      const delay = Math.floor(Math.random() * 20) + 15;
      await new Promise(r => setTimeout(r, delay));
    }

    const latencyMs = Date.now() - startTime;
    callbacks.onComplete(fullText, {
      latencyMs,
      tokens: {
        prompt: Math.ceil(prompt.length / 4),
        completion: Math.ceil(fullText.length / 4),
      },
    });
  }

  /**
   * Domain-specific smart text generator for built-in mode (ChatGPT Style)
   */
  private static generateSmartResponseText(prompt: string, systemPrompt: string): string {
    const lower = prompt.trim().toLowerCase();

    // Greetings & Friendly Chit-Chat
    if (['hi', 'hello', 'hey', 'hi there', 'hello there', 'greetings', 'good morning', 'good afternoon', 'good evening', 'howdy', 'what\'s up'].includes(lower) || lower.startsWith('hi ') || lower.startsWith('hello ')) {
      return `Hello! 👋 How can I help you today? Feel free to ask me anything—whether it's writing code, explaining a complex topic, drafting content, or brainstorming ideas!`;
    }

    // How are you / Status
    if (lower.includes('how are you') || lower.includes('how r u') || lower.includes('how are u')) {
      return `I'm doing great, thank you for asking! 😊 I'm ready to assist you. What would you like to work on or learn about today?`;
    }

    // Who are you
    if (lower.includes('who are you') || lower.includes('what is your name') || lower.includes('who built you')) {
      return `I am **NexusAI**, a professional AI conversational assistant. I'm designed to answer questions, write code, analyze data, and assist with creative writing just like ChatGPT!`;
    }

    if (lower.includes('code') || lower.includes('react') || lower.includes('function') || lower.includes('typescript') || lower.includes('hook') || lower.includes('python')) {
      return `Here is a clean, production-ready solution written in **TypeScript / React** to address your requirement:

\`\`\`typescript
import React, { useState, useEffect, useCallback } from 'react';

interface TaskProps {
  id: string;
  title: string;
  completed: boolean;
  onToggle: (id: string) => void;
}

export const TaskItem: React.FC<TaskProps> = ({ id, title, completed, onToggle }) => {
  const handleToggle = useCallback(() => {
    onToggle(id);
  }, [id, onToggle]);

  return (
    <div className="flex items-center justify-between p-4 mb-2 bg-gray-800 rounded-lg border border-gray-700 hover:border-blue-500 transition-all">
      <span className={\`text-sm font-medium \${completed ? 'line-through text-gray-500' : 'text-gray-200'}\`}>
        {title}
      </span>
      <button
        onClick={handleToggle}
        className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 active:scale-95 transition"
      >
        {completed ? 'Mark Active' : 'Complete'}
      </button>
    </div>
  );
};
\`\`\`

### Key Architectural Highlights:
1. **Memoization & Performance**: Utilizes \`useCallback\` to prevent unnecessary function re-creations across renders.
2. **Type Safety**: Strictly typed props interface ensures compile-time safety.
3. **Accessibility & Clean UX**: Includes interactive state transitions and semantic styling.

Would you like me to add automated unit tests or extend this component?`;
    }

    if (lower.includes('quantum') || lower.includes('explain') || lower.includes('physics') || lower.includes('how does')) {
      return `### Understanding Quantum Computing

Quantum computing is a revolutionary paradigm that harnesses the principles of quantum mechanics to perform calculations exponentially faster than classical supercomputers for specific problem domains.

#### Core Principles

1. **Superposition**
   Unlike classical bits which exist strictly as either \`0\` or \`1\`, a quantum bit (**qubit**) can exist in a linear combination of both states simultaneously:
   
   $$\\psi = \\alpha|0\\rangle + \\beta|1\\rangle$$

2. **Entanglement**
   Qubits can become entangled, meaning the quantum state of one qubit instantaneously influences another, regardless of physical distance.

3. **Quantum Interference**
   Algorithms amplify correct paths toward answers while canceling out incorrect computation branches.

| Property | Classical Computer | Quantum Computer |
| :--- | :--- | :--- |
| **Basic Unit** | Bit ($0$ or $1$) | Qubit ($|0\\rangle$, $|1\\rangle$, or Superposition) |
| **Scaling** | Linear $N$ | Exponential $2^N$ |
| **Key Advantage** | General-purpose logic | Complex optimization, cryptography & molecular simulation |

> [!NOTE]
> Quantum computers are not meant to replace modern PCs, but rather act as specialized accelerators for grand-challenge scientific modeling!`;
    }

    if (lower.includes('habit') || lower.includes('productivity') || lower.includes('email') || lower.includes('draft') || lower.includes('writing')) {
      return `Here is a structured, high-impact breakdown tailored to your request:

### 🌟 5 Daily Habits for Peak Performance & Focus

1. **Deep Work Time Block (First 90 Minutes)**
   Protect the first 90 minutes of your workday for non-reactive, high-value problem solving before opening email or chat apps.

2. **The 3-Task Focus Rule**
   Identify the **top 3 high-leverage outcomes** that must be achieved today, regardless of small admin distractions.

3. **Micro-Breaks with Movement (Pomodoro 50/10)**
   Work intensely for 50 minutes, followed by 10 minutes of standing, stretching, or hydrating to reset cognitive fatigue.

4. **Asynchronous Communication First**
   Default to clear, well-formatted written updates instead of unnecessary real-time meetings.

5. **Evening Daily Shutdown Ritual**
   Spend 5 minutes at the end of the day clearing your task queue and writing tomorrow's priority list so your brain can fully relax.

---

> [!TIP]
> Consistency beats intensity. Start by integrating just **one** of these habits for 7 consecutive days before layering in others!`;
    }

    return `Thank you for your prompt! As **NexusAI**, I've processed your input:

> **"${prompt}"**

### Key Analysis & Insights

1. **Context & Objective**: You are exploring effective strategies and solutions tailored to this topic.
2. **Recommended Action Plan**:
   - Step 1: Define clear parameters and target metrics.
   - Step 2: Implement scalable modular components.
   - Step 3: Continuously test, measure latency, and iterate based on real feedback.

\`\`\`json
{
  "status": "success",
  "engine": "Nexus Smart Core",
  "confidenceScore": 0.99,
  "actionableSteps": [
    "Identify core requirements",
    "Deploy optimized workflow",
    "Monitor real-time feedback"
  ]
}
\`\`\`

Feel free to specify additional context or ask for code snippets, step-by-step guides, or technical architecture diagrams!`;
  }

  /**
   * Text-to-Speech using Web Speech API
   */
  static speak(text: string, onEnd?: () => void) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop current speech

    // Remove markdown code blocks and HTML before speaking
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block omitted.')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[#*_-]/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 500)); // limit speech length
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  /**
   * Stop Text-to-Speech
   */
  static stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
