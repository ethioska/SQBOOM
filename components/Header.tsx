import React from 'react';
import { SQLogo } from './icons';

const Header: React.FC = () => {
  return (
    <header className="flex items-center justify-center p-4 max-w-md mx-auto w-full h-16">
      <h1 className="text-xl font-black text-white tracking-widest uppercase">
        SQ BOOM
      </h1>
    </header>
  );
};

export default Header;
