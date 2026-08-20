import { useEffect, useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Pencil,
  Loader2,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import EditOfferModal from '../components/EditOfferModal.jsx';
import CreateOfferModal from '../components/CreateOfferModal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDateTime, formatCurrency } from '../lib/utils.js';
import { useToast } from '../context/ToastContext.jsx';

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOffer, setEditOffer] = useState(null);
  const [createOfferOpen, setCreateOfferOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const toast = useToast();

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/offers');
      setOffers(res.data.offers || []);
    } catch (err) {
      toast.error(`Failed to load offers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleStatusChange = async (id, status) => {
    setStatusLoading((p) => ({ ...p, [id]: status }));
    try {
      await api.patch(`/offers/${id}`, { status });
      toast.success(`Offer status changed to "${status.toUpperCase()}".`);
      await fetchOffers();
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    } finally {
      setStatusLoading((p) => ({ ...p, [id]: '' }));
    }
  };

  const handleSave = async (id, data) => {
    await api.patch(`/offers/${id}`, data);
    await fetchOffers();
  };

  const stats = useMemo(() => {
    let totalValue = 0;
    let acceptedValue = 0;
    let pendingCount = 0;
    let acceptedCount = 0;

    offers.forEach((o) => {
      const amt = Number(o.amount) || 0;
      totalValue += amt;
      if (o.status === 'accepted' || o.status === 'completed') {
        acceptedValue += amt;
        acceptedCount++;
      } else if (o.status === 'sent' || o.status === 'draft') {
        pendingCount++;
      }
    });

    const winRate = offers.length ? Math.round((acceptedCount / offers.length) * 100) : 0;

    return {
      totalCount: offers.length,
      totalValue,
      acceptedValue,
      pendingCount,
      winRate,
    };
  }, [offers]);

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      const matchesSearch =
        !search ||
        (o.clientName || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.service || '').toLowerCase().includes(search.toLowerCase()) ||
        (o.offerId || '').toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'all') return true;
      return o.status === statusFilter;
    });
  }, [offers, search, statusFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Proposals & Client Offers</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Generate customized commercial proposals, automate PDF contracts, and track close rates.
          </p>
        </div>
        <button onClick={() => setCreateOfferOpen(true)} className="btn-primary text-xs py-2.5 px-4 shadow-sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Create New Proposal
        </button>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Proposals</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.totalCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pipeline Deal Value</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{formatCurrency(stats.totalValue)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Won Revenue</p>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{formatCurrency(stats.acceptedValue)}</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Proposal Win Rate</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats.winRate}%</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Offers' },
            { id: 'sent', label: 'Sent' },
            { id: 'accepted', label: 'Accepted' },
            { id: 'completed', label: 'Completed' },
            { id: 'draft', label: 'Draft' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === tab.id
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
            placeholder="Search proposals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Offers Table */}
      {loading ? (
        <Loading text="Loading proposals and offer PDFs..." />
      ) : filteredOffers.length === 0 ? (
        <EmptyState
          title="No proposals found"
          message="Create your first client proposal to generate structured scopes and automated PDFs."
          actionLabel="Create Proposal Now"
          onAction={() => setCreateOfferOpen(true)}
          icon={FileText}
        />
      ) : (
        <div className="glass-card overflow-hidden shadow-card border border-slate-200/80">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Proposal ID</th>
                  <th className="px-5 py-3.5">Client & Target</th>
                  <th className="px-5 py-3.5">Service Package</th>
                  <th className="px-5 py-3.5">Quote Amount</th>
                  <th className="px-5 py-3.5">Deal Status</th>
                  <th className="px-5 py-3.5">Date Created</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {filteredOffers.map((offer) => (
                  <tr key={offer._id} className="hover:bg-primary-50/30 transition-colors duration-150 group">
                    <td className="px-5 py-4 font-bold text-slate-900 font-mono text-xs">
                      {offer.offerId || 'OFF-NEW'}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900 text-sm group-hover:text-primary-700 transition">
                        {offer.clientName || 'Unnamed Client'}
                      </p>
                      {offer.clientDetails && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{offer.clientDetails}</p>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-700 font-medium max-w-xs truncate">
                      {offer.service}
                    </td>

                    <td className="px-5 py-4 font-extrabold text-slate-900 text-sm">
                      {formatCurrency(offer.amount)}
                    </td>

                    <td className="px-5 py-4">
                      {statusLoading[offer._id] ? (
                        <div className="flex items-center gap-1.5 text-primary-600">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs font-semibold">Updating...</span>
                        </div>
                      ) : (
                        <select
                          value={offer.status}
                          onChange={(e) => handleStatusChange(offer._id, e.target.value)}
                          className="input py-1 px-2.5 w-auto text-xs font-semibold cursor-pointer shadow-none"
                        >
                          {['draft', 'sent', 'accepted', 'completed', 'cancelled'].map((s) => (
                            <option key={s} value={s}>
                              {s.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-500 text-xs">
                      {formatDateTime(offer.offerDate || offer.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2 items-center">
                        <button
                          onClick={() => setEditOffer(offer)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
                          title="Edit Offer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {offer.pdfPath && (
                          <a
                            href={`/api/offers/${offer._id}/pdf`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary text-[11px] py-1 px-2.5 text-primary-700 font-semibold"
                            onClick={() => toast.info('Opening proposal PDF...')}
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> PDF
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Offer Modal */}
      <EditOfferModal
        offer={editOffer}
        open={Boolean(editOffer)}
        onClose={() => setEditOffer(null)}
        onSave={handleSave}
      />

      {/* Create Offer Modal */}
      <CreateOfferModal
        open={createOfferOpen}
        onClose={() => setCreateOfferOpen(false)}
        onCreated={fetchOffers}
      />
    </div>
  );
}
