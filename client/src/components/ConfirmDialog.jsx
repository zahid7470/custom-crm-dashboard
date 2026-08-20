import { AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const isDanger = variant === 'danger';

  return (
    <Modal open={open} onClose={onClose} title={title} size="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-3 rounded-2xl shrink-0 ${
              isDanger ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-amber-50 text-amber-600 ring-1 ring-amber-200'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="pt-0.5">
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} disabled={loading} className="btn-secondary text-xs">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`text-xs ${isDanger ? 'btn-danger' : 'btn-primary'}`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
