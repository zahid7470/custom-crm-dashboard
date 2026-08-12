import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { formatDateTime } from '../lib/utils.js';

export default function FollowUps() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState('');

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Follow-ups</h2>
        <button onClick={handleEOD} disabled={processing} className="btn-secondary">
          End of Day Process
        </button>
      </div>

      {message && <div className="text-sm text-primary-700 bg-primary-50 p-3 rounded">{message}</div>}

      {loading ? <Loading /> : (
        <div className="card overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium">
              <tr>
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Last Contact</th>
                <th className="px-4 py-3">Next Follow-up</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {followUps.map((f) => (
                <tr key={f._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{f.leadId?.businessName || f.leadId?.name || '-'}</td>
                  <td className="px-4 py-3 capitalize">{f.leadId?.source}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(f.lastContactDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDateTime(f.nextFollowUpDate)}</td>
                  <td className="px-4 py-3">{f.count}</td>
                  <td className="px-4 py-3"><StatusBadge status={f.status} /></td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{f.notes || '-'}</td>
                </tr>
              ))}
              {followUps.length === 0 && <tr><td colSpan="7" className="py-8"><EmptyState message="No follow-ups" /></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
