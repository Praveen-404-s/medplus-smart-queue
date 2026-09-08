import React, { useEffect, useState } from 'react';
import { UserRole } from './RoleLoginModal';
import { IconBell, IconCounter, IconUser } from './Icons';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  isWsConnected: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
  waitingCount: number;
  servingCount: number;
  currentRole: UserRole;
  currentUser: string;
  onOpenRoleModal: () => void;
}

interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  time: string;
  unread: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentRole,
  currentUser,
  onOpenRoleModal,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'success',
      title: 'Patient D002 called to Room 1 for consultation',
      time: '2 mins ago',
      unread: true,
    },
    {
      id: 'n2',
      type: 'warning',
      title: 'Emergency Triage patient E001 registered in priority queue',
      time: '8 mins ago',
      unread: true,
    },
    {
      id: 'n3',
      type: 'info',
      title: 'AI Queue Engine re-calibrated consultation turn times',
      time: '15 mins ago',
      unread: true,
    },
  ]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const getHeaderTitle = () => {
    if (activeTab === 'reports') return 'Clinical Analytics & Performance Reports';
    if (activeTab === 'search') return 'Patient Medical Record & Search';
    if (activeTab === 'register' || activeTab === 'token') return 'Patient Registration & Clinical Lobby';
    if (activeTab === 'rooms' || activeTab === 'staff') return 'Consultation Rooms & Staff Control';
    return 'Live Queue Dashboard';
  };

  const getHeaderSubtitle = () => {
    if (activeTab === 'reports') return 'Comprehensive queue metrics, doctor utilization & AI prediction accuracy';
    if (activeTab === 'search') return 'Search patient records, consultation history and active triage status';
    if (activeTab === 'register' || activeTab === 'token') return 'Register patients, select medical department & check clinical triage status';
    if (activeTab === 'rooms' || activeTab === 'staff') return 'Manage doctor rooms, call next patient & complete consultations';
    return 'Real-time patient queue with AI-powered consultation predictions';
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <header className="top-monitor-header">
      <div className="monitor-title-area">
        <h1 className="monitor-title">
          {getHeaderTitle()}
        </h1>
        <p className="monitor-subtitle">{getHeaderSubtitle()}</p>
      </div>

      <div className="top-header-meta-actions">
        {/* Active User Role Selector Pill */}
        <button className="top-user-pill" onClick={onOpenRoleModal} title="Click to Switch Role">
          <span className="user-avatar-icon">
            {currentRole === 'patient' ? <IconUser size={15} /> : <IconCounter size={15} />}
          </span>
          <span className="user-pill-name">
            {currentUser || (currentRole === 'patient' ? 'Patient' : 'Doctor / Staff')}
          </span>
          <span className="dropdown-arrow">▾</span>
        </button>

        {/* Live Clock Pill */}
        <div className="top-clock-pill">
          <span className="time-bold">{timeStr || '04:55:29 PM'}</span>
          <span className="date-sub">{dateStr || 'Mon, 26 Aug 2025'}</span>
        </div>

        {/* Interactive Notification Bell with Dropdown Popover */}
        <div className="notification-bell-container">
          <div
            className="notification-bell-badge"
            title="Notifications"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
          >
            <IconBell size={18} />
            {unreadCount > 0 && <span className="badge-count">{unreadCount}</span>}
          </div>

          {isNotifOpen && (
            <div className="notification-popover" onClick={(e) => e.stopPropagation()}>
              <div className="notif-header">
                <span className="notif-title">Live Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn-mark-read" onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className="notif-content">
                      <span className={`notif-dot notif-${n.type}`}></span>
                      <span className="notif-text">{n.title}</span>
                    </div>
                    <span className="notif-time">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
