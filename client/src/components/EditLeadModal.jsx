import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const fields = [
  { key: 'businessName', label: 'Business Name' },
  { key: 'category', label: 'Category' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'website', label: 'Website' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'notes', label: 'Notes', textarea: true },
];

export default function EditLeadModal({ lead, open, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      const initial = {};
      fields.forEach((f) => (initial[f.key] = lead[f.key] || ''));
      setForm(initial);
      setError('');
    }
  }, [lead, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(lead._id, form);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Lead" size="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.textarea ? 'md:col-span-2' : ''}>
              <label className="label">{f.label}</label>
              {f.textarea ? (
                <textarea
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  rows={3}
                  className="input"
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  className="input"
                />
              )}
            </div>
          ))}
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
