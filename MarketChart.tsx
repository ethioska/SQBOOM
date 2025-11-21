import React, { useState, useEffect, useMemo } from 'react';

const NUM_DATA_POINTS = 60;

interface MarketChartProps {
    basePrice: number;
    volatility: number; // e.g., 0.05 for 5%
    trend: number; // e.g., 0.001 for slight upward trend
    pair: string;
}

const generateInitialData = (basePrice: number, volatility: number, trend: number): number[] => {
  const data = [basePrice];
  for (let i = 1; i < NUM_DATA_POINTS; i++) {
    const prev = data[i - 1];
    const changePercent = (Math.random() - 0.5) * volatility;
    const next = prev * (1 + changePercent + trend);
    data.push(next);
  }
  return data;
};

const MarketChart: React.FC<MarketChartProps> = ({ basePrice, volatility, trend, pair }) => {
  const [data, setData] = useState<number[]>(() => generateInitialData(basePrice, volatility, trend));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastValue = prevData[prevData.length - 1];
        const changePercent = (Math.random() - 0.5) * volatility;
        const nextValue = lastValue * (1 + changePercent + trend);
        const newData = [...prevData.slice(1), nextValue];
        return newData;
      });
    }, 1500); // New data point every 1.5 seconds

    return () => clearInterval(interval);
  }, [volatility, trend]);

  const { path, min, max, strokeColor, lastValue, priceFormatOptions } = useMemo(() => {
    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const path = data
      .map((d, i) => {
        const x = (i / (NUM_DATA_POINTS - 1)) * 100;
        const y = 100 - ((d - minVal) / range) * 100;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');

    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    
    let strokeColor = 'var(--text-secondary)'; // White/Gray for stable
    if (lastValue > firstValue * 1.0005) strokeColor = '#22c55e'; // Green for gain
    if (lastValue < firstValue * 0.9995) strokeColor = '#ef4444'; // Red for loss
    
    const priceFormatOptions = {
        minimumFractionDigits: 2,
        maximumFractionDigits: lastValue > 1000 ? 2 : 4,
    };

    return { path, min: minVal, max: maxVal, strokeColor, lastValue, priceFormatOptions };
  }, [data]);

  const formatPrice = (price: number) => price.toLocaleString(undefined, priceFormatOptions);


  return (
    <div className="w-full h-48 relative">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${pair}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polyline
          fill={`url(#gradient-${pair})`}
          stroke={strokeColor}
          strokeWidth="0.5"
          points={path}
        />
      </svg>
      <div className="absolute top-0 left-0 text-xs p-1">
        <p className="text-boom-text-gray">HIGH: {formatPrice(max)}</p>
        <p className="text-boom-text-gray">LOW: {formatPrice(min)}</p>
      </div>
       <div className="absolute top-0 right-0 p-1 text-right">
         <p className="font-bold text-lg" style={{color: strokeColor}}>{formatPrice(lastValue)}</p>
         <p className="text-xs text-boom-text-gray">{pair}</p>
      </div>
    </div>
  );
};

export default MarketChart;