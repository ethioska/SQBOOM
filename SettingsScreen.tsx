
import React, { useState } from 'react';
import { useGame } from '../hooks/useGameLogic';
import ReportUserModal from './ReportUserModal';
import { LogoutIcon, ReportIcon, SunIcon, MoonIcon, SoundOnIcon, BrightnessIcon } from './icons';

const SettingsRow: React.FC<{ icon: React.ReactNode; label: string; control: React.ReactNode; }> = ({ icon, label, control }) => (
  <div className="flex items-center justify-between p-4">
    <div className="flex items-center gap-4">
      <span className="text-boom-text-gray">{icon}</span>
      <p className="text-white">{label}</p>
    </div>
    <div>{control}</div>
  </div>
);

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useGame();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 ${isDark ? 'bg-boom-cyan' : 'bg-gray-400'}`}
    >
      <span
        className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
};


const SettingsScreen: React.FC = () => {
  const { user, setActiveScreen, logout } = useGame();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="p-2 max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
        <div className="bg-glass border border-boom-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white text-center">Join SQ BOOM</h2>
           <p className="text-boom-text-gray text-sm text-center pb-2">Create an account to start earning and unlock all features.</p>
          <button
            onClick={() => setActiveScreen('register')}
            className="w-full btn-primary"
          >
            register this platform
          </button>
        </div>
      </div>
    );
  }

  // Agency View
  if (user.role === 'ADMIN' || user.role === 'SUPPORT' || user.role === 'RECEIVER') {
     return (
        <div className="p-2 max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>
          
          {(user.role === 'ADMIN' || user.role === 'SUPPORT') && (
            <div className="bg-glass border border-boom-border rounded-2xl p-6 space-y-4 text-left mb-4">
              <h2 className="text-lg font-semibold text-white text-center">Agency Access</h2>
              <p className="text-boom-text-gray text-sm text-center">Welcome, {user.name}. You have {user.role.toLowerCase()} privileges.</p>
              <button
                onClick={() => setActiveScreen('agency')}
                className="w-full btn-primary"
              >
                Enter Agency Panel
              </button>
            </div>
          )}

          <div className="bg-glass border border-boom-border rounded-2xl p-6 text-center">
            <h2 className="text-lg font-semibold text-white">Account Status</h2>
            <p className="text-boom-text-gray mt-2">
              {user.role === 'RECEIVER' && 'Your account is a verified agency coin receiver.'}
              {(user.role === 'ADMIN' || user.role === 'SUPPORT') && 'You can manage your settings from the Agency Panel.'}
            </p>
            <button onClick={logout} className="mt-4 w-full flex items-center justify-center gap-2 bg-red-600/20 text-red-400 font-bold py-3 rounded-lg transition-colors hover:bg-red-600/30">
              <LogoutIcon className="w-5 h-5"/>
              Logout
            </button>
          </div>
        </div>
      );
  }

  // Regular User View
  return (
    <>
      <div className="p-2 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-white mb-6">Settings</h1>
        
        <div className="bg-glass border border-boom-border rounded-2xl mb-4">
          <div className="divide-y divide-boom-border">
            <SettingsRow icon={<SunIcon className="w-6 h-6"/>} label="Light Mode" control={<ThemeToggle />} />
            <SettingsRow icon={<SoundOnIcon className="w-6 h-6"/>} label="Sound" control={<input type="range" className="w-24 h-1 accent-boom-cyan" defaultValue="80" />} />
            <SettingsRow icon={<BrightnessIcon className="w-6 h-6"/>} label="Brightness" control={<input type="range" className="w-24 h-1 accent-boom-cyan" defaultValue="100" />} />
          </div>
        </div>
        
        <div className="bg-glass border border-boom-border rounded-2xl">
           <div className="divide-y divide-boom-border">
              <button onClick={() => setIsReportModalOpen(true)} className="w-full text-left p-4 flex items-center gap-4 hover:bg-white/5 transition-colors rounded-t-2xl">
                <ReportIcon className="w-6 h-6 text-boom-text-gray"/>
                <span className="text-white">Report User</span>
              </button>
              <button onClick={logout} className="w-full text-left p-4 flex items-center gap-4 hover:bg-white/5 transition-colors rounded-b-2xl">
                <LogoutIcon className="w-6 h-6 text-red-400"/>
                <span className="text-red-400 font-semibold">Logout</span>
              </button>
            </div>
        </div>
      </div>
      {isReportModalOpen && (
        <ReportUserModal onClose={() => setIsReportModalOpen(false)} />
      )}
    </>
  );
};

export default SettingsScreen;
