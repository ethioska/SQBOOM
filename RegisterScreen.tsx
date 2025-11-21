
import React, { useState } from 'react';
import { useGame } from '../hooks/useGameLogic';

const OTP_CODE = '123456'; // Simulated OTP

const RegisterScreen: React.FC = () => {
  const { registerUser, setActiveScreen } = useGame();
  
  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [userDetails, setUserDetails] = useState({ fullName: '', phone: '', email: '', referralId: '' });
  const [otp, setOtp] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDetailsSubmit = () => {
    setError('');
    if (!userDetails.fullName.trim() || !userDetails.phone.trim() || !userDetails.email.trim()) {
        setError('All fields except Referral ID are required.');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userDetails.email)) {
        setError('Please enter a valid email address.');
        return;
    }
    
    setIsLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
        alert(`An OTP has been sent to your email. (For testing, use: ${OTP_CODE})`);
        setIsLoading(false);
        setStep('otp');
    }, 1000);
  };

  const handleVerifyOtp = () => {
    setError('');
    if (otp.trim() !== OTP_CODE) {
        setError('Invalid OTP. Please try again.');
        return;
    }

    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
        registerUser(userDetails);
        setIsLoading(false);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }


  return (
    <div className="bg-boom-dark text-white font-sans min-h-screen flex flex-col antialiased p-4">
        <div className="max-w-md mx-auto w-full flex flex-col flex-grow justify-center space-y-6">
            <h1 className="text-2xl font-bold text-boom-cyan text-center">
                {step === 'details' ? 'CREATE YOUR ACCOUNT' : 'VERIFY YOUR EMAIL'}
            </h1>

            {error && <p className="text-red-400 bg-red-500/10 p-2 rounded-md text-sm text-center">{error}</p>}
            
            {step === 'details' ? (
                <>
                    <div className="space-y-4">
                        <input
                            type="text"
                            name="fullName"
                            value={userDetails.fullName}
                            onChange={handleChange}
                            className="w-full bg-glass border border-boom-border rounded-lg p-4 text-white placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none transition-all"
                            placeholder="FULL NAME"
                        />
                        <input
                            type="email"
                            name="email"
                            value={userDetails.email}
                            onChange={handleChange}
                            className="w-full bg-glass border border-boom-border rounded-lg p-4 text-white placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none transition-all"
                            placeholder="GOOGLE GMAIL ACCOUNT"
                        />
                        <input
                            type="text"
                            name="phone"
                            value={userDetails.phone}
                            onChange={handleChange}
                            className="w-full bg-glass border border-boom-border rounded-lg p-4 text-white placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none transition-all"
                            placeholder="PHONE NUMBER"
                        />
                        <input
                            type="text"
                            name="referralId"
                            value={userDetails.referralId}
                            onChange={handleChange}
                            className="w-full bg-glass border border-boom-border rounded-lg p-4 text-white placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none transition-all"
                            placeholder="REFERRAL ID (OPTIONAL)"
                        />
                    </div>
                    
                    <div className="space-y-3 pt-2">
                      <button
                          onClick={handleDetailsSubmit}
                          disabled={isLoading}
                          className="w-full btn-primary py-4 disabled:opacity-50"
                      >
                          {isLoading ? 'SENDING OTP...' : 'REGISTER'}
                      </button>
                      <p className="text-center text-sm text-boom-text-gray">
                        Want to explore first? <button onClick={() => setActiveScreen('game')} className="font-semibold text-boom-cyan hover:underline">Back to Game</button>
                      </p>
                    </div>
                </>
            ) : (
                <>
                    <p className="text-center text-boom-text-gray text-sm">
                        Enter the 6-digit code sent to {userDetails.email}
                    </p>
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            maxLength={6}
                            className="w-full bg-glass border border-boom-border rounded-lg p-4 text-white text-center text-2xl tracking-[0.5em] placeholder:text-boom-text-gray focus:ring-2 focus:ring-boom-cyan focus:outline-none transition-all"
                            placeholder="_ _ _ _ _ _"
                        />
                    </div>
                    <div className="space-y-3 pt-2">
                      <button
                          onClick={handleVerifyOtp}
                          disabled={isLoading}
                          className="w-full btn-primary py-4 disabled:opacity-50"
                      >
                          {isLoading ? 'VERIFYING...' : 'VERIFY & CREATE ACCOUNT'}
                      </button>
                       <p className="text-center text-sm text-boom-text-gray">
                        Didn't receive code? <button onClick={() => setStep('details')} className="font-semibold text-boom-cyan hover:underline">Go Back</button>
                      </p>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};

export default RegisterScreen;
