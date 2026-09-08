import React, { useMemo, useState } from 'react';
import { Service, Token } from '../types/queue';
import { getCategoryServiceLabel, hospitalServiceNames } from './CustomerPortal';
import {
  IconCheck,
  IconClock,
  IconFileText,
  IconMedicalCross,
  IconPrinter,
  IconSearch,
  IconSparkles,
  IconStethoscope,
  IconUser,
  IconActivity
} from './Icons';

interface PatientRecord {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  tokenNumber: string;
  triageCategory: 'regular' | 'priority' | 'senior';
  serviceName: string;
  roomName: string;
  doctorName: string;
  status: 'waiting' | 'serving' | 'completed';
  checkInTime: string;
  vitals: {
    bp: string;
    heartRate: string;
    spo2: string;
    temp: string;
  };
  diagnosis: string;
  prescriptions: string[];
}

const mockPatientDatabase: PatientRecord[] = [
  {
    id: 'p1',
    patientId: 'PAT-9082',
    name: 'Sarah Jenkins',
    age: 34,
    gender: 'Female',
    phone: '+1 (555) 438-9201',
    tokenNumber: 'D001',
    triageCategory: 'regular',
    serviceName: 'General Doctor Consultation',
    roomName: 'OPD Room 101',
    doctorName: 'Dr. Alexander Vance',
    status: 'serving',
    checkInTime: '09:15 AM',
    vitals: { bp: '118/78 mmHg', heartRate: '74 bpm', spo2: '99%', temp: '98.4 °F' },
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    prescriptions: ['Amoxicillin 500mg - 1 Tab 3x Daily', 'Paracetamol 650mg - As needed for fever'],
  },
  {
    id: 'p2',
    patientId: 'PAT-4102',
    name: 'Priya Sharma',
    age: 28,
    gender: 'Female',
    phone: '+1 (555) 891-2043',
    tokenNumber: 'D002',
    triageCategory: 'regular',
    serviceName: 'Pharmacy & Medicine Dispatch',
    roomName: 'Pharmacy Window 2',
    doctorName: 'Pharmacist Rita Ray',
    status: 'waiting',
    checkInTime: '09:22 AM',
    vitals: { bp: '122/80 mmHg', heartRate: '78 bpm', spo2: '98%', temp: '98.6 °F' },
    diagnosis: 'Routine Prescription Refill',
    prescriptions: ['Cetirizine 10mg - 1 Tab Nightly', 'Vitamin C 500mg'],
  },
  {
    id: 'p3',
    patientId: 'PAT-8819',
    name: 'Kavin Kumar',
    age: 45,
    gender: 'Male',
    phone: '+1 (555) 772-9011',
    tokenNumber: 'E001',
    triageCategory: 'priority',
    serviceName: 'Accident & Emergency Triage',
    roomName: 'Emergency Room 1',
    doctorName: 'Dr. Sarah Chen (Trauma Specialist)',
    status: 'waiting',
    checkInTime: '09:30 AM',
    vitals: { bp: '138/90 mmHg', heartRate: '92 bpm', spo2: '96%', temp: '99.1 °F' },
    diagnosis: 'Chest Discomfort & Mild Tachycardia Evaluation',
    prescriptions: ['ECG Panel', 'Troponin I Blood Test', 'Aspirin 75mg Dispersible'],
  },
  {
    id: 'p4',
    patientId: 'PAT-3120',
    name: 'Michael Chang',
    age: 62,
    gender: 'Male',
    phone: '+1 (555) 612-4490',
    tokenNumber: 'D003',
    triageCategory: 'regular',
    serviceName: 'Laboratory & Blood Test',
    roomName: 'Lab Room 3',
    doctorName: 'Dr. Marcus Thorne',
    status: 'completed',
    checkInTime: '08:45 AM',
    vitals: { bp: '126/82 mmHg', heartRate: '68 bpm', spo2: '99%', temp: '98.2 °F' },
    diagnosis: 'Annual Diabetic & Lipid Profile Health Checkup',
    prescriptions: ['Fasting Blood Glucose', 'HbA1c Panel', 'Metformin 500mg Extended Release'],
  },
  {
    id: 'p5',
    patientId: 'PAT-7741',
    name: 'Emma Watson',
    age: 51,
    gender: 'Female',
    phone: '+1 (555) 309-1822',
    tokenNumber: 'D004',
    triageCategory: 'regular',
    serviceName: 'Radiology / X-Ray / Scan',
    roomName: 'X-Ray Suite 2',
    doctorName: 'Dr. Elena Rostova',
    status: 'completed',
    checkInTime: '08:30 AM',
    vitals: { bp: '115/75 mmHg', heartRate: '70 bpm', spo2: '98%', temp: '98.4 °F' },
    diagnosis: 'Right Knee Joint Degeneration Assessment',
    prescriptions: ['Knee AP/Lateral X-Ray', 'Glucosamine Supplement 1500mg'],
  },
];

interface PatientSearchProps {
  tokens: Token[];
  services: Service[];
}

