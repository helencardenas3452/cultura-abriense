import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Wind } from 'lucide-react';

export default function AmbientAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [soundType, setSoundType] = useState<'rain' | 'binaural' | 'waves'>('rain');
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioNode | null>(null);

  const startSereneSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.connect(ctx.destination);
      gainNodeRef.current = gain;

      // Pink noise synthesis for serene rain/atmosphere
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Filter for gentle atmospheric warmth
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(soundType === 'rain' ? 800 : 400, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      noise.start();
      noiseSourceRef.current = noise;

      setIsPlaying(true);
    } catch (err) {
      console.warn('Audio contextual initialization:', err);
    }
  };

  const stopSereneSound = () => {
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopSereneSound();
    } else {
      startSereneSound();
    }
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <button
      onClick={toggleSound}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-all duration-300 ${
        isPlaying 
          ? 'bg-[var(--primary-puro)] text-white shadow-sm' 
          : 'bg-white/50 hover:bg-white/80 text-[var(--text-puro-muted)] border border-neutral-200/60'
      }`}
      title={isPlaying ? "Pausar sonido ambiental de calma" : "Activar sonido sutil de fondo"}
    >
      {isPlaying ? (
        <>
          <Wind className="w-3.5 h-3.5 animate-spin duration-3000" />
          <span className="text-[11px] font-medium tracking-wide">Atmósfera Serena</span>
        </>
      ) : (
        <>
          <VolumeX className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium tracking-wide">Sonido Sutil</span>
        </>
      )}
    </button>
  );
}
