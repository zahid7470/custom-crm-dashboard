import { useEffect, useState } from 'react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

function StatCard({ title, value, sub }) {
  return (
    <div className="card p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/dashboard')
      .then((res) => setStats(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <EmptyState />;

  const { today, month, allTime, analytics } = stats;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      </div>

      <h3 className="text-lg font-semibold text-gray-800">Today</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={today.total} />
        <StatCard title="Pending" value={today.pending} />
        <StatCard title="Contacted" value={today.contacted} />
        <StatCard title="Responded" value={today.responded} />
        <StatCard title="No Response" value={today.no_response} />
        <StatCard title="Closed Client" value={today.closed} />
        <StatCard title="Today's Contacts" value={today.contacts} />
        <StatCard title="Today's Responses" value={today.responses} />
      </div>

      <h3 className="text-lg font-semibold text-gray-800">This Month</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={month.total} />
        <StatCard title="Contacted" value={month.contacted} />
        <StatCard title="Responded" value={month.responded} />
        <StatCard title="Closed" value={month.closed} />
        <StatCard title="Conversion Rate" value={`${month.conversion?.conversionRate || 0}%`} />
        <StatCard title="Avg Response Time" value={`${analytics.avgContactToResponseHours || 0}h`} />
      </div>

      <h3 className="text-lg font-semibold text-gray-800">Analytics</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-2">Lead Sources</p>
          <div className="space-y-1">
            {analytics.sources.map((s) => (
              <div key={s._id} className="flex justify-between text-sm">
                <span>{s._id}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-2">Website Availability</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>With Website</span><span className="font-medium">{analytics.websiteAvailability.withWebsite}</span></div>
            <div className="flex justify-between"><span>Without Website</span><span className="font-medium">{analytics.websiteAvailability.withoutWebsite}</span></div>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-sm text-gray-500 mb-2">Follow-ups</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>Pending</span><span className="font-medium">{analytics.followUps.pending}</span></div>
            <div className="flex justify-between"><span>Overdue</span><span className="font-medium text-red-600">{analytics.followUps.overdue}</span></div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800">Top Countries</h3>
      <div className="card p-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {analytics.countries.map((c) => (
            <div key={c._id} className="text-sm">
              <span className="font-medium">{c._id || 'Unknown'}</span>: {c.count}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
