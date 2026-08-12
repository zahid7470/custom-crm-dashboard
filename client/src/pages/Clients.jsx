import { useEffect, useState } from 'react';
import { Users, Briefcase, Clock, Loader2, Pencil, FileText } from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import EditClientModal from '../components/EditClientModal.jsx';
import EditProjectModal from '../components/EditProjectModal.jsx';
import EditOfferModal from '../components/EditOfferModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDateTime, formatDate, statusLabel, offerStatusColor, projectStatusColor } from '../lib/utils.js';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data.clients);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewClient = async (id) => {
    try {
      const res = await api.get(`/clients/${id}`);
      setSelected(res.data.client);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateClient = async (id, data) => {
    await api.patch(`/clients/${id}`, data);
    await fetchClients();
    await viewClient(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Clients</h2>
          <p className="text-slate-500 text-sm mt-1">Track projects, offers, and support status.</p>
        </div>
      </div>

      {loading ? <Loading /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {clients.map((client) => (
            <div key={client._id} className="card p-5 cursor-pointer hover:-translate-y-1" onClick={() => viewClient(client._id)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{client.name}</h3>
                  <p className="text-sm text-slate-500">{client.businessName || 'No business name'}</p>
                </div>
                <div className="p-2 bg-primary-50 rounded-xl text-primary-600">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600 space-y-1">
                <p>{[client.city, client.country].filter(Boolean).join(', ') || '-'}</p>
                <p>{client.phone || client.email || '-'}</p>
                <p className="text-slate-900 font-semibold">Projects: {client.projectCount} · Revenue: {client.totalRevenue}</p>
                {client.repeatClient && <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 ring-1 ring-inset ring-violet-200">Repeat Client</span>}
              </div>
            </div>
          ))}
          {clients.length === 0 && <EmptyState message="No clients yet" />}
        </div>
      )}

      <ClientDetailModal
        client={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onRefresh={() => selected && viewClient(selected._id)}
        onUpdateClient={handleUpdateClient}
        actionLoading={actionLoading}
        setActionLoading={setActionLoading}
      />
    </div>
  );
}

function ClientDetailModal({ client, open, onClose, onRefresh, onUpdateClient, actionLoading, setActionLoading }) {
  const [editClient, setEditClient] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [editOffer, setEditOffer] = useState(null);

  const handleAction = async (key, fn) => {
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await fn();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading((p) => ({ ...p, [key]: false }));
      onRefresh();
    }
  };

  const handleProjectSave = async (id, data) => {
    await api.patch(`/projects/${id}`, data);
    onRefresh();
  };

  const handleOfferSave = async (id, data) => {
    await api.patch(`/offers/${id}`, data);
    onRefresh();
  };

  return (
    <>
      <Modal open={open && !editClient && !editProject && !editOffer} onClose={onClose} title={client?.name || 'Client Details'} size="max-w-4xl">
        {client && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => setEditClient(client)} className="btn-secondary text-xs">
                <Pencil size={14} className="mr-1" /> Edit Client
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <Info label="Business" value={client.businessName} />
              <Info label="Email" value={client.email} />
              <Info label="Phone" value={client.phone} />
              <Info label="Website" value={client.website} />
              <Info label="Source" value={client.source} />
              <Info label="Repeat Client" value={client.repeatClient ? 'Yes' : 'No'} />
              <Info label="Project Count" value={client.projectCount} />
              <Info label="Total Revenue" value={client.totalRevenue} />
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><Briefcase size={18} className="text-primary-600" /> Projects</h4>
              <div className="space-y-3">
                {client.projects && client.projects.map((p) => (
                  <div key={p._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">{p.title}</p>
                        <StatusBadge status={p.status} type="project" />
                        <p className="text-slate-600">Amount: {p.amount}</p>
                        {p.handoverDate && <p className="text-slate-500">Handover: {formatDate(p.handoverDate)}</p>}
                        {p.supportEndDate && (
                          <p className="text-slate-500 flex items-center gap-1"><Clock size={12} /> Support ends: {formatDate(p.supportEndDate)}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <button onClick={() => setEditProject(p)} className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition"><Pencil size={14} /></button>
                        {p.status === 'active' && (
                          <button
                            onClick={() => handleAction(`handover-${p._id}`, () => api.patch(`/projects/${p._id}`, { status: 'handed_over' }))}
                            className="btn-primary text-xs py-1 px-2"
                            disabled={actionLoading[`handover-${p._id}`]}
                          >
                            {actionLoading[`handover-${p._id}`] ? <Loader2 size={12} className="animate-spin" /> : 'Handover'}
                          </button>
                        )}
                        {p.status === 'support' && (
                          <button
                            onClick={() => handleAction(`complete-${p._id}`, () => api.patch(`/projects/${p._id}`, { status: 'completed' }))}
                            className="btn-secondary text-xs py-1 px-2"
                            disabled={actionLoading[`complete-${p._id}`]}
                          >
                            {actionLoading[`complete-${p._id}`] ? <Loader2 size={12} className="animate-spin" /> : 'Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!client.projects?.length && <p className="text-slate-500 text-sm">No projects yet.</p>}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2"><FileText size={18} className="text-primary-600" /> Offers</h4>
              <div className="space-y-3">
                {client.offers && client.offers.map((o) => (
                  <div key={o._id} className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">{o.offerId}</p>
                      <p className="text-slate-600">{o.service} · {o.amount}</p>
                      <StatusBadge status={o.status} type="offer" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => setEditOffer(o)} className="p-1.5 text-slate-600 hover:bg-white rounded-lg transition"><Pencil size={14} /></button>
                      <span className="text-xs text-slate-500">{formatDateTime(o.offerDate)}</span>
                    </div>
                  </div>
                ))}
                {!client.offers?.length && <p className="text-slate-500 text-sm">No offers yet.</p>}
              </div>
            </div>

            {client.activeSupport?.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-900 mb-3">Active Support</h4>
                {client.activeSupport.map((s) => (
                  <div key={s._id} className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 text-sm">
                    <p className="font-semibold text-emerald-900">{s.title}</p>
                    <p className="text-emerald-800">{s.supportStatus} · {s.daysRemaining != null ? `${s.daysRemaining} days left` : ''}</p>
                    <p className="text-emerald-700/80">Support ends: {formatDate(s.supportEndDate)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      <EditClientModal client={editClient} open={Boolean(editClient)} onClose={() => setEditClient(null)} onSave={onUpdateClient} />
      <EditProjectModal project={editProject} open={Boolean(editProject)} onClose={() => setEditProject(null)} onSave={handleProjectSave} />
      <EditOfferModal offer={editOffer} open={Boolean(editOffer)} onClose={() => setEditOffer(null)} onSave={handleOfferSave} />
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className="font-semibold text-slate-900 mt-0.5">{value || '-'}</p>
    </div>
  );
}
