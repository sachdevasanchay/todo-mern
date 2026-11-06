export function Zigzag({ className }) {
  return (
    <svg className={className} viewBox="0 0 100 70" fill="none" stroke="white" strokeOpacity=".55" strokeWidth="3" aria-hidden="true">
      {[0, 14, 28, 42, 56].map((y) => (
        <path key={y} d={`M0 ${y + 10} l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10 l12 -10 l12 10`} />
      ))}
    </svg>
  );
}

export default function Onboarding({ onStart }) {
  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      <div className="relative flex-1 overflow-hidden bg-brand md:min-h-screen">
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[14px] border-white/20 md:h-40 md:w-40" />
        <Zigzag className="absolute left-0 top-24 w-28 md:w-44" />
        <Zigzag className="absolute bottom-6 right-0 w-28 md:w-44" />
      </div>
      <div className="px-6 pb-8 pt-6 md:flex md:flex-1 md:flex-col md:justify-center md:px-16 lg:px-24">
        <div className="md:max-w-sm">
          <h1 className="text-2xl font-bold md:text-4xl">Manage What To Do</h1>
          <p className="mt-3 max-w-[18rem] text-xs leading-relaxed text-slate-500 md:max-w-xs md:text-sm">
            The best way to manage what you have to do, don’t forget your plans
          </p>
          <button onClick={onStart} className="mt-14 w-full rounded-md bg-brand py-3 text-sm font-medium text-white hover:bg-brand-dark md:mt-10">
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
