import React, { useState } from 'react';
import MarketChart from './MarketChart';

type Asset = 'BTC' | 'USDT';

const RealWorldAssetCharts: React.FC = () => {
    const [activeAsset, setActiveAsset] = useState<Asset>('BTC');

    const renderChart = () => {
        switch(activeAsset) {
            case 'BTC':
                return <MarketChart key="btc" basePrice={65000} volatility={0.025} trend={0.0001} pair="BTC/USDT" />;
            case 'USDT':
                return <MarketChart key="usdt" basePrice={152.44} volatility={0.005} trend={-0.00005} pair="USDT/ETB" />;
            default:
                return null;
        }
    };

    return (
        <div>
            <div className="flex justify-center border-b border-boom-border mb-2">
                <TabButton 
                    label="BTC/USDT" 
                    isActive={activeAsset === 'BTC'} 
                    onClick={() => setActiveAsset('BTC')}
                />
                <TabButton 
                    label="USDT/ETB" 
                    isActive={activeAsset === 'USDT'} 
                    onClick={() => setActiveAsset('USDT')}
                />
            </div>
            <div className="animate-fade-in">
                {renderChart()}
            </div>
            <p className="text-xs text-boom-text-gray text-center mt-2">
              Note: These charts are for simulation purposes only and do not represent live market data.
            </p>
        </div>
    );
}

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
                isActive 
                    ? 'text-boom-gold border-b-2 border-boom-gold' 
                    : 'text-boom-text-gray hover:text-white'
            }`}
        >
            {label}
        </button>
    );
};


export default RealWorldAssetCharts;
