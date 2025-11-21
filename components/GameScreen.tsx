import React, { useEffect, useState } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { SQLogoSmall, AdBonusIcon } from './icons';
import { DAILY_TAP_LIMIT } from '../constants';

const InfoCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`w-full bg-glass border border-boom-border rounded-2xl p-4 shadow-lg ${className}`}>
        {children}
    </div>
);

const AdDisplay: React.FC = () => {
    const { platformSettings } = useGame();
    if (!platformSettings.adText) return null;

    return (
        <InfoCard>
            <p className="text-sm text-center text-boom-gold animate-pulse font-semibold">{platformSettings.adText}</p>
        </InfoCard>
    );
};

const CouponRedeem: React.FC = () => {
    const { user, couponSettings, redeemCoupon } = useGame();
    const [code, setCode] = useState('');

    if (!user || !couponSettings.isEnabled) {
        return null;
    }

    const handleRedeem = () => {
        if(redeemCoupon(code)) {
            setCode('');
        }
    };
    
    const progress = (user.tapsSinceLastCoupon / couponSettings.requiredTaps) * 100;

    return (
        <InfoCard className="space-y-3">
            <div>
                <p className="text-white font-bold">{couponSettings.prompt || 'Special Bonus'}</p>
                <p className="text-xs text-boom-text-gray">Tap {couponSettings.requiredTaps} times to get a code!</p>
            </div>
             <div className="w-full bg-black/20 rounded-full h-1.5">
              <div className="bg-gradient-to-r from-boom-gold to-amber-500 h-1.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}></div>
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter Code"
                    className="flex-grow w-full bg-main-bg/50 border border-boom-border rounded-lg p-2 text-white placeholder:text-boom-text-gray focus:ring-1 focus:ring-boom-cyan focus:outline-none transition-all"
                />
                <button
                    onClick={handleRedeem}
                    className="bg-boom-gold text-black font-bold py-2 px-6 rounded-lg transition-all hover:bg-boom-gold/80 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
                >
                    REDEEM
                </button>
            </div>
        </InfoCard>
    );
};


const GameScreen: React.FC = () => {
  const { user, levelData, handleTap, claimAdBonus, adBonusCooldown, getFormattedProgress, addFlyingCoin, isProcessingTap, setActiveScreen, earnedCouponCode, setEarnedCouponCode } = useGame();

  useEffect(() => {
    if (earnedCouponCode) {
      const timer = setTimeout(() => {
        setEarnedCouponCode(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [earnedCouponCode, setEarnedCouponCode]);

  if (!user) {
    return (
       <div className="flex flex-col items-center h-full space-y-4 max-w-md mx-auto">
        <InfoCard className="flex justify-between items-center text-center opacity-50">
          <div>
              <p className="text-white font-bold text-sm">--</p>
              <p className="text-boom-text-gray text-xs">C/TAP</p>
          </div>
          <div className="h-full border-l border-boom-border"></div>
          <div>
              <p className="text-white font-bold text-sm">0 / {DAILY_TAP_LIMIT.toLocaleString()}</p>
              <p className="text-boom-text-gray text-xs">DAILY LIMIT</p>
          </div>
        </InfoCard>
        <div
          onClick={() => setActiveScreen('settings')}
          className="relative w-full aspect-square flex items-center justify-center cursor-pointer select-none"
        >
          <div className="absolute inset-0 bg-glass rounded-full border border-boom-border"></div>
          <div className="relative w-[80%] aspect-square bg-boom-gray rounded-full flex flex-col items-center justify-center shadow-2xl border border-boom-border">
              <SQLogoSmall className="w-16 h-16 opacity-50" />
              <p className="text-boom-text-gray text-sm mt-1">Register to Play</p>
          </div>
        </div>
        <InfoCard className="text-center">
          <p className="text-boom-text-gray">Register an account to start earning coins!</p>
        </InfoCard>
      </div>
    );
  }

  if (!levelData) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-boom-text-gray">Loading game data...</p>
      </div>
    );
  }

  const onTapped = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isProcessingTap || earnedCouponCode) return;
    handleTap();
    addFlyingCoin(e.clientX, e.clientY);
  };

  const formatCooldown = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const { progress, text: progressText, levelText } = getFormattedProgress();


  return (
    <div className="flex flex-col items-center h-full space-y-4 max-w-md mx-auto">
      <AdDisplay />

      <InfoCard className="flex justify-between items-center text-center">
        <div>
            <p className="text-white font-bold text-sm">+{levelData.ctap.toLocaleString()}</p>
            <p className="text-boom-text-gray text-xs">C/TAP</p>
        </div>
        <div className="h-full border-l border-boom-border"></div>
        <div>
            <p className="text-white font-bold text-sm">{user.tapsToday.toLocaleString()} / {DAILY_TAP_LIMIT.toLocaleString()}</p>
            <p className="text-boom-text-gray text-xs">DAILY LIMIT</p>
        </div>
      </InfoCard>

      <div
        onClick={onTapped}
        className={`relative w-full aspect-square flex items-center justify-center cursor-pointer select-none transition-transform active:scale-95 ${isProcessingTap ? 'pointer-events-none' : ''}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-boom-cyan/20 to-boom-gold/20 rounded-full animate-pulse-glow"></div>
        <div className="absolute inset-[5px] bg-boom-dark rounded-full"></div>
       
        <div className="relative w-[85%] aspect-square bg-gradient-to-br from-boom-gray to-secondary-bg/80 rounded-full flex flex-col items-center justify-center shadow-2xl border border-boom-border">
            <SQLogoSmall className="w-20 h-20" />
            <p className="text-boom-text-gray text-sm mt-1">Tap to Earn</p>
        </div>

        {earnedCouponCode && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm rounded-full">
                <div className="text-center animate-fade-in-out">
                    <p className="text-white/60 text-xs font-mono">CODE UNLOCKED</p>
                    <p className="text-white/90 font-bold text-4xl tracking-widest font-mono select-all" style={{textShadow: 'var(--glow-gold)'}}>
                        {earnedCouponCode}
                    </p>
                </div>
            </div>
        )}
      </div>
      
      <InfoCard>
        <div className="flex justify-between items-center mb-2">
            <p className="text-white font-semibold">{levelText}</p>
            <p className="text-boom-gold font-bold text-sm">{progress.toFixed(0)}%</p>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2.5">
          <div className="bg-gradient-to-r from-boom-cyan to-blue-400 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}></div>
        </div>
        <p className="text-boom-text-gray text-center text-xs mt-2">{progressText}</p>
      </InfoCard>
      
      <CouponRedeem />
      
      <InfoCard>
        <div className="flex items-center justify-between">
            <div className='flex items-center gap-3'>
                <AdBonusIcon className="w-10 h-10"/>
                <div>
                    <p className="text-white font-bold">AD BONUS</p>
                    <p className="text-boom-text-gray text-xs">{adBonusCooldown > 0 ? formatCooldown(adBonusCooldown) : '5 COINS / 03:00:00 COOLDOWN'}</p>
                </div>
            </div>
            <button
              onClick={claimAdBonus}
              disabled={adBonusCooldown > 0}
              className="bg-boom-cyan text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-cyan-500/20 active:scale-95"
            >
              {adBonusCooldown > 0 ? 'WAIT' : 'CLAIM'}
            </button>
        </div>
      </InfoCard>
    </div>
  );
};

export default GameScreen;
