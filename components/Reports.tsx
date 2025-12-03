import React from 'react';
import { Candidate, Asset, CandidateStatus, AssetStatus, AssetType, UserRole } from '../types';
import { BarChart, PieChart, Users, Briefcase } from 'lucide-react';

interface ReportsProps {
  candidates: Candidate[];
  assets: Asset[];
  currentUser?: any; // Added to access role
}

const Reports: React.FC<ReportsProps> = ({ candidates, assets, currentUser }) => {
  const isRecruiter = currentUser?.role === UserRole.RECRUITER;

  const statusCounts = candidates.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<CandidateStatus, number>);

  const assetStatusCounts = assets.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {} as Record<AssetStatus, number>);
  
  const assetTypeCounts = assets.reduce((acc, a) => {
    acc[a.type] = (acc[a.type] || 0) + 1;
    return acc;
  }, {} as Record<AssetType, number>);


  const FunnelStep = ({ label, count, total, color, isFirst = false, isLast = false }: any) => {
    const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    return (
        <div className="flex items-center">
            <div className="w-32 text-right mr-4">
                <p className="text-sm font-bold text-brand-dark uppercase tracking-wider">{label}</p>
                <p className="text-xs text-gray-500">{count} Candidates</p>
            </div>
            <div className={`h-12 ${color} flex items-center justify-center text-white font-bold text-xs`} style={{ width: `${percentage}%` }}>
                {percentage}%
            </div>
        </div>
    );
  };
  
  const totalCandidates = candidates.length;

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-brand-dark font-heritage uppercase tracking-wider mb-8 flex items-center">
          <BarChart className="mr-3 text-brand-gold" /> 
          {isRecruiter ? 'Agency Performance Report' : 'Analytics & Reporting'}
        </h2>
        {isRecruiter && <p className="text-sm text-gray-500 mb-8 -mt-6 ml-10">Data limited to candidates assigned to {currentUser?.name}.</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Recruitment Funnel */}
            <div>
                <h3 className="text-lg font-bold text-brand-dark font-heritage uppercase tracking-widest mb-6 border-b pb-3">Recruitment Funnel</h3>
                <div className="space-y-2">
                    <FunnelStep label="New" count={statusCounts.New || 0} total={totalCandidates} color="bg-blue-600" />
                    <FunnelStep label="Screening" count={statusCounts.Screening || 0} total={totalCandidates} color="bg-yellow-500" />
                    <FunnelStep label="Hired" count={statusCounts.Hired || 0} total={totalCandidates} color="bg-brand-green" />
                    <FunnelStep label="Churned" count={statusCounts.Churned || 0} total={totalCandidates} color="bg-red-800" />
                </div>
            </div>

            {/* Asset Overview - Only show if not recruiter, or if we want them to see what their candidates hold */}
            <div>
                <h3 className="text-lg font-bold text-brand-dark font-heritage uppercase tracking-widest mb-6 border-b pb-3">
                  {isRecruiter ? 'Equipment Issued to Candidates' : 'Asset Overview'}
                </h3>
                
                {!isRecruiter ? (
                  <div className="space-y-4">
                      <div className="flex justify-around text-center p-4 bg-gray-50 rounded-sm">
                          <div>
                              <p className="text-3xl font-heritage text-brand-dark">{assets.length}</p>
                              <p className="text-xs uppercase font-bold tracking-widest text-gray-500">Total Assets</p>
                          </div>
                           <div>
                              <p className="text-3xl font-heritage text-green-700">{assetStatusCounts.Available || 0}</p>
                              <p className="text-xs uppercase font-bold tracking-widest text-gray-500">Available</p>
                          </div>
                           <div>
                              <p className="text-3xl font-heritage text-blue-700">{assetStatusCounts.Allocated || 0}</p>
                              <p className="text-xs uppercase font-bold tracking-widest text-gray-500">Allocated</p>
                          </div>
                      </div>
                      <div>
                          {Object.entries(assetTypeCounts).map(([type, count]) => (
                              <div key={type} className="flex justify-between items-center text-sm p-2 border-b border-gray-100">
                                  <span className="font-bold text-gray-600">{type}</span>
                                  <span className="font-mono text-brand-dark">{count} units</span>
                              </div>
                          ))}
                      </div>
                  </div>
                ) : (
                  <div className="space-y-4 bg-gray-50 p-6 rounded-sm">
                    {/* Logic to show assets held by THIS recruiter's candidates */}
                    {['Trade Plate', 'Fuel Card', 'Tablet'].map(type => {
                      const count = assets.filter(a => a.type === type && candidates.some(c => c.id === a.allocatedToCandidateId)).length;
                      return (
                         <div key={type} className="flex justify-between items-center text-sm p-3 border-b border-gray-200">
                              <span className="font-bold text-gray-600">{type}s Issued</span>
                              <span className="font-mono text-brand-dark font-bold">{count}</span>
                         </div>
                      )
                    })}
                     <p className="text-xs italic text-gray-400 mt-4">Total items currently in possession of your active drivers.</p>
                  </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;