import { useEffect, useState, useCallback } from 'react';
import {
  Search,
  RefreshCw,
  FileText,
  Loader2,
  Phone,
  Mail,
  Globe,
  MapPin,
  Trash2,
  Eye,
  Plus,
  LayoutGrid,
  List,
  Filter,
  X,
  Copy,
  Check,
  Building,
  Sparkles,
} from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LeadDetailModal from '../components/LeadDetailModal.jsx';
import CreateOfferModal from '../components/CreateOfferModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { statusLabel } from '../lib/utils.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Leads() {
  const [source, setSource] = useState('map');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [offerLead, setOfferLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [copiedId, setCopiedId] = useState(null);
  const toast = useToast();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { source, page, limit: 12 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (hasWebsiteFilter) params.hasWebsite = hasWebsiteFilter;
      const res = await api.get('/leads', { params });
      setLeads(res.data.leads || []);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(`Failed to fetch leads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [source, search, statusFilter, hasWebsiteFilter, page, toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await api.post('/leads/import');
      toast.success(res.message || 'Leads imported and synced successfully!');
      await fetchLeads();
    } catch (err) {
      toast.error(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.patch(`/leads/${leadId}`, { status: newStatus });
      toast.success(`Status updated to "${statusLabel(newStatus)}".`);
      setLeads((prev) => prev.map((l) => (l._id === leadId ? { ...l, status: newStatus } : l)));
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/leads/${leadToDelete._id}`);
      toast.success(`Lead "${leadToDelete.businessName || 'record'}" removed.`);
      setLeadToDelete(null);
      await fetchLeads();
    } catch (err) {
      toast.error(`Failed to delete lead: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Contact info copied to clipboard.');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setHasWebsiteFilter('');
    setPage(1);
    toast.info('Lead filters reset.');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Import Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Leads Pipeline</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Discover, qualify, audit websites, and convert leads into paying clients.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleImport}
            className="btn-primary text-xs py-2.5 px-4 shadow-sm"
            disabled={importing}
          >
            {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            {importing ? 'Syncing...' : 'Sync / Ingest Leads'}
          </button>
        </div>
      </div>

      {/* Source Selector & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'map', label: 'Google Maps / Local' },
            { id: 'facebook', label: 'Facebook Business' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSource(s.id);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-200 ${
                source === s.id
                  ? 'bg-primary-600 text-white shadow-sm ring-1 ring-primary-600'
                  : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table' ? 'bg-primary-50 text-primary-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('cards')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'cards' ? 'bg-primary-50 text-primary-600 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Card View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by business, phone, email, or city..."
            className="input pl-10 text-xs"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          className="input w-auto text-xs py-2.5 cursor-pointer font-medium"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          {['pending', 'contacted', 'responded', 'no_response', 'closed_client'].map((s) => (
            <option key={s} value={s}>
              {statusLabel(s)}
            </option>
          ))}
        </select>

        <select
          className="input w-auto text-xs py-2.5 cursor-pointer font-medium"
          value={hasWebsiteFilter}
          onChange={(e) => {
            setHasWebsiteFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Digital Presence (All)</option>
          <option value="true">With Website</option>
          <option value="false">Without Website</option>
        </select>

        {(search || statusFilter || hasWebsiteFilter) && (
          <button
            onClick={clearFilters}
            className="btn-secondary text-xs py-2 px-3 text-slate-600 hover:text-rose-600"
          >
            <X className="w-3.5 h-3.5 mr-1" /> Clear
          </button>
        )}
      </div>

      {/* Leads Content View */}
      {loading ? (
        <Loading text="Loading leads pipeline..." />
      ) : leads.length === 0 ? (
        <EmptyState
          title="No leads found"
          message="No records matched your search filters. Try importing new leads or adjusting query filters."
          actionLabel="Sync Leads Now"
          onAction={handleImport}
        />
      ) : viewMode === 'table' ? (
        <div className="glass-card overflow-hidden shadow-card border border-slate-200/80">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Business Name & Category</th>
                  <th className="px-5 py-3.5">Contact Channels</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Web Presence</th>
                  <th className="px-5 py-3.5">Pipeline Status</th>
                  <th className="px-5 py-3.5 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {leads.map((lead) => {
                  const leadName = lead.businessName || lead.name || 'Unnamed Lead';
                  return (
                    <tr
                      key={lead._id}
                      className="hover:bg-primary-50/40 transition-colors duration-150 group cursor-pointer"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-sm group-hover:text-primary-700 transition">
                            {leadName}
                          </p>
                          {lead.category && (
                            <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {lead.category}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-1">
                          {lead.phone ? (
                            <button
                              onClick={() => handleCopy(lead.phone, `phone-${lead._id}`)}
                              className="flex items-center gap-1.5 text-slate-700 hover:text-primary-600 font-medium"
                              title="Copy Phone"
                            >
                              <Phone className="w-3.5 h-3.5 text-slate-400" />
                              <span>{lead.phone}</span>
                              {copiedId === `phone-${lead._id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-400 italic">No phone</span>
                          )}

                          {lead.email && (
                            <button
                              onClick={() => handleCopy(lead.email, `email-${lead._id}`)}
                              className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-primary-600 truncate max-w-[180px]"
                              title="Copy Email"
                            >
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{lead.email}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{[lead.city, lead.country].filter(Boolean).join(', ') || '-'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {lead.hasWebsite ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                            <Globe className="w-3 h-3" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                            No site
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className="input text-xs py-1 px-2.5 w-auto font-semibold bg-white cursor-pointer shadow-none"
                        >
                          {['pending', 'contacted', 'responded', 'no_response', 'closed_client'].map((s) => (
                            <option key={s} value={s}>
                              {statusLabel(s)}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setOfferLead(lead)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-xl transition"
                            title="Create Proposal / Offer"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="btn-secondary text-[11px] py-1 px-2.5 font-semibold"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setLeadToDelete(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                            title="Delete Lead"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {leads.map((lead) => {
            const leadName = lead.businessName || lead.name || 'Unnamed Lead';
            return (
              <div
                key={lead._id}
                className="glass-card-hover p-5 flex flex-col justify-between space-y-4 cursor-pointer"
                onClick={() => setSelectedLead(lead)}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{leadName}</h3>
                      {lead.category && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">{lead.category}</p>
                      )}
                    </div>
                    <StatusBadge status={lead.status} size="xs" />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{lead.phone || 'No phone'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{lead.email || 'No email'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{[lead.city, lead.country].filter(Boolean).join(', ') || 'Unknown city'}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="pt-3 border-t border-slate-100 flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setOfferLead(lead)}
                    className="btn-secondary text-[11px] py-1 px-2.5 text-primary-700"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1" /> New Offer
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="btn-primary text-[11px] py-1 px-2.5"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Details
                    </button>
                    <button
                      onClick={() => setLeadToDelete(lead)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between p-4 glass-card">
          <p className="text-xs text-slate-500 font-medium">
            Showing Page <span className="font-bold text-slate-900">{page}</span> of{' '}
            <span className="font-bold text-slate-900">{pagination.pages}</span> ({pagination.total} total leads)
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Previous
            </button>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modals & Dialogs */}
      <LeadDetailModal
        lead={selectedLead}
        open={Boolean(selectedLead)}
        onClose={() => setSelectedLead(null)}
        onUpdate={fetchLeads}
      />
      <CreateOfferModal
        lead={offerLead}
        open={Boolean(offerLead)}
        onClose={() => setOfferLead(null)}
        onCreated={fetchLeads}
      />
      <ConfirmDialog
        open={Boolean(leadToDelete)}
        onClose={() => setLeadToDelete(null)}
        onConfirm={handleDeleteLead}
        title="Delete Lead Record"
        message={`Are you sure you want to permanently remove "${
          leadToDelete?.businessName || leadToDelete?.name || 'this lead'
        }" from your pipeline? This action cannot be undone.`}
        confirmText="Delete Lead"
        loading={deleting}
        variant="danger"
      />
    </div>
  );
}
