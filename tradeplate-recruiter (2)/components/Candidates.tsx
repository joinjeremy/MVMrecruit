import React, { useState, useCallback, useMemo } from 'react';
import { Candidate, CandidateStatus, Asset, User, HistoryLog, UserRole } from '../types';
import { useToast } from '../context/ToastContext';
import { parseCandidateEmail } from '../services/geminiService';
import { returnAssetsFromCandidate } from '../services/assetService';
import { Search, Plus, Sparkles, Filter, Clock } from 'lucide-react';
import CandidateTable from './CandidateTable';
import CandidateModal from './CandidateModal';
import CandidateForm from './CandidateForm';
import CandidateHistoryModal from './CandidateHistoryModal';

interface CandidatesProps {
  candidates: Candidate[]; // Potentially filtered list
  allCandidates: Candidate[]; // The full list
  assets: Asset[];
  users: User[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  currentUser: User;
}

const Candidates: React.FC<CandidatesProps> = ({ candidates, allCandidates, setCandidates, assets, setAssets, currentUser, users }) => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [probationFilter, setProbationFilter] = useState<string>('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [modalMode, setModalMode] = useState<'parse' | 'edit'>('parse');
  const [rawText, setRawText] = useState('');
  
  const emptyCandidate: Candidate = {
    id: '', name: '', email: '', mobile: '', location: '', parkingStatus: '', licensePoints: '0',
    experienceSummary: '', availability: '', financialStatus: '', status: CandidateStatus.NEW,
    probationStatus: 'Probation (46%)', contractSigned: false, handbookIssued: false, dbsStatus: 'Not Started',
    rating: 3, notes: '', dateAdded: new Date().toISOString(), history: [],
    bankDetails: { bankName: '', sortCode: '', accountNumber: '', nameOnAccount: '' },
    nextOfKin: { name: '', relationship: '', mobile: '' },
    uniformSizes: { polo: 'L', jacket: 'L', hiviz: 'L' }
  };

  const [currentCandidate, setCurrentCandidate] = useState<Candidate>(emptyCandidate);

  const uniqueLocations = useMemo(() => Array.from(new Set(allCandidates.map(c => c.location).filter(Boolean))).sort(), [allCandidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || c.name.toLowerCase().includes(lowerSearch) || c.email.toLowerCase().includes(lowerSearch) || c.location.toLowerCase().includes(lowerSearch);
      const matchesStatus = statusFilter === '' || c.status === statusFilter;
      const matchesLocation = locationFilter === '' || c.location === locationFilter;
      const matchesProbation = probationFilter === '' || c.probationStatus === probationFilter;
      return matchesSearch && matchesStatus && matchesLocation && matchesProbation;
    });
  }, [candidates, searchTerm, statusFilter, locationFilter, probationFilter]);

  const logHistoryEvent = useCallback((candidate: Candidate, event: string, details?: string): Candidate => {
    const newLog: HistoryLog = {
      date: new Date().toISOString(),
      user: currentUser.initials,
      event,
      details
    };
    return { ...candidate, history: [...(candidate.history || []), newLog] };
  }, [currentUser.initials]);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setIsParsing(true);
    try {
      const parsedData = await parseCandidateEmail(rawText);
      let newCandidate = { ...emptyCandidate, ...parsedData, id: Date.now().toString(), dateAdded: new Date().toISOString() };
      
      if (currentUser.role === UserRole.RECRUITER) {
        newCandidate.recruiterId = currentUser.id;
      }
      
      newCandidate = logHistoryEvent(newCandidate, 'Profile Created via AI Parser');
      setCurrentCandidate(newCandidate);
      setModalMode('edit');
      addToast("Candidate data parsed successfully.", 'success');
    } catch (error) {
      addToast("Failed to parse data. Please check API key.", 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleSave = (candidate: Candidate) => {
    const existingIndex = allCandidates.findIndex(c => c.id === candidate.id);
    let updatedCandidate = { ...candidate };

    if (existingIndex >= 0) {
      const originalStatus = allCandidates[existingIndex].status;
      if (originalStatus !== candidate.status) {
        updatedCandidate = logHistoryEvent(updatedCandidate, 'Status changed', `From ${originalStatus} to ${candidate.status}`);
        if (candidate.status === CandidateStatus.CHURNED || candidate.status === CandidateStatus.REJECTED) {
            setAssets(prevAssets => returnAssetsFromCandidate(candidate.id, prevAssets));
            addToast(`Assets for ${candidate.name} returned to inventory.`, 'info');
        }
      } else {
        updatedCandidate = logHistoryEvent(updatedCandidate, 'Profile Updated');
      }

      const updated = [...allCandidates];
      updated[existingIndex] = updatedCandidate;
      setCandidates(updated);
      addToast("Candidate updated successfully.", 'success');
    } else {
      if (currentUser.role === UserRole.RECRUITER) {
        updatedCandidate.recruiterId = currentUser.id;
      }
      updatedCandidate = logHistoryEvent(updatedCandidate, 'Profile Created Manually');
      setCandidates(prev => [updatedCandidate, ...prev]);
      
      if (currentUser.role === UserRole.RECRUITER) {
        addToast("Candidate added and linked to your agency.", 'success');
      } else {
        addToast("New candidate added successfully.", 'success');
      }
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (currentUser.role !== UserRole.ADMIN) return;
    if (confirm("Are you sure? This will also return all allocated assets.")) {
      setAssets(prevAssets => returnAssetsFromCandidate(id, prevAssets));
      setCandidates(prev => prev.filter(c => c.id !== id));
      addToast("Candidate deleted and assets returned.", 'success');
    }
  };

  const openNewModal = () => {
    if (currentUser.role === 'Read Only') return;
    setRawText('');
    let newCandidate = { ...emptyCandidate, id: Date.now().toString() };
    if (currentUser.role === UserRole.RECRUITER) {
      newCandidate.recruiterId = currentUser.id;
    }
    setCurrentCandidate(newCandidate);
    setModalMode('parse');
    setIsModalOpen(true);
  };

  const openEditModal = (candidate: Candidate) => {
    const mergedCandidate = { ...emptyCandidate, ...candidate, history: candidate.history || [] };
    setCurrentCandidate(mergedCandidate);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const openHistoryModal = (candidate: Candidate) => {
    setCurrentCandidate(candidate);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search candidates..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-brand-gold bg-gray-50" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {currentUser.role !== 'Read Only' && (
            <button onClick={openNewModal} className="w-full md:w-auto flex-1 md:flex-none flex items-center justify-center space-x-2 px-8 py-3 bg-brand-dark text-brand-gold font-bold rounded-sm hover:bg-black transition-colors shadow-lg uppercase text-xs tracking-widest font-heritage">
              <Plus size={16} /><span>New Candidate</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
          <select className="w-full p-2.5 text-xs font-bold uppercase tracking-wide border border-gray-200 bg-gray-50 rounded-sm outline-none focus:border-brand-gold cursor-pointer text-brand-dark text-brand-dark" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {Object.values(CandidateStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="w-full p-2.5 text-xs font-bold uppercase tracking-wide border border-gray-200 bg-gray-50 rounded-sm outline-none focus:border-brand-gold cursor-pointer text-brand-dark text-brand-dark" value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            {uniqueLocations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select className="w-full p-2.5 text-xs font-bold uppercase tracking-wide border border-gray-200 bg-gray-50 rounded-sm outline-none focus:border-brand-gold cursor-pointer text-brand-dark text-brand-dark" value={probationFilter} onChange={(e) => setProbationFilter(e.target.value)}>
            <option value="">All Probation Levels</option>
            <option value="Probation (46%)">Probation (46%)</option>
            <option value="Standard (51%)">Standard (51%)</option>
          </select>
          <button onClick={() => { setSearchTerm(''); setStatusFilter(''); setLocationFilter(''); setProbationFilter(''); }} className="flex items-center justify-center space-x-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-brand-dark transition-colors border border-dashed border-gray-300 rounded-sm hover:border-brand-dark hover:bg-gray-50">
            <Filter size={14} /><span>Reset Filters</span>
          </button>
        </div>
      </div>

      <CandidateTable candidates={filteredCandidates} assets={assets} onEdit={openEditModal} onDelete={handleDelete} onHistory={openHistoryModal} userRole={currentUser.role} />

      <CandidateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'parse' ? 'AI Assistant' : 'Candidate Profile'}>
        {modalMode === 'parse' ? (
          <div className="p-8 space-y-6 overflow-y-auto">
            <textarea className="w-full h-72 p-6 border border-gray-200 rounded-sm focus:ring-1 focus:ring-brand-gold font-mono text-sm bg-white shadow-inner resize-none" placeholder="Paste email content here..." value={rawText} onChange={(e) => setRawText(e.target.value)} />
            <div className="flex justify-end space-x-6 items-center">
              <button onClick={() => setModalMode('edit')} className="text-gray-500 hover:text-brand-dark text-xs uppercase tracking-widest font-bold">Skip to Manual Entry</button>
              <button onClick={handleParse} disabled={isParsing || !rawText} className="flex items-center space-x-3 px-8 py-3 bg-brand-dark text-brand-gold font-bold rounded-sm hover:bg-black disabled:opacity-50 transition-colors shadow-lg font-heritage uppercase tracking-wider text-sm">
                {isParsing ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-gold border-t-transparent"></div> : <Sparkles size={16} />}
                <span>Process Data</span>
              </button>
            </div>
          </div>
        ) : (
          <CandidateForm candidate={currentCandidate} assets={assets} setAssets={setAssets} onSave={handleSave} onCancel={() => setIsModalOpen(false)} currentUser={currentUser} users={users} logHistoryEvent={logHistoryEvent} />
        )}
      </CandidateModal>
      
      {isHistoryModalOpen && (
        <CandidateHistoryModal candidate={currentCandidate} isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} />
      )}
    </div>
  );
};

export default Candidates;