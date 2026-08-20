export default function Loading({ text = 'Loading data...', rows = 4 }) {
  return (
    <div className="space-y-4 animate-fadeIn p-4">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium text-slate-500">{text}</span>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-14 bg-gradient-to-r from-slate-100 via-slate-200/60 to-slate-100 rounded-2xl animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
