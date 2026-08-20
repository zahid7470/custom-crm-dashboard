import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

const fields = [
  { key: 'businessName', label: 'Business Name', placeholder: 'e.g. Acme Corp' },
  { key: 'category', label: 'Category / Niche', placeholder: 'e.g. Real Estate' },
  { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
  { key: 'email', label: 'Email Address', placeholder: 'contact@acme.com' },
  { key: 'website', label: 'Website URL', placeholder: 'https://example.com' },
  { key: 'address', label: 'Street Address', placeholder: '123 Main St' },
  { key: 'city', label: 'City', placeholder: 'New York' },
  { key: 'country', label: 'Country', placeholder: 'United States' },
  { key: 'notes', label: 'Internal Notes', textarea: true, placeholder: 'Important context or qualification details...' },
];

export default function EditLeadModal({ lead, open, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (lead) {
      const initial = {};
      fields.forEach((f) => (initial[f.key] = lead[f.key] || ''));
      setForm(initial);
    }
  }, [lead, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(lead._id, form);
      toast.success(`Lead "${form.businessName || 'record'}" updated successfully.`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update lead');
    } finally {
      setSaving(false);
    }
  };

  if (!lead) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Lead Details" subtitle={`Updating record for ${lead.businessName || lead.name || 'Lead'}`} size="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className={f.textarea ? 'sm:col-span-2' : ''}>
              <label className="label">{f.label}</label>
              {f.textarea ? (
                <textarea
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  rows={3}
                  placeholder={f.placeholder}
                  className="input"
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key] || ''}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="input"
                />
              )}
            </div>
          ))}
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
