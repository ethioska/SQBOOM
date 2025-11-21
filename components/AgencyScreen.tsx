import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';
import { User, Role, PlatformSettings, CouponSettings } from '../types';
import { GoogleGenAI } from '@google/genai';

const PanelCard: React.FC<{ children: React.ReactNode, title: string }> = ({ children, title }) => (
    <div className="bg-glass border border-boom-border rounded-2xl p-4 space-y-3 shadow-lg">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        {children}
    </div>
);

const AgencyScreen: React.FC = () => {
  const { user, allUsers, setActiveScreen, platformSettings, couponSettings, updatePlatformSettings, toggleUserBan } = useGame();
  
  const [currentPlatformSettings, setCurrentPlatformSettings] = useState<PlatformSettings>(platformSettings);
  const [currentCouponSettings, setCurrentCouponSettings] = useState<CouponSettings>(couponSettings);
  
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');
  
  const [simulatedUsers, setSimulatedUsers] = useState<User[]>(allUsers.filter(u => u.role === 'USER'));

  // Simulate live user activity for the admin dashboard
  useEffect(() => {
    if (user?.role !== 'ADMIN') return;

    const activityInterval = setInterval(() => {
      setSimulatedUsers(currentUsers => {
        if (currentUsers.length === 0) return currentUsers;

        const userIndex = Math.floor(Math.random() * currentUsers.length);
        
        return currentUsers.map((u, index) => {
          if (index === userIndex && !u.isBanned) {
            const tapsToAdd = Math.floor(Math.random() * 5) + 1;
            const coinsToAdd = tapsToAdd * 0.002;
            return {
              ...u,
              tapsToday: u.tapsToday + tapsToAdd,
              coins: u.coins + coinsToAdd
            };
          }
          return u;
        });
      });
    }, 3000);

    return () => clearInterval(activityInterval);
  }, [user?.role]);

  const platformStats = useMemo(() => {
    if (user?.role !== 'ADMIN') return null;
    const allUserAccounts = allUsers.filter(u => u.role === 'USER');
    return {
      totalCoins: allUserAccounts.reduce((acc, u) => acc + u.coins + u.adCoins, 0),
      activeUsers: simulatedUsers.filter(u => u.tapsToday > 0).length,
      totalUsers: allUserAccounts.length
    };
  }, [allUsers, simulatedUsers, user?.role]);


  useEffect(() => {
    setCurrentPlatformSettings(platformSettings);
    setCurrentCouponSettings(couponSettings);
  }, [platformSettings, couponSettings]);

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT')) {
    return (
        <div className="max-w-md mx-auto text-center p-4">
            <h1 className="text-xl font-bold text-red-500">Access Denied</h1>
            <p className="text-boom-text-gray mt-2">You do not have permission to view this page.</p>
            <button onClick={() => setActiveScreen('game')} className="mt-4 text-boom-cyan hover:underline">Go to Game</button>
        </div>
    );
  }

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      setAiError('Please enter a prompt.');
      return;
    }
    setIsGenerating(true);
    setAiError('');
    setGeneratedContent('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setGeneratedContent(response.text.trim());
    } catch (error) {
      console.error('Gemini AI error:', error);
      setAiError('Failed to generate content. Please check the API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleSettingsUpdate = () => {
    updatePlatformSettings({
        platform: currentPlatformSettings,
        coupon: currentCouponSettings
    });
    alert('Settings have been updated!');
  };

  const panelTitle = user.role === 'ADMIN' ? 'Admin Panel' : 'Support Panel';
  const displayUsers = allUsers.filter(u => u.role === 'USER');

  return (
    <div className="max-w-md mx-auto space-y-5 pb-10">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setActiveScreen('settings')}
          className="text-boom-cyan hover:text-white text-sm"
        >
          &larr; Back to Settings
        </button>
        <h1 className="text-xl font-bold text-center text-white">{panelTitle}</h1>
        <div className="w-32 text-right"></div>
      </div>
      
      {user.role === 'ADMIN' && (
        <>
          {platformStats && (
            <PanelCard title="Platform Statistics">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-boom-gold">{platformStats.totalCoins.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-boom-text-gray">Total Coins in Circulation</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-boom-cyan">{platformStats.activeUsers} <span className="text-lg text-boom-text-gray">/ {platformStats.totalUsers}</span></p>
                  <p className="text-xs text-boom-text-gray">Active Participants (Today)</p>
                </div>
              </div>
            </PanelCard>
          )}

          <PanelCard title="Platform Controls">
            <div className="space-y-2">
                <label className="text-sm text-boom-text-gray" htmlFor="coinPrice">Daily Coin Price (SQ per ETB)</label>
                <input id="coinPrice" type="number" value={currentPlatformSettings.etbRate} onChange={e => setCurrentPlatformSettings(p => ({ ...p, etbRate: Number(e.target.value) }))} className="w-full bg-main-bg/50 border border-boom-border rounded-lg p-3 text-white placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm text-boom-text-gray" htmlFor="adText">Ad Text (Appears on Game Screen)</label>
                <input id="adText" type="text" value={currentPlatformSettings.adText} onChange={e => setCurrentPlatformSettings(p => ({ ...p, adText: e.target.value }))} placeholder="Enter new ad text" className="w-full bg-main-bg/50 border border-boom-border rounded-lg p-3 text-white placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none" />
            </div>
            <button onClick={handleSettingsUpdate} className="w-full btn-primary !py-2">Update Settings</button>
          </PanelCard>

          <PanelCard title="Coupon Management">
             <div className="flex items-center justify-between">
                <label className="text-sm text-boom-text-gray" htmlFor="isEnabled">Enable Coupon System</label>
                <input id="isEnabled" type="checkbox" checked={currentCouponSettings.isEnabled} onChange={e => setCurrentCouponSettings(c => ({...c, isEnabled: e.target.checked }))} className="h-5 w-5 rounded bg-boom-dark border-boom-border text-boom-cyan focus:ring-boom-cyan"/>
            </div>
            <div className="space-y-2">
                <label className="text-sm text-boom-text-gray" htmlFor="couponPrompt">Coupon Prompt (e.g., Baby Cat Asks...)</label>
                <input id="couponPrompt" type="text" value={currentCouponSettings.prompt} onChange={e => setCurrentCouponSettings(c => ({...c, prompt: e.target.value}))} className="w-full bg-main-bg/50 border border-boom-border rounded-lg p-3 text-white"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-2">
                    <label className="text-sm text-boom-text-gray" htmlFor="couponCode">Coupon Code</label>
                    <input id="couponCode" type="text" value={currentCouponSettings.code} onChange={e => setCurrentCouponSettings(c => ({...c, code: e.target.value}))} className="w-full bg-main-bg/50 border border-boom-border rounded-lg p-3 text-white"/>
                </div>
                 <div className="space-y-2">
                    <label className="text-sm text-boom-text-gray" htmlFor="couponReward">Coin Reward</label>
                    <input id="couponReward" type="number" value={currentCouponSettings.reward} onChange={e => setCurrentCouponSettings(c => ({...c, reward: Number(e.target.value)}))} className="w-full bg-main-bg/50 border border-boom-border rounded-lg p-3 text-white"/>
                </div>
            </div>
             <div className="space-y-2">
                <label className="text-sm text-boom-text-gray" htmlFor="requiredTaps">Required Taps</label>
                <input id="requiredTaps" type="number" value={currentCouponSettings.requiredTaps} onChange={e => setCurrentCouponSettings(c => ({...c, requiredTaps: Number(e.target.value)}))} className="w-full bg-main-bg/50 border border-boom-border rounded-lg p-3 text-white"/>
            </div>
            <button onClick={handleSettingsUpdate} className="w-full btn-primary !py-2">Update Settings</button>
          </PanelCard>

          <PanelCard title="AI Content Generator">
            <p className="text-sm text-boom-text-gray">Generate text for ads, tasks, or messages using Gemini AI.</p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-main-bg/50 border border-boom-border rounded-lg p-3 text-white placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none"
              placeholder="e.g., Create an exciting ad for a 500 coin weekend bonus"
              rows={3}
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerateContent}
              disabled={isGenerating}
              className="w-full btn-primary !py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
            {aiError && <p className="text-red-400 text-sm mt-2">{aiError}</p>}
            {generatedContent && (
                <div className="bg-boom-dark p-3 rounded-lg mt-2 space-y-2 border border-boom-border">
                    <div>
                        <h3 className="text-boom-text-gray text-xs mb-1">Generated Content:</h3>
                        <p className="text-white whitespace-pre-wrap text-sm">{generatedContent}</p>
                    </div>
                     <button onClick={() => setCurrentPlatformSettings(p => ({...p, adText: generatedContent}))} className="w-full text-sm bg-boom-gold/80 text-black font-bold py-2 rounded-lg transition-colors hover:bg-boom-gold">Use as Ad Text</button>
                </div>
            )}
          </PanelCard>
        </>
      )}

      {user.role === 'SUPPORT' && (
        <PanelCard title="Approve Requests">
            <div className="text-center p-4 bg-boom-dark rounded-lg">
                <p className="text-boom-text-gray text-sm">No pending requests for agency or inquiry approvals.</p>
            </div>
        </PanelCard>
      )}

      <PanelCard title="User Accounts">
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {displayUsers.map(u => (
            <div key={u.id} className="bg-boom-dark p-3 rounded-lg border border-boom-border">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <p className="font-bold text-white">{u.name} <span className={`text-xs font-mono ${u.isBanned ? 'text-red-400' : 'text-green-400'}`}>{u.isBanned ? 'BANNED' : 'ACTIVE'}</span></p>
                  <p className="text-xs text-boom-text-gray">{u.id}</p>
                </div>
                <p className="font-bold text-boom-gold">{(u.coins + u.adCoins).toLocaleString(undefined, {maximumFractionDigits: 0})} C</p>
              </div>
              <div className="flex gap-2 mt-2">
                 <button 
                    onClick={() => alert(`Viewing ledger for ${u.id}:\n` + u.transactions.map(t => `${t.type}: ${t.amount}`).join('\n') || 'No transactions.')}
                    className="flex-1 text-xs bg-boom-border text-white py-1 rounded-md hover:bg-boom-border/70"
                 >
                    Ledger
                 </button>
                 {user.role === 'ADMIN' && (
                    <button 
                        onClick={() => toggleUserBan(u.id)}
                        className={`flex-1 text-xs text-white py-1 rounded-md transition-colors ${u.isBanned ? 'bg-green-600 hover:bg-green-500' : 'bg-red-600 hover:bg-red-500'}`}
                    >
                        {u.isBanned ? 'Unban' : 'Ban'}
                    </button>
                 )}
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};

export default AgencyScreen;
