import { FolderOpen, Plus } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  message = 'There are no items matching your criteria at this moment.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white/60 rounded-3xl border border-dashed border-slate-200 animate-fadeIn">
      <div className="p-4 bg-primary-50 rounded-2xl text-primary-600 mb-3.5 shadow-sm">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mb-5 leading-relaxed">{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary text-xs py-2 px-3.5">
          <Plus className="w-4 h-4 mr-1.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
