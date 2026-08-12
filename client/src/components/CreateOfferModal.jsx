import { useState, useEffect } from 'react';
import api from '../lib/api.js';
import Modal from './Modal.jsx';

export default function CreateOfferModal({ lead, open, onClose, onCreated }) {
  const [form, setForm] = useState({
    clientName: lead?.businessName || lead?.name || '',
    clientDetails: '',
    requirement: '',
    service: '',
    scope: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (lead) {
      setForm((f) => ({ ...f, clientName: lead.businessName || lead.name || '' }));
    } else {
      setForm({ clientName: '', clientDetails: '', requirement: '', service: '', scope: '', amount: '' });
    }
  }, [lead]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, amount: Number(form.amount), leadId: lead._id };
      await api.post('/offers', payload);
      onCreated && onCreated();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Client Offer">
      <form onSubmit={submit} className="space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        <div>
          <label className="label">Client Name</label>
          <input className="input" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required />
        </div>
        <div>
          <label className="label">Client Details</label>
          <input className="input" value={form.clientDetails} onChange={(e) => setForm({ ...form, clientDetails: e.target.value })} placeholder="Phone, email, location..." />
        </div>
        <div>
          <label className="label">Requirement</label>
          <textarea className="input" value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} required />
        </div>
        <div>
          <label className="label">Service</label>
          <input className="input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required />
        </div>
        <div>
          <label className="label">Scope / Details</label>
          <textarea className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
        </div>
        <div>
          <label className="label">Amount</label>
          <input type="number" className="input" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="0" />
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">Create Offer</button>
        </div>
      </form>
    </Modal>
  );
}
