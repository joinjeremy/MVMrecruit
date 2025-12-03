import React from 'react';
import { Asset, AssetStatus, AssetType, Candidate } from '../types';
import { X, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface AssetAllocatorProps {
  candidate: Candidate;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  readOnly?: boolean;
  onLog: (event: string, details?: string) => void;
}

const AssetAllocator: React.FC<AssetAllocatorProps> = ({ candidate, assets, setAssets, readOnly, onLog }) => {
  const { addToast } = useToast();
  const assignedAssets = assets.filter(a => a.allocatedToCandidateId === candidate.id);
  const availableAssets = assets.filter(a => a.status === AssetStatus.AVAILABLE);

  const handleAllocate = (assetId: string) => {
    if (readOnly) return;
    const assetToAssign = assets.find(a => a.id === assetId);
    if (!assetToAssign) return;

    const existingType = assignedAssets.find(a => a.type === assetToAssign.type);
    if (existingType) {
      addToast(`Conflict: This candidate already has a ${assetToAssign.type} assigned.`, 'warning');
      return;
    }

    onLog('Asset Allocated', `${assetToAssign.type} (${assetToAssign.name})`);
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: AssetStatus.ALLOCATED,
          allocatedToCandidateId: candidate.id,
          history: [ ...(a.history || []), { date: new Date().toISOString(), action: 'Allocated', candidateName: candidate.name }]
        };
      }
      return a;
    }));
  };

  const handleDeallocate = (assetId: string) => {
    if (readOnly) return;
    const assetToReturn = assets.find(a => a.id === assetId);
    if (!assetToReturn) return;

    onLog('Asset Returned', `${assetToReturn.type} (${assetToReturn.name})`);
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: AssetStatus.AVAILABLE,
          allocatedToCandidateId: undefined,
          history: [ ...(a.history || []), { date: new Date().toISOString(), action: 'Returned', candidateName: candidate.name }]
        };
      }
      return a;
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-brand-dark font-heritage uppercase tracking-widest mb-4">Allocation Record</h3>
      
      <div className="flex-1 bg-white p-6 rounded-sm border border-gray-200 flex flex-col shadow-sm mb-6">
        <div className="flex-1 overflow-y-auto max-h-48">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Issued Items</span>
          <div className="space-y-3">
            {assignedAssets.map(asset => (
              <div key={asset.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-sm border-l-2 border-brand-green">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-brand-dark font-heritage uppercase">{asset.name}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-wide">{asset.type}</span>
                </div>
                {!readOnly && (
                  <button onClick={() => handleDeallocate(asset.id)} className="text-gray-400 hover:text-red-600 transition-colors" title="Return to Inventory">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            {assignedAssets.length === 0 && <p className="text-xs text-gray-400 italic font-serif">No equipment currently issued.</p>}
          </div>
        </div>

        {!readOnly && (
          <div className="pt-6 border-t border-gray-100 mt-4">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Issue New Item</label>
            <select className="w-full p-3 text-sm border rounded-sm mb-2 bg-gray-50 focus:border-brand-gold outline-none" onChange={(e) => { if(e.target.value) { handleAllocate(e.target.value); e.target.value = ''; } }}>
              <option value="">Select asset from inventory...</option>
              {availableAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.name} - {asset.type}</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-brand-gold/10 p-6 rounded-sm border border-brand-gold/20">
        <h3 className="text-sm font-bold text-brand-dark font-heritage uppercase tracking-widest mb-4">Onboarding Protocol</h3>
        <ul className="space-y-3 text-xs">
          {[
            { label: 'Trade Plates', type: AssetType.TRADE_PLATE },
            { label: 'Company Fuel Card', type: AssetType.FUEL_CARD },
            { label: 'Tablet Device', type: AssetType.TABLET }
          ].map((item, i) => {
            const hasItem = assignedAssets.some(a => a.type === item.type);
            return (
              <li key={i} className="flex items-center space-x-3">
                {hasItem ? <div className="w-4 h-4 bg-brand-green rounded-full flex items-center justify-center text-white"><CheckCircle size={10} /></div> : <div className="w-4 h-4 border border-gray-400 rounded-full"></div>}
                <span className={`${hasItem ? 'text-brand-dark font-bold' : 'text-gray-500'} uppercase tracking-wide`}>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AssetAllocator;