export default function Loading({ size = 8, text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <div
        className="animate-spin rounded-full border-4 border-slate-200"
        style={{ width: `${size * 4}px`, height: `${size * 4}px`, borderBottomColor: '#4f46e5' }}
      ></div>
      {text && <span className="mt-3 text-sm font-medium">{text}</span>}
    </div>
  );
}
