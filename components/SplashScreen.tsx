
import React, { useEffect, useState } from 'react';
import { Fan } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [shouldFade, setShouldFade] = useState(false);

  useEffect(() => {
    // Start fade out after 2.2 seconds
    const timer1 = setTimeout(() => setShouldFade(true), 2200);
    // Unmount after 2.5 seconds
    const timer2 = setTimeout(onFinish, 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B142F] transition-opacity duration-500 ease-in-out ${shouldFade ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="relative flex flex-col items-center">
        {/* Logo */}
        <Fan className="w-20 h-20 md:w-28 md:h-28 text-[#FE5800] mb-5" />
        
        {/* Brand Text */}
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-2 font-sans">
          PTT<span className="text-[#FE5800]">.Risk</span>
        </h1>
        <p className="text-blue-200 text-sm tracking-widest uppercase font-semibold">
          Engineering Delivery Portal
        </p>

        {/* Loading Indicator */}
        <div className="mt-12 w-48 h-1.5 bg-[#1e2e5c] rounded-full overflow-hidden">
          <div className="h-full bg-[#FE5800] animate-progress-indeterminate rounded-full"></div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-8 text-blue-400 text-xs font-medium">
        Powered by Intelligent Data
      </div>
    </div>
  );
};

export default SplashScreen;
