
import React, { useState, useEffect, useRef } from 'react';
import { MeditationSession } from '../types';
import { decode, decodeAudioData } from '../services/geminiService';
import Button from './Button';

interface MeditationPlayerProps {
  session: MeditationSession;
  onClose: () => void;
}

const MeditationPlayer: React.FC<MeditationPlayerProps> = ({ session, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedAtRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  const cleanup = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanup();
  }, []);

  const playAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }

      const ctx = audioContextRef.current;
      const audioBytes = decode(session.audioData);
      const buffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
      durationRef.current = buffer.duration;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      
      const offset = pausedAtRef.current % buffer.duration;
      source.start(0, offset);
      startTimeRef.current = ctx.currentTime - offset;
      
      sourceNodeRef.current = source;
      setIsPlaying(true);

      source.onended = () => {
        if (sourceNodeRef.current === source) {
          setIsPlaying(false);
          setProgress(100);
        }
      };
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const pauseAudio = () => {
    if (sourceNodeRef.current && audioContextRef.current) {
      pausedAtRef.current = audioContextRef.current.currentTime - startTimeRef.current;
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    let interval: number;
    if (isPlaying && audioContextRef.current) {
      interval = window.setInterval(() => {
        if (audioContextRef.current && durationRef.current) {
          const current = audioContextRef.current.currentTime - startTimeRef.current;
          setProgress((current / durationRef.current) * 100);
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black animate-in fade-in duration-500">
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 transition-opacity duration-1000 scale-105"
        style={{ backgroundImage: `url(${session.imageUrl})` }}
      />
      
      <div className="relative z-10 flex flex-col h-full bg-gradient-to-t from-black via-transparent to-black/30">
        <header className="p-6 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h3 className="text-white font-serif text-xl font-medium tracking-wide">ZenGen AI</h3>
            <p className="text-white/60 text-xs uppercase tracking-widest mt-1">Immersive Experience</p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="mb-12 max-w-lg">
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-150">
              {session.title}
            </h2>
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-indigo-200 text-sm font-medium tracking-wide">Breathe deeply</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full" />
            <button
              onClick={isPlaying ? pauseAudio : playAudio}
              className="relative w-24 h-24 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center transition-all active:scale-95 group"
            >
              {isPlaying ? (
                <svg className="w-10 h-10 text-white fill-white" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-white fill-white translate-x-1" viewBox="0 0 24 24">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              )}
            </button>
          </div>
        </main>

        <footer className="p-12">
          <div className="max-w-xl mx-auto">
            <div className="flex justify-between text-white/40 text-sm mb-4">
              <span>{Math.floor(progress * (durationRef.current || 0) / 100)}s</span>
              <span>{Math.floor(durationRef.current || 0)}s</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-8 flex justify-center">
               <div className="flex gap-12">
                  <div className="text-center">
                    <div className="text-white/40 text-[10px] uppercase tracking-tighter mb-1">Visual</div>
                    <div className="text-white text-xs font-medium">Procedural AI</div>
                  </div>
                  <div className="text-center border-x border-white/10 px-8">
                    <div className="text-white/40 text-[10px] uppercase tracking-tighter mb-1">Script</div>
                    <div className="text-white text-xs font-medium">Gemini 3 Flash</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/40 text-[10px] uppercase tracking-tighter mb-1">Audio</div>
                    <div className="text-white text-xs font-medium">2.5 Flash TTS</div>
                  </div>
               </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MeditationPlayer;
