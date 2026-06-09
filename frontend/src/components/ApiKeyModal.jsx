import React, { useState } from 'react';
import { KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ApiKeyModal({ onSave }) {
  const [geminiKey, setGeminiKey] = useState('');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!geminiKey.trim()) {
      setError('Gemini API Key is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gemini_key: geminiKey.trim(),
          elevenlabs_key: elevenLabsKey.trim() || null
        })
      });
      
      const data = await res.json();
      if (data.success) {
        onSave();
      } else {
        setError(data.error || 'Failed to configure keys');
      }
    } catch (err) {
      setError('Connection to backend failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-md p-8 glass rounded-2xl border border-teal-200 shadow-soft relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-teal-400 blur-sm"></div>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-teal-700">
            <KeyRound size={24} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-wide">System Setup</h2>
            <p className="text-sm text-teal-700/60 font-mono">Provide API credentials to begin</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Gemini API Key (Required)</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-teal-300 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-500 mb-1.5 uppercase tracking-wider">ElevenLabs API Key (Optional Voice)</label>
            <input
              type="password"
              value={elevenLabsKey}
              onChange={(e) => setElevenLabsKey(e.target.value)}
              placeholder="Optional for TTS"
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-teal-300 focus:ring-1 focus:ring-cyan-500 transition-all font-mono text-sm placeholder:text-slate-600"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-500/20">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-4 bg-teal-500 hover:bg-teal-500 text-slate-900 py-3 rounded-xl font-semibold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <span>Initialize System</span>
                <CheckCircle2 size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
