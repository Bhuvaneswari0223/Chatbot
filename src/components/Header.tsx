import React from 'react';
import { 
  Bot, 
  Settings, 
  Trash2, 
  Download, 
  Menu, 
  Sparkles,
  Zap,
  Globe,
  Sliders,
  UserCheck
} from 'lucide-react';
import { AIModel, Persona, ChatSettings } from '../types/chat';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  models: AIModel[];
  personas: Persona[];
  settings: ChatSettings;
  onUpdateSettings: (newSettings: Partial<ChatSettings>) => void;
  onOpenSettingsModal: () => void;
  onOpenPersonaModal: () => void;
  onClearCurrentChat: () => void;
  onExportChat: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
  models,
  personas,
  settings,
  onUpdateSettings,
  onOpenSettingsModal,
  onOpenPersonaModal,
  onClearCurrentChat,
  onExportChat,
  messageCount
}) => {
  const currentModel = models.find(m => m.id === settings.selectedModel) || models[0];
  const currentPersona = personas.find(p => p.id === settings.selectedPersonaId) || personas[0];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-[#0b0f19]/90 backdrop-blur-md border-b border-gray-800 text-gray-200">
      {/* Left section: Hamburger & App Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 shadow-lg shadow-blue-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-semibold text-base tracking-tight text-white">Nexus<span className="text-blue-400 font-bold">AI</span></h1>
              <span className="px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center section: Model & Persona Selector Bar */}
      <div className="hidden md:flex items-center space-x-3 bg-gray-900/80 p-1 rounded-xl border border-gray-800">
        {/* Model Dropdown */}
        <div className="relative flex items-center px-2 py-1 space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <select
            value={settings.selectedModel}
            onChange={(e) => onUpdateSettings({ selectedModel: e.target.value })}
            className="bg-transparent text-xs font-medium text-gray-200 focus:outline-none cursor-pointer pr-4"
          >
            {models.map(model => (
              <option key={model.id} value={model.id} className="bg-gray-900 text-gray-200">
                {model.name} ({model.badge})
              </option>
            ))}
          </select>
        </div>

        <div className="h-4 w-px bg-gray-800" />

        {/* Persona Quick Trigger */}
        <button
          onClick={onOpenPersonaModal}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-800/80 rounded-lg transition"
          title="Change Assistant Persona"
        >
          <span>{currentPersona.avatar}</span>
          <span>{currentPersona.name}</span>
          <Sliders className="w-3.5 h-3.5 text-gray-400 ml-1" />
        </button>

        <div className="h-4 w-px bg-gray-800" />

        {/* Web Search Toggle */}
        <button
          onClick={() => onUpdateSettings({ webSearchEnabled: !settings.webSearchEnabled })}
          className={`flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg transition ${
            settings.webSearchEnabled 
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          }`}
          title="Toggle Web Search Grounding"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Web Search</span>
        </button>
      </div>

      {/* Right section: Action Buttons */}
      <div className="flex items-center space-x-1 sm:space-x-2">
        {messageCount > 0 && (
          <>
            <button
              onClick={onExportChat}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition"
              title="Export Conversation"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClearCurrentChat}
              className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-800 transition"
              title="Clear Messages"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        <button
          onClick={onOpenSettingsModal}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          title="Settings & API Keys"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
