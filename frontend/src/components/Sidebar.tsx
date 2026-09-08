import React from 'react';
import {
  IconMedicalCross,
  IconDashboard,
  IconUsers,
  IconUserPlus,
  IconTicket,
  IconSearch,
  IconCounter,
  IconChart,
  IconSettings,
  IconHeartbeat
} from './Icons';

import { UserRole } from './RoleLoginModal';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, currentRole }) => {
  const patientNavItems = [
    { id: 'register', label: 'Patient Lobby', icon: <IconTicket size={18} /> },
  ];

  const receptionistNavItems = [
    { id: 'live', label: 'Live OPD Queue', icon: <IconDashboard size={18} /> },
    { id: 'search', label: 'Patient Search', icon: <IconSearch size={18} /> },
    { id: 'rooms', label: 'Consultation Rooms', icon: <IconCounter size={18} /> },
    { id: 'reports', label: 'Reports', icon: <IconChart size={18} /> },
  ];

  const doctorNavItems = [
    { id: 'rooms', label: 'Consultation Rooms', icon: <IconCounter size={18} /> },
    { id: 'live', label: 'Live OPD Queue', icon: <IconDashboard size={18} /> },
    { id: 'reports', label: 'Reports', icon: <IconChart size={18} /> },
  ];

  const navItems = currentRole === 'patient'
    ? patientNavItems
    : currentRole === 'doctor'
    ? doctorNavItems
    : receptionistNavItems;

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo-icon">
          <IconMedicalCross size={24} />
        </div>
        <div className="sidebar-brand-text">
          <h1 className="sidebar-title">
            MED <span className="highlight-plus blinking-pulse">PLUS</span>
          </h1>
          <p className="sidebar-subtitle">Healthcare Intelligence Engine</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Inspiration Card */}
      <div className="sidebar-footer-card">
        <div className="heartbeat-icon-wrapper">
          <IconHeartbeat size={28} />
        </div>
        <p className="heartbeat-motto">Better Queues, Healthier Tomorrows</p>
        <div className="heartbeat-pulse-line"></div>
      </div>
    </aside>
  );
};
