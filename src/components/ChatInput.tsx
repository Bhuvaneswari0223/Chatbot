import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Globe, 
  Square, 
  X, 
  Sparkles,
  FileCode
} from 'lucide-react';
import { Attachment, ChatSettings } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  settings: ChatSettings;
  onUpdateSettings: (newSettings: Partial<ChatSettings>) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  settings,
  onUpdateSettings,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isStreaming) return;
    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const newAttachment: Attachment = {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'text',
          content,
          size: file.size,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsText(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Toggle Web Speech Voice Recognition
  const toggleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      setText(transcript);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full px-4 pb-4">
      {/* File Upload Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        className="hidden"
      />

      <div className="bg-[#111827]/90 rounded-2xl border border-gray-800 shadow-2xl backdrop-blur-md overflow-hidden transition-all focus-within:border-blue-500/60 focus-within:ring-1 focus-within:ring-blue-500/30">
        {/* Attachment preview chips */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-gray-900/60 border-b border-gray-800">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-800 rounded-lg border border-gray-700 text-xs text-gray-200"
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                <span className="truncate max-w-[150px] font-medium">{att.name}</span>
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 hover:text-red-400 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Input area */}
        <div className="p-2 sm:p-3 flex items-end space-x-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition"
            title="Attach file or code"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NexusAI anything... (Shift+Enter for newline)"
            rows={1}
            className="flex-1 bg-transparent border-0 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 resize-none py-1.5 px-1 max-h-[180px]"
          />

          <div className="flex items-center space-x-1.5 pb-0.5">
            {/* Voice Input Button */}
            <button
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-red-500/20 text-red-400 animate-pulse border border-red-500/40'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={isListening ? 'Listening...' : 'Voice Dictation'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Send or Stop Button */}
            {isStreaming ? (
              <button
                onClick={onStopStreaming}
                className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20 transition active:scale-95"
                title="Stop response generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!text.trim() && attachments.length === 0}
                className={`p-2.5 rounded-xl transition font-medium shadow-lg active:scale-95 ${
                  text.trim() || attachments.length > 0
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/25'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed shadow-none'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Input Footer toolbar */}
        <div className="px-3 py-1.5 bg-gray-900/80 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateSettings({ webSearchEnabled: !settings.webSearchEnabled })}
              className={`flex items-center space-x-1 px-2 py-0.5 rounded-md transition ${
                settings.webSearchEnabled ? 'bg-blue-600/20 text-blue-400 font-medium' : 'hover:text-gray-200'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Web Search {settings.webSearchEnabled ? 'ON' : 'OFF'}</span>
            </button>
          </div>

          <div className="hidden sm:block text-gray-500">
            NexusAI Engine • Fast Streaming Enabled
          </div>
        </div>
      </div>
    </div>
  );
};
