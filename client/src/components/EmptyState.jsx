import { Inbox } from 'lucide-react';

export default function EmptyState({ message = 'No data available' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
      <div className="p-3 bg-slate-100 rounded-full mb-3">
        <Inbox size={24} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
