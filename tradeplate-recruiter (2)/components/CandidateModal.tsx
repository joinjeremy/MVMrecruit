import React from 'react';
import { X } from 'lucide-react';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const CandidateModal: React.FC<CandidateModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/80 backdrop-blur-md p-4">
      <div className="bg-white rounded-sm shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border-t-4 border-brand-gold">
        {/* Modal Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark font-heritage uppercase tracking-wider">
              {title}
            </h2>
            <p className="text-xs text-brand-gold uppercase tracking-widest mt-1">Confidential Record</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-brand-dark transition-colors"><X size={24} /></button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/30">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CandidateModal;