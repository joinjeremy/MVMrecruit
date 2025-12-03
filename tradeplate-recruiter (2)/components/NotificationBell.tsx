import React, { useState } from 'react';
import { Bell, Check, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Notification } from '../types';

interface NotificationBellProps {
  notifications: Notification[];
}

const NotificationBell: React.FC<NotificationBellProps> = ({ notifications }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'error': return <XCircle className="text-red-500" size={16} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'info': return <Info className="text-blue-500" size={16} />;
      default: return <Check className="text-green-500" size={16} />;
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-gray-500 hover:text-brand-dark transition-colors">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 w-5 h-5 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white rounded-sm shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-4">
          <div className="p-4 border-b font-bold text-sm text-brand-dark">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 flex items-start space-x-3">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <p className="text-xs text-gray-700">{notification.message}</p>
                </div>
              ))
            ) : (
              <p className="p-6 text-center text-xs text-gray-400 font-serif italic">No new notifications.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
