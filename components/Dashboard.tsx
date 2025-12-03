import React, { useEffect, useMemo } from 'react';
import { Candidate, CandidateStatus, Asset, AssetStatus, AssetType, UserRole } from '../types';
import { useToast } from '../context/ToastContext';
import { UserCheck, Briefcase, UserX, UserSearch, Target } from 'lucide-react';

interface DashboardProps {
  candidates: Candidate[];
  assets: Asset[];
  currentUser?: any; // Added to access role
}

const StatsCard = ({ title, value, icon: Icon, colorClass }: any) => (
  <div className="bg-white p-6 rounded-sm shadow-sm border-t-4 border-brand-gold hover:shadow-xl transition-all duration-300 group">
    <div className={`p-3 rounded-sm ${colorClass} group-hover:scale-110 transition-transform duration-300 w-fit mb-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <p className="text-3xl text-brand-dark font-heritage">{value}</p>
    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-[0.2em] font-heritage mt-1">{title}</h3>
  </div>
);

const PipelineBar = ({ status, count, total, colorClass }: any) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">{status}</span>
      <span className="text-xs font-bold text-gray-500">{count}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}></div>
    </div>
  </div>
);

const AssetUtilizationBar = ({ type, allocated, total, colorClass }: any) => (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-brand-dark">{type}</span>
        <span className="text-xs font-bold text-gray-500">{allocated} / {total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div className={`${colorClass} h-2.5 rounded-full`} style={{ width: `${total > 0 ? (allocated / total) * 100 : 0}%` }}></div>
      </div>
    </div>
);


const Dashboard: React.FC<DashboardProps> = ({ candidates, assets, currentUser }) => {
  const { addToast } = useToast();
  const isRecruiter = currentUser?.role === UserRole.RECRUITER;

  useEffect(() => {
    // Only show DBS warnings for candidates visible to this user
    const expiringDbs = candidates.filter(c => c.dbsStatus === 'Expired' && c.status === CandidateStatus.HIRED);
    if (expiringDbs.length > 0) {
      addToast(`${expiringDbs.length} active driver(s) have an expired DBS check.`, 'warning');
    }
  }, [candidates, addToast]);

  const stats = useMemo(() => {
    const hiredCandidates = candidates.filter(c => c.status === CandidateStatus.HIRED).length;
    const churnedCandidates = candidates.filter(c => c.status === CandidateStatus.CHURNED).length;
    const screeningCandidates = candidates.filter(c => c.status === CandidateStatus.SCREENING).length;

    // Assets might be global or empty depending on App.tsx logic, 
    // but for recruiters we might just hide the Asset cards entirely.
    const totalPlates = assets.filter(a => a.type === AssetType.TRADE_PLATE).length;
    const allocatedPlates = assets.filter(a => a.type === AssetType.TRADE_PLATE && a.status === AssetStatus.ALLOCATED).length;
    const availablePlates = totalPlates - allocatedPlates;
    
    const totalFuelCards = assets.filter(a => a.type === AssetType.FUEL_CARD).length;
    const allocatedFuelCards = assets.filter(a => a.type === AssetType.FUEL_CARD && a.status === AssetStatus.ALLOCATED).length;

    return { hiredCandidates, churnedCandidates, screeningCandidates, totalPlates, allocatedPlates, availablePlates, totalFuelCards, allocatedFuelCards };
  }, [candidates, assets]);

  return (
    <div className="space-y-8">
      {isRecruiter && (
        <div className="bg-brand-dark text-brand-gold p-6 rounded-sm shadow-md border-l-4 border-brand-green">
          <h2 className="text-xl font-heritage font-bold mb-2">Welcome, {currentUser?.name}</h2>
          <p className="text-xs uppercase tracking-widest opacity-80">Partner Agency Dashboard</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Active Placements" value={stats.hiredCandidates} icon={UserCheck} colorClass="bg-brand-green" />
        <StatsCard title="Pipeline / Screening" value={stats.screeningCandidates} icon={UserSearch} colorClass="bg-blue-500" />
        <StatsCard title="Churn Rate (Total)" value={stats.churnedCandidates} icon={UserX} colorClass="bg-red-500" />
        
        {/* Recruiters see 'Total Candidates' instead of Operational Asset info */}
        {isRecruiter ? (
           <StatsCard title="Total Candidates" value={candidates.length} icon={Target} colorClass="bg-brand-gold" />
        ) : (
           <StatsCard title="Available Plates" value={stats.availablePlates} icon={Briefcase} colorClass="bg-yellow-500" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
           <h3 className="text-lg font-bold text-brand-dark font-heritage uppercase tracking-widest mb-6">
             {isRecruiter ? 'Recruitment Funnel' : 'Candidate Pipeline'}
           </h3>
           <div className="space-y-4">
              <PipelineBar status="New" count={candidates.filter(c=>c.status === CandidateStatus.NEW).length} total={candidates.length} colorClass="bg-blue-600" />
              <PipelineBar status="Screening" count={stats.screeningCandidates} total={candidates.length} colorClass="bg-yellow-500" />
              <PipelineBar status="Hired" count={stats.hiredCandidates} total={candidates.length} colorClass="bg-brand-green" />
           </div>
        </div>
        
        {/* Hide Asset Utilization for Recruiters as they don't manage stock */}
        {!isRecruiter && (
          <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-brand-dark font-heritage uppercase tracking-widest mb-6">Asset Utilization</h3>
              <div className="space-y-4">
                <AssetUtilizationBar type="Trade Plates" allocated={stats.allocatedPlates} total={stats.totalPlates} colorClass="bg-brand-dark" />
                <AssetUtilizationBar type="Fuel Cards" allocated={stats.allocatedFuelCards} total={stats.totalFuelCards} colorClass="bg-brand-gold" />
              </div>
          </div>
        )}
        
        {/* Show a placeholder or different chart for recruiters if needed, or just leave layout fluid */}
        {isRecruiter && (
           <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100 flex items-center justify-center text-center">
              <div>
                <Target className="w-12 h-12 text-brand-gold mx-auto mb-4" />
                <h3 className="text-lg font-bold text-brand-dark font-heritage uppercase tracking-widest mb-2">Performance Goals</h3>
                <p className="text-sm text-gray-500">Keep pipeline candidates moving through screening to increase placement rates.</p>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;