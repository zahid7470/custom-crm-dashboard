import { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Briefcase,
  Clock,
  Loader2,
  Pencil,
  FileText,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  DollarSign,
  Layers,
} from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import EditClientModal from '../components/EditClientModal.jsx';
import EditProjectModal from '../components/EditProjectModal.jsx';
import EditOfferModal from '../components/EditOfferModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDateTime, formatDate, formatCurrency } from '../lib/utils.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [search, setSearch] = useState('');
  const [filterRepeat, setFilterRepeat] = useState('all');
  const toast = useToast();

  const fetchClients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/clients');
      setClients(res.data.clients || []);
    } catch (err) {
      toast.error(`Failed to load clients: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const viewClient = async (id) => {
    try {
      const res = await api.get(`/clients/${id}`);
      setSelected(res.data.client);
    } catch (err) {
      toast.error(`Failed to load client details: ${err.message}`);
    }
  };

  const handleUpdateClient = async (id, data) => {
    await api.patch(`/clients/${id}`, data);
    await fetchClients();
    await viewClient(id);
  };

  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalProjects = 0;
    let activeSupportCount = 0;

    clients.forEach((c) => {
      totalRevenue += Number(c.totalRevenue) || 0;
      totalProjects += Number(c.projectCount) || 0;
      if (c.activeSupport && c.activeSupport.length > 0) activeSupportCount++;
    });

    return {
      clientCount: clients.length,
      totalRevenue,
      totalProjects,
      activeSupportCount,
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const bname = (c.businessName || '').toLowerCase();
      const matchesSearch = !search || name.includes(search.toLowerCase()) || bname.includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (filterRepeat === 'repeat') return c.repeatClient;
      if (filterRepeat === 'new') return !c.repeatClient;
      return true;
    });
  }, [clients, search, filterRepeat]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clients & Portfolio</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage closed accounts, active project deliverables, warranties, and client lifetime value.
          </p>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Clients</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.clientCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Lifetime Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(stats.totalRevenue)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Delivered Projects</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.totalProjects}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600">Active Support</p>
          <p className="text-2xl font-extrabold text-violet-700 mt-1">{stats.activeSupportCount} accounts</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Clients' },
            { id: 'repeat', label: 'Repeat Clients' },
            { id: 'new', label: 'Single Project' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterRepeat(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                filterRepeat === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by client or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      {loading ? (
        <Loading text="Loading client portfolio..." />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          message="Convert qualified leads or proposals to populate your client roster."
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => (
            <div
              key={client._id}
              className="glass-card-hover p-6 cursor-pointer space-y-4 group"
              onClick={() => viewClient(client._id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-primary-700 transition">
                    {client.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {client.businessName || 'Independent Client'}
                  </p>
                </div>
                <div className="p-2.5 bg-primary-50 text-primary-600 rounded-2xl group-hover:scale-105 transition">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{client.phone || client.email || 'No contact specified'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{[client.city, client.country].filter(Boolean).join(', ') || 'Global'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Value</p>
                  <p className="text-base font-extrabold text-emerald-700">
                    {formatCurrency(client.totalRevenue)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {client.repeatClient && (
                    <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full ring-1 ring-violet-200">
                      Repeat Client
                    </span>
                  )}
                  <span className="text-xs font-bold text-primary-600 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
                    View &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Client Modal */}
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

function ClientDetailModal({
  client,
  open,
  onClose,
  onRefresh,
  onUpdateClient,
  actionLoading,
  setActionLoading,
}) {
  const [editClient, setEditClient] = useState(null);
  const [editProject, setEditProject] = useState(null);
  const [editOffer, setEditOffer] = useState(null);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const toast = useToast();

  const handleAction = async (key, fn, successMessage) => {
    setActionLoading((p) => ({ ...p, [key]: true }));
    try {
      await fn();
      toast.success(successMessage || 'Action completed successfully.');
    } catch (err) {
      toast.error(err.message || 'Action failed');
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
      <Modal
        open={open && !editClient && !editProject && !editOffer && !addProjectOpen}
        onClose={onClose}
        title={client?.name || 'Client Details'}
        subtitle={`Company: ${client?.businessName || 'Direct Account'}`}
        size="max-w-4xl"
      >
        {client && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header Actions */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-500 uppercase">Account Status:</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active Account
                </span>
                {client.repeatClient && (
                  <span className="text-xs font-bold bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full ring-1 ring-violet-200">
                    Repeat Client
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditClient(client)}
                  className="btn-secondary text-xs py-1.5 px-3 font-semibold"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1" /> Edit Profile
                </button>
              </div>
            </div>

            {/* Profile Info Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <InfoCard label="Email" value={client.email} />
              <InfoCard label="Phone" value={client.phone} />
              <InfoCard label="Website" value={client.website} link={client.website} />
              <InfoCard label="Location" value={[client.city, client.country].filter(Boolean).join(', ')} />
              <InfoCard label="Project Count" value={client.projectCount || '0'} />
              <InfoCard label="Total Revenue" value={formatCurrency(client.totalRevenue)} />
              <InfoCard label="Lead Sourced Via" value={client.source?.toUpperCase() || 'Direct'} />
              <InfoCard label="Account Registered" value={formatDate(client.createdAt)} />
            </div>

            {/* Projects Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary-600" /> Projects & Deliverables
                </h4>
              </div>

              <div className="space-y-3">
                {client.projects && client.projects.length > 0 ? (
                  client.projects.map((p) => (
                    <div
                      key={p._id}
                      className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 text-sm">{p.title}</p>
                            <StatusBadge status={p.status} type="project" size="xs" />
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.service} · Value: <span className="font-bold text-slate-900">{formatCurrency(p.amount)}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditProject(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                            title="Edit Project"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {p.status === 'active' && (
                            <button
                              onClick={() =>
                                handleAction(
                                  `handover-${p._id}`,
                                  () => api.patch(`/projects/${p._id}`, { status: 'handed_over' }),
                                  'Project moved to Handover status.'
                                )
                              }
                              className="btn-primary text-xs py-1.5 px-3"
                              disabled={actionLoading[`handover-${p._id}`]}
                            >
                              {actionLoading[`handover-${p._id}`] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : null}
                              Mark Handed Over
                            </button>
                          )}

                          {p.status === 'support' && (
                            <button
                              onClick={() =>
                                handleAction(
                                  `complete-${p._id}`,
                                  () => api.patch(`/projects/${p._id}`, { status: 'completed' }),
                                  'Project completed and closed.'
                                )
                              }
                              className="btn-success text-xs py-1.5 px-3"
                              disabled={actionLoading[`complete-${p._id}`]}
                            >
                              {actionLoading[`complete-${p._id}`] ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                              ) : null}
                              Mark Completed
                            </button>
                          )}
                        </div>
                      </div>

                      {(p.handoverDate || p.supportEndDate) && (
                        <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 text-xs text-slate-500">
                          {p.handoverDate && <span>Handover: {formatDate(p.handoverDate)}</span>}
                          {p.supportEndDate && (
                            <span className="flex items-center gap-1 font-medium text-purple-700">
                              <Clock className="w-3.5 h-3.5" /> Support warranty ends: {formatDate(p.supportEndDate)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-2xl">
                    No active projects logged for this client yet.
                  </p>
                )}
              </div>
            </div>

            {/* Offers History */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary-600" /> Commercial Proposals & History
              </h4>

              <div className="space-y-2.5">
                {client.offers && client.offers.length > 0 ? (
                  client.offers.map((o) => (
                    <div
                      key={o._id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">{o.offerId}</span>
                          <StatusBadge status={o.status} type="offer" size="xs" />
                        </div>
                        <p className="text-slate-600">
                          {o.service} · <span className="font-bold">{formatCurrency(o.amount)}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditOffer(o)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-slate-400">{formatDate(o.offerDate)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-2xl">
                    No offer records found.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <EditClientModal
        client={editClient}
        open={Boolean(editClient)}
        onClose={() => setEditClient(null)}
        onSave={onUpdateClient}
      />
      <EditProjectModal
        project={editProject}
        open={Boolean(editProject)}
        onClose={() => setEditProject(null)}
        onSave={handleProjectSave}
      />
      <EditOfferModal
        offer={editOffer}
        open={Boolean(editOffer)}
        onClose={() => setEditOffer(null)}
        onSave={handleOfferSave}
      />
    </>
  );
}

function InfoCard({ label, value, link }) {
  return (
    <div className="p-3 rounded-2xl bg-white border border-slate-200/80">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="font-bold text-primary-600 hover:underline block truncate mt-0.5"
        >
          {value || '-'}
        </a>
      ) : (
        <p className="font-bold text-slate-900 truncate mt-0.5">{value || '-'}</p>
      )}
    </div>
  );
}
