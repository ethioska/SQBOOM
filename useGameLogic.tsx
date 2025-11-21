
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, Level, GameContextType, Screen, Role, PlatformSettings, CouponSettings, Transaction, ChatMessage } from '../types';
import { LevelRequirementType } from '../types';
import { LEVELS, DAILY_TAP_LIMIT, AD_BONUS_COINS, AD_BONUS_COOLDOWN_HOURS, PRIMARY_AGENCY_ID, VERIFIED_AGENCIES, MOCK_USERS } from '../constants';

const GameContext = createContext<GameContextType | undefined>(undefined);

const LS_KEYS = {
    USERS: 'sqboom_users',
    CHAT: 'sqboom_chat',
    PLATFORM_SETTINGS: 'sqboom_platform_settings',
    COUPON_SETTINGS: 'sqboom_coupon_settings',
    THEME: 'sqboom_theme',
    LAST_USER_ID: 'sqboom_lastUserId',
};

// Helper to safely parse JSON from localStorage
// Fix: Added a trailing comma inside the generic type parameter `<T,>` to disambiguate from JSX syntax in a .tsx file. This was causing a major parsing error.
const safeJSONParse = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error: any) {
        console.error(`Failed to parse ${key} from localStorage`, error);
        return defaultValue;
    }
};


