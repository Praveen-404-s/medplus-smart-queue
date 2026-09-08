import React from 'react';
import { DashboardStats } from '../types/queue';
import { IconActivity, IconClock, IconCounter, IconQueue, IconSparkles } from './Icons';

interface StatsBannerProps {
  stats: DashboardStats;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ stats }) => {
  return (
    <section className="stats-banner-grid">
      <div className="stat-card waiting-theme">
        <div className="stat-icon-wrapper">
          <IconQueue size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">TOTAL WAITING</span>
          <div className="stat-value">{stats.totalWaiting}</div>
          <span className="stat-subtext">Patients in OPD queue</span>
        </div>
      </div>

      <div className="stat-card serving-theme">
        <div className="stat-icon-wrapper">
          <IconActivity size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">IN CONSULTATION</span>
          <div className="stat-value">{stats.currentlyServing}</div>
          <span className="stat-subtext">Active with doctors & labs</span>
        </div>
      </div>

      <div className="stat-card completed-theme">
        <div className="stat-icon-wrapper">
          <IconSparkles size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">COMPLETED</span>
          <div className="stat-value">{stats.completedCount}</div>
          <span className="stat-subtext">Successfully treated</span>
        </div>
      </div>

      <div className="stat-card duration-theme">
        <div className="stat-icon-wrapper">
          <IconClock size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">AVG PREDICTED DURATION</span>
          <div className="stat-value">
            {stats.avgPredictedDuration.toFixed(1)} <span className="unit">min</span>
          </div>
          <span className="stat-subtext">AI predicted turn time</span>
        </div>
      </div>

      <div className="stat-card counter-theme">
        <div className="stat-icon-wrapper">
          <IconCounter size={22} />
        </div>
        <div className="stat-content">
          <span className="stat-label">OPD ROOMS</span>
          <div className="stat-value">{stats.activeCounters}</div>
          <span className="stat-subtext">Active consultation rooms</span>
        </div>
      </div>
    </section>
  );
};
