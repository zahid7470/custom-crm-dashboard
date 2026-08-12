import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

export default function EditOfferModal({ offer, open, onClose, onSave }) {
  const [form, setForm] = useState({ service: '', requirement: '', scope: '', amount: '', status: 'draft' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (offer) {
      setForm({
        service: offer.service || '',
        requirement: offer.requirement || '',
        scope: offer.scope || '',
        amount: offer.amount || '',
        status: offer.status || 'draft',
      });
      setError('');
    }
  }, [offer, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, amount: Number(form.amount) };
      await onSave(offer._id, payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update offer');
    } finally {
      setSaving(false);
    }
  };

  if (!offer) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Offer" size="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Service</label>
          <input
            type="text"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className="input"
          />
        </div>
        <div>
          <label className="label">Requirement</label>
          <textarea
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            rows={3}
            className="input"
          />
        </div>
        <div>
          <label className="label">Scope</label>
          <textarea
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            rows={3}
            className="input"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
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
