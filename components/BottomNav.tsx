import React from 'react';
import type { Screen } from '../types';
import { GameIcon, WalletIcon, TransferCoinsIcon, ChatIcon, SettingsIcon } from './icons';

interface BottomNavProps {
  activeScreen: Screen;
  setActiveScreen: (screen: Screen) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center w-full pt-3 pb-2 transition-colors duration-200 group ${
      isActive ? 'text-boom-gold' : 'text-boom-text-gray hover:text-white'
    }`}
  >
    {isActive && <span className="absolute top-0 w-8 h-1 bg-boom-gold rounded-full" style={{boxShadow: 'var(--glow-gold)'}}></span>}
    {icon}
    <span className={`text-xs mt-1 font-medium ${isActive ? 'text-boom-gold' : 'text-boom-text-gray group-hover:text-white'}`}>{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, setActiveScreen }) => {
  const navItems = [
    { id: 'game', label: 'Game', icon: <GameIcon className="w-6 h-6" /> },
    { id: 'wallet', label: 'Wallet', icon: <WalletIcon className="w-6 h-6" /> },
    { id: 'transfer', label: 'Transfer', icon: <TransferCoinsIcon className="w-6 h-6" /> },
    { id: 'chat', label: 'Chat', icon: <ChatIcon className="w-6 h-6" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md bg-glass border border-boom-border rounded-2xl shadow-lg z-20">
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(item => (
          <NavItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activeScreen === item.id}
            onClick={() => setActiveScreen(item.id as Screen)}
          />
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
