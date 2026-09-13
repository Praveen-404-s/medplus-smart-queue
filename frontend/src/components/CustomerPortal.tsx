import React, { useEffect, useState } from 'react';
import { CustomerType, Service, Token } from '../types/queue';
import { IconCheck, IconTicket, IconUser } from './Icons';

interface CustomerPortalProps {
  services: Service[];
  onCreateToken: (customerName: string, customerType: CustomerType, serviceId: number) => Promise<Token>;
  activeTokensInQueue: Token[];
  currentUser?: string;
  onViewQueue?: () => void;
}

export const hospitalServiceNames: Record<string, string> = {
  'General Consultation': 'General Consultation',
  'Radiology': 'Radiology',
  'Laboratory Test': 'Laboratory Test',
};

// Helper function to get service label based on patient triage category
export const getCategoryServiceLabel = (serviceName: string, category: string): string => {
  if (category === 'priority' && (serviceName.includes('Consultation') || serviceName.includes('Account'))) {
    return 'Emergency General Consultation';
  }
  return hospitalServiceNames[serviceName] || serviceName;
};

export interface ServiceOption {
  key: string;
  serviceId: number;
  label: string;
  reason?: string;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  services,
  onCreateToken,
  activeTokensInQueue = [],
  currentUser,
  onViewQueue,
}) => {
  const cleanDefaultName = currentUser ? currentUser.replace(/\s*\(.*\)/, '').trim() : '';
  const [customerName, setCustomerName] = useState(cleanDefaultName || 'Praveen');
  const [customerType, setCustomerType] = useState<CustomerType>('regular');
  const [selectedOptionKey, setSelectedOptionKey] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [issuedToken, setIssuedToken] = useState<Token | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser && !customerName) {
      const clean = currentUser.replace(/\s*\(.*\)/, '').trim();
      if (clean) setCustomerName(clean);
    }
  }, [currentUser]);

  // Build Department / Healthcare popup select options based on triage category
  const dropdownOptions: ServiceOption[] = React.useMemo(() => {
    if (customerType === 'priority') {
      return [
        { key: 'breathing', serviceId: 1, label: '🫁 Trouble Breathing', reason: 'Trouble Breathing' },
        { key: 'poison', serviceId: 1, label: '🧪 Swallowing Poison', reason: 'Swallowing Poison' },
        { key: 'road', serviceId: 1, label: '🚑 Road Accidents', reason: 'Road Accidents' },
      ];
    }
    return [
      { key: '1', serviceId: 1, label: 'General Consultation' },
      { key: '2', serviceId: 2, label: 'Radiology' },
      { key: '3', serviceId: 3, label: 'Laboratory Test' },
    ];
  }, [customerType]);

  // Auto-select first available option when triage category changes
  useEffect(() => {
    if (dropdownOptions.length > 0) {
      if (!dropdownOptions.some((o) => o.key === selectedOptionKey)) {
        setSelectedOptionKey(dropdownOptions[0].key);
      }
    }
  }, [customerType, dropdownOptions, selectedOptionKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOption = dropdownOptions.find((o) => o.key === selectedOptionKey) || dropdownOptions[0];
    if (!selectedOption) {
      setErrorMsg('Please select a healthcare service');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    let finalName = customerName.trim() || cleanDefaultName || 'Walk-in Patient';
    if (customerType === 'priority' && selectedOption.reason && !finalName.includes('Emergency:')) {
      finalName = `${finalName} [Emergency: ${selectedOption.reason}]`;
    }
    try {
      const newTok = await onCreateToken(finalName, customerType, selectedOption.serviceId);
      setIssuedToken(newTok);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to issue patient token. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-portal-container single-form-view">
      <div className="card portal-card-form">
        <div className="card-header">
          <div className="card-title-group">
            <IconTicket size={24} className="card-icon text-primary" />
            <div>
              <h2>Patient Registration & Clinical Lobby</h2>
              <p className="card-subtitle">Select your medical department to register for doctor consultation & triage</p>
            </div>
          </div>
        </div>

        {(() => {
          const targetToken = issuedToken || activeTokensInQueue.find((t) =>
            (customerName && t.customer_name?.toLowerCase().includes(customerName.toLowerCase())) ||
            (cleanDefaultName && t.customer_name?.toLowerCase().includes(cleanDefaultName.toLowerCase()))
          );
          if (!targetToken) return null;

          const waitingList = activeTokensInQueue.filter((t) => t.status === 'waiting');
          const myWaitIdx = waitingList.findIndex((t) => t.id === targetToken.id);
          const queuePositionStr = targetToken.status === 'serving' || targetToken.status === 'called'
            ? 'In Consultation Now'
            : targetToken.status === 'completed'
            ? 'Consultation Completed'
            : myWaitIdx >= 0
            ? `#${myWaitIdx + 1} in Queue`
            : 'In Queue';

          return (
            <div className="pass-issued-alert success" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px', width: '100%', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <IconCheck size={22} className="text-success" />
                  <strong style={{ fontSize: '16px' }}>My Token: {targetToken.token_number}</strong>
                </div>
                <span className={`status-badge ${targetToken.status}`} style={{ textTransform: 'uppercase', fontSize: '11px', padding: '3px 8px' }}>
                  {targetToken.status === 'serving' || targetToken.status === 'called' ? 'IN CONSULTATION' : targetToken.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', width: '100%', marginTop: '6px', background: 'rgba(0, 200, 133, 0.08)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Patient Name</span>
                  <strong style={{ fontSize: '13px', color: '#e2e8f0' }}>{targetToken.customer_name || 'Patient'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Queue Position</span>
                  <strong style={{ fontSize: '13px', color: '#00c885' }}>{queuePositionStr}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Assigned OPD Room</span>
                  <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{targetToken.counter_id ? `Room ${targetToken.counter_id}` : 'Triage / Auto'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Estimated Wait</span>
                  <strong style={{ fontSize: '13px', color: '#fbbf24' }}>{Math.max(0, Math.round(targetToken.estimated_wait))} mins</strong>
                </div>
              </div>
            </div>
          );
        })()}

        <form onSubmit={handleSubmit} className="token-form">
          {errorMsg && <div className="alert-box error">{errorMsg}</div>}

          <div className="form-group">
            <label htmlFor="customerName">
              <IconUser size={15} /> Patient Name <span className="required-star" style={{ color: '#00c885' }}>*</span>
            </label>
            <input
              id="customerName"
              type="text"
              className="form-input"
              placeholder="e.g. Praveen Kumar"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="customerType">Patient Triage Category</label>
            <div className="customer-type-options">
              <button
                type="button"
                className={`type-chip regular ${customerType === 'regular' ? 'selected' : ''}`}
                onClick={() => setCustomerType('regular')}
              >
                <span className="chip-title">Regular Consultation</span>
                <span className="chip-sub">Standard Queue</span>
              </button>

              <button
                type="button"
                className={`type-chip priority ${customerType === 'priority' ? 'selected' : ''}`}
                onClick={() => setCustomerType('priority')}
              >
                <span className="chip-title">Emergency / Triage</span>
                <span className="chip-sub">Priority Care</span>
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="serviceSelect">Department / Healthcare Service</label>
            <div className="service-select-wrapper">
              <select
                id="serviceSelect"
                className="form-select"
                value={selectedOptionKey}
                onChange={(e) => setSelectedOptionKey(e.target.value)}
                required
              >
                {dropdownOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-primary get-token-btn" disabled={isSubmitting || dropdownOptions.length === 0}>
            {isSubmitting ? (
              <>
                <span className="btn-spinner" /> Registering Patient...
              </>
            ) : (
              <>
                <IconTicket size={20} /> Register Patient
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
