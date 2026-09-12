import React, { useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Code, Lightbulb, Compass, Zap, Bot } from 'lucide-react';
import { Message, Persona } from '../types/chat';
import { ChatMessage } from './ChatMessage';

interface ChatAreaProps {
  messages: Message[];
  persona: Persona;
  isStreaming: boolean;
  onSelectPrompt: (promptText: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  persona,
  isStreaming,
  onSelectPrompt,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-6">
          {/* Welcome Avatar & Title */}
          <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-2xl shadow-blue-500/25 mb-2">
            <span className="text-4xl">{persona?.avatar || '🤖'}</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Meet <span className="gradient-text">{persona?.name || 'NexusAI'}</span>
            </h2>
            <p className="text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
              {persona?.description || 'Your intelligent partner for code, strategy, writing, and research.'}
            </p>
          </div>

          {/* Quick Prompt Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-left">
            {persona?.suggestedPrompts?.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt)}
                className="group flex flex-col justify-between p-4 rounded-2xl bg-gray-900/80 hover:bg-gray-800/90 border border-gray-800 hover:border-blue-500/40 transition duration-200 shadow-md text-left"
              >
                <div className="flex items-center justify-between text-xs font-medium text-blue-400 mb-2">
                  <span>Prompt Idea</span>
                  <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition" />
                </div>
                <p className="text-xs text-gray-300 group-hover:text-white font-medium leading-normal">
                  "{prompt}"
                </p>
              </button>
            ))}
          </div>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 text-xs text-gray-500 font-medium border-t border-gray-800/80">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Real-Time Streaming</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Code className="w-4 h-4 text-blue-400" />
              <span>Rich Code Formatting</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>Multi-Persona System</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {messages.map((message, idx) => (
          <ChatMessage
            key={message.id}
            message={message}
            persona={persona}
            isLast={idx === messages.length - 1}
          />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
