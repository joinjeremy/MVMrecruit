import React, { useState } from 'react';
import { Asset, AssetStatus, AssetType, UserRole } from '../types';
import { Plus, Trash2, Tag, Truck, CreditCard, Tablet, Shirt, CheckCircle, Camera, IdCard, Briefcase } from 'lucide-react';

interface AssetsProps {
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  userRole: UserRole;
}

const Assets: React.FC<AssetsProps> = ({ assets, setAssets, userRole }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
      type: AssetType.TRADE_PLATE,
      status: AssetStatus.AVAILABLE,
      name: '',
      replacementCost: 180
  });

  const readOnly = userRole === UserRole.READ_ONLY;

  const handleAddAsset = () => {
      if(readOnly || !newAsset.name) return;
      const asset: Asset = {
          id: `a-${Date.now()}`,
          name: newAsset.name,
          type: newAsset.type as AssetType,
          status: AssetStatus.AVAILABLE,
          replacementCost: newAsset.replacementCost,
          notes: newAsset.notes,
          history: []
      };
      setAssets(prev => [...prev, asset]);
      setNewAsset({ type: AssetType.TRADE_PLATE, status: AssetStatus.AVAILABLE, name: '', replacementCost: 180 });
      setIsAdding(false);
  };

  const handleDelete = (id: string) => {
      if(readOnly || !confirm('Delete this asset?')) return;
      setAssets(prev => prev.filter(a => a.id !== id));
  };

  const updateDefaultCost = (type: AssetType) => {
      let cost = 0;
      switch(type) {
          case AssetType.TRADE_PLATE: cost = 180; break;
          case AssetType.TABLET: cost = 150; break;
          case AssetType.DASH_CAM: cost = 155; break;
          case AssetType.UNIFORM: cost = 120; break;
          case AssetType.FUEL_CARD: cost = 50; break;
          case AssetType.AA_CARD: cost = 50; break;
          case AssetType.ID_BADGE: cost = 25; break;
      }
      setNewAsset(prev => ({ ...prev, type, replacementCost: cost }));
  }

  const getIcon = (type: AssetType) => {
      switch(type) {
          case AssetType.TRADE_PLATE: return <Truck size={18} />;
          case AssetType.FUEL_CARD: return <CreditCard size={18} />;
          case AssetType.TABLET: return <Tablet size={18} />;
          case AssetType.UNIFORM: return <Shirt size={18} />;
          case AssetType.DASH_CAM: return <Camera size={18} />;
          case AssetType.ID_BADGE: return <IdCard size={18} />;
          case AssetType.AA_CARD: return <Briefcase size={18} />;
          default: return <Tag size={18} />;
      }
  };
  
  const getStatusColor = (status: AssetStatus) => {
      switch(status) {
          case AssetStatus.AVAILABLE: return 'bg-green-100 text-green-800 border-green-200';
          case AssetStatus.ALLOCATED: return 'bg-blue-100 text-blue-800 border-blue-200';
          case AssetStatus.MAINTENANCE: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
          case AssetStatus.LOST: return 'bg-red-100 text-red-800 border-red-200';
          default: return 'bg-gray-100';
      }
  };

  return (
      <div className="space-y-8">
          <div className="flex justify-between items-center bg-white p-6 rounded-sm shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-brand-dark font-heritage uppercase tracking-wider">Asset Inventory</h2>
              {!readOnly && (
                <button onClick={() => setIsAdding(!isAdding)} className="flex items-center space-x-3 px-6 py-3 bg-brand-dark text-brand-gold rounded-sm hover:bg-black transition-colors uppercase text-xs tracking-widest font-bold shadow-md">
                    <Plus size={16} />
                    <span>New Asset</span>
                </button>
              )}
          </div>

          {isAdding && !readOnly && (
              <div className="bg-white p-8 rounded-sm border-l-4 border-brand-green shadow-lg animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-sm font-bold text-brand-dark font-heritage uppercase tracking-widest mb-6">Register New Item</h3>
                  <div className="flex flex-wrap gap-6 items-end">
                      <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Asset Name / ID</label>
                          <input type="text" className="w-full p-3 border border-gray-200 rounded-sm focus:border-brand-gold outline-none bg-gray-50" placeholder="e.g. TP-402, Tablet #9" value={newAsset.name} onChange={e => setNewAsset({...newAsset, name: e.target.value})} />
                      </div>
                      <div className="w-56">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category</label>
                          <select className="w-full p-3 border border-gray-200 rounded-sm outline-none bg-gray-50" value={newAsset.type} onChange={e => updateDefaultCost(e.target.value as AssetType)}>
                              {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      </div>
                      <div className="w-40">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Value (£)</label>
                          <input type="number" className="w-full p-3 border border-gray-200 rounded-sm focus:border-brand-gold outline-none bg-gray-50" value={newAsset.replacementCost} onChange={e => setNewAsset({...newAsset, replacementCost: Number(e.target.value)})} />
                      </div>
                      <div className="flex space-x-3">
                        <button onClick={handleAddAsset} className="px-8 py-3 bg-brand-green text-white rounded-sm hover:bg-brand-dark transition-colors uppercase text-xs tracking-widest font-bold">Save</button>
                        <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-gray-400 hover:text-brand-dark transition-colors uppercase text-xs tracking-widest font-bold">Cancel</button>
                      </div>
                  </div>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assets.map(asset => (
                  <div key={asset.id} className="bg-white p-6 rounded-sm border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 relative group">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-4">
                              <div className={`p-3 rounded-sm bg-brand-dark text-brand-gold shadow-sm`}>{getIcon(asset.type)}</div>
                              <div>
                                  <h3 className="font-bold text-brand-dark font-heritage uppercase tracking-wide">{asset.name}</h3>
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-1">{asset.type} • £{asset.replacementCost}</p>
                              </div>
                          </div>
                          <span className={`px-2 py-1 text-[10px] uppercase font-bold tracking-widest border ${getStatusColor(asset.status)}`}>{asset.status}</span>
                      </div>
                      {!readOnly && (
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(asset.id)} className="p-2 text-gray-300 hover:text-red-700 bg-white rounded-sm shadow-sm border border-gray-100"><Trash2 size={16} /></button>
                        </div>
                      )}
                  </div>
              ))}
          </div>
      </div>
  );
};

export default Assets;