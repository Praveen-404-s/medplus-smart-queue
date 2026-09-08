import React, { useState } from 'react';
import { IconCheck, IconCounter, IconShield, IconSparkles, IconUser } from './Icons';

export type UserRole = 'patient' | 'receptionist' | 'doctor' | null;

interface RoleLoginModalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole, username?: string) => void;
  onClose: () => void;
  currentRole: UserRole;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onSelectRole,
  onClose,
}) => {
  const [selectedRole, setSelectedRole] = useState<'patient' | 'receptionist' | 'doctor'>('patient');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (role: 'patient' | 'receptionist' | 'doctor') => {
    const demoName = role === 'patient'
      ? 'Praveen (Patient)'
      : role === 'receptionist'
      ? 'Sarah (Reception)'
      : 'Dr. Sarah (Doctor / Staff)';
    onSelectRole(role, demoName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    const defaultTitle = selectedRole === 'patient'
      ? 'Patient User'
      : selectedRole === 'doctor'
      ? 'Dr. Sarah (Doctor / Staff)'
      : 'Reception Desk';
    const finalName = username.trim() || defaultTitle;
    onSelectRole(selectedRole, finalName);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card role-login-modal" onClick={(e) => e.stopPropagation()}>
        <div className="login-modal-header">
          <div className="brand-logo-badge">
            <IconSparkles size={16} /> SMART QUEUE AI AUTH
          </div>
          <h2>Hospital Portal Access</h2>
          <p className="card-subtitle">Select your role to access Doctor / Staff or Patient Portal</p>
        </div>

        {/* 2 Role Cards Grid */}
        <div className="role-selection-grid two-roles">
          <div
            className={`role-card ${selectedRole === 'patient' ? 'active' : ''}`}
            onClick={() => setSelectedRole('patient')}
          >
            <div className="role-card-icon patient-icon">
              <IconUser size={28} />
            </div>
            <div className="role-card-info">
              <h3>Patient Portal</h3>
              <p>Book token, check live status & wait time</p>
            </div>
            {selectedRole === 'patient' && <IconCheck size={18} className="role-check-icon" />}
          </div>

          <div
            className={`role-card ${selectedRole === 'receptionist' ? 'active' : ''}`}
            onClick={() => setSelectedRole('receptionist')}
          >
            <div className="role-card-icon staff-icon">
              <IconCounter size={28} />
            </div>
            <div className="role-card-info">
              <h3>Doctor / Staff</h3>
              <p>Dispatch rooms 1-3, call next patient & complete consultations</p>
            </div>
            {selectedRole === 'receptionist' && <IconCheck size={18} className="role-check-icon" />}
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="modalUsername">
              <IconUser size={14} /> Name / Username <span className="optional">(Optional)</span>
            </label>
            <input
              id="modalUsername"
              type="text"
              className="form-input"
              placeholder={selectedRole === 'patient' ? 'e.g. Praveen' : 'e.g. Dr. Sarah / Staff'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="modalPassword">
              <IconShield size={14} /> Password <span className="optional">(Minimum 6 chars)</span>
            </label>
            <input
              id="modalPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary login-submit-btn">
            <IconShield size={18} /> Enter as {selectedRole === 'patient' ? 'Patient' : 'Doctor / Staff'}
          </button>
        </form>

        {/* Quick Demo 1-Click Login Chips */}
        <div className="quick-login-chips">
          <span className="chip-label">⚡ Quick Login:</span>
          <div className="chip-buttons">
            <button type="button" className="quick-chip patient" onClick={() => handleQuickLogin('patient')}>
              👤 Patient
            </button>
            <button type="button" className="quick-chip staff" onClick={() => handleQuickLogin('receptionist')}>
              👨‍⚕️ Doctor / Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

