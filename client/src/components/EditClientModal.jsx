import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

const fields = [
  { key: 'name', label: 'Primary Contact Name', placeholder: 'John Doe' },
  { key: 'businessName', label: 'Company / Business Name', placeholder: 'Acme Corp' },
  { key: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
  { key: 'email', label: 'Email Address', placeholder: 'client@company.com' },
  { key: 'website', label: 'Website URL', placeholder: 'https://client.com' },
  { key: 'city', label: 'City', placeholder: 'San Francisco' },
  { key: 'country', label: 'Country', placeholder: 'United States' },
  { key: 'address', label: 'Physical Address', placeholder: 'Suite 400, 100 Market St' },
  { key: 'notes', label: 'Client Relationship Notes', textarea: true, placeholder: 'Client communication preferences, contracts, key contacts...' },
];

export default function EditClientModal({ client, open, onClose, onSave }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (client) {
      const initial = {};
      fields.forEach((f) => (initial[f.key] = client[f.key] || ''));
      setForm(initial);
    }
  }, [client, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(client._id, form);
      toast.success(`Client profile "${form.name || form.businessName || 'record'}" updated.`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update client profile');
    } finally {
      setSaving(false);
    }
  };

  if (!client) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Client Account"
      subtitle={`Account ID: ${client._id}`}
      size="max-w-2xl"
    >
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
