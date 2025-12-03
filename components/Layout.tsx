import React from 'react';
import { LayoutDashboard, Users, Briefcase, BarChart3, Settings, Map as MapIcon, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, UserRole, Notification } from '../types';
import NotificationBell from './NotificationBell';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout?: () => void;
  notifications?: Notification[];
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout, notifications = [] }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isRecruiter = currentUser.role === UserRole.RECRUITER;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/map', label: 'Logistics Map', icon: MapIcon },
    { path: '/candidates', label: 'Candidates', icon: Users },
    // Hide Asset management for Recruiters, they strictly manage people
    { path: '/assets', label: 'Assets & Plates', icon: Briefcase, hidden: isRecruiter },
    { path: '/reports', label: 'Reporting', icon: BarChart3 },
  ].filter(item => !item.hidden);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <div className="w-72 bg-brand-dark text-white flex flex-col shadow-2xl border-r border-brand-green/50 relative z-20">
        <div className="h-28 flex flex-col items-center justify-center bg-white border-b-4 border-brand-gold p-6 text-center">
            <img 
              src="https://mvm-ltd.co.uk/wp-content/themes/mvm-ltd/assets/images/mvm-logo.svg" 
              alt="MVM Logo" 
              className="h-12 w-auto object-contain mb-2" 
            />
            {isRecruiter && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-brand-dark font-bold bg-brand-gold/20 px-2 py-0.5 rounded-sm">
                Partner Portal
              </span>
            )}
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-4 px-5 py-4 rounded-sm transition-all duration-300 group ${
                  isActive 
                    ? 'bg-brand-green text-brand-gold shadow-lg border-r-4 border-brand-gold translate-x-1' 
                    : 'text-gray-400 hover:bg-brand-green/30 hover:text-white'
                }`}
              >
                <Icon size={20} className={`transition-colors ${isActive ? 'text-brand-gold' : 'text-gray-500 group-hover:text-white'}`} />
                <span className={`font-heritage text-sm uppercase tracking-widest font-semibold ${isActive ? 'text-white' : ''}`}>
                    {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-brand-green/30 bg-black/10">
            {currentUser.role === UserRole.ADMIN && (
                <div 
                    onClick={() => navigate('/settings')}
                    className={`flex items-center space-x-3 text-brand-gold/70 hover:text-brand-gold cursor-pointer px-2 transition-colors mb-4 ${location.pathname === '/settings' ? 'text-brand-gold font-bold' : ''}`}
                >
                    <Settings size={18} />
                    <span className="font-heritage text-xs uppercase tracking-widest">System Settings</span>
                </div>
            )}
            <div className="flex items-center space-x-3 text-gray-500 hover:text-red-400 cursor-pointer px-2 transition-colors" onClick={onLogout}>
                <LogOut size={18} />
                <span className="font-heritage text-xs uppercase tracking-widest">Logout</span>
            </div>
            <p className="px-2 text-[10px] text-gray-600 mt-6 uppercase tracking-widest opacity-50">Est. 2016 • MVM Logistics</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-brand-light relative">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shadow-sm z-10">
          <div>
              <h1 className="text-3xl text-brand-dark font-heritage uppercase tracking-wider">
                  {location.pathname === '/' ? 'Dashboard' : location.pathname.replace('/', '').replace('-', ' ')}
              </h1>
              <p className="text-xs text-gray-400 font-sans tracking-wide mt-1">
                {isRecruiter ? 'External Partner Access' : 'Authorized Personnel Only'}
              </p>
          </div>
          <div className="flex items-center space-x-6">
             <NotificationBell notifications={notifications} />
             <div className="text-right hidden sm:block">
                 <p className="text-sm font-bold text-brand-dark font-heritage">{currentUser.name}</p>
                 <p className="text-xs text-brand-gold uppercase tracking-wide">{currentUser.role}</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-brand-dark flex items-center justify-center text-brand-gold font-heritage font-bold border-2 border-brand-gold shadow-md ring-4 ring-gray-50">
                 {currentUser.initials}
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-10">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;