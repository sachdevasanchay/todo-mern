import { useRef, useState } from 'react';
import Checkbox from './Checkbox.jsx';
import { EditIcon, TrashIcon } from './Icons.jsx';
import { fmtTime } from '../utils/dates.js';

const PRIORITY = {
  high: 'bg-danger-soft text-danger',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};
const REVEAL = 84; // px of the red Delete button revealed on swipe

export default function TaskItem({ task, onToggle, onEdit, onDelete, showDate = false }) {
  const done = task.status === 'completed';
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [drag, setDrag] = useState(null);
  const x0 = useRef(0);

  const offset = drag !== null ? drag : open ? -REVEAL : 0;

  const onTouchStart = (e) => { x0.current = e.touches[0].clientX; };
  const onTouchMove = (e) => {
    const d = e.touches[0].clientX - x0.current + (open ? -REVEAL : 0);
    setDrag(Math.max(-REVEAL, Math.min(0, d)));
  };
  const onTouchEnd = () => { setOpen(drag !== null && drag < -REVEAL / 2); setDrag(null); };

  return (
    <li className="relative overflow-hidden border-b border-slate-100">
      {/* Swipe-left action */}
      <button
        type="button"
        onClick={() => onDelete(task)}
        tabIndex={open ? 0 : -1}
        className="absolute inset-y-0 right-0 flex items-center justify-center bg-danger font-medium text-white"
        style={{ width: REVEAL }}
      >
        Delete
      </button>

      <div
        className="relative bg-white py-3.5 transition-transform duration-200"
        style={{ transform: `translateX(${offset}px)`, transitionDuration: drag !== null ? '0ms' : undefined }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center gap-3">
          <Checkbox checked={done} onChange={() => onToggle(task)} label={`Mark "${task.title}" as ${done ? 'in progress' : 'completed'}`} />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="min-w-0 flex-1 text-left"
          >
            <span className={`block truncate text-sm ${done ? 'text-slate-800 line-through' : 'font-medium'}`}>
              {task.title}
            </span>
            <span className="mt-0.5 block text-xs text-slate-400">
              {showDate && `${new Date(task.dueAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}, `}
              {fmtTime(task.dueAt)}
              {task.endAt && ` – ${fmtTime(task.endAt)}`}
            </span>
          </button>
          <button type="button" onClick={() => onDelete(task)} aria-label={`Delete ${task.title}`} className="hidden p-1 text-slate-300 hover:text-danger sm:block">
            <TrashIcon />
          </button>
          <button type="button" onClick={() => onEdit(task)} aria-label={`Edit ${task.title}`} className="p-1 text-slate-300 hover:text-brand">
            <EditIcon />
          </button>
        </div>

        {expanded && (
          <div className="ml-8 mt-2 space-y-2 pr-2 text-xs text-slate-600">
            {task.priority && (
              <span className={`inline-block rounded-full px-2 py-0.5 font-medium capitalize ${PRIORITY[task.priority]}`}>
                {task.priority} priority
              </span>
            )}
            <p className="whitespace-pre-wrap">{task.description || 'No description added.'}</p>
          </div>
        )}
      </div>
    </li>
  );
}
