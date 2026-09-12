import React, { useState } from 'react';
import { 
  Bot, 
  User, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Cpu, 
  FileText, 
  Paperclip 
} from 'lucide-react';
import { Message, Persona } from '../types/chat';
import { AIService } from '../services/aiService';

interface ChatMessageProps {
  message: Message;
  persona: Persona;
  isLast: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, persona, isLast }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopyCode = (codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCode(codeText);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      AIService.stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      AIService.speak(message.content, () => setIsSpeaking(false));
    }
  };

  const formatTimestamp = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`group flex space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-2xl transition-all ${
        isUser
          ? 'bg-gray-900/60 border border-gray-800/60 ml-4 sm:ml-12'
          : 'bg-[#111827]/80 border border-gray-800/90 shadow-lg shadow-black/20 mr-2 sm:mr-8'
      }`}
    >
      {/* Avatar Icon */}
      <div className="flex-shrink-0">
        {isUser ? (
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-gray-700 to-gray-600 border border-gray-500/30 text-white shadow">
            <User className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/20 text-lg">
            {persona?.avatar || <Bot className="w-5 h-5" />}
          </div>
        )}
      </div>

      {/* Message Body Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header line */}
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-200">
              {isUser ? 'You' : (persona?.name || 'NexusAI')}
            </span>
            <span className="text-[10px] text-gray-500">
              {formatTimestamp(message.timestamp)}
            </span>
          </div>

          {/* Message controls */}
          {!isUser && message.content && (
            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition">
              <button
                onClick={handleToggleSpeak}
                className={`p-1 rounded-md hover:bg-gray-800 ${isSpeaking ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                title={isSpeaking ? 'Stop reading' : 'Read message aloud'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Attachment chips */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1 pb-2">
            {message.attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-800/80 rounded-lg border border-gray-700 text-xs text-gray-200"
              >
                <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-medium truncate max-w-[180px]">{att.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Formatted Text Content */}
        <div className="text-sm text-gray-200 leading-relaxed space-y-3 break-words">
          {renderFormattedText(message.content, handleCopyCode, copiedCode, message.status === 'streaming')}
        </div>

        {/* Metadata Footer: Latency & Tokens */}
        {!isUser && (message.latencyMs || message.tokens) && message.status === 'complete' && (
          <div className="flex items-center space-x-3 pt-2 text-[10px] text-gray-500 font-mono border-t border-gray-800/40">
            {message.latencyMs && (
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{(message.latencyMs / 1000).toFixed(2)}s latency</span>
              </div>
            )}
            {message.tokens && (
              <div className="flex items-center space-x-1">
                <Cpu className="w-3 h-3 text-gray-400" />
                <span>{message.tokens.completion} tokens</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Custom text parser to render Markdown code blocks, tables, math, lists, and inline formatting
 */
function renderFormattedText(
  text: string, 
  onCopy: (code: string) => void, 
  copiedCode: string | null,
  isStreaming: boolean
) {
  if (!text) return null;

  // Split code blocks ```lang ... ```
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const firstLineEnd = part.indexOf('\n');
      const language = part.slice(3, firstLineEnd > 0 ? firstLineEnd : 3).trim() || 'plaintext';
      const codeContent = firstLineEnd > 0 ? part.slice(firstLineEnd + 1, -3).trim() : part.slice(3, -3).trim();

      const isCopied = copiedCode === codeContent;

      return (
        <div key={index} className="my-3 rounded-xl overflow-hidden border border-gray-800 bg-[#0a0d14] shadow-md">
          {/* Code Header Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900/90 border-b border-gray-800 text-xs">
            <span className="font-mono font-medium text-blue-400 uppercase tracking-wider text-[11px]">
              {language}
            </span>
            <button
              onClick={() => onCopy(codeContent)}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition text-[11px]"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
          {/* Code body */}
          <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-200 leading-relaxed bg-[#0a0d14]">
            <code>{codeContent}</code>
          </pre>
        </div>
      );
    }

    // Process line-by-line formatting (Headers, Lists, Blockquotes)
    const lines = part.split('\n');
    return (
      <React.Fragment key={index}>
        {lines.map((line, lIdx) => {
          // Blockquote (> [!NOTE] or > text)
          if (line.startsWith('>')) {
            return (
              <blockquote key={lIdx} className="pl-3 py-1 my-1 border-l-4 border-blue-500 bg-blue-500/5 text-gray-300 text-xs rounded-r-md">
                {formatInlineMarkdown(line.replace(/^>\s?/, ''))}
              </blockquote>
            );
          }
          // Headers (#, ##, ###)
          if (line.startsWith('### ')) {
            return <h3 key={lIdx} className="text-base font-semibold text-white pt-2 pb-1">{formatInlineMarkdown(line.slice(4))}</h3>;
          }
          if (line.startsWith('## ')) {
            return <h2 key={lIdx} className="text-lg font-bold text-white pt-3 pb-1 border-b border-gray-800">{formatInlineMarkdown(line.slice(3))}</h2>;
          }
          if (line.startsWith('# ')) {
            return <h1 key={lIdx} className="text-xl font-extrabold text-white pt-3 pb-1">{formatInlineMarkdown(line.slice(2))}</h1>;
          }
          // Bullet list (* or -)
          if (line.match(/^[\*\-]\s/)) {
            return (
              <div key={lIdx} className="flex items-start space-x-2 pl-2 my-0.5">
                <span className="text-blue-400 text-base leading-none">•</span>
                <span>{formatInlineMarkdown(line.replace(/^[\*\-]\s/, ''))}</span>
              </div>
            );
          }
          // Numbered list
          if (line.match(/^\d+\.\s/)) {
            const match = line.match(/^(\d+)\.\s(.*)/);
            if (match) {
              return (
                <div key={lIdx} className="flex items-start space-x-2 pl-2 my-0.5">
                  <span className="font-mono text-xs text-blue-400 font-semibold">{match[1]}.</span>
                  <span>{formatInlineMarkdown(match[2])}</span>
                </div>
              );
            }
          }
          // Regular line
          return (
            <p key={lIdx} className={line.trim() === '' ? 'h-2' : ''}>
              {formatInlineMarkdown(line)}
              {isStreaming && index === parts.length - 1 && lIdx === lines.length - 1 && (
                <span className="typing-cursor ml-0.5" />
              )}
            </p>
          );
        })}
      </React.Fragment>
    );
  });
}

/**
 * Formats bold **text**, inline `code`, and math $eq$
 */
function formatInlineMarkdown(text: string) {
  // Replace inline `code`
  const codeSplit = text.split(/(`[^`]+`)/g);

  return codeSplit.map((chunk, cIdx) => {
    if (chunk.startsWith('`') && chunk.endsWith('`')) {
      return (
        <code key={cIdx} className="px-1.5 py-0.5 mx-0.5 rounded bg-gray-800 text-blue-300 font-mono text-xs border border-gray-700">
          {chunk.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    const boldSplit = chunk.split(/(\*\*[^\*]+\*\*)/g);
    return boldSplit.map((sub, sIdx) => {
      if (sub.startsWith('**') && sub.endsWith('**')) {
        return <strong key={sIdx} className="font-semibold text-white">{sub.slice(2, -2)}</strong>;
      }
      return sub;
    });
  });
}
