import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../hooks/useGameLogic';

const NUM_DATA_POINTS = 50;

const generateInitialData = (baseRate: number): number[] => {
  const data = [baseRate];
  for (let i = 1; i < NUM_DATA_POINTS; i++) {
    const prev = data[i - 1];
    const changePercent = (Math.random() - 0.5) * 0.02; // Fluctuate by max 2%
    const next = prev * (1 + changePercent);
    data.push(next);
  }
  return data;
};

const LiquidityGraph: React.FC = () => {
  const { platformSettings } = useGame();
  const [data, setData] = useState<number[]>(() => generateInitialData(platformSettings.etbRate));

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastValue = prevData[prevData.length - 1];
        const changePercent = (Math.random() - 0.5) * 0.02;
        const nextValue = lastValue * (1 + changePercent);
        const newData = [...prevData.slice(1), nextValue];
        return newData;
      });
    }, 2000); // New data point every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const { path, min, max, strokeColor, lastValue } = useMemo(() => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;

    const path = data
      .map((d, i) => {
        const x = (i / (NUM_DATA_POINTS - 1)) * 100;
        const y = 100 - ((d - min) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    const firstValue = data[0];
    const lastValue = data[data.length - 1];
    let strokeColor = 'var(--text-secondary)'; // White/Gray for stable
    if (lastValue > firstValue * 1.001) strokeColor = '#22c55e'; // Green for gain
    if (lastValue < firstValue * 0.999) strokeColor = '#ef4444'; // Red for loss

    return { path, min, max, strokeColor, lastValue };
  }, [data]);

  return (
    <div className="w-full h-48 relative">
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <polyline
          fill="url(#gradient)"
          stroke={strokeColor}
          strokeWidth="0.5"
          points={path}
        />
      </svg>
      <div className="absolute top-0 left-0 text-xs p-1">
        <p className="text-boom-text-gray">HIGH: {max.toFixed(2)}</p>
        <p className="text-boom-text-gray">LOW: {min.toFixed(2)}</p>
      </div>
       <div className="absolute top-0 right-0 p-1 text-right">
         <p className="font-bold text-lg" style={{color: strokeColor}}>{lastValue.toFixed(2)}</p>
         <p className="text-xs text-boom-text-gray">SQ/ETB</p>
      </div>
    </div>
  );
};

export default LiquidityGraph;
