import React, { useMemo, useState } from 'react';
import { Counter, Service, Token } from '../types/queue';
import { getCategoryServiceLabel, hospitalServiceNames } from './CustomerPortal';
import {
  IconActivity,
  IconCheck,
  IconClock,
  IconCounter,
  IconPlus,
  IconQueue,
  IconRefresh,
  IconSearch,
  IconSparkles,
  IconUser,
  IconUserPlus
} from './Icons';

interface ReceptionDashboardProps {
  tokens: Token[];
  counters: Counter[];
  services: Service[];
  onCallToken: (tokenId: number) => Promise<void>;
  onCompleteToken: (tokenId: number) => Promise<void>;
  onSeedDemo: () => Promise<void>;
  onNavigate: (tab: string) => void;
  onRefresh: () => void;
  isOperating: boolean;
}

export const ReceptionDashboard: React.FC<ReceptionDashboardProps> = ({
  tokens,
  counters,
  services,
  onCallToken,
  onCompleteToken,
  onSeedDemo,
  onNavigate,
  onRefresh,
  isOperating,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'waiting' | 'serving'>('all');

  const waitingTokens = useMemo(() => tokens.filter((t) => t.status === 'waiting'), [tokens]);
  const servingTokens = useMemo(
    () => tokens.filter((t) => t.status === 'serving' || t.status === 'called'),
    [tokens]
  );
  const emergencyTokens = useMemo(
    () => tokens.filter((t) => t.customer_type === 'priority' && t.status === 'waiting'),
    [tokens]
  );

  const filteredTokens = useMemo(() => {
    return tokens.filter((t) => {
      if (filterStatus === 'waiting' && t.status !== 'waiting') return false;
      if (filterStatus === 'serving' && t.status !== 'serving' && t.status !== 'called') return false;

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const numMatch = t.token_number.toLowerCase().includes(term);
        const nameMatch = (t.customer_name || '').toLowerCase().includes(term);
        return numMatch || nameMatch;
      }
      return true;
    });
  }, [tokens, filterStatus, searchTerm]);

  const handleNextCall = () => {
    if (waitingTokens.length > 0) {
      onCallToken(waitingTokens[0].id);
    }
  };

  return (
    <div className="reception-dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Reception Command Quick Action Bar */}
      <div className="card command-center-header-card" style={{ background: '#05241b', borderColor: 'rgba(0, 200, 133, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge-live-cyan" style={{ background: 'rgba(0, 200, 133, 0.15)', color: '#00c885', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                ● OPD CLINICAL COMMAND CENTER
              </span>
              {emergencyTokens.length > 0 && (
                <span style={{ background: 'rgba(255, 42, 75, 0.2)', color: '#ff2a4b', border: '1px solid rgba(255, 42, 75, 0.4)', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800 }}>
                  🚨 {emergencyTokens.length} Emergency Triage Waiting
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>Hospital OPD Operations & Clinical Control</h2>
            <p style={{ fontSize: '13px', color: '#00e699', margin: '2px 0 0 0' }}>Streamlined walk-in patient triage, consultation room control & queue dispatch</p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={handleNextCall} disabled={isOperating || waitingTokens.length === 0} style={{ padding: '12px 18px', fontSize: '13px' }}>
              <IconActivity size={16} /> Call Next Patient
            </button>
            <button className="btn-secondary" onClick={onSeedDemo} disabled={isOperating} style={{ padding: '12px 18px', fontSize: '13px' }}>
              <IconSparkles size={16} /> Add Demo Queue
            </button>
            <button className="btn-secondary" onClick={() => onNavigate('search')} style={{ padding: '12px 18px', fontSize: '13px' }}>
              <IconSearch size={16} /> Search EHR
            </button>
          </div>
        </div>
      </div>

      {/* OPD Rooms Live Status Grid */}
      <div className="card opd-rooms-summary-card">
        <div className="card-header" style={{ marginBottom: '16px' }}>
          <div className="card-title-group">
            <IconCounter size={22} className="card-icon text-primary" />
            <div>
              <h2>Active OPD Consultation Rooms Status</h2>
              <p className="card-subtitle">Real-time status of doctor consultation chambers</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {counters.map((c) => {
            const activeToken = servingTokens.find((t) => t.counter_id === c.id);
            return (
              <div
                key={c.id}
                style={{
                  background: '#03160f',
                  border: activeToken ? '1.5px solid #00c885' : '1px solid rgba(0, 200, 133, 0.2)',
                  borderRadius: '14px',
                  padding: '16px',
                  boxShadow: activeToken ? '0 0 15px rgba(0, 200, 133, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '15px', color: '#ffffff' }}>OPD Room {c.id}</strong>
                  <span className={`status-badge ${activeToken ? 'serving' : 'waiting'}`} style={{ fontSize: '10px', padding: '3px 8px' }}>
                    {activeToken ? 'BUSY' : 'AVAILABLE'}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#00e699', marginBottom: '8px' }}>{c.name}</div>

                {activeToken ? (
                  <div style={{ background: 'rgba(0, 200, 133, 0.1)', padding: '10px', borderRadius: '10px', marginTop: '8px', border: '1px solid rgba(0, 200, 133, 0.25)' }}>
                    <div style={{ fontSize: '11px', color: '#00e699', fontWeight: 700 }}>Currently Consulting:</div>
                    <div style={{ fontSize: '18px', fontWeight: 900, color: '#ffffff', letterSpacing: '1px' }}>{activeToken.token_number}</div>
                    <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600 }}>{activeToken.customer_name || 'Walk-in Patient'}</div>
                    <button
                      className="btn-success btn-xs"
                      onClick={() => onCompleteToken(activeToken.id)}
                      disabled={isOperating}
                      style={{ marginTop: '10px', width: '100%' }}
                    >
                      <IconCheck size={14} /> Complete Consultation
                    </button>
                  </div>
                ) : (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#64748b', fontSize: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
                    Chamber Ready
                    <button
                      className="btn-secondary btn-xs"
                      onClick={handleNextCall}
                      disabled={isOperating || waitingTokens.length === 0}
                      style={{ marginTop: '8px', width: '100%' }}
                    >
                      Call Next Patient
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Reception Queue Stream Table */}
      <div className="card live-reception-stream-card">
        <div className="queue-board-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div className="card-title-group">
            <IconQueue size={22} className="card-icon text-primary" />
            <div>
              <h2>Active Patient Queue Stream</h2>
              <p className="card-subtitle">Active patient tokens waiting and in consultation</p>
            </div>
          </div>

          <div className="queue-controls-bar" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div className="search-input-wrapper">
              <IconSearch size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search patient name or token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-pill-tabs">
              <button className={`filter-pill ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
                All ({tokens.length})
              </button>
              <button className={`filter-pill ${filterStatus === 'waiting' ? 'active' : ''}`} onClick={() => setFilterStatus('waiting')}>
                Waiting ({waitingTokens.length})
              </button>
              <button className={`filter-pill ${filterStatus === 'serving' ? 'active' : ''}`} onClick={() => setFilterStatus('serving')}>
                Consulting ({servingTokens.length})
              </button>
            </div>

            <button className="btn-secondary btn-sm" onClick={onRefresh}>
              <IconRefresh size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="queue-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Token</th>
                <th>Patient Name</th>
                <th>Triage</th>
                <th>Department</th>
                <th>Assigned Room</th>
                <th>Est. Wait</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTokens.length > 0 ? (
                filteredTokens.map((t, idx) => {
                  const rawObj = services.find((s) => s.id === t.service_id);
                  const serviceName = rawObj ? getCategoryServiceLabel(rawObj.name, t.customer_type) : `Service #${t.service_id}`;
                  const isServing = t.status === 'serving' || t.status === 'called';

                  return (
                    <tr key={t.id} className={isServing ? 'row-serving' : 'row-waiting'}>
                      <td><span className="rank-badge">#{idx + 1}</span></td>
                      <td><span className="token-number-cell">{t.token_number}</span></td>
                      <td><span className="customer-name">{t.customer_name || 'Walk-in Patient'}</span></td>
                      <td>
                        <span className={`chip-category ${t.customer_type}`}>
                          {t.customer_type.toUpperCase()}
                        </span>
                      </td>
                      <td><span className="service-name-text">{serviceName}</span></td>
                      <td>
                        {t.counter_id ? (
                          <span className="counter-badge">OPD Room {t.counter_id}</span>
                        ) : (
                          <span className="unassigned-text">Unassigned</span>
                        )}
                      </td>
                      <td>
                        <span className="wait-time-text">
                          <IconClock size={13} /> {Math.max(0, Math.round(t.estimated_wait))} min
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${t.status}`}>
                          {isServing ? 'CONSULTING' : t.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {t.status === 'waiting' && (
                          <button className="btn-secondary btn-xs" onClick={() => onCallToken(t.id)} disabled={isOperating}>
                            Call Patient
                          </button>
                        )}
                        {isServing && (
                          <button className="btn-success btn-xs" onClick={() => onCompleteToken(t.id)} disabled={isOperating}>
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    No patient records found in active queue stream.
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
