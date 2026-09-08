import React, { useState } from 'react';
import {
  IconChart,
  IconClock,
  IconDownload,
  IconFileText,
  IconPrinter,
  IconSparkles,
  IconTrendingUp,
  IconUsers,
  IconPieChart,
  IconCheck
} from './Icons';

interface ReportsDashboardProps {
  waitingCount: number;
  servingCount: number;
  completedCount: number;
}

export const ReportsDashboard: React.FC<ReportsDashboardProps> = ({
  completedCount,
}) => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setDownloadSuccess(`Exported MED PLUS Report as ${format.toUpperCase()}`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="reports-dashboard-container">
      {/* Reports Header & Action Control Bar */}
      <div className="card reports-control-card">
        <div className="reports-header-flex">
          <div className="card-title-group">
            <IconChart size={24} className="card-icon text-cyan" />
            <div>
              <h2 className="reports-main-title">
                MED <span className="highlight-plus blinking-pulse">PLUS</span> Healthcare Analytics & Performance Reports
              </h2>
              <p className="card-subtitle">
                AI-driven queue optimization analytics, department loads, and consultation throughput metrics
              </p>
            </div>
          </div>

          <div className="reports-actions-group">
            <div className="time-range-pills">
              <button
                className={`range-pill ${timeRange === 'today' ? 'active' : ''}`}
                onClick={() => setTimeRange('today')}
              >
                Today
              </button>
              <button
                className={`range-pill ${timeRange === 'week' ? 'active' : ''}`}
                onClick={() => setTimeRange('week')}
              >
                This Week
              </button>
              <button
                className={`range-pill ${timeRange === 'month' ? 'active' : ''}`}
                onClick={() => setTimeRange('month')}
              >
                This Month
              </button>
            </div>

            <div className="export-btn-group">
              <button className="btn-secondary btn-sm" onClick={() => handleExport('csv')}>
                <IconDownload size={14} /> CSV
              </button>
              <button className="btn-secondary btn-sm" onClick={() => handleExport('pdf')}>
                <IconFileText size={14} /> PDF Report
              </button>
              <button className="btn-primary btn-sm primary-glow-blue" onClick={() => window.print()}>
                <IconPrinter size={14} /> Print
              </button>
            </div>
          </div>
        </div>

        {downloadSuccess && (
          <div className="pass-issued-alert success" style={{ marginTop: '12px', padding: '10px 14px' }}>
            <IconCheck size={18} />
            <span>{downloadSuccess}</span>
          </div>
        )}
      </div>

      {/* 4 High-Impact KPI Performance Cards */}
      <div className="reports-kpi-grid">
        <div className="kpi-card glow-cyan">
          <div className="kpi-icon-badge cyan">
            <IconUsers size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Total Patients Served</span>
            <div className="kpi-value">{completedCount + 142}</div>
            <span className="kpi-trend positive">
              <IconTrendingUp size={12} /> +18.4% vs last period
            </span>
          </div>
        </div>

        <div className="kpi-card glow-emerald">
          <div className="kpi-icon-badge emerald">
            <IconClock size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Avg Wait Time / Patient</span>
            <div className="kpi-value">7.8 <span className="unit">min</span></div>
            <span className="kpi-trend positive">
              <IconTrendingUp size={12} strokeWidth={3} /> -3.2 min reduced by AI
            </span>
          </div>
        </div>

        <div className="kpi-card glow-emerald">
          <div className="kpi-icon-badge emerald">
            <IconSparkles size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">AI Prediction Accuracy</span>
            <div className="kpi-value">98.2<span className="unit">%</span></div>
            <span className="kpi-sub-text">Based on 1,420 historical consultations</span>
          </div>
        </div>

        <div className="kpi-card glow-emerald">
          <div className="kpi-icon-badge emerald">
            <IconPieChart size={20} />
          </div>
          <div className="kpi-details">
            <span className="kpi-label">Patient Satisfaction Score</span>
            <div className="kpi-value">4.92<span className="unit">/ 5.0</span></div>
            <span className="kpi-trend positive">98.6% positive experience rating</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Visual Charts Row */}
      <div className="reports-charts-row">
        {/* Hourly OPD Patient Flow Area Chart */}
        <div className="card chart-card flex-2">
          <div className="card-header">
            <div className="title-with-badge">
              <h3>Hourly OPD Patient Flow & Peak Times</h3>
              <span className="badge-live-cyan">Live Hourly Triage Data</span>
            </div>
          </div>
          <div className="svg-chart-container">
            <svg width="100%" height="220" viewBox="0 0 500 200" preserveAspectRatio="none" className="analytics-svg">
              <defs>
                <linearGradient id="mintGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e699" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#00c885" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="lineGlowMint" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#00c885" />
                  <stop offset="50%" stopColor="#00e699" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#0a3d2e" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#0a3d2e" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#0a3d2e" strokeDasharray="4 4" />

              {/* Area Path */}
              <path
                d="M 0 170 Q 50 140, 100 110 T 200 60 T 300 90 T 400 40 T 500 120 L 500 190 L 0 190 Z"
                fill="url(#mintGradient)"
              />

              {/* Glowing Line */}
              <path
                d="M 0 170 Q 50 140, 100 110 T 200 60 T 300 90 T 400 40 T 500 120"
                fill="none"
                stroke="url(#lineGlowMint)"
                strokeWidth="3.5"
              />

              {/* Data Points */}
              <circle cx="100" cy="110" r="4" fill="#00e699" className="glow-dot" />
              <circle cx="200" cy="60" r="5" fill="#ffffff" stroke="#00c885" strokeWidth="3" className="glow-dot" />
              <circle cx="300" cy="90" r="4" fill="#00e699" className="glow-dot" />
              <circle cx="400" cy="40" r="6" fill="#00e699" stroke="#00c885" strokeWidth="3" className="glow-dot" />
            </svg>

            <div className="chart-x-labels">
              <span>08:00 AM</span>
              <span>10:00 AM (Peak)</span>
              <span>12:00 PM</span>
              <span>02:00 PM (Peak)</span>
              <span>04:00 PM</span>
              <span>06:00 PM</span>
            </div>
          </div>
        </div>

        {/* Department Volume Share Progress */}
        <div className="card chart-card flex-1">
          <div className="card-header">
            <h3>Department Volume Share</h3>
          </div>
          <div className="dept-distribution-list">
            <div className="dept-dist-item">
              <div className="dept-dist-info">
                <span className="dept-name">General OPD Consultation</span>
                <span className="dept-val">42% (62 Patients)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-cyan" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div className="dept-dist-item">
              <div className="dept-dist-info">
                <span className="dept-name">Accident & Emergency Triage</span>
                <span className="dept-val">28% (41 Patients)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-emerald" style={{ width: '28%' }}></div>
              </div>
            </div>

            <div className="dept-dist-item">
              <div className="dept-dist-info">
                <span className="dept-name">Laboratory & Blood Test</span>
                <span className="dept-val">18% (27 Patients)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-emerald" style={{ width: '18%' }}></div>
              </div>
            </div>

            <div className="dept-dist-item">
              <div className="dept-dist-info">
                <span className="dept-name">Pharmacy & Radiology</span>
                <span className="dept-val">12% (18 Patients)</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill fill-emerald" style={{ width: '12%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPD Room & Physician Performance Metrics */}
      <div className="card room-performance-card">
        <div className="card-header">
          <h3>Doctor Consultation Rooms & Throughput Metrics</h3>
        </div>
        <div className="table-responsive">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Consultation Room</th>
                <th>Assigned Physician</th>
                <th>Patients Served</th>
                <th>Avg Duration</th>
                <th>AI Duration Variance</th>
                <th>Room Utilization</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong className="text-cyan">Room 101</strong></td>
                <td>Dr. Alexander Vance (Senior Physician)</td>
                <td>34 Patients</td>
                <td>11.2 min</td>
                <td><span className="chip-category priority">+0.4 min (Precise)</span></td>
                <td>
                  <div className="table-progress-flex">
                    <span>96%</span>
                    <div className="mini-progress-bar"><div className="fill fill-cyan" style={{ width: '96%' }}></div></div>
                  </div>
                </td>
                <td><span className="status-badge serving">ACTIVE</span></td>
              </tr>
              <tr>
                <td><strong className="text-cyan">Room 102</strong></td>
                <td>Dr. Elena Rostova (Pediatrics)</td>
                <td>29 Patients</td>
                <td>14.5 min</td>
                <td><span className="chip-category priority">-0.2 min (Precise)</span></td>
                <td>
                  <div className="table-progress-flex">
                    <span>94%</span>
                    <div className="mini-progress-bar"><div className="fill fill-emerald" style={{ width: '94%' }}></div></div>
                  </div>
                </td>
                <td><span className="status-badge serving">ACTIVE</span></td>
              </tr>
              <tr>
                <td><strong className="text-cyan">Room 103</strong></td>
                <td>Dr. Marcus Thorne (Cardiology Triage)</td>
                <td>31 Patients</td>
                <td>12.8 min</td>
                <td><span className="chip-category priority">+0.1 min (Precise)</span></td>
                <td>
                  <div className="table-progress-flex">
                    <span>98%</span>
                    <div className="mini-progress-bar"><div className="fill fill-emerald" style={{ width: '98%' }}></div></div>
                  </div>
                </td>
                <td><span className="status-badge serving">ACTIVE</span></td>
              </tr>
              <tr>
                <td><strong className="text-cyan">Emergency Room 1</strong></td>
                <td>Dr. Sarah Chen (Trauma Specialist)</td>
                <td>22 Patients</td>
                <td>18.0 min</td>
                <td><span className="chip-category priority">0.0 min (Exact)</span></td>
                <td>
                  <div className="table-progress-flex">
                    <span>99%</span>
                    <div className="mini-progress-bar"><div className="fill fill-emerald" style={{ width: '99%' }}></div></div>
                  </div>
                </td>
                <td><span className="status-badge serving">ON CALL</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
