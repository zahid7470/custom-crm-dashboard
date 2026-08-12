import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

export default function EditProjectModal({ project, open, onClose, onSave }) {
  const [form, setForm] = useState({
    title: '',
    service: '',
    requirement: '',
    description: '',
    amount: '',
    notes: '',
    status: 'active',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setForm({
        title: project.title || '',
        service: project.service || '',
        requirement: project.requirement || '',
        description: project.description || '',
        amount: project.amount || '',
        notes: project.notes || '',
        status: project.status || 'active',
      });
      setError('');
    }
  }, [project, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (form.amount) payload.amount = Number(form.amount);
      await onSave(project._id, payload);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (!project) return null;

  return (
    <Modal open={open} onClose={onClose} title="Edit Project" size="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
        <div>
          <label className="label">Requirement</label>
          <textarea
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            rows={2}
            className="input"
          />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="input"
          />
        </div>
        <div>
          <label className="label">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
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
            <option value="active">Active</option>
            <option value="handed_over">Handed Over</option>
            <option value="support">Support</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
