import { useEffect, useState } from 'react';
import { TrendingUp, Users, CheckCircle, Clock, Globe, MapPin, Activity, Calendar } from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';

function StatCard({ title, value, sub, icon: Icon, accent }) {
  return (
    <div className="card p-5 animate-slideUp hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-500 mt-2">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${accent}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="space-y-4 animate-fadeIn">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={18} className="text-primary-600" />}
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </section>
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Overview of leads, clients, and pipeline health.</p>
        </div>
      </div>

      <Section title="Today" icon={Calendar}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard title="Total Leads" value={today.total} icon={Users} accent="bg-primary-50 text-primary-600" />
          <StatCard title="Pending" value={today.pending} icon={Clock} accent="bg-amber-50 text-amber-600" />
          <StatCard title="Contacted" value={today.contacted} icon={Activity} accent="bg-blue-50 text-blue-600" />
          <StatCard title="Responded" value={today.responded} icon={CheckCircle} accent="bg-emerald-50 text-emerald-600" />
          <StatCard title="No Response" value={today.no_response} icon={Clock} accent="bg-orange-50 text-orange-600" />
          <StatCard title="Closed Client" value={today.closed} icon={TrendingUp} accent="bg-violet-50 text-violet-600" />
          <StatCard title="Today's Contacts" value={today.contacts} icon={Activity} accent="bg-sky-50 text-sky-600" />
          <StatCard title="Today's Responses" value={today.responses} icon={CheckCircle} accent="bg-teal-50 text-teal-600" />
        </div>
      </Section>

      <Section title="This Month" icon={TrendingUp}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <StatCard title="Total Leads" value={month.total} icon={Users} accent="bg-primary-50 text-primary-600" />
          <StatCard title="Contacted" value={month.contacted} icon={Activity} accent="bg-blue-50 text-blue-600" />
          <StatCard title="Responded" value={month.responded} icon={CheckCircle} accent="bg-emerald-50 text-emerald-600" />
          <StatCard title="Closed" value={month.closed} icon={TrendingUp} accent="bg-violet-50 text-violet-600" />
          <StatCard title="Conversion Rate" value={`${month.conversion?.conversionRate || 0}%`} sub="of contacted leads" icon={TrendingUp} accent="bg-primary-50 text-primary-600" />
          <StatCard title="Avg Response Time" value={`${analytics.avgContactToResponseHours || 0}h`} sub="contact to response" icon={Clock} accent="bg-sky-50 text-sky-600" />
        </div>
      </Section>

      <Section title="Analytics" icon={Activity}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Lead Sources</p>
            <div className="space-y-3">
              {analytics.sources.map((s) => (
                <div key={s._id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{s._id}</span>
                  <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Website Availability</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-700">
                  <Globe size={14} className="text-emerald-500" /> With Website
                </span>
                <span className="font-semibold text-slate-900">{analytics.websiteAvailability.withWebsite}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-700">
                  <Globe size={14} className="text-slate-400" /> Without Website
                </span>
                <span className="font-semibold text-slate-900">{analytics.websiteAvailability.withoutWebsite}</span>
              </div>
            </div>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Follow-ups</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Pending</span>
                <span className="font-semibold text-slate-900">{analytics.followUps.pending}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-700">Overdue</span>
                <span className="font-semibold text-red-600">{analytics.followUps.overdue}</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Top Countries" icon={MapPin}>
        <div className="card p-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {analytics.countries.map((c) => (
              <div key={c._id} className="text-sm flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                <span className="font-semibold text-slate-800">{c._id || 'Unknown'}</span>
                <span className="text-slate-500">({c.count})</span>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
