export type Role = 'user' | 'assistant' | 'system';

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'text' | 'pdf' | 'code';
  url?: string;
  content?: string;
  size?: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  latencyMs?: number;
  tokens?: {
    prompt: number;
    completion: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  modelId: string;
  personaId: string;
  pinned?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: 'General' | 'Coding' | 'Business' | 'Writing' | 'Academic';
  systemPrompt: string;
  suggestedPrompts: string[];
}

export interface AIModel {
  id: string;
  name: string;
  provider: 'gemini' | 'openai' | 'nexus-smart';
  description: string;
  badge: string;
  contextWindow: string;
}

export interface ChatSettings {
  geminiApiKey: string;
  openaiApiKey: string;
  selectedModel: string;
  selectedPersonaId: string;
  temperature: number;
  maxTokens: number;
  webSearchEnabled: boolean;
  autoSpeak: boolean;
  theme: 'dark' | 'light' | 'system';
  fontSize: 'sm' | 'md' | 'lg';
}
