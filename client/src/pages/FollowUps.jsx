import { useEffect, useState } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import EditFollowUpModal from '../components/EditFollowUpModal.jsx';
import { formatDateTime } from '../lib/utils.js';

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [editFollowUp, setEditFollowUp] = useState(null);

  const fetchFollowUps = async () => {
    setLoading(true);
    try {
      const res = await api.get('/follow-ups');
      setFollowUps(res.data.followUps);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFollowUps(); }, []);

  const handleEOD = async () => {
    setProcessing(true);
    setMessage('');
    try {
      await api.post('/follow-ups/process');
      await fetchFollowUps();
      setMessage('End-of-day processing completed.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSave = async (id, data) => {
    await api.patch(`/follow-ups/${id}`, data);
    await fetchFollowUps();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Follow-ups</h2>
          <p className="text-slate-500 text-sm mt-1">Stay on top of outreach and next actions.</p>
        </div>
        <button onClick={handleEOD} disabled={processing} className="btn-secondary">
          {processing ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
          End of Day Process
        </button>
      </div>

      {message && <div className={`text-sm p-3 rounded-lg ${message.includes('completed') ? 'text-primary-700 bg-primary-50' : 'text-red-600 bg-red-50'}`}>{message}</div>}

      {loading ? <Loading /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-5 py-4">Lead</th>
                  <th className="px-5 py-4">Source</th>
                  <th className="px-5 py-4">Last Contact</th>
                  <th className="px-5 py-4">Next Follow-up</th>
                  <th className="px-5 py-4">Count</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Notes</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {followUps.map((f) => (
                  <tr key={f._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-5 py-4 font-semibold text-slate-900">{f.leadId?.businessName || f.leadId?.name || '-'}</td>
                    <td className="px-5 py-4 capitalize text-slate-600">{f.leadId?.source}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(f.lastContactDate)}</td>
                    <td className="px-5 py-4 text-slate-600">{formatDateTime(f.nextFollowUpDate)}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{f.count}</td>
                    <td className="px-5 py-4"><StatusBadge status={f.status} type="followup" /></td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{f.notes || '-'}</td>
                    <td className="px-5 py-4 text-right">
                      <button onClick={() => setEditFollowUp(f)} className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition" title="Edit">
                        <Pencil size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {followUps.length === 0 && <tr><td colSpan="8" className="py-10"><EmptyState message="No follow-ups" /></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditFollowUpModal followUp={editFollowUp} open={Boolean(editFollowUp)} onClose={() => setEditFollowUp(null)} onSave={handleSave} />
    </div>
  );
}