export const PatientSearch: React.FC<PatientSearchProps> = ({ tokens, services }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'serving' | 'completed'>('all');
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);

  // Merge live API tokens with patient database records
  const allRecords = useMemo(() => {
    const liveMapped: PatientRecord[] = tokens.map((t, idx) => {
      const rawService = services.find((s) => s.id === t.service_id);
      const svcName = rawService ? getCategoryServiceLabel(rawService.name, t.customer_type) : `Department #${t.service_id}`;
      return {
        id: `live-${t.id}`,
        patientId: `PAT-${1000 + t.id}`,
        name: t.customer_name || `Walk-in Patient #${t.id}`,
        age: 30 + (idx % 25),
        gender: idx % 2 === 0 ? 'Female' : 'Male',
        phone: `+1 (555) ${100 + idx * 17}-${2000 + idx * 33}`,
        tokenNumber: t.token_number,
        triageCategory: t.customer_type as 'regular' | 'priority' | 'senior',
        serviceName: svcName,
        roomName: t.counter_id ? `Room ${t.counter_id}` : 'Triage Queue',
        doctorName: t.counter_id === 1 ? 'Dr. Alexander Vance' : t.counter_id === 2 ? 'Dr. Elena Rostova' : 'Dr. Sarah Chen',
        status: (t.status === 'called' ? 'serving' : t.status) as any,
        checkInTime: new Date(t.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vitals: { bp: '120/80 mmHg', heartRate: '72 bpm', spo2: '99%', temp: '98.6 °F' },
        diagnosis: t.customer_type === 'priority' ? 'Emergency Evaluation & Triage' : 'Routine Medical Consultation',
        prescriptions: ['Prescription details available upon doctor completion.'],
      };
    });

    // Deduplicate or merge
    const combined = [...liveMapped];
    mockPatientDatabase.forEach((m) => {
      if (!combined.some((c) => c.tokenNumber === m.tokenNumber)) {
        combined.push(m);
      }
    });

    return combined;
  }, [tokens, services]);

  // Filter records based on search query and status filter
  const filteredPatients = useMemo(() => {
    return allRecords.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;

      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(term);
        const tokenMatch = p.tokenNumber.toLowerCase().includes(term);
        const idMatch = p.patientId.toLowerCase().includes(term);
        const phoneMatch = p.phone.toLowerCase().includes(term);
        const deptMatch = p.serviceName.toLowerCase().includes(term);
        const docMatch = p.doctorName.toLowerCase().includes(term);
        return nameMatch || tokenMatch || idMatch || phoneMatch || deptMatch || docMatch;
      }

      return true;
    });
  }, [allRecords, searchTerm, statusFilter]);

  return (
    <div className="patient-search-dashboard-container">
      {/* Header & Search Bar Card */}
      <div className="card patient-search-control-card">
        <div className="card-header">
          <div className="card-title-group">
            <IconSearch size={24} className="card-icon text-cyan" />
            <div>
              <h2>Patient Search & Electronic Health Records (EHR)</h2>
              <p className="card-subtitle">
                Search patient records by Name, Token Number, Patient ID, Contact, or Department
              </p>
            </div>
          </div>
        </div>

        {/* Search Controls Toolbar */}
        <div className="search-toolbar-row">
          <div className="big-search-input-wrapper">
            <IconSearch size={18} className="search-input-icon text-cyan" />
            <input
              type="text"
              className="big-search-input"
              placeholder="Type Patient Name, Token (e.g. D001), ID (PAT-9082), Phone, or Doctor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                ✕ Clear
              </button>
            )}
          </div>

          <div className="filter-pill-tabs">
            <button
              className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Directory ({allRecords.length})
            </button>
            <button
              className={`filter-pill ${statusFilter === 'waiting' ? 'active' : ''}`}
              onClick={() => setStatusFilter('waiting')}
            >
              Waiting
            </button>
            <button
              className={`filter-pill ${statusFilter === 'serving' ? 'active' : ''}`}
              onClick={() => setStatusFilter('serving')}
            >
              In Consultation
            </button>
            <button
              className={`filter-pill ${statusFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setStatusFilter('completed')}
            >
              Completed Visits
            </button>
          </div>
        </div>
      </div>

      {/* Patient Search Results Table Card */}
      <div className="card patient-results-card">
        <div className="results-card-header">
          <h3>
            Matching Patient Records <span className="results-count-badge">{filteredPatients.length} Found</span>
          </h3>
        </div>

        <div className="table-responsive">
          <table className="queue-table patient-directory-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Token #</th>
                <th>Patient Name</th>
                <th>Age / Sex</th>
                <th>Contact Phone</th>
                <th>Department / Service</th>
                <th>OPD Room & Physician</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length > 0 ? (
                filteredPatients.map((p) => (
                  <tr key={p.id} className={`row-${p.status}`}>
                    <td>
                      <strong className="patient-id-tag">{p.patientId}</strong>
                    </td>

                    <td>
                      <span className="token-number-cell">{p.tokenNumber}</span>
                    </td>

                    <td>
                      <div className="patient-name-cell">
                        <span className="name-bold">{p.name}</span>
                        <span className={`chip-category ${p.triageCategory}`}>
                          {p.triageCategory.toUpperCase()}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className="age-sex-text">{p.age} yrs / {p.gender}</span>
                    </td>

                    <td>
                      <span className="phone-text">{p.phone}</span>
                    </td>

                    <td>
                      <span className="service-name-text">{p.serviceName}</span>
                    </td>

                    <td>
                      <div className="room-doc-cell">
                        <span className="counter-badge">{p.roomName}</span>
                        <span className="doc-name">{p.doctorName}</span>
                      </div>
                    </td>

                    <td>
                      <span className={`status-badge ${p.status}`}>
                        {p.status === 'serving' && <IconActivity size={12} className="pulse-icon" />}
                        {p.status === 'serving' ? 'IN CONSULTATION' : p.status.toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <button
                        className="btn-secondary btn-xs btn-view-ehr"
                        onClick={() => setSelectedPatient(p)}
                      >
                        <IconFileText size={14} /> View EHR Profile
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="empty-table-cell">
                    <div className="empty-state-box">
                      <IconSearch size={38} className="text-cyan" />
                      <p className="empty-title">No patient records found matching "{searchTerm}".</p>
                      <p className="empty-sub">Try searching by token number (e.g. D001) or patient name.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient EHR Health Details Modal */}
      {selectedPatient && (
        <div className="modal-backdrop" onClick={() => setSelectedPatient(null)}>
          <div className="card patient-ehr-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="ehr-modal-header">
              <div className="ehr-patient-title-group">
                <div className="patient-avatar-circle">
                  <IconUser size={26} />
                </div>
                <div>
                  <h2 className="ehr-patient-name">{selectedPatient.name}</h2>
                  <p className="ehr-patient-meta">
                    ID: <strong>{selectedPatient.patientId}</strong> • Token: <strong className="text-cyan">{selectedPatient.tokenNumber}</strong> • {selectedPatient.age} Y / {selectedPatient.gender} • {selectedPatient.phone}
                  </p>
                </div>
              </div>
              <button className="close-modal-btn" onClick={() => setSelectedPatient(null)}>✕</button>
            </div>

            <div className="ehr-modal-body">
              {/* Vital Signs Grid */}
              <div className="ehr-vitals-banner">
                <div className="vital-item">
                  <span className="vital-lbl">Blood Pressure</span>
                  <strong className="vital-val">{selectedPatient.vitals.bp}</strong>
                </div>
                <div className="vital-item">
                  <span className="vital-lbl">Heart Rate</span>
                  <strong className="vital-val text-cyan">{selectedPatient.vitals.heartRate}</strong>
                </div>
                <div className="vital-item">
                  <span className="vital-lbl">Oxygen (SpO2)</span>
                  <strong className="vital-val">{selectedPatient.vitals.spo2}</strong>
                </div>
                <div className="vital-item">
                  <span className="vital-lbl">Temperature</span>
                  <strong className="vital-val">{selectedPatient.vitals.temp}</strong>
                </div>
              </div>

              {/* Consultation Details & Prescriptions */}
              <div className="ehr-details-grid">
                <div className="ehr-section-box">
                  <h4 className="section-title">
                    <IconStethoscope size={16} className="text-cyan" /> Current Consultation Info
                  </h4>
                  <div className="info-pair">
                    <span className="lbl">Department / Service:</span>
                    <span className="val">{selectedPatient.serviceName}</span>
                  </div>
                  <div className="info-pair">
                    <span className="lbl">Assigned OPD Room:</span>
                    <span className="val">{selectedPatient.roomName}</span>
                  </div>
                  <div className="info-pair">
                    <span className="lbl">Attending Physician:</span>
                    <span className="val">{selectedPatient.doctorName}</span>
                  </div>
                  <div className="info-pair">
                    <span className="lbl">Triage Category:</span>
                    <span className={`chip-category ${selectedPatient.triageCategory}`}>
                      {selectedPatient.triageCategory.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="ehr-section-box">
                  <h4 className="section-title">
                    <IconFileText size={16} className="text-cyan" /> Clinical Diagnosis & Notes
                  </h4>
                  <p className="diagnosis-text">{selectedPatient.diagnosis}</p>
                </div>
              </div>

              {/* Prescriptions List */}
              <div className="ehr-section-box full-width">
                <h4 className="section-title">
                  <IconSparkles size={16} className="text-cyan" /> Prescribed Medications & Dosage
                </h4>
                <ul className="prescription-list">
                  {selectedPatient.prescriptions.map((rx, idx) => (
                    <li key={idx}>
                      <IconCheck size={14} className="text-cyan" /> {rx}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="ehr-modal-footer">
              <button className="btn-secondary" onClick={() => window.print()}>
                <IconPrinter size={15} /> Print Medical Records
              </button>
              <button className="btn-primary primary-glow-blue" onClick={() => setSelectedPatient(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
