
import React, { useState, useEffect } from 'react';
import { MeditationSession } from './types';
import MeditationWizard from './components/MeditationWizard';
import MeditationPlayer from './components/MeditationPlayer';
import ApiKeyGateway from './components/ApiKeyGateway';
import ChatBot from './components/ChatBot';
import Button from './components/Button';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [activeSession, setActiveSession] = useState<MeditationSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    // Check if user has already selected a key
    const checkKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSessionCreated = (session: MeditationSession) => {
    setSessions(prev => [session, ...prev]);
    setIsCreating(false);
    setActiveSession(session);
  };

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {!hasApiKey && <ApiKeyGateway onSuccess={() => setHasApiKey(true)} />}

      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold text-slate-900">ZenGen AI</h1>
                <p className="text-[10px] text-indigo-500 uppercase font-bold tracking-widest leading-none">Powered by Gemini</p>
              </div>
            </div>
            <Button variant="primary" onClick={() => setIsCreating(true)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              New Session
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {isCreating ? (
          <MeditationWizard 
            onSessionCreated={handleSessionCreated} 
            onCancel={() => setIsCreating(false)} 
          />
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">Welcome Home</h2>
                <p className="text-slate-500 text-lg">Select a previously generated journey or create a new one.</p>
              </div>
              <div className="flex gap-4">
                 <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                    <span className="text-sm font-medium text-slate-600">{sessions.length} Sessions Saved</span>
                 </div>
              </div>
            </div>

            {sessions.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
                <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-2xl font-serif font-bold text-slate-900 mb-4">No sessions yet</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">Generate your first meditation session with custom visuals and voiceovers using advanced AI.</p>
                <Button onClick={() => setIsCreating(true)} className="px-10">Start Your First Journey</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => setActiveSession(session)}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img 
                        src={session.imageUrl} 
                        alt={session.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 transform scale-90 group-hover:scale-100 transition-transform">
                          <svg className="w-6 h-6 text-white fill-white" viewBox="0 0 24 24">
                            <path d="M5 3l14 9-14 9V3z" />
                          </svg>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => deleteSession(session.id, e)}
                          className="bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-lg backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-xl font-serif font-bold text-slate-900 mb-2 truncate group-hover:text-indigo-600 transition-colors">
                        {session.title}
                      </h3>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-slate-400 text-xs">{new Date(session.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">AI Guided</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <ChatBot />

      {activeSession && (
        <MeditationPlayer 
          session={activeSession} 
          onClose={() => setActiveSession(null)} 
        />
      )}

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
             <div className="bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.05 7.05l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              </div>
              <span className="text-slate-500 font-medium">ZenGen AI Mindfulness App</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-slate-400">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Gemini 3 Pro</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Help</span>
          </div>
          <p className="text-slate-400 text-sm">© 2024 AI Meditation Experience</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
