import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

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
  const toast = useToast();

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
    }
  }, [project, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (form.amount) payload.amount = Number(form.amount);
      await onSave(project._id, payload);
      toast.success(`Project "${form.title || 'Project'}" updated.`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  if (!project) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Client Project"
      subtitle={`Project: ${project.title || 'Project'}`}
      size="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Project Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="input"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Service Category</label>
            <input
              type="text"
              value={form.service}
              onChange={(e) => setForm({ ...form, service: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Contract Value (USD)</label>
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
        </div>

        <div>
          <label className="label">Requirement / Deliverables</label>
          <textarea
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            rows={2}
            className="input"
          />
        </div>

        <div>
          <label className="label">Scope & Architecture Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="input"
          />
        </div>

        <div>
          <label className="label">Status & Lifecycle Stage</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="input cursor-pointer font-semibold"
          >
            <option value="active">Active (Development / Execution)</option>
            <option value="handed_over">Handed Over (Client Review)</option>
            <option value="support">Support / Maintenance Active</option>
            <option value="completed">Completed & Closed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary text-xs" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Save className="w-4 h-4 mr-1.5" />}
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
