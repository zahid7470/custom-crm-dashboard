import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, PhoneCall, FileText, Briefcase } from 'lucide-react';

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
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-lg font-bold text-primary-700">Custom CRM</h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                  active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
