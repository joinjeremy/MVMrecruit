import React from 'react';
import { X, Clock } from 'lucide-react';
import { Candidate } from '../types';

interface CandidateHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate;
}

const CandidateHistoryModal: React.FC<CandidateHistoryModalProps> = ({ isOpen, onClose, candidate }) => {
  if (!isOpen) return null;

  const sortedHistory = [...(candidate.history || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border-t-4 border-brand-green">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark font-heritage uppercase tracking-wider">
              {candidate.name}
            </h2>
            <p className="text-xs text-brand-gold uppercase tracking-widest mt-1">Activity Log</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-dark transition-colors"><X size={24} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
          <div className="space-y-6">
            {sortedHistory.length > 0 ? sortedHistory.map((log, index) => (
              <div key={index} className="flex space-x-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-brand-dark text-brand-gold flex items-center justify-center font-bold text-xs font-heritage">
                    {log.user}
                  </div>
                  <div className="w-px h-full bg-gray-200 mt-2"></div>
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-xs text-gray-400">
                    {new Date(log.date).toLocaleString()}
                  </p>
                  <div className="bg-white p-4 rounded-sm border border-gray-200 mt-1">
                    <p className="text-sm font-bold text-brand-dark">{log.event}</p>
                    {log.details && <p className="text-xs text-gray-500 mt-1 italic">"{log.details}"</p>}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-400 p-10 font-serif italic">
                No history recorded for this candidate.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateHistoryModal;