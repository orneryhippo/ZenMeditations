
import React, { useState } from 'react';
import Button from './Button';
import { MeditationVoice, ImageSize, MeditationSession } from '../types';
import { GeminiService } from '../services/geminiService';

interface MeditationWizardProps {
  onSessionCreated: (session: MeditationSession) => void;
  onCancel: () => void;
}

const MeditationWizard: React.FC<MeditationWizardProps> = ({ onSessionCreated, onCancel }) => {
  const [prompt, setPrompt] = useState('');
  const [voice, setVoice] = useState<MeditationVoice>(MeditationVoice.Zephyr);
  const [size, setSize] = useState<ImageSize>(ImageSize.OneK);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    try {
      setStatus('Writing your meditation script...');
      const script = await GeminiService.generateScript(prompt);

      setStatus('Creating soothing visuals...');
      const imageUrl = await GeminiService.generateVisual(prompt, size);

      setStatus('Synthesizing professional voiceover...');
      const audioData = await GeminiService.generateAudio(script, voice);

      const newSession: MeditationSession = {
        id: crypto.randomUUID(),
        title: prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt,
        prompt,
        imageUrl,
        audioData,
        createdAt: Date.now(),
      };

      onSessionCreated(newSession);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-2xl mx-auto border border-gray-100">
      <div className="p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-serif font-bold text-gray-900">Create Session</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Focus or Theme</label>
            <textarea
              placeholder="E.g., Walking through a misty forest at dawn, letting go of work stress..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-28"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Guide Voice</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={voice}
                onChange={(e) => setVoice(e.target.value as MeditationVoice)}
              >
                {Object.values(MeditationVoice).map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visual Resolution</label>
              <select
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={size}
                onChange={(e) => setSize(e.target.value as ImageSize)}
              >
                {Object.values(ImageSize).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full py-4 text-lg" 
              onClick={handleGenerate} 
              isLoading={loading}
            >
              {loading ? status : 'Generate AI Session'}
            </Button>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Uses Gemini 3 Pro Vision for high-fidelity images & Gemini 2.5 Flash for TTS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeditationWizard;
