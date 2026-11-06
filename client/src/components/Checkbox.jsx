import { CheckIcon } from './Icons.jsx';

export default function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`grid h-5 w-5 shrink-0 place-items-center rounded-[4px] border transition-colors ${
        checked ? 'border-brand bg-brand-soft text-brand' : 'border-brand bg-white'
      }`}
    >
      {checked && <CheckIcon width={14} height={14} />}
    </button>
  );
}
