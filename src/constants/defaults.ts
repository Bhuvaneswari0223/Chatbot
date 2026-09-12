import { AIModel, Persona, ChatSettings } from '../types/chat';

export const DEFAULT_MODELS: AIModel[] = [
  {
    id: 'nexus-smart-v1',
    name: 'Nexus Smart Core',
    provider: 'nexus-smart',
    description: 'High-speed built-in reasoning engine with zero setup required.',
    badge: 'Fast & Built-in',
    contextWindow: '128k tokens',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Google’s state-of-the-art fast multimodal model.',
    badge: 'Recommended',
    contextWindow: '1M tokens',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    description: 'Complex reasoning, deep analysis, and advanced coding task master.',
    badge: 'Pro Reasoning',
    contextWindow: '2M tokens',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'OpenAI high-intelligence model for general purpose & vision.',
    badge: 'OpenAI flagship',
    contextWindow: '128k tokens',
  },
];

export const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'general',
    name: 'General Assistant',
    description: 'Versatile, friendly, and knowledgeable AI assistant for any query.',
    avatar: '🤖',
    category: 'General',
    systemPrompt: 'You are NexusAI, a professional, helpful, accurate, and empathetic AI assistant. Answer queries clearly with clear formatting.',
    suggestedPrompts: [
      'Explain quantum computing in simple terms',
      'What are 5 effective daily habits for productivity?',
      'Help me draft an email to request a project deadline extension',
      'Summarize the core principles of design thinking'
    ]
  },
  {
    id: 'senior-dev',
    name: 'Senior Full-Stack Architect',
    description: 'Specialist in modern web dev, clean code, refactoring, system design & security.',
    avatar: '💻',
    category: 'Coding',
    systemPrompt: 'You are a Principal Software Architect with 15+ years of experience. Write clean, production-grade code, follow SOLID principles, explain performance tradeoffs, and provide runnable code blocks with explanations.',
    suggestedPrompts: [
      'Refactor this React hook for better performance',
      'Design a scalable microservices architecture for real-time chat',
      'Explain how Python asyncio event loop works under the hood',
      'Write a TypeScript helper for robust API rate-limiting'
    ]
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist & AI Researcher',
    description: 'Expert in Python pandas, PyTorch, ML algorithms, statistics, and visualizations.',
    avatar: '📊',
    category: 'Academic',
    systemPrompt: 'You are a Senior Data Scientist and Machine Learning Researcher. Provide rigorous analytical explanations, code in Python/Pandas/PyTorch, and format equations using clear mathematical notation.',
    suggestedPrompts: [
      'Explain the math behind Transformer Attention mechanism',
      'Write a Python script to clean and normalize a pandas DataFrame',
      'Compare Random Forest vs XGBoost hyperparameter tuning strategies',
      'How do I calculate confidence intervals for A/B testing?'
    ]
  },
  {
    id: 'creative-writer',
    name: 'Creative Content Director',
    description: 'Specialist in storytelling, copy editing, viral headlines, and brand voice.',
    avatar: '✍️',
    category: 'Writing',
    systemPrompt: 'You are an award-winning Content Director and Creative Writer. Help write engaging, impactful copy, stories, script outlines, and marketing campaigns.',
    suggestedPrompts: [
      'Write a compelling pitch for a SaaS product launch',
      'Craft 5 magnetic headlines for a tech article on AI automation',
      'Review and polish this introduction paragraph to be more punchy',
      'Draft a YouTube video script outline for a developer tutorial'
    ]
  },
  {
    id: 'business-advisor',
    name: 'Executive Startup Strategist',
    description: 'Expert in startup strategy, product management, pitch decks, and financial analysis.',
    avatar: '📈',
    category: 'Business',
    systemPrompt: 'You are an Executive Business Advisor and former YC Partner. Provide strategic, actionable business advice, SWOT analysis, and financial strategy.',
    suggestedPrompts: [
      'Analyze the TAM, SAM, and SOM for an AI dev tools startup',
      'Draft a 1-page executive summary for an investor pitch deck',
      'How to structure a freemium pricing strategy for B2B SaaS?',
      'Create a KPI framework for tracking customer churn & LTV'
    ]
  }
];

export const DEFAULT_SETTINGS: ChatSettings = {
  geminiApiKey: '',
  openaiApiKey: '',
  selectedModel: 'nexus-smart-v1',
  selectedPersonaId: 'general',
  temperature: 0.7,
  maxTokens: 2048,
  webSearchEnabled: false,
  autoSpeak: false,
  theme: 'dark',
  fontSize: 'md',
};
