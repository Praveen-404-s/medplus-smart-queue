import React, { useMemo, useState } from 'react';
import { Service, Token } from '../types/queue';
import { getCategoryServiceLabel, hospitalServiceNames } from './CustomerPortal';
import { IconActivity, IconClock, IconQueue, IconRefresh, IconSearch, IconSparkles } from './Icons';

interface LiveQueueProps {
  tokens: Token[];
  services: Service[];
  onRefresh: () => void;
  isWsConnected: boolean;
}

export const LiveQueue: React.FC<LiveQueueProps> = ({
  tokens,
  services,
  onRefresh,
  isWsConnected,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'serving'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const serviceMap = useMemo(() => {
    const map = new Map<number, string>();
    services.forEach((s) => map.set(s.id, hospitalServiceNames[s.name] || s.name));
    return map;
  }, [services]);

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      if (filterStatus === 'waiting' && t.status !== 'waiting') return false;
      if (filterStatus === 'serving' && t.status !== 'serving' && t.status !== 'called') return false;

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const numMatch = t.token_number.toLowerCase().includes(term);
        const nameMatch = (t.customer_name || '').toLowerCase().includes(term);
        const serviceName = (serviceMap.get(t.service_id) || '').toLowerCase();
        const serviceMatch = serviceName.includes(term);
        return numMatch || nameMatch || serviceMatch;
      }
      return true;
    });
  }, [tokens, filterStatus, searchTerm, serviceMap]);

  const waitingCount = useMemo(() => tokens.filter((t) => t.status === 'waiting').length, [tokens]);
  const servingCount = useMemo(
    () => tokens.filter((t) => t.status === 'serving' || t.status === 'called').length,
    [tokens]
  );

  return (
    <div className="live-queue-container">
      <div className="card queue-board-card">
        <div className="queue-board-header">
          <div className="title-area">
            <div className="card-title-group">
              <IconQueue size={22} className="card-icon text-primary" />
              <div>
                <h2>Live Hospital Queue Display</h2>
                <p className="card-subtitle">Real-time public lobby tracking & AI consultation predictions</p>
              </div>
            </div>
          </div>

          <div className="queue-controls-bar">
            <div className="search-input-wrapper">
              <IconSearch size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search patient, token, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-pill-tabs">
              <button
                className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All Patients ({tokens.length})
              </button>
              <button
                className={`filter-pill ${filterStatus === 'waiting' ? 'active' : ''}`}
                onClick={() => setFilterStatus('waiting')}
              >
                Waiting ({waitingCount})
              </button>
              <button
                className={`filter-pill ${filterStatus === 'serving' ? 'active' : ''}`}
                onClick={() => setFilterStatus('serving')}
              >
                In Consultation ({servingCount})
              </button>
            </div>

            <button className="btn-secondary btn-sm" onClick={onRefresh} title="Manual Refresh">
              <IconRefresh size={15} /> Refresh
            </button>
          </div>
        </div>

        {/* Live OPD Board Table */}
        <div className="table-responsive">
          <table className="queue-table">
            <thead>
              <tr>
                <th># Rank</th>
                <th>Token Number</th>
                <th>Patient Name</th>
                <th>Triage Category</th>
                <th>Department / Service</th>
                <th>Consultation Room</th>
                <th>Predicted Duration</th>
                <th>Estimated Wait</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.length > 0 ? (
                filteredTokens.map((t, index) => {
                  const rawObj = services.find((s) => s.id === t.service_id);
                  const serviceName = rawObj ? getCategoryServiceLabel(rawObj.name, t.customer_type) : `Department #${t.service_id}`;
                  const isServing = t.status === 'serving' || t.status === 'called';

                  return (
                    <tr key={t.id} className={isServing ? 'row-serving' : 'row-waiting'}>
                      <td className="col-rank">
                        <span className="rank-badge">#{index + 1}</span>
                      </td>

                      <td className="col-token">
                        <span className="token-number-cell">{t.token_number}</span>
                      </td>

                      <td className="col-customer">
                        <span className="customer-name">{t.customer_name || 'Walk-in Patient'}</span>
                      </td>

                      <td className="col-category">
                        <span className={`chip-category ${t.customer_type}`}>
                          {t.customer_type.toUpperCase()}
                        </span>
                      </td>

                      <td className="col-service">
                        <span className="service-name-text">{serviceName}</span>
                      </td>

                      <td className="col-counter">
                        {t.counter_id ? (
                          <span className="counter-badge">Room {t.counter_id}</span>
                        ) : (
                          <span className="unassigned-text">Unassigned</span>
                        )}
                      </td>

                      <td className="col-duration">
                        <span className="time-text">
                          <IconSparkles size={13} /> {t.predicted_duration} min
                        </span>
                      </td>

                      <td className="col-wait">
                        <span className="wait-time-text">
                          <IconClock size={13} /> {Math.max(0, Math.round(t.estimated_wait))} min
                        </span>
                      </td>

                      <td className="col-status">
                        <span className={`status-badge ${t.status}`}>
                          {isServing && <IconActivity size={12} className="pulse-icon" />}
                          {t.status === 'serving' || t.status === 'called' ? 'IN CONSULTATION' : t.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="empty-table-cell">
                    <div className="empty-state-box">
                      <IconQueue size={36} />
                      <p>No patient tokens matching your criteria.</p>
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
