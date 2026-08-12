import { useEffect, useState, useCallback } from 'react';
import { Search, RefreshCw, FileText, Loader2 } from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LeadDetailModal from '../components/LeadDetailModal.jsx';
import CreateOfferModal from '../components/CreateOfferModal.jsx';
import { statusLabel } from '../lib/utils.js';

export default function Leads() {
  const [source, setSource] = useState('map');
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [hasWebsiteFilter, setHasWebsiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [offerLead, setOfferLead] = useState(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { source, page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (hasWebsiteFilter) params.hasWebsite = hasWebsiteFilter;
      const res = await api.get('/leads', { params });
      setLeads(res.data.leads);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [source, search, statusFilter, hasWebsiteFilter, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleImport = async () => {
    setImporting(true);
    setError('');
    try {
      await api.post('/leads/import');
      await fetchLeads();
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leads</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and convert your pipeline.</p>
        </div>
        <button onClick={handleImport} className="btn-secondary" disabled={importing}>
          {importing ? <Loader2 size={16} className="mr-2 animate-spin" /> : <RefreshCw size={16} className="mr-2" />}
          Add / Import Leads
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-100">
        {['map', 'facebook'].map((s) => (
          <button
            key={s}
            onClick={() => { setSource(s); setPage(1); }}
            className={`pb-2.5 px-3 text-sm font-semibold capitalize transition ${
              source === s ? 'text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads..."
            className="input pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="input w-auto" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          {['pending', 'contacted', 'responded', 'no_response', 'closed_client'].map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
        <select className="input w-auto" value={hasWebsiteFilter} onChange={(e) => { setHasWebsiteFilter(e.target.value); setPage(1); }}>
          <option value="">Website</option>
          <option value="true">With Website</option>
          <option value="false">Without Website</option>
        </select>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      {loading ? <Loading /> : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Business</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Website</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Imported</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4 font-semibold text-slate-900">{lead.businessName || lead.name || '-'}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {lead.phone && <div>{lead.phone}</div>}
                        {lead.email && <div className="text-xs text-slate-500">{lead.email}</div>}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{[lead.city, lead.country].filter(Boolean).join(', ') || '-'}</td>
                      <td className="px-5 py-4">
                        {lead.hasWebsite ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">Yes</span>
                        ) : (
                          <span className="text-slate-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={lead.status} /></td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setOfferLead(lead)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Create Offer">
                            <FileText size={16} />
                          </button>
                          <button onClick={() => setSelectedLead(lead)} className="text-xs font-semibold text-primary-600 hover:text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition">
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr><td colSpan="7" className="py-10"><EmptyState message="No leads found" /></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center gap-3">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-secondary px-4 py-1.5 text-xs">Previous</button>
              <span className="text-sm text-slate-600 py-1.5 font-medium">Page {page} of {pagination.pages}</span>
              <button disabled={page === pagination.pages} onClick={() => setPage(page + 1)} className="btn-secondary px-4 py-1.5 text-xs">Next</button>
            </div>
          )}
        </>
      )}

      <LeadDetailModal lead={selectedLead} open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} onUpdate={fetchLeads} />
      <CreateOfferModal lead={offerLead} open={Boolean(offerLead)} onClose={() => setOfferLead(null)} onCreated={fetchLeads} />
    </div>
  );
}
