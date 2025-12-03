import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Candidates from './components/Candidates';
import Assets from './components/Assets';
import DriverMap from './components/DriverMap';
import Settings from './components/Settings';
import Reports from './components/Reports';
import { ToastProvider } from './context/ToastContext';
import { getNotifications } from './services/notificationService';
import { INITIAL_CANDIDATES, INITIAL_ASSETS, INITIAL_USERS, Candidate, Asset, User, UserRole, Notification } from './types';

// Helper to persist state
function usePersistedState<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialValue;
    } catch (e) {
      console.error("Error reading from localStorage", e);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      console.error("Error writing to localStorage", e);
    }
  }, [key, state]);

  return [state, setState];
}

export function App() {
  const [candidates, setCandidates] = usePersistedState<Candidate[]>('mvm_candidates', INITIAL_CANDIDATES);
  const [assets, setAssets] = usePersistedState<Asset[]>('mvm_assets', INITIAL_ASSETS);
  const [users, setUsers] = usePersistedState<User[]>('mvm_users', INITIAL_USERS);
  
  // Auth Simulation
  const [currentUserId, setCurrentUserId] = usePersistedState<string>('mvm_current_user_id', 'u-1'); // Default to Admin
  
  const currentUser = users.find(u => u.id === currentUserId) || users[0] || INITIAL_USERS[0];

  const visibleCandidates = useMemo(() => {
    if (currentUser.role === UserRole.RECRUITER) {
      return candidates.filter(c => c.recruiterId === currentUser.id);
    }
    return candidates; // Admins and Read Only see all
  }, [candidates, currentUser]);

  const notifications = useMemo(() => getNotifications(candidates, currentUser), [candidates, currentUser]);

  return (
    <ToastProvider>
      <Layout currentUser={currentUser} onLogout={() => alert("Logout functionality would redirect to login page.")} notifications={notifications}>
        <Routes>
          <Route path="/" element={<Dashboard candidates={visibleCandidates} assets={assets} currentUser={currentUser} />} />
          <Route path="/map" element={<DriverMap candidates={visibleCandidates} />} />
          <Route path="/candidates" element={
            <Candidates 
              candidates={visibleCandidates} 
              allCandidates={candidates}
              setCandidates={setCandidates} 
              assets={assets}
              setAssets={setAssets}
              currentUser={currentUser}
              users={users}
            />
          } />
          <Route path="/assets" element={
              <Assets assets={assets} setAssets={setAssets} userRole={currentUser.role} />
          } />
          <Route path="/settings" element={
            <Settings users={users} setUsers={setUsers} currentUser={currentUser} />
          } />
          <Route path="/reports" element={
              <Reports candidates={visibleCandidates} assets={assets} currentUser={currentUser} />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ToastProvider>
  );
}
