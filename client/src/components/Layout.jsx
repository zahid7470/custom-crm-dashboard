import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  FileText,
  Briefcase,
  Sparkles,
  Menu,
  X,
  Plus,
  Bell,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { path: '/leads', label: 'Leads Pipeline', icon: Users, badge: 'Active' },
  { path: '/follow-ups', label: 'Follow-ups', icon: PhoneCall, badge: null },
  { path: '/offers', label: 'Proposals & Offers', icon: FileText, badge: null },
  { path: '/clients', label: 'Clients & Projects', icon: Briefcase, badge: null },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const toast = useToast();

  const getPageTitle = () => {
    const current = navItems.find(
      (item) => item.path === location.pathname || (item.path !== '/' && location.pathname.startsWith(item.path))
    );
    return current ? current.label : 'CRM Workspace';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900/5">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-white/85 backdrop-blur-xl border-r border-slate-200/80 shadow-card transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Workspace Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100/90">
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
            <div className="p-2.5 bg-gradient-to-tr from-primary-600 via-indigo-600 to-violet-600 rounded-2xl shadow-glow-sm group-hover:scale-105 transition-all duration-300">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-primary-900 to-violet-900">
                  LeadPulse
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-md border border-primary-200/60">
                  Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">CRM & Sales Engine</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white shadow-md shadow-primary-500/25 ring-1 ring-primary-500/20 translate-x-1'
                    : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-xl transition ${
                      active ? 'text-white' : 'text-slate-400 group-hover:text-primary-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge && !active && (
                  <span className="text-[10px] font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full ring-1 ring-primary-200">
                    {item.badge}
                  </span>
                )}
                {active && <ChevronRight className="w-4 h-4 text-white/80 opacity-90" />}
              </Link>
            );
          })}
        </nav>

        {/* Workspace Quick Status Footer */}
        <div className="p-4 border-t border-slate-100/90">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4 text-white shadow-card">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary-500/20 rounded-full blur-xl" />
            <div className="flex items-center justify-between mb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live System
              </span>
              <Activity className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs font-medium text-slate-300">Lead Conversion Engine</p>
            <p className="text-[11px] text-slate-400 mt-1">Multi-channel Sync Active</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 glass-header flex items-center justify-between px-6 lg:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{getPageTitle()}</h2>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Automated lead tracking & client lifecycle management</p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-3">
            <Link
              to="/leads"
              className="btn-primary text-xs py-2 px-3.5 shadow-sm"
              title="Explore Leads Pipeline"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add / View Leads</span>
            </Link>

            <button
              onClick={() => toast.info('System notification feed is up-to-date.')}
              className="p-2.5 text-slate-500 hover:text-slate-900 rounded-2xl hover:bg-slate-100/90 transition relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
