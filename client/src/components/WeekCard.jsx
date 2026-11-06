import { useState } from 'react';
import { ChevronIcon } from './Icons.jsx';
import TaskList from './TaskList.jsx';
import { fmtRange, weekKey } from '../utils/dates.js';

export default function WeekCard({ week, defaultOpen = false, ...handlers }) {
  const [open, setOpen] = useState(defaultOpen);
  const isCurrent = week.key === weekKey(new Date());
  const pct = week.tasks.length ? Math.round((week.done / week.tasks.length) * 100) : 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {fmtRange(week.start)}
            {isCurrent && <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-medium text-brand">This week</span>}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            <span className="text-danger">{week.open} open</span> · <span className="text-brand">{week.done} completed</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-brand-dark transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <ChevronIcon className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4">
          <TaskList tasks={week.tasks} empty="No tasks this week." showDate {...handlers} />
        </div>
      )}
    </section>
  );
}
