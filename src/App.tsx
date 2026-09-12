import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Conversation, 
  Message, 
  ChatSettings, 
  Attachment 
} from './types/chat';
import { 
  DEFAULT_MODELS, 
  DEFAULT_PERSONAS, 
  DEFAULT_SETTINGS 
} from './constants/defaults';
import { AIService } from './services/aiService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { SettingsModal } from './components/SettingsModal';
import { PersonaSelectorModal } from './components/PersonaSelectorModal';

export const App: React.FC = () => {
  // 1. Storage Initialization
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nexus_ai_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    const saved = localStorage.getItem('nexus_ai_active_id');
    return saved || null;
  });

  const [settings, setSettings] = useState<ChatSettings>(() => {
    const saved = localStorage.getItem('nexus_ai_settings');
    if (saved) {
      try { return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) }; } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [personaModalOpen, setPersonaModalOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const activeCancelRef = useRef<(() => void) | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('nexus_ai_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('nexus_ai_active_id', activeConversationId);
    }
  }, [activeConversationId]);

  useEffect(() => {
    localStorage.setItem('nexus_ai_settings', JSON.stringify(settings));
  }, [settings]);

  // Ensure an active conversation exists
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;
  const activePersona = DEFAULT_PERSONAS.find(p => p.id === settings.selectedPersonaId) || DEFAULT_PERSONAS[0];

  // Handler: Create New Conversation
  const handleNewConversation = useCallback(() => {
    const newConv: Conversation = {
      id: Math.random().toString(36).substring(2, 11),
      title: 'New Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      modelId: settings.selectedModel,
      personaId: settings.selectedPersonaId,
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  }, [settings.selectedModel, settings.selectedPersonaId]);

  // Handler: Send User Message & Stream AI Response
  const handleSendMessage = async (text: string, attachments: Attachment[]) => {
    let currentConvId = activeConversationId;
    let targetConv = activeConversation;

    // Create new conversation if none exists
    if (!targetConv || !currentConvId) {
      const newId = Math.random().toString(36).substring(2, 11);
      const titleSnippet = text.slice(0, 30) || 'New Chat';
      const newConv: Conversation = {
        id: newId,
        title: titleSnippet,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
        modelId: settings.selectedModel,
        personaId: settings.selectedPersonaId,
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newId);
      currentConvId = newId;
      targetConv = newConv;
    } else if (targetConv.messages.length === 0) {
      // Auto update title from first prompt
      const titleSnippet = text.slice(0, 30) || 'New Chat';
      setConversations(prev => prev.map(c => c.id === currentConvId ? { ...c, title: titleSnippet } : c));
    }

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      attachments,
    };

    const assistantMessageId = Math.random().toString(36).substring(2, 9);
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'streaming',
    };

    // Append user message + empty assistant placeholder
    setConversations(prev => prev.map(c => {
      if (c.id === currentConvId) {
        return {
          ...c,
          updatedAt: Date.now(),
          messages: [...c.messages, userMessage, initialAssistantMessage]
        };
      }
      return c;
    }));

    setIsStreaming(true);

    const contextMessages = [...(targetConv?.messages || []), userMessage];

    // Start streaming response
    const cancelFn = await AIService.generateStreamingResponse(
      contextMessages,
      activePersona.systemPrompt,
      settings,
      {
        onChunk: (chunkText) => {
          setConversations(prev => prev.map(c => {
            if (c.id === currentConvId) {
              const updatedMessages = c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return { ...m, content: m.content + chunkText };
                }
                return m;
              });
              return { ...c, messages: updatedMessages };
            }
            return c;
          }));
        },
        onComplete: (fullText, metadata) => {
          setIsStreaming(false);
          setConversations(prev => prev.map(c => {
            if (c.id === currentConvId) {
              const updatedMessages = c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: fullText,
                    status: 'complete' as const,
                    latencyMs: metadata.latencyMs,
                    tokens: metadata.tokens,
                  };
                }
                return m;
              });
              return { ...c, messages: updatedMessages };
            }
            return c;
          }));

          if (settings.autoSpeak) {
            AIService.speak(fullText);
          }
        },
        onError: (error) => {
          setIsStreaming(false);
          setConversations(prev => prev.map(c => {
            if (c.id === currentConvId) {
              const updatedMessages = c.messages.map(m => {
                if (m.id === assistantMessageId) {
                  return {
                    ...m,
                    content: `⚠️ **Error generating response:** ${error.message}`,
                    status: 'error' as const,
                  };
                }
                return m;
              });
              return { ...c, messages: updatedMessages };
            }
            return c;
          }));
        }
      }
    );

    activeCancelRef.current = cancelFn;
  };

  // Stop streaming
  const handleStopStreaming = () => {
    if (activeCancelRef.current) {
      activeCancelRef.current();
      activeCancelRef.current = null;
    }
    setIsStreaming(false);
  };

  // Conversation Management
  const handleDeleteConversation = (id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConversationId === id) {
      const remaining = conversations.filter(c => c.id !== id);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleTogglePinConversation = (id: string) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
  };

  const handleClearCurrentChat = () => {
    if (!activeConversationId) return;
    setConversations(prev => prev.map(c => c.id === activeConversationId ? { ...c, messages: [] } : c));
  };

  const handleExportChat = () => {
    if (!activeConversation) return;
    const content = activeConversation.messages
      .map(m => `### ${m.role === 'user' ? 'User' : 'NexusAI'} (${new Date(m.timestamp).toLocaleString()})\n\n${m.content}\n\n---`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeConversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = () => {
    localStorage.clear();
    setConversations([]);
    setActiveConversationId(null);
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <div className="flex h-screen bg-[#0b0f19] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar Drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={(id) => setActiveConversationId(id)}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onTogglePinConversation={handleTogglePinConversation}
        personas={DEFAULT_PERSONAS}
        settings={settings}
        onOpenPersonaModal={() => setPersonaModalOpen(true)}
        onOpenSettingsModal={() => setSettingsModalOpen(true)}
      />

      {/* Main Chat Area Layout */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#0b0f19] relative">
        {/* Navigation Bar */}
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(prev => !prev)}
          models={DEFAULT_MODELS}
          personas={DEFAULT_PERSONAS}
          settings={settings}
          onUpdateSettings={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
          onOpenSettingsModal={() => setSettingsModalOpen(true)}
          onOpenPersonaModal={() => setPersonaModalOpen(true)}
          onClearCurrentChat={handleClearCurrentChat}
          onExportChat={handleExportChat}
          messageCount={activeConversation?.messages.length || 0}
        />

        {/* Message feed stream */}
        <ChatArea
          messages={activeConversation?.messages || []}
          persona={activePersona}
          isStreaming={isStreaming}
          onSelectPrompt={(promptText) => handleSendMessage(promptText, [])}
        />

        {/* Floating Input Dock */}
        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          settings={settings}
          onUpdateSettings={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
        />
      </div>

      {/* Modals */}
      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
        onClearAllData={handleClearAllData}
      />

      <PersonaSelectorModal
        isOpen={personaModalOpen}
        onClose={() => setPersonaModalOpen(false)}
        personas={DEFAULT_PERSONAS}
        selectedPersonaId={settings.selectedPersonaId}
        onSelectPersona={(pId) => setSettings(prev => ({ ...prev, selectedPersonaId: pId }))}
      />
    </div>
  );
};

export default App;
