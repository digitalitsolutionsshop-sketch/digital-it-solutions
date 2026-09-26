import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'badge' | 'receipt' | 'image-only';
  className?: string;
  showTagline?: boolean;
  showCscBadge?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '',
  showTagline = true,
  showCscBadge = true
}) => {
  // Height mappings for the official logo
  const heights = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-16 sm:h-18',
    xl: 'h-22 sm:h-26'
  };

  const shieldSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  // If variant is image-only, render the direct vector SVG asset
  if (variant === 'image-only') {
    return (
      <img 
        src="/logo.svg" 
        alt="Digital IT Solutions" 
        className={`${heights[size]} w-auto object-contain select-none ${className}`} 
      />
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Official Shield & Rising Arrow Emblem */}
      <div className={`relative ${shieldSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg 
          viewBox="0 0 140 145" 
          className="w-full h-full drop-shadow-sm" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Blue Shield Left Outline */}
          <path 
            d="M 68,10 C 50,14 26,18 16,30 C 13,56 16,84 32,106 C 44,122 58,131 68,136" 
            stroke="#0066B3" 
            strokeWidth="7" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Green Shield Right Lower Outline */}
          <path 
            d="M 68,136 C 76,132 88,124 98,110 C 108,96 112,82 114,70" 
            stroke="#22A349" 
            strokeWidth="7" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Top-Right Blue Arc */}
          <path 
            d="M 68,10 C 82,14 96,18 108,24" 
            stroke="#0066B3" 
            strokeWidth="7" 
            strokeLinecap="round" 
            fill="none" 
          />

          {/* Blue Circuit Traces (Left inside shield) */}
          <path d="M 28,88 L 28,62" stroke="#0066B3" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <circle cx="28" cy="56" r="5" fill="#0066B3" />

          <path d="M 40,98 L 40,46" stroke="#0066B3" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <circle cx="40" cy="40" r="5" fill="#0066B3" />

          <path d="M 52,106 L 52,40" stroke="#0066B3" strokeWidth="5.5" strokeLinecap="round" fill="none" />
          <circle cx="52" cy="34" r="5" fill="#0066B3" />

          {/* Green Circuit Branch with circular nodes */}
          <path 
            d="M 46,122 L 62,98 L 78,112 L 96,86" 
            stroke="#22A349" 
            strokeWidth="5.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          <circle cx="46" cy="122" r="5" fill="#22A349" />
          <circle cx="62" cy="98" r="5" fill="#22A349" />
          <circle cx="78" cy="112" r="5" fill="#22A349" />

          {/* Main Green Arrow Trunk & Upper Circuit */}
          <path 
            d="M 36,92 L 56,64 L 72,78 L 102,36" 
            stroke="#22A349" 
            strokeWidth="6.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none" 
          />
          <circle cx="36" cy="92" r="5.5" fill="#22A349" />
          <circle cx="56" cy="64" r="5.5" fill="#22A349" />
          <circle cx="72" cy="78" r="5.5" fill="#22A349" />

          {/* Bold Green Arrowhead breaking through top-right */}
          <path d="M 88,38 L 118,12 L 126,50 L 114,44 L 104,56 Z" fill="#22A349" />
          <polygon points="98,34 116,18 120,40 112,36 104,44" fill="#FFFFFF" />
          <line x1="90" y1="52" x2="114" y2="24" stroke="#22A349" strokeWidth="4.5" strokeLinecap="round" />
        </svg>

        {/* Optional CSC Authorized Badge overlay */}
        {showCscBadge && variant !== 'receipt' && (
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-[8px] font-black px-1.5 py-0.2 rounded-md shadow-xs border border-white">
            CSC
          </div>
        )}
      </div>

      {/* Typography: DIGITAL IT SOLUTIONS */}
      {variant !== 'badge' && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="font-extrabold tracking-tight text-[#0066B3] text-lg sm:text-xl lg:text-2xl font-sans">
              DIGITAL
            </span>
            <span className="font-extrabold tracking-tight text-slate-800 text-base sm:text-lg lg:text-xl font-sans">
              IT SOLUTIONS
            </span>
          </div>

          {showTagline && (
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-slate-600 mt-0.5">
              EMPOWERING YOUR FUTURE
            </span>
          )}

          {variant === 'full' && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] font-bold text-orange-700 bg-orange-50 border border-orange-200 px-1 rounded">
                सीएससी डिजिटल इंडिया केंद्र
              </span>
              <span className="text-[9px] text-slate-500 font-medium">
                पैगम्बरपुर (दरभंगा)
              </span>
            </div>
          )}

          {variant === 'receipt' && (
            <p className="text-[9px] text-slate-600 font-medium mt-1">
              VILLAGE PAIGHAMBERPUR, POST DARIMA, PS KEOTI, DARBHANGA BIHAR 847121 | MOB: 8340622912
            </p>
          )}

          {variant === 'compact' && (
            <span className="text-[10px] text-emerald-700 font-bold mt-0.5">
              CSC Cyber Cafe • 8340622912
            </span>
          )}
        </div>
      )}
    </div>
  );
};
