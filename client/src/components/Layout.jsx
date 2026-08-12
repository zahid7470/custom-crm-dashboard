import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, FileText, Briefcase, Sparkles } from 'lucide-react';

const nav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/leads', label: 'Leads', icon: Users },
  { path: '/follow-ups', label: 'Follow-ups', icon: PhoneCall },
  { path: '/offers', label: 'Offers', icon: FileText },
  { path: '/clients', label: 'Clients', icon: Briefcase },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-50/60">
      <aside className="w-64 flex flex-col bg-white/80 backdrop-blur border-r border-slate-200/80">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-primary-600 to-violet-600 rounded-lg">
              <Sparkles className="text-white" size={18} />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-violet-700">
              Custom CRM
            </h1>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1.5">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={active ? 'text-primary-600' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-gradient-to-br from-primary-600 to-violet-600 rounded-xl p-4 text-white">
            <p className="text-xs opacity-80">Powered by</p>
            <p className="text-sm font-semibold">Custom CRM Dashboard</p>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
