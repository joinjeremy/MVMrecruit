import React from 'react';
import { Candidate, CandidateStatus, Asset, UserRole, AssetType } from '../types';
import { Edit2, Trash2, Car, CreditCard, Tablet, Shirt, Camera, IdCard, Briefcase, Clock } from 'lucide-react';

interface CandidateTableProps {
  candidates: Candidate[];
  assets: Asset[];
  onEdit: (c: Candidate) => void;
  onDelete: (id: string) => void;
  onHistory: (c: Candidate) => void;
  userRole: UserRole;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, assets, onEdit, onDelete, onHistory, userRole }) => {
  
  const getAssignedAssets = (candidateId: string) => {
    return assets.filter(a => a.allocatedToCandidateId === candidateId);
  };

  const getAssetIcon = (type: AssetType) => {
    switch(type) {
      case AssetType.TRADE_PLATE: return <Car size={10} className="mr-1"/>;
      case AssetType.FUEL_CARD: return <CreditCard size={10} className="mr-1"/>;
      case AssetType.TABLET: return <Tablet size={10} className="mr-1"/>;
      case AssetType.UNIFORM: return <Shirt size={10} className="mr-1"/>;
      case AssetType.DASH_CAM: return <Camera size={10} className="mr-1"/>;
      case AssetType.ID_BADGE: return <IdCard size={10} className="mr-1"/>;
      default: return <Briefcase size={10} className="mr-1"/>;
    }
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b-2 border-brand-gold/50 text-xs uppercase tracking-widest text-brand-dark font-heritage">
                <th className="px-8 py-6 font-bold">Candidate</th>
                <th className="px-8 py-6 font-bold">Details</th>
                <th className="px-8 py-6 font-bold">Compliance</th>
                <th className="px-8 py-6 font-bold">Quality</th>
                <th className="px-8 py-6 font-bold">Assets</th>
                <th className="px-8 py-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {candidates.map(candidate => {
                  const assignedAssets = getAssignedAssets(candidate.id);
                  const isComplianceComplete = candidate.contractSigned && candidate.dbsStatus === 'Valid';
                  return (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                        <span className="font-bold text-brand-dark font-heritage uppercase tracking-wide group-hover:text-brand-gold transition-colors">{candidate.name}</span>
                        <span className="text-sm text-gray-500 font-light">{candidate.email}</span>
                        <span className="text-xs text-brand-green/80 font-mono mt-1">{candidate.mobile}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm">
                      <div className="flex flex-col gap-1 text-gray-600">
                          <span className="text-xs uppercase tracking-wide">📍 {candidate.location}</span>
                          <span className="text-xs uppercase tracking-wide">🅿️ {candidate.parkingStatus}</span>
                          {candidate.probationStatus && <span className="text-[10px] font-bold text-brand-gold border border-brand-gold px-1 rounded-sm w-fit mt-1">{candidate.probationStatus}</span>}
                      </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-2">
                        <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-bold border w-fit ${
                        candidate.status === CandidateStatus.HIRED ? 'border-brand-green text-brand-green' :
                        candidate.status === CandidateStatus.NEW ? 'border-blue-800 text-blue-800' :
                        candidate.status === CandidateStatus.CHURNED ? 'border-red-800 text-red-800' :
                        'border-gray-300 text-gray-500'
                        }`}>
                        {candidate.status}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isComplianceComplete ? 'bg-brand-green' : 'bg-red-500'}`} />
                            <span className="text-[10px] uppercase text-gray-500">{isComplianceComplete ? 'Compliant' : 'Incomplete'}</span>
                        </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex text-brand-gold">
                        {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-sm ${i < candidate.rating ? 'fill-current' : 'text-gray-200'}`}>★</span>
                        ))}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                      {assignedAssets.length > 0 ? (
                           <div className="flex flex-wrap gap-1">
                               {assignedAssets.map(a => (
                                   <span key={a.id} className="px-2 py-1 bg-brand-dark text-brand-gold border border-brand-green rounded-sm text-[10px] uppercase tracking-wider flex items-center">
                                       {getAssetIcon(a.type)}
                                       {a.name}
                                   </span>
                               ))}
                           </div>
                      ) : (
                          <span className="text-xs text-gray-300 italic font-serif">No assets</span>
                      )}
                  </td>
                  <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onHistory(candidate)}
                            className="p-2 text-gray-500 hover:text-brand-green transition-colors"
                            title="View History"
                        >
                            <Clock size={16} />
                        </button>
                        <button 
                            onClick={() => onEdit(candidate)}
                            className="p-2 text-gray-500 hover:text-brand-gold transition-colors"
                            title="View/Edit"
                        >
                            <Edit2 size={16} />
                        </button>
                        {userRole === UserRole.ADMIN && (
                            <button 
                                onClick={() => onDelete(candidate.id)}
                                className="p-2 text-gray-500 hover:text-red-700 transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                      </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default React.memo(CandidateTable);