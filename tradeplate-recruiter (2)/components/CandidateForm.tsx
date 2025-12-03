import React, { useState } from 'react';
import { Candidate, CandidateStatus, Asset, User, UserRole } from '../types';
import { User as UserIcon, FileCheck, Banknote, Briefcase, Save } from 'lucide-react';
import { isValidSortCode, isValidAccountNumber, isValidNINumber, formatSortCode } from '../utils/validation';
import AssetAllocator from './AssetAllocator';

interface CandidateFormProps {
  candidate: Candidate;
  assets: Asset[];
  users: User[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  onSave: (c: Candidate) => void;
  onCancel: () => void;
  currentUser: User;
  logHistoryEvent: (c: Candidate, event: string, details?: string) => Candidate;
}

const CandidateForm: React.FC<CandidateFormProps> = ({ candidate, assets, setAssets, onSave, onCancel, currentUser, users, logHistoryEvent }) => {
  const [formData, setFormData] = useState<Candidate>(candidate);
  const [activeTab, setActiveTab] = useState<'overview' | 'personal' | 'banking' | 'assets'>('overview');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const readOnly = currentUser.role === UserRole.READ_ONLY;
  const recruiters = users.filter(u => u.role === UserRole.RECRUITER);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (formData.bankDetails?.sortCode && !isValidSortCode(formData.bankDetails.sortCode)) newErrors.sortCode = "Invalid Sort Code (XX-XX-XX)";
    if (formData.bankDetails?.accountNumber && !isValidAccountNumber(formData.bankDetails.accountNumber)) newErrors.accountNumber = "Account Number must be 8 digits";
    if (formData.niNumber && !isValidNINumber(formData.niNumber)) newErrors.niNumber = "Invalid UK NI Number";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  const handleChange = (field: keyof Candidate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleNestedChange = (obj: 'bankDetails' | 'nextOfKin' | 'uniformSizes', field: string, value: string) => {
    setFormData(prev => ({ ...prev, [obj]: { ...prev[obj], [field]: value }}));
  }

  const handleAssetLog = (event: string, details?: string) => {
    const updatedCandidate = logHistoryEvent(formData, event, details);
    setFormData(updatedCandidate);
  };

  const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
    <div>
        <label className="block text-xs font-bold text-brand-dark font-heritage uppercase tracking-wider mb-2">{label}</label>
        {children}
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 bg-white px-8">
        {[
            { id: 'overview', label: 'Overview', icon: UserIcon },
            { id: 'personal', label: 'Legal & Compliance', icon: FileCheck },
            { id: 'banking', label: 'Financials', icon: Banknote },
            { id: 'assets', label: 'Assets & Equipment', icon: Briefcase }
        ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center space-x-3 px-6 py-5 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === tab.id ? 'border-brand-gold text-brand-dark' : 'border-transparent text-gray-400 hover:text-brand-green'}`}>
                <tab.icon size={16} /><span>{tab.label}</span>
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === 'overview' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <FormField label="Full Name">
                        <input disabled={readOnly} type="text" className={`w-full p-3 border rounded-sm outline-none ${errors.name ? 'border-red-500' : 'border-gray-200'}`} value={formData.name} onChange={e => handleChange('name', e.target.value)} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-6">
                      <FormField label="Status">
                          <select disabled={readOnly} className="w-full p-3 border border-gray-200 rounded-sm outline-none bg-white" value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                              {Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </FormField>
                      {currentUser.role === UserRole.ADMIN && (
                        <FormField label="Assigned Recruiter">
                          <select disabled={readOnly} className="w-full p-3 border border-gray-200 rounded-sm outline-none bg-white" value={formData.recruiterId || ''} onChange={e => handleChange('recruiterId', e.target.value)}>
                            <option value="">Unassigned / In-house</option>
                            {recruiters.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                          </select>
                        </FormField>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <FormField label="Email">
                            <input disabled={readOnly} type="email" className="w-full p-3 border border-gray-200 rounded-sm outline-none" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                        </FormField>
                        <FormField label="Mobile">
                            <input disabled={readOnly} type="text" className="w-full p-3 border border-gray-200 rounded-sm outline-none" value={formData.mobile} onChange={e => handleChange('mobile', e.target.value)} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Location">
                             <input disabled={readOnly} type="text" className="w-full p-3 border border-gray-200 rounded-sm outline-none" value={formData.location} onChange={e => handleChange('location', e.target.value)} />
                        </FormField>
                        <FormField label="Age">
                             <input 
                                disabled={readOnly} 
                                type="number" 
                                className="w-full p-3 border border-gray-200 rounded-sm outline-none" 
                                value={formData.age || ''} 
                                onChange={e => handleChange('age', e.target.value ? parseInt(e.target.value, 10) : undefined)} 
                             />
                        </FormField>
                    </div>
                </div>
                <div className="space-y-6">
                    <FormField label="Professional Summary">
                        <textarea disabled={readOnly} className="w-full p-3 border border-gray-200 rounded-sm h-48 resize-none outline-none" value={formData.experienceSummary} onChange={e => handleChange('experienceSummary', e.target.value)} />
                    </FormField>
                    <FormField label="Internal Notes">
                        <textarea disabled={readOnly} className="w-full p-3 border border-gray-200 rounded-sm h-24 resize-none outline-none" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} />
                    </FormField>
                </div>
             </div>
        )}
        {activeTab === 'personal' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <FormField label="NI Number">
                       <input disabled={readOnly} type="text" placeholder="e.g. QQ123456C" className={`w-full p-3 border rounded-sm outline-none ${errors.niNumber ? 'border-red-500' : 'border-gray-200'}`} value={formData.niNumber || ''} onChange={e => handleChange('niNumber', e.target.value.toUpperCase())} />
                        {errors.niNumber && <p className="text-red-500 text-xs mt-1">{errors.niNumber}</p>}
                   </FormField>
                   <FormField label="Driving License Number">
                       <input disabled={readOnly} type="text" className="w-full p-3 border rounded-sm outline-none" value={formData.drivingLicenseNumber || ''} onChange={e => handleChange('drivingLicenseNumber', e.target.value)} />
                   </FormField>
                   <div className="space-y-3 pt-6">
                        <label className="flex items-center">
                            <input disabled={readOnly} type="checkbox" className="h-4 w-4 text-brand-green rounded" checked={formData.contractSigned} onChange={e => handleChange('contractSigned', e.target.checked)} />
                            <span className="ml-3 text-sm font-bold text-brand-dark">Contract Signed & Returned</span>
                        </label>
                         <label className="flex items-center">
                            <input disabled={readOnly} type="checkbox" className="h-4 w-4 text-brand-green rounded" checked={formData.handbookIssued} onChange={e => handleChange('handbookIssued', e.target.checked)} />
                            <span className="ml-3 text-sm font-bold text-brand-dark">Driver Handbook Issued</span>
                        </label>
                    </div>
                </div>
                <div className="space-y-6">
                    <FormField label="DBS Check Status">
                        <select disabled={readOnly} className="w-full p-3 border border-gray-200 rounded-sm outline-none bg-white" value={formData.dbsStatus} onChange={e => handleChange('dbsStatus', e.target.value)}>
                           <option>Not Started</option>
                           <option>Requested</option>
                           <option>Valid</option>
                           <option>Expired</option>
                        </select>
                    </FormField>
                    <FormField label="DBS Expiry Date">
                         <input disabled={readOnly} type="date" className="w-full p-3 border border-gray-200 rounded-sm outline-none" value={formData.dbsExpiryDate || ''} onChange={e => handleChange('dbsExpiryDate', e.target.value)} />
                    </FormField>
                </div>
            </div>
        )}
        {activeTab === 'banking' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6 p-6 bg-white border border-gray-100 rounded-sm">
                    <h3 className="text-sm font-bold text-brand-dark font-heritage uppercase tracking-widest mb-4 border-b pb-2">Bank Details (for Self-Billing)</h3>
                    <FormField label="Bank Name">
                        <input disabled={readOnly} type="text" className="w-full p-3 border rounded-sm outline-none" value={formData.bankDetails?.bankName || ''} onChange={e => handleNestedChange('bankDetails', 'bankName', e.target.value)} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Sort Code">
                            <input disabled={readOnly} type="text" placeholder="XX-XX-XX" className={`w-full p-3 border rounded-sm outline-none ${errors.sortCode ? 'border-red-500' : 'border-gray-200'}`} value={formData.bankDetails?.sortCode || ''} onChange={e => handleNestedChange('bankDetails', 'sortCode', formatSortCode(e.target.value))} />
                            {errors.sortCode && <p className="text-red-500 text-xs mt-1">{errors.sortCode}</p>}
                        </FormField>
                        <FormField label="Account Number">
                           <input disabled={readOnly} type="text" placeholder="8 digits" className={`w-full p-3 border rounded-sm outline-none ${errors.accountNumber ? 'border-red-500' : 'border-gray-200'}`} value={formData.bankDetails?.accountNumber || ''} onChange={e => handleNestedChange('bankDetails', 'accountNumber', e.target.value.replace(/\D/g, ''))} maxLength={8} />
                           {errors.accountNumber && <p className="text-red-500 text-xs mt-1">{errors.accountNumber}</p>}
                        </FormField>
                    </div>
                </div>
                 <div className="space-y-6 p-6 bg-white border border-gray-100 rounded-sm">
                    <h3 className="text-sm font-bold text-brand-dark font-heritage uppercase tracking-widest mb-4 border-b pb-2">Next of Kin</h3>
                    <FormField label="Full Name">
                        <input disabled={readOnly} type="text" className="w-full p-3 border rounded-sm outline-none" value={formData.nextOfKin?.name || ''} onChange={e => handleNestedChange('nextOfKin', 'name', e.target.value)} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Relationship">
                            <input disabled={readOnly} type="text" className="w-full p-3 border rounded-sm outline-none" value={formData.nextOfKin?.relationship || ''} onChange={e => handleNestedChange('nextOfKin', 'relationship', e.target.value)} />
                        </FormField>
                        <FormField label="Mobile">
                           <input disabled={readOnly} type="text" className="w-full p-3 border rounded-sm outline-none" value={formData.nextOfKin?.mobile || ''} onChange={e => handleNestedChange('nextOfKin', 'mobile', e.target.value)} />
                        </FormField>
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'assets' && (
            <AssetAllocator 
                candidate={formData} 
                assets={assets} 
                setAssets={setAssets} 
                readOnly={readOnly} 
                onLog={handleAssetLog} 
            />
        )}
      </div>

      <div className="shrink-0 px-8 py-6 border-t border-gray-200 bg-white flex justify-end space-x-4">
        <button onClick={onCancel} className="px-8 py-3 text-gray-500 hover:text-brand-dark transition-colors uppercase text-xs tracking-widest font-bold">Cancel</button>
        {!readOnly && (
            <button onClick={handleSave} className="flex items-center space-x-3 px-8 py-3 bg-brand-dark text-brand-gold font-bold rounded-sm hover:bg-black transition-colors shadow-lg font-heritage uppercase tracking-wider text-sm">
                <Save size={16} />
                <span>Save Changes</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default CandidateForm;