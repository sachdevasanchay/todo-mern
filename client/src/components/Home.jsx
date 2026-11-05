import { useMemo, useState } from 'react';
import { CheckIcon, CrossIcon, PlusIcon, SearchIcon } from './Icons.jsx';
import TaskList from './TaskList.jsx';
import WeekCard from './WeekCard.jsx';
import { addDays, fmtLongDate, groupByWeek, sameDay, startOfWeek, weekKey } from '../utils/dates.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function Stat({ tone, icon, label, value }) {
  const isDone = tone === 'done';
  return (
    <div className={`flex-1 rounded-md p-3.5 md:p-5 ${isDone ? 'bg-brand-soft' : 'bg-danger-soft'}`}>
      <div className="flex items-center gap-2 text-xs text-slate-700 md:text-sm">
        <span className={`grid h-6 w-6 place-items-center rounded-[4px] border ${isDone ? 'border-brand bg-brand-track text-brand' : 'border-danger bg-danger-soft text-danger'}`}>{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900 md:text-3xl">
        {String(value).padStart(2, '0')} <span className="text-[10px] font-normal text-slate-500 md:text-xs">This Week</span>
      </p>
    </div>
  );
}

export default function Home({ user, onLogout, tasks, loading, error, onAdd, onOpenSearch, onRetry, ...handlers }) {
  const today = new Date();
  const [selected, setSelected] = useState(today);
  const weekStart = startOfWeek(selected);
  const weeks = useMemo(() => groupByWeek(tasks), [tasks]);

  const thisWeek = weeks.find((w) => w.key === weekKey(selected));
  const done = thisWeek?.done || 0;
  const open = thisWeek?.open || 0;
  const total = done + open;
  const pct = total ? (done / total) * 100 : 0;

  const dayTasks = tasks.filter((t) => sameDay(t.dueAt, selected));
  const isToday = sameDay(selected, today);

  return (
    <div className="px-5 pb-28 pt-5 md:px-8 lg:px-10 lg:pb-10 lg:pt-8">
      <div className="mb-4 flex items-center justify-between lg:mb-2">
        <p className="text-sm text-slate-500">
          Hi, <span className="font-semibold text-slate-900">{user?.name?.split(' ')[0]}</span>
        </p>
        <button type="button" onClick={onLogout} className="text-sm font-medium text-brand hover:underline">
          Log out
        </button>
      </div>

      {/* Laptop header: title + add button (phones use the floating + instead) */}
      <header className="mb-6 hidden items-center justify-between lg:flex">
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-sm text-slate-500">{fmtLongDate(today)}</p>
        </div>
        <button type="button" onClick={onAdd} className="flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark">
          <PlusIcon width={18} height={18} /> Add task
        </button>
      </header>

      {/* Phone/tablet: one column. Laptop: tasks on the left, weeks on the right */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-10">
        <div>
          <button type="button" onClick={onOpenSearch} className="flex w-full items-center justify-between rounded-md border border-slate-200 px-3 py-2.5 text-left text-xs text-slate-400 md:text-sm">
            Search for a task <SearchIcon className="text-slate-900" />
          </button>

          <div className="mt-4 grid grid-cols-7 gap-1 md:gap-2" role="group" aria-label="Days of this week">
            {DAYS.map((d, i) => {
              const date = addDays(weekStart, i);
              const active = sameDay(date, selected);
              const hasTasks = tasks.some((t) => sameDay(t.dueAt, date));
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelected(date)}
                  aria-pressed={active}
                  className={`flex flex-col items-center rounded-md py-2 text-[10px] md:py-3 md:text-xs ${active ? 'bg-brand text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  {d}
                  <span className={`mt-1.5 text-sm md:text-base ${active ? 'font-semibold' : 'font-medium'}`}>{String(date.getDate()).padStart(2, '0')}</span>
                  <span className={`mt-1 h-1 w-1 rounded-full ${hasTasks ? (active ? 'bg-white' : 'bg-brand') : 'bg-transparent'}`} />
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex gap-3 md:gap-4">
            <Stat tone="done" icon={<CheckIcon width={14} height={14} />} label="Task Complete" value={done} />
            <Stat tone="open" icon={<CrossIcon width={14} height={14} />} label="Task Pending" value={open} />
          </div>

          <h2 className="mt-6 text-base font-semibold md:text-lg">Weekly Progress</h2>
          <div className="mt-3 h-4 overflow-hidden bg-brand-track" role="progressbar" aria-label="Weekly progress" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-brand-dark transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>

          {error && (
            <div className="mt-5 rounded-md bg-danger-soft p-3 text-sm text-danger" role="alert">
              {error} <button onClick={onRetry} className="font-semibold underline">Retry</button>
            </div>
          )}

          <h2 className="mt-6 text-base font-semibold md:text-lg">
            {isToday ? 'Tasks Today' : `Tasks on ${fmtLongDate(selected)}`}
          </h2>
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-400">Loading tasks…</p>
          ) : (
            <TaskList
              tasks={dayTasks}
              empty={isToday ? 'Nothing planned today. Add a task to get started.' : 'No tasks on this day.'}
              {...handlers}
            />
          )}
        </div>

        <aside className="mt-8 lg:mt-0 lg:border-l lg:border-slate-100 lg:pl-10">
          <h2 className="text-base font-semibold md:text-lg">All Weeks</h2>
          <p className="mb-3 text-xs text-slate-400">Weeks run Monday to Sunday. Tap a week to see its tasks.</p>
          <div className="space-y-3">
            {!loading && !weeks.length && <p className="py-4 text-center text-sm text-slate-400">No tasks yet.</p>}
            {weeks.map((w) => (
              <WeekCard key={w.key} week={w} {...handlers} />
            ))}
          </div>
        </aside>
      </div>

      {/* Floating + for phones and tablets */}
      <button
        type="button"
        onClick={onAdd}
        aria-label="Add task"
        className="fixed bottom-6 left-1/2 z-20 grid h-14 w-14 -translate-x-1/2 place-items-center rounded-full bg-brand text-white shadow-lg shadow-brand/40 lg:hidden"
      >
        <PlusIcon width={26} height={26} />
      </button>
    </div>
  );
}
