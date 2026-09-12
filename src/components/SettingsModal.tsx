import React, { useState } from 'react';
import { X, Key, Sliders, Shield, Trash2, Check, ExternalLink, Zap } from 'lucide-react';
import { ChatSettings } from '../types/chat';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ChatSettings;
  onSaveSettings: (newSettings: Partial<ChatSettings>) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onClearAllData,
}) => {
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey);
  const [openaiKey, setOpenaiKey] = useState(settings.openaiApiKey);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      geminiApiKey: geminiKey.trim(),
      openaiApiKey: openaiKey.trim(),
      temperature,
      maxTokens,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-[#0f172a] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-gray-800 bg-gray-900/60">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-lg text-white">System Settings & API Keys</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Smart Engine Notice */}
          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start space-x-3 text-xs text-blue-300">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Built-in Smart Engine Active:</span> You can use NexusAI immediately without entering any keys! Entering API keys below unlocks live online model generation.
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <label className="flex items-center justify-between font-medium text-gray-200">
              <span className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <span>Google Gemini API Key</span>
              </span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <label className="flex items-center justify-between font-medium text-gray-200">
              <span className="flex items-center space-x-2">
                <Key className="w-4 h-4 text-purple-400" />
                <span>OpenAI API Key</span>
              </span>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
              >
                <span>Get Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            <input
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>

          <div className="h-px bg-gray-800/80 my-4" />

          {/* Model Parameters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300 text-xs uppercase tracking-wider">
              Model Parameters
            </h3>

            {/* Temperature Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Creativity (Temperature): {temperature}</span>
                <span className="text-gray-500">{temperature < 0.4 ? 'Precise' : temperature > 0.8 ? 'Creative' : 'Balanced'}</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-300">Max Tokens: {maxTokens}</span>
              </div>
              <input
                type="number"
                min="256"
                max="8192"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2048)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-800 rounded-xl text-gray-100 font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="h-px bg-gray-800/80 my-4" />

          {/* Danger Zone */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all conversation history and reset settings?')) {
                  onClearAllData();
                  onClose();
                }
              }}
              className="flex items-center space-x-2 text-xs text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear all stored local data</span>
            </button>
          </div>

          {/* Submit bar */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-lg shadow-blue-600/25 transition active:scale-95"
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
