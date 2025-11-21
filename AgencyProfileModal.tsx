
import React from 'react';
import type { Agency } from '../types';
import { VerifiedWatermarkIcon } from './icons';

interface AgencyProfileModalProps {
  agency: Agency;
  onClose: () => void;
  onStartChat: () => void;
}

const AgencyProfileModal: React.FC<AgencyProfileModalProps> = ({ agency, onClose, onStartChat }) => {
  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4 animate-fade-in backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-glass border border-boom-border rounded-2xl w-full max-w-sm relative overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <VerifiedWatermarkIcon className="absolute -top-10 -right-10 w-48 h-48" />
        
        <div className="p-6 relative">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-boom-dark rounded-full flex items-center justify-center font-bold text-3xl text-boom-gold border-2 border-boom-border mb-4">
              {agency.name.charAt(0)}
            </div>
            <h2 className="text-2xl font-bold text-white">{agency.name}</h2>
            <p className="text-sm text-green-400 font-semibold">VERIFIED AGENCY</p>
            
            <div className="w-full text-left bg-boom-dark/50 border border-boom-border p-4 rounded-lg mt-6 space-y-3">
                <p className="text-boom-text-gray text-xs">AGENCY ID</p>
                <p className="font-mono text-white select-all">{agency.id}</p>
                <p className="text-boom-text-gray text-xs">EMAIL</p>
                <p className="text-white">{agency.email}</p>
                {agency.phone && (
                  <>
                    <p className="text-boom-text-gray text-xs">PHONE</p>
                    <p className="text-white">{agency.phone}</p>
                  </>
                )}
            </div>

            <div className="flex gap-3 w-full mt-6">
                 <button 
                    onClick={onClose} 
                    className="w-full bg-boom-border text-white font-bold py-3 rounded-lg transition-colors hover:bg-boom-border/70"
                 >
                    Close
                </button>
                <button 
                    onClick={onStartChat} 
                    className="w-full btn-primary"
                >
                    Start Chat
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgencyProfileModal;
