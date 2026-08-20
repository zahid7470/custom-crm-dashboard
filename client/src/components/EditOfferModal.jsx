import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function EditOfferModal({ offer, open, onClose, onSave }) {
  const [form, setForm] = useState({ service: '', requirement: '', scope: '', amount: '', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (offer) {
      setForm({
        service: offer.service || '',
        requirement: offer.requirement || '',
        scope: offer.scope || '',
        amount: offer.amount || '',
        status: offer.status || 'draft',
      });
    }
  }, [offer, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      await onSave(offer._id, payload);
      toast.success(`Offer "${offer.offerId || 'Record'}" updated successfully.`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update offer');
    } finally {
      setSaving(false);
    }
  };

  if (!offer) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit Proposal: ${offer.offerId || 'Offer'}`}
      subtitle={`Client: ${offer.clientName || 'Unnamed'}`}
      size="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Service Name</label>
          <input
            type="text"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className="input"
            required
          />
        </div>

        <div>
          <label className="label">Client Requirement</label>
          <textarea
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            rows={3}
            className="input"
          />
        </div>

        <div>
          <label className="label">Scope of Work</label>
          <textarea
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            rows={3}
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input pl-8"
                required
              />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input cursor-pointer font-semibold"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary text-xs" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
