import React, { useEffect, useState } from 'react';
import {
  IconClock,
  IconSparkles,
  IconUserPlus,
  IconTicket,
  IconVolume,
  IconCounter
} from './Icons';

import { UserRole } from './RoleLoginModal';

interface RightSidebarProps {
  waitingCount: number;
  servingCount: number;
  completedCount: number;
  onCallNextToken: () => void;
  currentRole?: UserRole;
  onNavigate?: (tab: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  waitingCount,
  servingCount,
  completedCount,
  onCallNextToken,
  currentRole,
  onNavigate,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

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

  const total = waitingCount + servingCount + completedCount || 1;
  const waitingPct = (waitingCount / total) * 100;
  const servingPct = (servingCount / total) * 100;
  const strokeDasharray = 251.2; // 2 * PI * r (r=40)
  const waitingDash = (waitingPct / 100) * strokeDasharray;

  return (
    <aside className="app-right-sidebar">
      {/* Live Clock Card */}
      <div className="right-card live-clock-card">
        <div className="right-card-header">
          <IconClock size={16} className="text-cyan" />
          <span className="right-card-title">Live Clock</span>
        </div>
        <div className="live-digital-clock-display">
          <div className="big-time">{timeStr || '04:55:29 PM'}</div>
          <div className="sub-date">{dateStr || 'Mon, 26 Aug 2025'}</div>
        </div>
      </div>

      {/* AI Queue Optimisation Card */}
      <div className="right-card ai-optimization-card">
        <div className="right-card-header">
          <IconSparkles size={16} className="text-cyan" />
          <span className="right-card-title highlight-cyan">AI Queue Optimisation</span>
        </div>
        <p className="ai-opt-desc">
          Predicted consultation time is calculated using service type, patient category, current queue load and historical service patterns.
        </p>
      </div>

      {/* Quick Actions Card */}
      <div className="right-card quick-actions-card">
        <div className="right-card-header">
          <span className="right-card-title">Quick Actions</span>
        </div>
        <div className="quick-action-btn-list">
          {currentRole === 'patient' ? (
            <>
              <button className="quick-btn primary-glow-blue" onClick={() => onNavigate?.('register')}>
                <IconTicket size={16} />
                <span>Register Patient Token</span>
              </button>
            </>
          ) : (
            <>
              <button className="quick-btn primary-glow-blue" onClick={onCallNextToken}>
                <IconVolume size={16} />
                <span>Call Next Patient</span>
              </button>
              <button className="quick-btn border-blue" onClick={() => onNavigate?.('rooms')}>
                <IconCounter size={16} />
                <span>Manage OPD Rooms</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Queue Overview Donut Chart */}
      <div className="right-card queue-overview-card">
        <div className="right-card-header">
          <span className="right-card-title">Queue Overview</span>
        </div>
        <div className="donut-chart-wrapper">
          <svg width="110" height="110" viewBox="0 0 100 100" className="donut-svg">
            <circle cx="50" cy="50" r="40" className="donut-ring-bg" />
            <circle
              cx="50"
              cy="50"
              r="40"
              className="donut-ring-waiting"
              strokeDasharray={`${waitingDash} ${strokeDasharray - waitingDash}`}
              strokeDashoffset="0"
            />
            <text x="50" y="47" textAnchor="middle" className="donut-center-val">{waitingCount}</text>
            <text x="50" y="62" textAnchor="middle" className="donut-center-lbl">Waiting</text>
          </svg>
          <div className="donut-legend">
            <div className="legend-item">
              <span className="dot dot-waiting"></span>
              <span className="lbl">Waiting</span>
              <span className="val">{waitingCount}</span>
            </div>
            <div className="legend-item">
              <span className="dot dot-serving"></span>
              <span className="lbl">In Consultation</span>
              <span className="val">{servingCount}</span>
            </div>
            <div className="legend-item">
              <span className="dot dot-completed"></span>
              <span className="lbl">Completed</span>
              <span className="val">{completedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
