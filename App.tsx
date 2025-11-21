
import React from 'react';
import GameScreen from './components/GameScreen';
import WalletScreen from './components/WalletScreen';
import ChatScreen from './components/ChatScreen';
import TransferScreen from './components/TransferScreen';
import SettingsScreen from './components/SettingsScreen';
import RegisterScreen from './components/RegisterScreen';
import AgencyScreen from './components/AgencyScreen';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import { GameProvider, useGame } from './hooks/useGameLogic';
import { PRIMARY_AGENCY_ID, VERIFIED_AGENCIES } from './constants';
import { WarningIcon } from './components/icons';

const AppContent: React.FC = () => {
  const { user, activeScreen, setActiveScreen, flyingCoins, getCoinPerTap } = useGame();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'wallet':
        return <WalletScreen />;
      case 'chat':
        return <ChatScreen />;
      case 'transfer':
        return <TransferScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'agency':
        return <AgencyScreen />;
      case 'register':
        return <RegisterScreen />;
      case 'game':
      default:
        return <GameScreen />;
    }
  };

  return (
    <>
      <div className="font-sans min-h-screen flex flex-col justify-between antialiased" style={{backgroundColor: 'var(--main-bg)', color: 'var(--text-primary)'}}>
        <Header />
        <main className="flex-grow p-4 pb-28 overflow-y-auto animate-fade-in">
          {renderScreen()}
        </main>
        <BottomNav activeScreen={activeScreen} setActiveScreen={setActiveScreen} />
      </div>
      
      {user && <div className="pointer-events-none fixed inset-0 z-50">
        {flyingCoins.map(coin => (
          <div
            key={coin.id}
            style={{ position: 'absolute', left: `${coin.x}px`, top: `${coin.y}px` }}
            className="text-lg font-bold animate-fly-up"
          >
            +{getCoinPerTap().toLocaleString()}
          </div>
        ))}
      </div>}
      <style>{`
        :root {
          --main-bg: #0A0E13;
          --secondary-bg: #121820;
          --glass-bg: rgba(22, 27, 34, 0.5);
          --border-color: rgba(255, 255, 255, 0.1);
          --text-primary: #E6EDF3;
          --text-secondary: #7D8590;
          --accent-gold: #FFD700;
          --accent-cyan: #00BFFF;
          --glow-cyan: 0 0 15px rgba(0, 191, 255, 0.6);
          --glow-gold: 0 0 15px rgba(255, 215, 0, 0.6);
        }
        html.light {
          --main-bg: #F0F2F5;
          --secondary-bg: #FFFFFF;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --border-color: #DCDFE4;
          --text-primary: #1C1E21;
          --text-secondary: #606770;
          --accent-gold: #F59E0B;
          --accent-cyan: #0088D1;
          --glow-cyan: 0 0 15px rgba(0, 136, 209, 0.5);
          --glow-gold: 0 0 15px rgba(245, 158, 11, 0.5);
        }
        body {
          background-color: var(--main-bg);
          color: var(--text-primary);
        }
        .text-boom-gold { color: var(--accent-gold); }
        .text-boom-blue { color: var(--accent-cyan); }
        .bg-boom-gray { background-color: var(--secondary-bg); }
        .border-boom-border { border-color: var(--border-color); }
        .text-boom-text-gray { color: var(--text-secondary); }
        .bg-boom-dark { background-color: var(--main-bg); }
        .text-white { color: var(--text-primary); }
        .divide-boom-border > :not([hidden]) ~ :not([hidden]) { border-color: var(--border-color); }

        .bg-glass {
            background-color: var(--glass-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
        
        .btn-primary {
            background-image: linear-gradient(to right, var(--accent-cyan), #00A9FF);
            color: white;
            font-weight: bold;
            border-radius: 0.75rem;
            padding: 0.75rem 1.5rem;
            transition: all 0.3s ease;
            box-shadow: 0 0 15px rgba(0, 191, 255, 0.2);
        }
        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: var(--glow-cyan);
        }

        @keyframes fly-up {
          0% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -350px) scale(0.5); opacity: 0; }
        }
        .animate-fly-up {
          animation: fly-up 1.5s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
          color: var(--accent-gold);
          text-shadow: var(--glow-gold);
        }

        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }

        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: scale(0.9); }
          10%, 90% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-out {
            animation: fade-in-out 10s ease-in-out forwards;
        }

        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        .animate-pulse-glow {
          animation: pulse-glow 4s infinite ease-in-out;
        }
      `}</style>
    </>
  );
};


const App: React.FC = () => {
  const isAgencyConfigured = VERIFIED_AGENCIES.some(agency => agency.id === PRIMARY_AGENCY_ID);

  if (!isAgencyConfigured) {
    return (
      <div className="bg-boom-dark text-white font-sans min-h-screen flex flex-col justify-center items-center antialiased p-4 text-center">
        <WarningIcon className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-red-400">Application Integrity Error</h1>
        <p className="text-boom-text-gray mt-2 max-w-sm">
          This version of the application is not authorized or has been tampered with. Please download the official version.
        </p>
      </div>
    );
  }

  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;
