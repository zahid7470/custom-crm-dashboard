import { useEffect, useState, useMemo } from 'react';
import {
  Pencil,
  Loader2,
  PhoneCall,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Search,
  Building,
  ArrowRight,
  Filter,
} from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EditFollowUpModal from '../components/EditFollowUpModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { formatDateTime } from '../lib/utils.js';
import { useToast } from '../context/ToastContext.jsx';

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [confirmEodOpen, setConfirmEodOpen] = useState(false);
  const [editFollowUp, setEditFollowUp] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');
  const toast = useToast();

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/follow-ups');
      setFollowUps(res.data.followUps || []);
    } catch (err) {
      toast.error(`Failed to load follow-ups: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFollowUps();
  }, []);

  const handleEOD = async () => {
    setProcessing(true);
    try {
      const res = await api.post('/follow-ups/process');
      await fetchFollowUps();
      toast.success(res.message || 'End-of-day batch processing completed successfully!');
      setConfirmEodOpen(false);
    } catch (err) {
      toast.error(`EOD process failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (id, data) => {
    await api.patch(`/follow-ups/${id}`, data);
    await fetchFollowUps();
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const todayEnd = todayStart + 86400000;

  const counts = useMemo(() => {
    let overdue = 0;
    let dueToday = 0;
    let open = 0;
    let converted = 0;

    followUps.forEach((f) => {
      const isPending = f.status === 'open';
      if (isPending) open++;
      if (f.status === 'converted') converted++;

      if (isPending && f.nextFollowUpDate) {
        const time = new Date(f.nextFollowUpDate).getTime();
        if (time < todayStart) overdue++;
        else if (time >= todayStart && time <= todayEnd) dueToday++;
      }
    });

    return { total: followUps.length, overdue, dueToday, open, converted };
  }, [followUps, todayStart, todayEnd]);

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((f) => {
      const leadName = (f.leadId?.businessName || f.leadId?.name || '').toLowerCase();
      const notes = (f.notes || '').toLowerCase();
      const matchesSearch = !search || leadName.includes(search.toLowerCase()) || notes.includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (activeFilter === 'all') return true;
      if (activeFilter === 'open') return f.status === 'open';
      if (activeFilter === 'converted') return f.status === 'converted';
      if (activeFilter === 'closed') return f.status === 'closed';

      if (activeFilter === 'overdue') {
        return f.status === 'open' && f.nextFollowUpDate && new Date(f.nextFollowUpDate).getTime() < todayStart;
      }

      if (activeFilter === 'today') {
        if (f.status !== 'open' || !f.nextFollowUpDate) return false;
        const time = new Date(f.nextFollowUpDate).getTime();
        return time >= todayStart && time <= todayEnd;
      }

      return true;
    });
  }, [followUps, activeFilter, search, todayStart, todayEnd]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Follow-ups & Outreach</h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Maintain communication momentum and ensure zero leads slip through the cracks.
          </p>
        </div>
        <button
          onClick={() => setConfirmEodOpen(true)}
          disabled={processing}
          className="btn-primary text-xs py-2.5 px-4 shadow-sm"
        >
          {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
          {processing ? 'Processing...' : 'Run End-of-Day Process'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveFilter('open')}
          className={`cursor-pointer p-4 rounded-2xl bg-white border transition-all ${
            activeFilter === 'open' ? 'border-primary-500 shadow-md ring-2 ring-primary-500/20' : 'border-slate-200/80 shadow-xs'
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Open Follow-ups</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{counts.open}</p>
        </div>

        <div
          onClick={() => setActiveFilter('today')}
          className={`cursor-pointer p-4 rounded-2xl bg-white border transition-all ${
            activeFilter === 'today' ? 'border-sky-500 shadow-md ring-2 ring-sky-500/20' : 'border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Due Today</p>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-sky-950 mt-1">{counts.dueToday}</p>
        </div>

        <div
          onClick={() => setActiveFilter('overdue')}
          className={`cursor-pointer p-4 rounded-2xl bg-white border transition-all ${
            activeFilter === 'overdue' ? 'border-rose-500 shadow-md ring-2 ring-rose-500/20' : 'border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">Overdue</p>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">{counts.overdue}</p>
        </div>

        <div
          onClick={() => setActiveFilter('converted')}
          className={`cursor-pointer p-4 rounded-2xl bg-white border transition-all ${
            activeFilter === 'converted' ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Converted</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1">{counts.converted}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'today', label: `Due Today (${counts.dueToday})` },
            { id: 'overdue', label: `Overdue (${counts.overdue})` },
            { id: 'open', label: 'Open' },
            { id: 'converted', label: 'Converted' },
            { id: 'closed', label: 'Closed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeFilter === tab.id
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
            placeholder="Search follow-ups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs py-2"
          />
        </div>
      </div>

      {/* Follow-ups Content */}
      {loading ? (
        <Loading text="Loading follow-up pipeline..." />
      ) : filteredFollowUps.length === 0 ? (
        <EmptyState
          title="No follow-ups match criteria"
          message="There are no scheduled follow-up tasks under this category."
          icon={PhoneCall}
        />
      ) : (
        <div className="glass-card overflow-hidden shadow-card border border-slate-200/80">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-slate-50/90 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3.5">Lead / Account</th>
                  <th className="px-5 py-3.5">Last Contact</th>
                  <th className="px-5 py-3.5">Next Touchpoint</th>
                  <th className="px-5 py-3.5 text-center">Touch Count</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Latest Notes</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white/70">
                {filteredFollowUps.map((f) => {
                  const leadName = f.leadId?.businessName || f.leadId?.name || 'Unnamed Lead';
                  const isOverdue =
                    f.status === 'open' && f.nextFollowUpDate && new Date(f.nextFollowUpDate).getTime() < todayStart;

                  return (
                    <tr key={f._id} className="hover:bg-primary-50/30 transition-colors duration-150 group">
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 text-sm group-hover:text-primary-700 transition">
                            {leadName}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">
                            Source: {f.leadId?.source || 'Direct'}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {formatDateTime(f.lastContactDate)}
                      </td>

                      <td className="px-5 py-4">
                        {f.nextFollowUpDate ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-semibold ${
                                isOverdue ? 'text-rose-600 font-bold flex items-center gap-1' : 'text-slate-800'
                              }`}
                            >
                              {isOverdue && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                              {formatDateTime(f.nextFollowUpDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Not scheduled</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 font-bold text-slate-800 text-xs">
                          {f.count || 0}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={f.status} type="followup" />
                      </td>

                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                        {f.notes || <span className="text-slate-300 italic">No notes recorded</span>}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setEditFollowUp(f)}
                          className="btn-secondary text-xs py-1.5 px-3 font-semibold"
                        >
                          <Pencil className="w-3.5 h-3.5 mr-1 text-slate-500" /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Follow-up Modal */}
      <EditFollowUpModal
        followUp={editFollowUp}
        open={Boolean(editFollowUp)}
        onClose={() => setEditFollowUp(null)}
        onSave={handleSave}
      />

      {/* Confirm EOD Dialog */}
      <ConfirmDialog
        open={confirmEodOpen}
        onClose={() => setConfirmEodOpen(false)}
        onConfirm={handleEOD}
        title="Execute End of Day Pipeline Automation"
        message="This will automatically process pending follow-ups, advance overdue schedules, update lead stages, and prepare tomorrow's outreach agenda. Would you like to proceed?"
        confirmText="Run Automation"
        loading={processing}
        variant="warning"
      />
    </div>
  );
}
