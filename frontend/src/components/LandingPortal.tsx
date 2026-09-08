import React, { useState } from 'react';
import { IconMedicalCross } from './Icons';
import { UserRole } from './RoleLoginModal';

interface LandingPortalProps {
  isOpen: boolean;
  onSelectRole: (role: UserRole, username?: string) => void;
  onClose: () => void;
  currentRole: UserRole;
}

export const LandingPortal: React.FC<LandingPortalProps> = ({
  isOpen,
  onSelectRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<'receptionist' | 'doctor' | 'patient'>('receptionist');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      setErrorMsg(
        selectedRole === 'receptionist'
          ? 'Please enter your Reception Employee ID to sign in.'
          : selectedRole === 'doctor'
          ? 'Please enter your Doctor / Staff ID to sign in.'
          : 'Please enter your Patient ID or Name to sign in.'
      );
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your Password to sign in.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    setErrorMsg(null);
    onSelectRole(selectedRole, userId.trim());
  };

  const handleRoleChange = (role: 'receptionist' | 'doctor' | 'patient') => {
    setSelectedRole(role);
    setErrorMsg(null);
  };

  return (
    <div className="login-page-fullscreen">
      {/* Subtle Star Particles & Aura in Background */}
      <div className="login-bg-aura">
        <div className="aura-glow top-purple"></div>
        <div className="aura-glow bottom-blue"></div>
      </div>

      {/* Main Login Card matching user image */}
      <div className="login-card-container">
        {/* Top Glowing Icon Box */}
        <div className="login-card-logo-wrapper">
          <div className="neon-logo-box">
            <IconMedicalCross size={28} />
          </div>
        </div>

        {/* Brand Title */}
        <div className="login-card-header">
          <h1 className="login-brand-title">
            MED <span className="highlight-plus blinking-pulse">PLUS</span>
          </h1>
          <p className="login-brand-subtitle">Hospital Healthcare Management System</p>
        </div>

        {/* Segmented Role Toggle Pills */}
        <div className="segmented-role-toggle">
          <button
            type="button"
            className={`segmented-tab ${selectedRole === 'receptionist' ? 'active' : ''}`}
            onClick={() => handleRoleChange('receptionist')}
          >
            Doctor / Staff
          </button>
          <button
            type="button"
            className={`segmented-tab ${selectedRole === 'patient' ? 'active' : ''}`}
            onClick={() => handleRoleChange('patient')}
          >
            Patient Portal
          </button>
        </div>

        {/* Validation Error Alert Box */}
        {errorMsg && (
          <div className="alert-box error" style={{ marginBottom: '18px', padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>
            {errorMsg}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="login-card-form">
          <div className="form-group-sleek">
            <label htmlFor="userIdInput">
              {selectedRole === 'receptionist'
                ? 'Reception Employee ID'
                : selectedRole === 'doctor'
                ? 'Doctor / Staff ID'
                : 'Patient ID / Name'}
            </label>
            <input
              id="userIdInput"
              type="text"
              className="sleek-input"
              placeholder={
                selectedRole === 'receptionist'
                  ? 'e.g. REC-2024'
                  : selectedRole === 'doctor'
                  ? 'e.g. DOC-2024'
                  : 'e.g. PAT-2024'
              }
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              required
            />
          </div>

          <div className="form-group-sleek">
            <div className="label-with-link">
              <label htmlFor="passwordInput">Password</label>
              <button
                type="button"
                className="forgot-link"
                onClick={() => alert('Demo Mode: Enter any ID and a minimum 6-character password to sign in!')}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="passwordInput"
              type="password"
              className="sleek-input"
              placeholder="••••••••"
              value={password}
              minLength={6}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              required
            />
            <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'block', textAlign: 'left' }}>
              Minimum 6 characters required
            </span>
          </div>

          <button type="submit" className="btn-mint-glow">
            Sign In
          </button>
        </form>

        {/* Footer Subtext */}
        <div className="login-card-footer">
          <p>Secure Healthcare Queue Management Portal • v2.0.4</p>
        </div>
      </div>
    </div>
  );
};