export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- STATE INITIALIZATION FROM LOCALSTORAGE ---
  const [allUsers, setAllUsers] = useState<User[]>(() => safeJSONParse(LS_KEYS.USERS, MOCK_USERS));
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(() => safeJSONParse(LS_KEYS.PLATFORM_SETTINGS, { etbRate: 100, adText: '' }));
  const [couponSettings, setCouponSettings] = useState<CouponSettings>(() => safeJSONParse(LS_KEYS.COUPON_SETTINGS, { code: '', reward: 0, requiredTaps: 100, isEnabled: false, prompt: '' }));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => safeJSONParse(LS_KEYS.CHAT, []));
  
  const [theme, rawSetTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem(LS_KEYS.THEME);
    const initialTheme = (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
    if (initialTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    return initialTheme;
  });

  const [user, setUser] = useState<User | null>(() => {
    const lastUserId = localStorage.getItem(LS_KEYS.LAST_USER_ID);
    if (!lastUserId) return null;
    const users = safeJSONParse<User[]>(LS_KEYS.USERS, MOCK_USERS);
    return users.find(u => u.id === lastUserId) || null;
  });

  // --- NON-PERSISTENT STATE ---
  const [activeScreen, setActiveScreen] = useState<Screen>('game');
  const [earnedCouponCode, setEarnedCouponCode] = useState<string | null>(null);
  const [adBonusCooldown, setAdBonusCooldown] = useState(0);
  const [flyingCoins, setFlyingCoins] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isProcessingTap, setIsProcessingTap] = useState(false);
  
  const levelData = useMemo(() => user ? LEVELS.find(l => l.level === user.level)! : null, [user]);
  const nextLevelData = useMemo(() => user && levelData ? LEVELS.find(l => l.level === levelData.nextLevel) : null, [user, levelData]);

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem(LS_KEYS.USERS, JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem(LS_KEYS.CHAT, JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem(LS_KEYS.PLATFORM_SETTINGS, JSON.stringify(platformSettings)); }, [platformSettings]);
  useEffect(() => { localStorage.setItem(LS_KEYS.COUPON_SETTINGS, JSON.stringify(couponSettings)); }, [couponSettings]);
  useEffect(() => {
    localStorage.setItem(LS_KEYS.THEME, theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);
  
  // Sync logged-in user state with the master user list
  useEffect(() => {
    if (user) {
      const currentUserInList = allUsers.find(u => u.id === user.id);
      // Update user state if the master list has changed, preventing stale data
      if (currentUserInList && JSON.stringify(currentUserInList) !== JSON.stringify(user)) {
        setUser(currentUserInList);
      }
    }
  }, [allUsers, user]);

  // Dynamic ETB Rate Simulation
  useEffect(() => {
    if (user?.role === 'ADMIN') return; 
    const interval = setInterval(() => {
        setPlatformSettings(prev => {
            if (!prev.etbRate) return prev;
            const changePercent = (Math.random() - 0.5) * 0.005; 
            const change = prev.etbRate * changePercent;
            const newRate = parseFloat((prev.etbRate + change).toFixed(2));
            return { ...prev, etbRate: Math.max(1, newRate) };
        });
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const registerUser = useCallback((details: { fullName: string; phone: string; email: string; referralId?: string }) => {
    const existingUser = allUsers.find(u => u.email.toLowerCase() === details.email.toLowerCase());
    
    // If user exists, treat it as a login
    if (existingUser) {
        setUser(existingUser);
        localStorage.setItem(LS_KEYS.LAST_USER_ID, existingUser.id);
        setActiveScreen('game');
        return;
    }

    // Otherwise, create a new user
    const agency = VERIFIED_AGENCIES.find(a => a.email.toLowerCase() === details.email.toLowerCase());
    const userRole: Role = agency ? agency.role : 'USER';

    const newId = agency?.id || `SQB_${Date.now().toString().slice(-6)}`;
    const newUser: User = {
        id: newId,
        name: details.fullName,
        phone: details.phone,
        email: details.email,
        coins: 0,
        adCoins: 0,
        level: 1,
        invites: 0,
        tapsToday: 0,
        isBanned: false,
        role: userRole,
        referralId: details.referralId || PRIMARY_AGENCY_ID,
        claimedCoupons: [],
        tapsSinceLastCoupon: 0,
        transactions: [],
    };
    
    setAllUsers(prev => [...prev.filter(u => u.id !== newId), newUser]);
    setUser(newUser);
    localStorage.setItem(LS_KEYS.LAST_USER_ID, newUser.id);
    setActiveScreen('game');
  }, [allUsers]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_KEYS.LAST_USER_ID);
    setActiveScreen('game');
  };

  useEffect(() => {
    let timer: number;
    if (adBonusCooldown > 0) {
      timer = window.setInterval(() => {
        setAdBonusCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [adBonusCooldown]);

  const checkForLevelUp = useCallback((currentUser: User) => {
    if (!nextLevelData) return currentUser;
    let canLevelUp = false;
    const requirement = nextLevelData.requirement;
    switch (requirement.type) {
      case LevelRequirementType.COINS:
        if (currentUser.coins >= requirement.value) canLevelUp = true;
        break;
      case LevelRequirementType.INVITES:
        if (currentUser.invites >= requirement.value) canLevelUp = true;
        break;
      case LevelRequirementType.AGENCY_APPROVAL: break;
    }
    if (canLevelUp) {
      return { ...currentUser, level: currentUser.level + 1, coins: 0, invites: 0 };
    }
    return currentUser;
  }, [nextLevelData]);

  const handleTap = useCallback(async () => {
    if (!user || !levelData || isProcessingTap || user.tapsToday >= DAILY_TAP_LIMIT || user.isBanned) return;

    setIsProcessingTap(true);
    
    setAllUsers(prevAllUsers => {
      const userIndex = prevAllUsers.findIndex(u => u.id === user.id);
      if (userIndex === -1) {
        setIsProcessingTap(false);
        return prevAllUsers;
      }
      const currentUser = prevAllUsers[userIndex];
      const newTapsSinceCoupon = currentUser.tapsSinceLastCoupon + 1;
      let shouldShowAlert = false;
      if (couponSettings.isEnabled && newTapsSinceCoupon >= couponSettings.requiredTaps) {
          shouldShowAlert = true;
      }
      let updatedUser = {
        ...currentUser,
        coins: currentUser.coins + levelData.ctap,
        tapsToday: currentUser.tapsToday + 1,
        tapsSinceLastCoupon: shouldShowAlert ? 0 : newTapsSinceCoupon,
      };
      if (shouldShowAlert) {
        setEarnedCouponCode(couponSettings.code);
      }
      updatedUser = checkForLevelUp(updatedUser);
      const newAllUsers = [...prevAllUsers];
      newAllUsers[userIndex] = updatedUser;
      return newAllUsers;
    });
    setTimeout(() => setIsProcessingTap(false), 100);
  }, [user, levelData, isProcessingTap, checkForLevelUp, couponSettings, setEarnedCouponCode]);

  const claimAdBonus = useCallback(() => {
    if (!user || adBonusCooldown > 0) return;
    const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'AD_BONUS',
        amount: AD_BONUS_COINS,
        description: 'Claimed Ad Bonus',
        timestamp: Date.now(),
    };
    
    setAllUsers(prev => {
        const userIndex = prev.findIndex(u => u.id === user.id);
        if (userIndex === -1) return prev;
        const currentUser = prev[userIndex];
        const updatedUser = {
            ...currentUser,
            adCoins: currentUser.adCoins + AD_BONUS_COINS,
            coins: currentUser.coins + AD_BONUS_COINS,
            transactions: [newTransaction, ...(currentUser.transactions || [])],
        };
        const newAllUsers = [...prev];
        newAllUsers[userIndex] = updatedUser;
        return newAllUsers;
    });
    setAdBonusCooldown(AD_BONUS_COOLDOWN_HOURS * 60 * 60);
  }, [user, adBonusCooldown]);

  const handleTransfer = useCallback(async (recipientId: string, amount: number): Promise<boolean> => {
    if (!user || amount <= 0) return false;
    let success = false;
    setAllUsers(currentUsers => {
      const senderIndex = currentUsers.findIndex(u => u.id === user.id);
      const recipientIndex = currentUsers.findIndex(u => u.id === recipientId);
      if (senderIndex === -1 || recipientIndex === -1) return currentUsers;
      const sender = currentUsers[senderIndex];
      if (amount > sender.coins + sender.adCoins) return currentUsers;

      const sentTransaction: Transaction = { id: `txn_sent_${Date.now()}`, type: 'SENT', amount: amount, description: `Transferred to ID: ${recipientId}`, timestamp: Date.now() };
      const receivedTransaction: Transaction = { id: `txn_received_${Date.now()}`, type: 'RECEIVED', amount: amount, description: `Received from ID: ${sender.id}`, timestamp: Date.now() };
      
      let remainingAdCoins = sender.adCoins;
      let remainingCoins = sender.coins;
      if (amount <= remainingAdCoins) {
          remainingAdCoins -= amount;
      } else {
          const fromAd = remainingAdCoins;
          remainingAdCoins = 0;
          remainingCoins -= (amount - fromAd);
      }
      
      const updatedSender = { ...sender, coins: remainingCoins, adCoins: remainingAdCoins, transactions: [sentTransaction, ...(sender.transactions || [])] };
      const recipient = currentUsers[recipientIndex];
      const updatedRecipient = { ...recipient, coins: recipient.coins + amount, transactions: [receivedTransaction, ...(recipient.transactions || [])] };
      
      const newAllUsers = [...currentUsers];
      newAllUsers[senderIndex] = updatedSender;
      newAllUsers[recipientIndex] = updatedRecipient;
      success = true;
      return newAllUsers;
    });
    return success;
  }, [user]);

  const getFormattedProgress = useCallback(() => {
    if (!user || !levelData) return { progress: 100, text: 'Max Level Reached', levelText: `LEVEL ${user?.level}` };
    if (!nextLevelData) return { progress: 100, text: 'Max Level Reached', levelText: `LEVEL ${user.level}` };

    const req = nextLevelData.requirement;
    let current = 0;
    let target = req.value;
    let text = '';
    let levelText = `LEVEL ${user.level}/${nextLevelData.level-1}`;

    switch(req.type) {
      case LevelRequirementType.COINS: current = user.coins; text = `${current.toLocaleString()} / ${target.toLocaleString()} COINS`; break;
      case LevelRequirementType.INVITES: current = user.invites; text = `${current} / ${target} INVITES`; levelText = `LEVEL ${user.level}`; break;
      case LevelRequirementType.AGENCY_APPROVAL: return { progress: 0, text: 'AWAITING AGENCY APPROVAL', levelText: `LEVEL ${user.level}` };
    }
    const progress = Math.min((current / target) * 100, 100);
    return { progress, text, levelText };
  }, [user, levelData, nextLevelData]);

  const addFlyingCoin = useCallback((x: number, y: number) => {
    const newCoin = { id: Date.now() + Math.random(), x, y };
    setFlyingCoins(prev => [...prev, newCoin]);
    setTimeout(() => { setFlyingCoins(prev => prev.filter(c => c.id !== newCoin.id)); }, 1500);
  }, []);

  const getCoinPerTap = useCallback(() => levelData?.ctap || 0, [levelData]);

  const updatePlatformSettings = useCallback((settings: { platform: PlatformSettings, coupon: CouponSettings }) => {
    setPlatformSettings(settings.platform);
    setCouponSettings(settings.coupon);
  }, []);

  const redeemCoupon = useCallback((code: string): boolean => {
      if (!user || !couponSettings.isEnabled) return false;
      
      const currentUserInState = allUsers.find(u => u.id === user.id);
      if (!currentUserInState) return false;

      if (code.trim().toUpperCase() !== couponSettings.code.toUpperCase()) {
          alert('Invalid coupon code.');
          return false;
      }
      
      if (currentUserInState.claimedCoupons.includes(couponSettings.code)) {
          alert('You have already redeemed this coupon.');
          return false;
      }

      const newTransaction: Transaction = { id: `txn_${Date.now()}`, type: 'COUPON', amount: couponSettings.reward, description: `Redeemed coupon: ${couponSettings.code}`, timestamp: Date.now() };
      
      setAllUsers(prev => {
        const userIndex = prev.findIndex(u => u.id === user.id);
        if (userIndex === -1) return prev;
        
        const currentUser = prev[userIndex];
        if (currentUser.claimedCoupons.includes(couponSettings.code)) {
            return prev;
        }

        const updatedUser = { 
            ...currentUser, 
            coins: currentUser.coins + couponSettings.reward, 
            claimedCoupons: [...currentUser.claimedCoupons, couponSettings.code], 
            transactions: [newTransaction, ...(currentUser.transactions || [])] 
        };
        const newAllUsers = [...prev];
        newAllUsers[userIndex] = updatedUser;
        return newAllUsers;
      });
      
      setEarnedCouponCode(null);
      return true;
  }, [user, allUsers, couponSettings]);

  const setTheme = (newTheme: 'dark' | 'light') => { rawSetTheme(newTheme); };

  const toggleUserBan = useCallback((userId: string) => {
    setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, isBanned: !u.isBanned } : u));
  }, []);
  
  const sendMessage = useCallback((receiverId: string, text: string) => {
    if (!user) return;
    const newMessage: ChatMessage = { id: `msg_${Date.now()}`, text, senderId: user.id, receiverId: receiverId, timestamp: Date.now() };
    setChatMessages(prev => [...prev, newMessage]);

    const receiverIsAgency = VERIFIED_AGENCIES.find(a => a.id === receiverId);
    if (user.role === 'USER' && receiverIsAgency && (receiverIsAgency.role === 'ADMIN' || receiverIsAgency.role === 'SUPPORT')) {
        setTimeout(() => {
            const agencyReply: ChatMessage = { id: `msg_reply_${Date.now()}`, text: `Thank you for your message. We have received it and will get back to you shortly. (Automated Reply)`, senderId: receiverId, receiverId: user.id, timestamp: Date.now() };
            setChatMessages(prev => [...prev, agencyReply]);
        }, 1500);
    }
  }, [user]);

  const value: GameContextType = {
    user, allUsers, levelData, nextLevelData, platformSettings, couponSettings,
    earnedCouponCode, setEarnedCouponCode, updatePlatformSettings, redeemCoupon,
    adBonusCooldown, isProcessingTap, handleTap, claimAdBonus, handleTransfer,
    getFormattedProgress, activeScreen, setActiveScreen, flyingCoins,
    addFlyingCoin, getCoinPerTap, registerUser, theme, setTheme, logout,
    toggleUserBan, chatMessages, sendMessage,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
