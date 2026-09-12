import React, { useState } from 'react';
import { X, Sparkles, Check, Edit3, Sliders, Shield } from 'lucide-react';
import { Persona } from '../types/chat';

interface PersonaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  personas: Persona[];
  selectedPersonaId: string;
  onSelectPersona: (personaId: string, customSystemPrompt?: string) => void;
}

export const PersonaSelectorModal: React.FC<PersonaSelectorModalProps> = ({
  isOpen,
  onClose,
  personas,
  selectedPersonaId,
  onSelectPersona,
}) => {
  const [activeTab, setActiveTab] = useState<string>('All');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [editingPersonaId, setEditingPersonaId] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Coding', 'Writing', 'Business', 'Academic', 'General'];

  const filteredPersonas = activeTab === 'All'
    ? personas
    : personas.filter(p => p.category === activeTab);

  const currentPersona = personas.find(p => p.id === selectedPersonaId) || personas[0];

  const handleSelect = (p: Persona) => {
    onSelectPersona(p.id, customPrompt ? customPrompt : p.systemPrompt);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-800 bg-gray-900/60">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="font-bold text-lg text-white">Select AI Persona & System Instructions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center space-x-2 px-6 py-3 border-b border-gray-800/80 overflow-x-auto text-xs font-medium">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`px-3 py-1.5 rounded-xl transition ${
                activeTab === cat
                  ? 'bg-blue-600 text-white font-semibold shadow'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Persona Cards Grid */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPersonas.map((p) => {
              const isSelected = p.id === selectedPersonaId;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`group p-4 rounded-2xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                      : 'bg-gray-900/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl p-2 rounded-xl bg-gray-800/80 border border-gray-700/50">{p.avatar}</span>
                      <div>
                        <h3 className="font-semibold text-sm text-white group-hover:text-blue-400 transition">
                          {p.name}
                        </h3>
                        <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
                          {p.category}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-blue-600 text-white">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Custom System Prompt Area */}
          <div className="pt-4 border-t border-gray-800 space-y-2">
            <label className="flex items-center space-x-2 text-xs font-semibold text-gray-300">
              <Edit3 className="w-4 h-4 text-blue-400" />
              <span>Customize Active System Instructions</span>
            </label>
            <textarea
              value={customPrompt || currentPersona.systemPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Custom system instructions..."
              rows={3}
              className="w-full p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs text-gray-200 focus:outline-none focus:border-blue-500 font-mono leading-relaxed"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
