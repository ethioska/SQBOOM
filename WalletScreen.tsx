
import React, { useState, useEffect } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { TransferCoinsIcon, CopyIcon } from './icons';
import TransactionHistoryModal from './TransactionHistoryModal';
import LiquidityGraph from './LiquidityGraph';
import RealWorldAssetCharts from './RealWorldAssetCharts';

const Card: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`bg-glass border border-boom-border rounded-2xl p-4 shadow-lg ${className}`}>
      {children}
    </div>
);

const DataRow: React.FC<{ label: string; value: string | number; children?: React.ReactNode }> = ({ label, value, children }) => (
  <div className="flex justify-between items-center py-3">
    <p className="text-boom-text-gray text-sm">{label}</p>
    {children || <p className="text-white font-semibold">{value}</p>}
  </div>
);

const ExchangeRateDisplay: React.FC = () => {
    const { platformSettings } = useGame();
    const [usdToEtb, setUsdToEtb] = useState(152.44); // 250 ETB / 1.64 USD
    const sqToEtb = platformSettings.etbRate;

    useEffect(() => {
        const interval = setInterval(() => {
            setUsdToEtb(prevRate => {
                const change = (Math.random() - 0.5) * 0.2; // Small fluctuation
                return parseFloat((prevRate + change).toFixed(2));
            });
        }, 2000); // Update every 2 seconds

        return () => clearInterval(interval);
    }, []);

    const usdToSq = usdToEtb * sqToEtb;

    return (
        <Card className="text-center">
            <h3 className="text-white font-bold mb-2 text-md">Live Exchange Rate</h3>
            <div className="font-mono text-lg space-x-2 flex justify-center items-center flex-wrap">
                <span className="text-white">1 USD</span>
                <span className="text-boom-text-gray">=</span>
                <span className="text-boom-cyan">{usdToEtb.toFixed(2)} ETB</span>
                <span className="text-boom-text-gray">=</span>
                <span className="text-boom-gold">{usdToSq.toLocaleString(undefined, {maximumFractionDigits: 0})} SQ</span>
            </div>
            <p className="text-xs text-boom-text-gray mt-2 animate-pulse">Rates update in real-time</p>
        </Card>
    );
};


const WalletScreen: React.FC = () => {
  const { user, setActiveScreen, platformSettings } = useGame();
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const USD_TO_ETB_RATE = 152.44; // From user spec: 250 ETB / 1.64 USD

  const handleCopyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto space-y-5">
        <ExchangeRateDisplay />

        <Card className="text-center">
          <p className="text-boom-text-gray text-sm">TOTAL COINS</p>
          <h2 className="text-4xl font-extrabold text-white my-1">0</h2>
          <p className="text-boom-text-gray text-xs">EST. 0.00 ETB / EST. $0.00 USD</p>
        </Card>

        <Card>
          <h3 className="text-white font-bold mb-2 text-center">LIQUIDITY CHART</h3>
          <LiquidityGraph />
        </Card>
        
        <Card>
            <h3 className="text-white font-bold mb-2 text-center">GLOBAL MARKET OVERVIEW</h3>
            <RealWorldAssetCharts />
        </Card>

        <Card>
          <h3 className="text-white font-bold mb-2">FULL PROFILE</h3>
          <div className="divide-y divide-boom-border">
            <DataRow label="USER ID" value="N/A" />
            <DataRow label="NAME" value="Guest" />
            <DataRow label="PHONE NUMBER" value="N/A" />
            <DataRow label="LEVEL" value="-" />
          </div>
        </Card>
        
        <button
          onClick={() => setActiveScreen('settings')}
          className="relative w-full border-2 border-boom-cyan text-boom-cyan font-bold py-4 px-4 rounded-xl shadow-lg transition-all hover:bg-boom-cyan/10 active:scale-95 group"
        >
          <div className="absolute -inset-0.5 bg-boom-cyan rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <span className="relative flex items-center justify-center gap-2">
              <TransferCoinsIcon className="w-6 h-6"/>
              REGISTER TO TRANSFER
          </span>
        </button>
      </div>
    );
  }

  const totalBalance = user.coins + user.adCoins;
  const etbValue = (totalBalance / platformSettings.etbRate).toFixed(2);
  const usdValue = (parseFloat(etbValue) / USD_TO_ETB_RATE).toFixed(2);

  return (
    <>
      <div className="max-w-md mx-auto space-y-5">
        <ExchangeRateDisplay />
        <Card className="text-center">
          <p className="text-boom-text-gray text-sm">TOTAL COINS</p>
          <h2 className="text-5xl font-extrabold text-white my-1" style={{textShadow: 'var(--glow-gold)'}}>{totalBalance.toLocaleString(undefined, {maximumFractionDigits: 2})}</h2>
          <p className="text-boom-text-gray text-xs">EST. {etbValue} ETB / EST. ${usdValue} USD</p>
        </Card>

        <Card>
          <h3 className="text-white font-bold mb-2 text-center">LIQUIDITY CHART (SQ/ETB)</h3>
          <LiquidityGraph />
        </Card>
        
        <Card>
            <h3 className="text-white font-bold mb-2 text-center">GLOBAL MARKET OVERVIEW</h3>
            <RealWorldAssetCharts />
        </Card>

        <Card>
          <h3 className="text-white font-bold mb-2">FULL PROFILE</h3>
          <div className="divide-y divide-boom-border">
            <DataRow label="USER ID" value={user.id} />
            <DataRow label="NAME" value={user.name} />
            <DataRow label="PHONE NUMBER" value={user.phone} />
            <DataRow label="LEVEL" value={user.level} />
            <DataRow label="TAPS TODAY" value={user.tapsToday.toLocaleString()} />
            <DataRow label="INVITES" value={user.invites} />
            <DataRow label="ARCHIVE AD BALANCE" value={`${user.adCoins.toLocaleString()} COINS`} />
            <DataRow label="REFERRED BY" value={user.referralId || 'N/A'} />
             <DataRow label="YOUR REFERRAL ID">
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold font-mono">{user.id}</p>
                <button 
                    onClick={handleCopyId} 
                    className="text-boom-text-gray hover:text-white p-1 rounded-md transition-colors"
                    aria-label="Copy referral ID"
                >
                  {copiedId ? <span className="text-xs text-boom-cyan">Copied!</span> : <CopyIcon className="w-4 h-4" />}
                </button>
              </div>
            </DataRow>
          </div>
        </Card>
        
        <button
          onClick={() => setActiveScreen('transfer')}
          className="relative w-full border-2 border-boom-cyan text-boom-cyan font-bold py-4 px-4 rounded-xl shadow-lg transition-all hover:bg-boom-cyan/10 active:scale-95 group"
        >
          <div className="absolute -inset-0.5 bg-boom-cyan rounded-xl blur-lg opacity-20 group-hover:opacity-40 transition duration-300"></div>
          <span className="relative flex items-center justify-center gap-2">
              <TransferCoinsIcon className="w-6 h-6"/>
              TRANSFER COINS
          </span>
        </button>

        <div className="text-center">
          <button onClick={() => setIsHistoryModalOpen(true)} className="text-boom-text-gray hover:text-white text-sm underline transition-colors">
              Transfer History
          </button>
        </div>
      </div>
      {isHistoryModalOpen && user && (
        <TransactionHistoryModal
          transactions={user.transactions}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </>
  );
};

export default WalletScreen;
