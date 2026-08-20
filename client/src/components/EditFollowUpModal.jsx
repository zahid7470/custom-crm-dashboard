import { useEffect, useState } from 'react';
import { Loader2, Save, Calendar, Clock, MessageSquare } from 'lucide-react';
import Modal from './Modal.jsx';
import { formatDateForInput } from '../lib/utils.js';
import { useToast } from '../context/ToastContext.jsx';

export default function EditFollowUpModal({ followUp, open, onClose, onSave }) {
  const [form, setForm] = useState({ notes: '', status: 'open', nextFollowUpDate: '', count: 0 });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (followUp) {
      setForm({
        notes: followUp.notes || '',
        status: followUp.status || 'open',
        nextFollowUpDate: followUp.nextFollowUpDate ? formatDateForInput(followUp.nextFollowUpDate) : '',
        count: followUp.count || 0,
      });
    }
  }, [followUp, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        notes: form.notes,
        status: form.status,
        count: Number(form.count),
      };
      if (form.nextFollowUpDate) payload.nextFollowUpDate = new Date(form.nextFollowUpDate).toISOString();
      await onSave(followUp._id, payload);
      toast.success('Follow-up task updated successfully.');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update follow-up');
    } finally {
      setSaving(false);
    }
  };

  if (!followUp) return null;

  const leadName = followUp.leadId?.businessName || followUp.leadId?.name || 'Lead';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Follow-up Task"
      subtitle={`Outreach record for: ${leadName}`}
      size="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input cursor-pointer font-semibold"
          >
            <option value="open">Open / Pending</option>
            <option value="closed">Closed / Disqualified</option>
            <option value="converted">Converted to Client</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Next Follow-up Scheduled Date</label>
            <div className="relative">
              <input
                type="datetime-local"
                value={form.nextFollowUpDate}
                onChange={(e) => setForm({ ...form, nextFollowUpDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="label">Follow-up Touch Count</label>
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
          <label className="label">Outreach & Follow-up Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            placeholder="Record summary of conversation, objections, or next planned touchpoint..."
            className="input"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary text-xs" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            {saving ? 'Saving...' : 'Save Follow-up'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
