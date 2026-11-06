import { useEffect, useRef, useState } from 'react';
import { api } from '../api.js';
import { MicIcon, SparklesIcon } from './Icons.jsx';
import { toDateInput, toTimeInput } from '../utils/dates.js';

// Voice input uses the browser's built-in speech recognition (Chrome, Edge, Safari). Not available in Firefox.
const Speech = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

// Tell the AI what "today" is for the user, e.g. "2026-11-06 14:30, Friday"
const nowString = () => {
  const d = new Date();
  return `${toDateInput(d)} ${toTimeInput(d)}, ${d.toLocaleDateString('en-US', { weekday: 'long' })}`;
};

export default function QuickAdd({ onParsed }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recognition = useRef(null);

  useEffect(() => () => recognition.current?.abort(), []);

  const submit = async (value) => {
    const sentence = (value ?? text).trim();
    if (!sentence || busy) return;
    setBusy(true);
    setError('');
    try {
      const task = await api.parseTask(sentence, nowString());
      setText('');
      onParsed(task); // opens the task form, already filled in
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () => {
    if (listening) { recognition.current?.stop(); return; }
    const rec = new Speech();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = true;
    rec.continuous = false;
    let heard = '';
    rec.onresult = (e) => {
      heard = Array.from(e.results).map((r) => r[0].transcript).join('');
      setText(heard);
    };
    rec.onerror = (e) => {
    console.log('Speech recognition error', e.error);

    if (e.error === 'not-allowed') {
        setError('Microphone is blocked. Allow it in your browser settings.');
    } else if (e.error === 'no-speech') {
        setError('I did not hear anything. Try again.');
    } else if (e.error === 'network') {
        setError('Speech recognition service is unavailable. Check your internet connection or try again.');
    } else if (e.error === 'audio-capture') {
        setError('No microphone detected. Check your microphone connection.');
    } else {
        setError('Voice input failed. You can type instead.');
    }

    setListening(false);
};
    rec.onend = () => {
      setListening(false);
      if (heard.trim()) submit(heard); // send what was said
    };
    recognition.current = rec;
    setError('');
    setListening(true);
    rec.start();
  };

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="flex items-center gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Describe a task to add with AI</span>
          <SparklesIcon width={18} height={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={500}
            disabled={busy}
            placeholder={listening ? 'Listening…' : 'Try: call mom tomorrow at 5pm'}
            className="w-full rounded-md border border-brand/40 bg-brand-soft/40 py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-400"
          />
        </label>
        {Speech && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={busy}
            aria-label={listening ? 'Stop listening' : 'Speak a task'}
            aria-pressed={listening}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border ${listening ? 'animate-pulse border-danger bg-danger text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            <MicIcon />
          </button>
        )}
        <button type="submit" disabled={busy || !text.trim()} className="h-10 shrink-0 rounded-md bg-brand px-4 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50">
          {busy ? 'Thinking…' : 'Add'}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-danger" role="alert">{error}</p>}
      <p className="mt-1.5 text-[11px] text-slate-400">Type or speak. You can check the details before it is saved.</p>
    </div>
  );
}
