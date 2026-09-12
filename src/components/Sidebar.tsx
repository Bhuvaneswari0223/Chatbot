import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Search, 
  X, 
  Pin, 
  Sparkles,
  Sliders,
  Check,
  Zap,
  Key
} from 'lucide-react';
import { Conversation, Persona, ChatSettings } from '../types/chat';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation: (id: string) => void;
  personas: Persona[];
  settings: ChatSettings;
  onOpenPersonaModal: () => void;
  onOpenSettingsModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  personas,
  settings,
  onOpenPersonaModal,
  onOpenSettingsModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const currentPersona = personas.find(p => p.id === settings.selectedPersonaId) || personas[0];

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pinnedList = filteredConversations.filter(c => c.pinned);
  const recentList = filteredConversations.filter(c => !c.pinned);

  const startEditing = (c: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const saveEditing = (id: string, e: React.FormEvent) => {
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-72 bg-[#0d1322] border-r border-gray-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & New Chat Button */}
        <div className="p-3 border-b border-gray-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Workspace History
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-gray-400 hover:text-white lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={onNewConversation}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl shadow-md shadow-blue-600/20 active:scale-[0.98] transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-900/90 text-xs text-gray-200 placeholder-gray-500 rounded-lg border border-gray-800 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* Pinned Section */}
          {pinnedList.length > 0 && (
            <div>
              <div className="px-2 mb-1 flex items-center space-x-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                <Pin className="w-3 h-3 text-amber-400" />
                <span>Pinned</span>
              </div>
              <div className="space-y-1">
                {pinnedList.map(renderConversationItem)}
              </div>
            </div>
          )}

          {/* Recent Section */}
          <div>
            {pinnedList.length > 0 && (
              <div className="px-2 mb-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Recent Chats
              </div>
            )}

            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                No conversations found.
              </div>
            ) : (
              <div className="space-y-1">
                {recentList.map(renderConversationItem)}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Persona & Engine Status Banner */}
        <div className="p-3 border-t border-gray-800/80 bg-gray-900/50 space-y-2">
          {/* Active Persona Selector Trigger */}
          <button
            onClick={onOpenPersonaModal}
            className="w-full flex items-center justify-between p-2 rounded-xl bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 text-left transition group"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <span className="text-lg">{currentPersona.avatar}</span>
              <div className="truncate">
                <div className="text-xs font-semibold text-gray-200 group-hover:text-blue-400 transition">
                  {currentPersona.name}
                </div>
                <div className="text-[10px] text-gray-400 truncate">
                  {currentPersona.category} Persona
                </div>
              </div>
            </div>
            <Sliders className="w-3.5 h-3.5 text-gray-400 group-hover:text-white" />
          </button>

          {/* API Key Status / Engine Banner */}
          <div
            onClick={onOpenSettingsModal}
            className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-[11px] text-gray-400 hover:text-gray-200 cursor-pointer transition"
          >
            <div className="flex items-center space-x-1.5">
              {settings.geminiApiKey || settings.openaiApiKey ? (
                <>
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Custom API Key Active</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nexus Smart Engine</span>
                </>
              )}
            </div>
            <span className="text-[10px] text-gray-500 hover:underline">Config</span>
          </div>
        </div>
      </aside>
    </>
  );

  function renderConversationItem(c: Conversation) {
    const isActive = c.id === activeConversationId;
    const isEditing = editingId === c.id;

    return (
      <div
        key={c.id}
        onClick={() => onSelectConversation(c.id)}
        className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition ${
          isActive
            ? 'bg-blue-600/15 text-blue-300 font-medium border border-blue-500/30'
            : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
        }`}
      >
        <div className="flex items-center space-x-2.5 truncate pr-6">
          <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
          {isEditing ? (
            <form onSubmit={(e) => saveEditing(c.id, e)} className="flex items-center space-x-1 w-full" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
                className="bg-gray-900 text-white px-2 py-0.5 rounded text-xs border border-blue-500 focus:outline-none w-full"
              />
              <button type="submit" className="text-blue-400 p-0.5 hover:text-white">
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <span className="truncate">{c.title || 'Untitled Conversation'}</span>
          )}
        </div>

        {!isEditing && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center space-x-1 bg-gray-900/90 p-1 rounded-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinConversation(c.id);
              }}
              className={`p-1 rounded hover:bg-gray-800 ${c.pinned ? 'text-amber-400' : 'text-gray-400 hover:text-white'}`}
              title={c.pinned ? 'Unpin chat' : 'Pin chat'}
            >
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => startEditing(c, e)}
              className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800"
              title="Rename chat"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(c.id);
              }}
              className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-gray-800"
              title="Delete chat"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  }
};
