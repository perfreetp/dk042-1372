import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2,
  AlertTriangle,
  ClipboardCheck,
  Bus,
  ListChecks,
  BarChart3,
} from 'lucide-react';

const navItems = [
  {
    path: '/',
    label: '学校清单',
    icon: Building2,
  },
  {
    path: '/risk-inspection',
    label: '风险抽查',
    icon: AlertTriangle,
  },
  {
    path: '/inspection-tasks',
    label: '抽查任务',
    icon: ListChecks,
  },
  {
    path: '/rectification',
    label: '整改跟踪',
    icon: ClipboardCheck,
  },
  {
    path: '/dashboard',
    label: '复盘看板',
    icon: BarChart3,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-primary-700 min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-600">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
            <Bus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">校车监管</h1>
            <p className="text-primary-200 text-xs">电子围栏抽查系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`sidebar-item ${
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-primary-600">
        <div className="bg-primary-600/50 rounded-lg p-4">
          <p className="text-primary-200 text-xs mb-1">当前用户</p>
          <p className="text-white font-medium text-sm">监管员 - 王科长</p>
          <p className="text-primary-300 text-xs mt-1">县区教育局校车监管科</p>
        </div>
      </div>
    </aside>
  );
}
