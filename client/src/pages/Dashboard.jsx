import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Globe,
  MapPin,
  Activity,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  PhoneCall,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import api from '../lib/api.js';
import Loading from '../components/Loading.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { Link } from 'react-router-dom';

function StatCard({ title, value, sub, icon: Icon, color = 'primary', trend }) {
  const colorMap = {
    primary: {
      bg: 'from-primary-500/10 via-primary-500/5 to-transparent',
      border: 'border-primary-200/60',
      iconBg: 'bg-primary-500/10 text-primary-600 ring-primary-500/20',
      text: 'text-primary-950',
    },
    amber: {
      bg: 'from-amber-500/10 via-amber-500/5 to-transparent',
      border: 'border-amber-200/60',
      iconBg: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
      text: 'text-amber-950',
    },
    blue: {
      bg: 'from-sky-500/10 via-sky-500/5 to-transparent',
      border: 'border-sky-200/60',
      iconBg: 'bg-sky-500/10 text-sky-600 ring-sky-500/20',
      text: 'text-sky-950',
    },
    emerald: {
      bg: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      border: 'border-emerald-200/60',
      iconBg: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
      text: 'text-emerald-950',
    },
    violet: {
      bg: 'from-violet-500/10 via-violet-500/5 to-transparent',
      border: 'border-violet-200/60',
      iconBg: 'bg-violet-500/10 text-violet-600 ring-violet-500/20',
      text: 'text-violet-950',
    },
    rose: {
      bg: 'from-rose-500/10 via-rose-500/5 to-transparent',
      border: 'border-rose-200/60',
      iconBg: 'bg-rose-500/10 text-rose-600 ring-rose-500/20',
      text: 'text-rose-950',
    },
  };

  const currentTheme = colorMap[color] || colorMap.primary;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white p-5 border ${currentTheme.border} shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${currentTheme.bg} pointer-events-none`} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold tracking-wider uppercase text-slate-400">{title}</p>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</p>
          {sub && <p className="text-xs text-slate-500 font-medium pt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl ring-1 shadow-sm shrink-0 ${currentTheme.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="relative mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-emerald-600 font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            {trend}
          </span>
          <span className="text-slate-400 font-medium">vs prev period</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setError('');

      try {
        const res = await api.get('/dashboard');
        setStats(res.data);
        if (isManualRefresh) {
          toast.success('Dashboard metrics refreshed successfully.');
        }
      } catch (err) {
        setError(err.message);
        toast.error(`Failed to load metrics: ${err.message}`);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !stats) return <Loading text="Crunching real-time CRM analytics..." />;
  if (error && !stats) {
    return (
      <div className="card p-8 text-center space-y-4 max-w-lg mx-auto">
        <p className="text-rose-600 font-semibold">{error}</p>
        <button onClick={() => fetchDashboardData(true)} className="btn-primary">
          Retry Loading
        </button>
      </div>
    );
  }
  if (!stats) return <EmptyState title="No analytics data" message="No CRM activity recorded yet." />;

  const { today, month, allTime, analytics } = stats;

  const totalLeadsMonth = month?.total || 0;
  const contactedMonth = month?.contacted || 0;
  const respondedMonth = month?.responded || 0;
  const closedMonth = month?.closed || 0;

  const contactRate = totalLeadsMonth ? Math.round((contactedMonth / totalLeadsMonth) * 100) : 0;
  const responseRate = contactedMonth ? Math.round((respondedMonth / contactedMonth) * 100) : 0;
  const closeRate = respondedMonth ? Math.round((closedMonth / respondedMonth) * 100) : 0;

  const withWebsite = analytics?.websiteAvailability?.withWebsite || 0;
  const withoutWebsite = analytics?.websiteAvailability?.withoutWebsite || 0;
  const totalWebAnalysis = withWebsite + withoutWebsite;
  const webPercentage = totalWebAnalysis ? Math.round((withWebsite / totalWebAnalysis) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-primary-950 p-6 sm:p-8 text-white shadow-card">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold bg-primary-500/30 text-primary-200 rounded-full ring-1 ring-primary-400/40 backdrop-blur-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-300" />
                Live Pipeline Intelligence
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Executive Lead Management Overview
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Track conversion velocity, active client outreach, follow-up queues, and team execution.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="btn bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs py-2.5 px-4 backdrop-blur-md transition"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
            </button>
            <Link to="/leads" className="btn-primary text-xs py-2.5 px-4">
              <Zap className="w-4 h-4 mr-1.5" />
              Manage Pipeline
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Pulse */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-none">Today's Pulse</h3>
              <p className="text-xs text-slate-500 mt-1">Real-time daily activity & outreach</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
          <StatCard title="Total Leads Today" value={today.total} icon={Users} color="primary" />
          <StatCard title="Contacted" value={today.contacted} icon={PhoneCall} color="blue" />
          <StatCard title="Responded" value={today.responded} icon={CheckCircle2} color="emerald" />
          <StatCard title="Closed Clients" value={today.closed} icon={TrendingUp} color="violet" />
        </div>
      </section>

      {/* Pipeline Funnel & Monthly Performance */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-none">Monthly Conversion Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1">Lead progression through conversion stages</p>
            </div>
          </div>
        </div>

        {/* Funnel Progress Visual */}
        <div className="glass-card p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase">1. Ingested</p>
              <p className="text-2xl font-bold text-slate-900">{totalLeadsMonth} leads</p>
              <p className="text-xs text-slate-400">Total pipeline intake</p>
            </div>
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-sky-700 uppercase">2. Contacted</p>
                <span className="text-xs font-bold text-sky-700">{contactRate}%</span>
              </div>
              <p className="text-2xl font-bold text-sky-950">{contactedMonth}</p>
              <p className="text-xs text-sky-600/80">Outreach attempted</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-1">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-indigo-700 uppercase">3. Responded</p>
                <span className="text-xs font-bold text-indigo-700">{responseRate}%</span>
              </div>
              <p className="text-2xl font-bold text-indigo-950">{respondedMonth}</p>
              <p className="text-xs text-indigo-600/80">Warm conversations</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1 shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-emerald-700 uppercase">4. Closed</p>
                <span className="text-xs font-bold text-emerald-700">{closeRate}%</span>
              </div>
              <p className="text-2xl font-bold text-emerald-950">{closedMonth}</p>
              <p className="text-xs text-emerald-700 font-medium">Deals won</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-3 bg-primary-100 text-primary-700 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Overall Conversion</p>
                <p className="text-lg font-bold text-slate-900">
                  {month.conversion?.conversionRate || 0}%
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-3 bg-sky-100 text-sky-700 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">Avg Response Time</p>
                <p className="text-lg font-bold text-slate-900">
                  {analytics.avgContactToResponseHours || 0} hours
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="p-3 bg-violet-100 text-violet-700 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-semibold uppercase">All-time Closed</p>
                <p className="text-lg font-bold text-slate-900">{allTime?.closed || 0} clients</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Breakdown Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Channels */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Lead Acquisition Sources</h4>
            <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
              Multi-channel
            </span>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics.sources && analytics.sources.length > 0 ? (
              analytics.sources.map((s) => {
                const count = s.count || 0;
                const total = analytics.sources.reduce((acc, curr) => acc + curr.count, 0) || 1;
                const pct = Math.round((count / total) * 100);

                return (
                  <div key={s._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="capitalize text-slate-700">{s._id || 'Direct'}</span>
                      <span className="text-slate-900 font-bold">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-violet-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No source distribution yet.</p>
            )}
          </div>
        </div>

        {/* Website Availability */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Digital Footprint</h4>
            <Globe className="w-4 h-4 text-slate-400" />
          </div>

          <div className="pt-2 space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-950">With Website</span>
              </div>
              <span className="text-base font-extrabold text-emerald-900">{withWebsite}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-slate-400" />
                <span className="text-sm font-semibold text-slate-700">Without Website</span>
              </div>
              <span className="text-base font-extrabold text-slate-900">{withoutWebsite}</span>
            </div>

            <div className="text-xs text-slate-500 text-center pt-2">
              <span className="font-bold text-primary-600">{webPercentage}%</span> of leads have an active digital web footprint.
            </div>
          </div>
        </div>

        {/* Follow-up Queue Health */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Follow-up Health</h4>
            <Link to="/follow-ups" className="text-xs font-bold text-primary-600 hover:text-primary-700">
              View All &rarr;
            </Link>
          </div>

          <div className="pt-2 space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
              <span className="text-sm font-semibold text-amber-950">Pending Follow-ups</span>
              <span className="text-base font-bold text-amber-900">{analytics.followUps.pending}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200">
              <span className="text-sm font-semibold text-rose-950">Overdue Follow-ups</span>
              <span className="text-base font-extrabold text-rose-600">{analytics.followUps.overdue}</span>
            </div>

            {analytics.followUps.overdue > 0 && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl text-center">
                Action required: {analytics.followUps.overdue} overdue outreach tasks.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Top Countries */}
      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Geographic Distribution</h4>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {analytics.countries && analytics.countries.length > 0 ? (
            analytics.countries.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-200 transition"
              >
                <span className="text-xs font-bold text-slate-800 truncate">{c._id || 'Global / Other'}</span>
                <span className="text-xs font-extrabold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-200/50">
                  {c.count}
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 col-span-full text-center py-2">No country data recorded.</p>
          )}
        </div>
      </section>
    </div>
  );
}
