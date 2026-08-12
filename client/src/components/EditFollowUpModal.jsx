import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { formatDateForInput } from '../lib/utils.js';

export default function EditFollowUpModal({ followUp, open, onClose, onSave }) {
  const [form, setForm] = useState({ notes: '', status: 'open', nextFollowUpDate: '', count: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (followUp) {
      setForm({
        notes: followUp.notes || '',
        status: followUp.status || 'open',
        nextFollowUpDate: followUp.nextFollowUpDate ? formatDateForInput(followUp.nextFollowUpDate) : '',
        count: followUp.count || 0,
      });
      setError('');
    }
  }, [followUp, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        notes: form.notes,
        status: form.status,
        count: Number(form.count),
      };
      if (form.nextFollowUpDate) payload.nextFollowUpDate = new Date(form.nextFollowUpDate).toISOString();
      await onSave(followUp._id, payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update follow-up');
    } finally {
      setSaving(false);
    }
  };

  if (!followUp) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Follow-up" size="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="converted">Converted</option>
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Next Follow-up Date</label>
            <input
              type="datetime-local"
              value={form.nextFollowUpDate}
              onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Count</label>
            <input
              type="number"
              min={0}
              value={form.count}
              onChange={(e) => setForm({ ...form, count: e.target.value })}
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            className="input"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
