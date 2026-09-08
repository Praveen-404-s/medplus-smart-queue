import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, createWebSocketClient } from './api/client';
import { CustomerPortal } from './components/CustomerPortal';
import { Header } from './components/Header';
import { LandingPortal } from './components/LandingPortal';
import { LiveQueue } from './components/LiveQueue';
import { UserRole } from './components/RoleLoginModal';
import { StaffDashboard } from './components/StaffDashboard';
import { StatsBanner } from './components/StatsBanner';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { ReportsDashboard } from './components/ReportsDashboard';
import { PatientSearch } from './components/PatientSearch';
import { Counter, CustomerType, DashboardStats, Service, Token } from './types/queue';

interface ToastNotice {
  id: string;
  type: 'success' | 'info' | 'error';
  message: string;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'customer' | 'live' | 'staff' | string>('live');
  const [services, setServices] = useState<Service[]>([]);
  const [queueTokens, setQueueTokens] = useState<Token[]>([]);
  const [allTokens, setAllTokens] = useState<Token[]>([]);
  const [counters, setCounters] = useState<Counter[]>([]);

  // Role Auth State
  const [isRoleModalOpen, setIsRoleModalOpen] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<string>('Praveen (Patient)');

  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isOperating, setIsOperating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  const addToast = (type: 'success' | 'info' | 'error', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [sData, qData, tData, cData] = await Promise.all([
        api.getServices().catch(() => []),
        api.getQueue().catch(() => []),
        api.getTokens().catch(() => []),
        api.getCounters().catch(() => []),
      ]);
      setServices(Array.isArray(sData) ? sData : []);
      setQueueTokens(Array.isArray(qData) ? qData : []);
      setAllTokens(Array.isArray(tData) ? tData : []);
      setCounters(Array.isArray(cData) ? cData : []);
    } catch (err: any) {
      console.error('Data fetch failed:', err);
      addToast('error', 'Failed to connect to backend server');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const cleanupWs = createWebSocketClient(
      () => {
        fetchData();
      },
      (connected) => {
        setIsWsConnected(connected);
      }
    );

    const pollingInterval = setInterval(() => {
      fetchData();
    }, 6000);

    return () => {
      cleanupWs();
      clearInterval(pollingInterval);
    };
  }, [fetchData]);

  // Compute Dashboard Statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const safeQueue = Array.isArray(queueTokens) ? queueTokens : [];
    const safeAll = Array.isArray(allTokens) ? allTokens : [];
    const safeCounters = Array.isArray(counters) ? counters : [];

    const waitingList = safeQueue.filter((t) => t && t.status === 'waiting');
    const servingList = safeQueue.filter((t) => t && (t.status === 'serving' || t.status === 'called'));
    const completedList = safeAll.filter((t) => t && t.status === 'completed');

    const totalPredicted = waitingList.length
      ? waitingList.reduce((sum, t) => sum + (t.predicted_duration || 0), 0)
      : safeQueue.reduce((sum, t) => sum + (t.predicted_duration || 0), 0);

    const avgPredictedDuration = waitingList.length
      ? totalPredicted / waitingList.length
      : safeQueue.length
      ? totalPredicted / safeQueue.length
      : 0;

    return {
      totalWaiting: waitingList.length,
      currentlyServing: servingList.length,
      completedCount: completedList.length,
      avgPredictedDuration: Math.round(avgPredictedDuration * 10) / 10,
      activeCounters: safeCounters.filter((c) => c && c.is_active).length,
    };
  }, [queueTokens, allTokens, counters]);

  // Role Selection Handler
  const handleSelectRole = (role: UserRole, username?: string) => {
    setCurrentRole(role);
    if (username) setCurrentUser(username);

    if (role === 'patient') {
      setActiveTab('register');
      addToast('info', `Logged in as Patient: ${username || 'Patient Portal'}`);
    } else if (role === 'doctor') {
      setActiveTab('rooms');
      addToast('success', `Logged in as Doctor / Staff: ${username || 'Doctor / Staff'}`);
    } else {
      setActiveTab('live');
      addToast('success', `Logged in as Reception Desk: ${username || 'Receptionist'}`);
    }
    setIsRoleModalOpen(false);
  };

  // Guard activeTab if switching roles or attempting unauthorized navigation
  useEffect(() => {
    if (currentRole === 'patient' && ['rooms', 'staff', 'reports', 'search', 'live'].includes(activeTab)) {
      setActiveTab('register');
    } else if (currentRole !== 'patient' && activeTab === 'register') {
      setActiveTab('live');
    }
  }, [currentRole, activeTab]);

  // Handle Token Creation
  const handleCreateToken = async (
    customerName: string,
    customerType: CustomerType,
    serviceId: number
  ): Promise<Token> => {
    setIsOperating(true);
    try {
      const cleanUser = currentUser ? currentUser.replace(/\s*\(.*\)/, '').trim() : '';
      const finalName = (customerName || '').trim() || cleanUser || 'Walk-in Patient';

      const newTok = await api.createToken({
        customer_name: finalName,
        customer_type: customerType,
        service_id: serviceId,
      });
      addToast('success', `Patient Token ${newTok.token_number} issued for ${finalName}!`);
      await fetchData();
      return newTok;
    } catch (err: any) {
      addToast('error', err.message || 'Failed to create token');
      throw err;
    } finally {
      setIsOperating(false);
    }
  };

  // Handle Call Token
  const handleCallToken = async (tokenId: number) => {
    setIsOperating(true);
    try {
      const updated = await api.callToken(tokenId);
      addToast('info', `Patient ${updated.token_number} is now called to consultation!`);
      await fetchData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to call token');
    } finally {
      setIsOperating(false);
    }
  };

  // Handle Complete Token
  const handleCompleteToken = async (tokenId: number, actualDuration?: number) => {
    setIsOperating(true);
    try {
      const updated = await api.completeToken(tokenId, actualDuration);
      addToast('success', `Patient ${updated.token_number} consultation completed!`);
      await fetchData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to complete token');
    } finally {
      setIsOperating(false);
    }
  };

  // Handle Seed Demo Data
  const handleSeedDemo = async () => {
    setIsOperating(true);
    try {
      const res = await api.seedDemoQueue();
      addToast('success', res.message || 'Demo patient queue added!');
      await fetchData();
    } catch (err: any) {
      addToast('error', err.message || 'Failed to seed demo data');
    } finally {
      setIsOperating(false);
    }
  };

  const handleNextQuickCall = () => {
    const nextWaiting = queueTokens.find((t) => t.status === 'waiting');
    if (nextWaiting) {
      handleCallToken(nextWaiting.id);
    } else {
      addToast('info', 'No waiting patients in queue');
    }
  };

  return (
    <div className="dashboard-grid-layout">
      {/* Toast Notifications Overlay */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item toast-${toast.type}`}>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Dark Space Landing Gateway Modal */}
      <LandingPortal
        isOpen={isRoleModalOpen}
        onSelectRole={handleSelectRole}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
      />

      {/* Left Column Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} currentRole={currentRole} />

      {/* Center Main Dashboard Column */}
      <main className="app-center-column">
        {/* Main App Navigation Header */}
        <Header
          activeTab={activeTab === 'register' ? 'customer' : activeTab === 'rooms' ? 'staff' : 'live'}
          onTabChange={(tab) => setActiveTab(tab)}
          isWsConnected={isWsConnected}
          onRefresh={fetchData}
          isRefreshing={isRefreshing}
          waitingCount={dashboardStats.totalWaiting}
          servingCount={dashboardStats.currentlyServing}
          currentRole={currentRole}
          currentUser={currentUser}
          onOpenRoleModal={() => setIsRoleModalOpen(true)}
        />

        {/* 5 Statistics Banner Row */}
        <StatsBanner stats={dashboardStats} />

        {/* Main View Area */}
        {activeTab === 'live' && (
          <LiveQueue
            tokens={queueTokens}
            services={services}
            onRefresh={fetchData}
            isWsConnected={isWsConnected}
          />
        )}

        {currentRole === 'patient' && activeTab === 'register' && (
          <CustomerPortal
            services={services}
            onCreateToken={handleCreateToken}
            activeTokensInQueue={queueTokens}
            currentUser={currentUser}
            onViewQueue={() => setActiveTab('live')}
          />
        )}

        {currentRole !== 'patient' && (activeTab === 'rooms' || activeTab === 'staff') && (
          <StaffDashboard
            counters={counters}
            tokens={queueTokens}
            services={services}
            onCallToken={handleCallToken}
            onCompleteToken={handleCompleteToken}
            onSeedDemo={handleSeedDemo}
            isOperating={isOperating}
          />
        )}

        {currentRole !== 'patient' && activeTab === 'reports' && (
          <ReportsDashboard
            waitingCount={dashboardStats.totalWaiting}
            servingCount={dashboardStats.currentlyServing}
            completedCount={dashboardStats.completedCount}
          />
        )}

        {currentRole !== 'patient' && activeTab === 'search' && (
          <PatientSearch tokens={allTokens} services={services} />
        )}
      </main>

      {/* Right Column Sidebar */}
      <RightSidebar
        waitingCount={dashboardStats.totalWaiting}
        servingCount={dashboardStats.currentlyServing}
        completedCount={dashboardStats.completedCount}
        onCallNextToken={handleNextQuickCall}
        currentRole={currentRole}
        onNavigate={(tab) => setActiveTab(tab)}
      />
    </div>
  );
}

