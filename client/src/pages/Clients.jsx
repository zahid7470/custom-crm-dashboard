import { useEffect, useState } from 'react';
import { Users, Briefcase, Clock } from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { formatDateTime, formatDate } from '../lib/utils.js';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/clients').then((res) => setClients(res.data.clients)).finally(() => setLoading(false));
  }, []);

  const viewClient = async (id) => {
    try {
      const res = await api.get(`/clients/${id}`);
      setSelected(res.data.client);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
      </div>

      {loading ? <Loading /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client._id} className="card p-4 hover:shadow-md transition cursor-pointer" onClick={() => viewClient(client._id)}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">{client.businessName}</p>
                </div>
                <Users size={18} className="text-gray-400" />
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>{client.country}{client.city ? `, ${client.city}` : ''}</p>
                <p>{client.phone || client.email || '-'}</p>
                <p>Projects: {client.projectCount} · Revenue: {client.totalRevenue}</p>
                {client.repeatClient && <span className="badge bg-purple-100 text-purple-800">Repeat Client</span>}
              </div>
            </div>
          ))}
          {clients.length === 0 && <EmptyState message="No clients yet" />}
        </div>
      )}

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name || 'Client Details'}>
        {selected && <ClientDetail client={selected} onClose={() => setSelected(null)} onRefresh={() => viewClient(selected._id)} />}
      </Modal>
    </div>
  );
}

function ClientDetail({ client, onRefresh }) {
  const handleHandover = async (projectId) => {
    try {
      await api.patch(`/projects/${projectId}`, { status: 'handed_over' });
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (projectId) => {
    try {
      await api.patch(`/projects/${projectId}`, { status: 'completed' });
      onRefresh();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Briefcase size={16} /> Projects</h4>
        <div className="space-y-3">
          {client.projects && client.projects.map((p) => (
            <div key={p._id} className="bg-gray-50 p-3 rounded-md text-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-gray-500">Status: {p.status}</p>
                  <p className="text-gray-500">Amount: {p.amount}</p>
                  {p.handoverDate && <p className="text-gray-500">Handover: {formatDate(p.handoverDate)}</p>}
                  {p.supportEndDate && (
                    <p className="text-gray-500 flex items-center gap-1"><Clock size={12} /> Support ends: {formatDate(p.supportEndDate)}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {p.status === 'active' && (
                    <button onClick={() => handleHandover(p._id)} className="btn-primary text-xs py-1 px-2">Handover</button>
                  )}
                  {p.status === 'support' && (
                    <button onClick={() => handleComplete(p._id)} className="btn-secondary text-xs py-1 px-2">Mark Completed</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!client.projects?.length && <p className="text-gray-500 text-sm">No projects yet.</p>}
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Offers</h4>
        <div className="space-y-2">
          {client.offers && client.offers.map((o) => (
            <div key={o._id} className="bg-gray-50 p-3 rounded-md text-sm flex justify-between">
              <div>
                <p className="font-medium">{o.offerId}</p>
                <p className="text-gray-500">{o.service} · {o.amount}</p>
              </div>
              <span className="text-xs text-gray-500">{formatDateTime(o.offerDate)}</span>
            </div>
          ))}
          {!client.offers?.length && <p className="text-gray-500 text-sm">No offers yet.</p>}
        </div>
      </div>

      {client.activeSupport?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Active Support</h4>
          {client.activeSupport.map((s) => (
            <div key={s._id} className="bg-green-50 p-3 rounded-md text-sm">
              <p className="font-medium">{s.title}</p>
              <p className="text-gray-600">Support Status: {s.supportStatus} · Days Remaining: {s.daysRemaining}</p>
              <p className="text-gray-600">Support Ends: {formatDate(s.supportEndDate)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || '-'}</p>
    </div>
  );
}
