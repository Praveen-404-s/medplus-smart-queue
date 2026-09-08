import React, { useMemo, useState } from 'react';
import { Counter, Service, Token } from '../types/queue';
import { getCategoryServiceLabel, hospitalServiceNames } from './CustomerPortal';
import { IconCheck, IconCounter, IconPhone, IconPlus, IconQueue, IconSparkles } from './Icons';

interface StaffDashboardProps {
  counters: Counter[];
  tokens: Token[];
  services: Service[];
  onCallToken: (tokenId: number) => Promise<void>;
  onCompleteToken: (tokenId: number, actualDuration?: number) => Promise<void>;
  onSeedDemo: () => Promise<void>;
  isOperating: boolean;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  counters,
  tokens,
  services,
  onCallToken,
  onCompleteToken,
  onSeedDemo,
  isOperating,
}) => {
  const [loadingTokenId, setLoadingTokenId] = useState<number | null>(null);

  const serviceMap = useMemo(() => {
    const map = new Map<number, string>();
    services.forEach((s) => map.set(s.id, hospitalServiceNames[s.name] || s.name));
    return map;
  }, [services]);

  const counterAnalytics = useMemo(() => {
    return counters.slice(0, 3).map((c) => {
      const activeToken = tokens.find(
        (t) => (t.id === c.current_token_id || t.counter_id === c.id) && (t.status === 'serving' || t.status === 'called')
      );

      const counterWaitingTokens = tokens.filter(
        (t) => t.counter_id === c.id && t.status === 'waiting'
      );

      const workloadMins = [...(activeToken ? [activeToken] : []), ...counterWaitingTokens].reduce(
        (acc, t) => acc + t.predicted_duration,
        0
      );

      const nextInLine = counterWaitingTokens.length > 0 ? counterWaitingTokens[0] : null;

      const roomName = c.name.replace(/Counter/i, 'Consultation Room');

      return {
        counter: c,
        roomName,
        activeToken,
        waitingQueue: counterWaitingTokens,
        queueLength: counterWaitingTokens.length,
        workloadMins,
        nextInLine,
      };
    });
  }, [counters, tokens]);

  const waitingTokensAll = useMemo(() => {
    return tokens.filter((t) => t.status === 'waiting');
  }, [tokens]);

  const handleCallNext = async (counterId: number, nextTokenId?: number) => {
    const targetTokenId = nextTokenId || waitingTokensAll.find((t) => t.counter_id === counterId || t.counter_id === null)?.id;

    if (!targetTokenId) return;

    setLoadingTokenId(targetTokenId);
    try {
      await onCallToken(targetTokenId);
    } finally {
      setLoadingTokenId(null);
    }
  };

  const handleCompleteCurrent = async (tokenId: number) => {
    setLoadingTokenId(tokenId);
    try {
      await onCompleteToken(tokenId);
    } finally {
      setLoadingTokenId(null);
    }
  };

  return (
    <div className="staff-dashboard-container">
      {/* Dashboard Top Header & Seed Button */}
      <div className="staff-header-card card">
        <div className="staff-header-content">
          <div>
            <h2>Clinical Staff Dispatcher</h2>
            <p className="card-subtitle">
              Manage doctor consultation rooms, call upcoming patients, and log consultation completions.
            </p>
          </div>
          <div className="staff-actions-bar" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={onSeedDemo} disabled={isOperating}>
              <IconPlus size={16} /> Clean & Reset Clinical Queue
            </button>
          </div>
        </div>
      </div>

      {/* OPD Rooms Grid View */}
      <div className="counters-grid">
        {counterAnalytics.map(({ counter, roomName, activeToken, queueLength, workloadMins, nextInLine }) => {
          const isBusy = !!activeToken;

          return (
            <div className={`card counter-station-card ${isBusy ? 'state-busy' : 'state-available'}`} key={counter.id}>
              <div className="counter-card-header">
                <div className="counter-name-badge">
                  <IconCounter size={18} />
                  <span>{roomName}</span>
                </div>
                <span className={`status-indicator-pill ${isBusy ? 'busy' : 'available'}`}>
                  {isBusy ? 'IN CONSULTATION' : 'AVAILABLE'}
                </span>
              </div>

              {/* Active Patient Details at OPD Station */}
              <div className="current-token-box">
                {activeToken ? (
                  <div className="active-serving-info">
                    <span className="info-label">CURRENT PATIENT</span>
                    <div className="big-serving-token">{activeToken.token_number}</div>
                    <div className="customer-meta">
                      <strong>{activeToken.customer_name || 'Walk-in Patient'}</strong> ({activeToken.customer_type})
                    </div>
                    <div className="service-meta">
                      {serviceMap.get(activeToken.service_id)} • ~{activeToken.predicted_duration}m est.
                    </div>
                  </div>
                ) : (
                  <div className="idle-counter-info">
                    <span className="info-label">ROOM AVAILABLE</span>
                    <div className="idle-placeholder">—</div>
                    <p>Ready for next patient</p>
                  </div>
                )}
              </div>

              {/* OPD Room Analytics Summary */}
              <div className="counter-metrics-row">
                <div className="metric-col">
                  <span className="metric-title">Patient Queue</span>
                  <strong className="metric-value">{queueLength} waiting</strong>
                </div>
                <div className="metric-col">
                  <span className="metric-title">Est. Workload</span>
                  <strong className="metric-value">{Math.round(workloadMins)} mins</strong>
                </div>
              </div>

              {/* Action Buttons for Room */}
              <div className="counter-actions-footer">
                {activeToken ? (
                  <button
                    className="btn-success complete-btn"
                    onClick={() => handleCompleteCurrent(activeToken.id)}
                    disabled={loadingTokenId === activeToken.id}
                  >
                    <IconCheck size={18} />
                    {loadingTokenId === activeToken.id ? 'Completing...' : 'Complete Consultation'}
                  </button>
                ) : (
                  <button
                    className="btn-primary call-btn"
                    onClick={() => handleCallNext(counter.id, nextInLine?.id)}
                    disabled={waitingTokensAll.length === 0 || loadingTokenId !== null}
                  >
                    <IconPhone size={18} />
                    {nextInLine ? `Call Patient ${nextInLine.token_number}` : 'Call Next Patient'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Queue Action Table */}
      <div className="card master-queue-card">
        <div className="card-header">
          <div className="card-title-group">
            <IconQueue size={22} className="card-icon text-primary" />
            <div>
              <h2>Queue Management Control Center</h2>
              <p className="card-subtitle">Direct dispatch control over all active and waiting patient tickets</p>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Patient Name</th>
                <th>Category</th>
                <th>Department</th>
                <th>Room</th>
                <th>Wait Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tokens.length > 0 ? (
                tokens.map((t) => {
                  const serviceName = serviceMap.get(t.service_id) || `Service #${t.service_id}`;
                  const isWaiting = t.status === 'waiting';
                  const isServing = t.status === 'serving' || t.status === 'called';

                  return (
                    <tr key={t.id} className={isServing ? 'row-serving' : 'row-waiting'}>
                      <td className="col-token">
                        <strong className="token-code-text">{t.token_number}</strong>
                      </td>

                      <td className="col-customer">
                        {t.customer_name || 'Walk-in Patient'}
                      </td>

                      <td className="col-category">
                        <span className={`chip-category ${t.customer_type}`}>
                          {t.customer_type.toUpperCase()}
                        </span>
                      </td>

                      <td className="col-service">{serviceName}</td>

                      <td className="col-counter">
                        {t.counter_id ? `Room ${t.counter_id}` : 'Auto / Unassigned'}
                      </td>

                      <td className="col-wait">{Math.max(0, Math.round(t.estimated_wait))} min</td>

                      <td className="col-status">
                        <span className={`status-badge ${t.status}`}>
                          {isServing ? 'IN CONSULTATION' : t.status.toUpperCase()}
                        </span>
                      </td>

                      <td className="col-actions">
                        {isWaiting && (
                          <button
                            className="btn-primary btn-xs"
                            onClick={() => handleCallNext(t.counter_id || 1, t.id)}
                            disabled={loadingTokenId === t.id}
                          >
                            <IconPhone size={14} /> Call Patient
                          </button>
                        )}

                        {isServing && (
                          <button
                            className="btn-success btn-xs"
                            onClick={() => handleCompleteCurrent(t.id)}
                            disabled={loadingTokenId === t.id}
                          >
                            <IconCheck size={14} /> Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="empty-table-cell">
                    <div className="empty-state-box">
                      <p>No active patient tokens. Click "Seed Demo Patient Queue" above to populate sample data.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
