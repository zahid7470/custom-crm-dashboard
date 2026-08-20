import { useState, useEffect } from 'react';
import { FileText, Loader2, Send } from 'lucide-react';
import api from '../lib/api.js';
import Modal from './Modal.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function CreateOfferModal({ lead, open, onClose, onCreated }) {
  const [form, setForm] = useState({
    clientName: '',
    clientDetails: '',
    requirement: '',
    service: '',
    scope: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (lead) {
      setForm({
        clientName: lead.businessName || lead.name || '',
        clientDetails: [lead.phone, lead.email, lead.city, lead.country].filter(Boolean).join(' | '),
        requirement: lead.category ? `Web & Digital growth for ${lead.category}` : '',
        service: 'Custom Web Design & Lead Generation System',
        scope: 'Full responsive website redesign, SEO setup, CRM pipeline integration, and ongoing support.',
        amount: '2500',
      });
    } else {
      setForm({ clientName: '', clientDetails: '', requirement: '', service: '', scope: '', amount: '' });
    }
  }, [lead, open]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.clientName || !form.service || !form.amount) {
      toast.warning('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        amount: Number(form.amount),
        leadId: lead?._id,
      };
      const res = await api.post('/offers', payload);
      toast.success(`Proposal & Offer created successfully (${res.data?.offer?.offerId || 'Ready'})!`);
      onCreated && onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to create offer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create Client Proposal & Offer" subtitle={lead?.businessName ? `Targeting: ${lead.businessName}` : 'Generate new deal proposal'} size="max-w-2xl">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Client / Business Name *</label>
            <input
              className="input"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              placeholder="e.g. Apex Dental Care"
              required
            />
          </div>
          <div>
            <label className="label">Amount (USD) *</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">$</span>
              <input
                type="number"
                className="input pl-8"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="2500"
                required
                min="0"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Client Contact Details</label>
          <input
            className="input"
            value={form.clientDetails}
            onChange={(e) => setForm({ ...form, clientDetails: e.target.value })}
            placeholder="Phone, email, location..."
          />
        </div>

        <div>
          <label className="label">Service Proposed *</label>
          <input
            className="input"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            placeholder="e.g. Website Redesign & SEO Lead Engine"
            required
          />
        </div>

        <div>
          <label className="label">Client Requirement / Needs</label>
          <textarea
            className="input"
            value={form.requirement}
            onChange={(e) => setForm({ ...form, requirement: e.target.value })}
            placeholder="Outline what problem the client wants solved..."
            rows={2}
          />
        </div>

        <div>
          <label className="label">Scope of Work & Deliverables</label>
          <textarea
            className="input"
            value={form.scope}
            onChange={(e) => setForm({ ...form, scope: e.target.value })}
            placeholder="List deliverables, timelines, milestones..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary text-xs" disabled={loading}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary text-xs">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Send className="w-4 h-4 mr-1.5" />}
            {loading ? 'Generating Offer...' : 'Create & Generate PDF'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
