import { useEffect, useState } from 'react';
import { BackIcon, SearchIcon } from './Icons.jsx';
import TaskList from './TaskList.jsx';
import { api } from '../api.js';

// Searches through the API (title + description), debounced.
export default function SearchScreen({ onClose, refreshKey, ...handlers }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q.trim()) { setResults([]); setError(''); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        setResults(await api.list(q.trim()));
        setError('');
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, refreshKey]);

  return (
    <div className="absolute inset-0 z-30 overflow-y-auto bg-white px-5 pt-5 md:px-8 md:pt-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onClose} aria-label="Back" className="p-1"><BackIcon /></button>
          <label className="relative flex-1">
            <span className="sr-only">Search for a task</span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or description"
              className="w-full rounded-md border border-slate-200 py-2.5 pl-3 pr-10 text-sm placeholder:text-slate-400"
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2" />
          </label>
        </div>

        <div className="mt-4">
          {error && <p className="rounded-md bg-danger-soft p-2.5 text-sm text-danger">{error}</p>}
          {!q.trim() && <p className="py-10 text-center text-sm text-slate-400">Type a keyword to find your tasks.</p>}
          {q.trim() && loading && <p className="py-10 text-center text-sm text-slate-400">Searching…</p>}
          {q.trim() && !loading && !error && (
            <TaskList tasks={results} empty={`No tasks match “${q.trim()}”.`} showDate {...handlers} />
          )}
        </div>
      </div>
    </div>
  );
}
