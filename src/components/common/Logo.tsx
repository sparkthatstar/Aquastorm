import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubText?: boolean;
  inverted?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showSubText = true,
  inverted = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', title: 'text-lg', sub: 'text-[10px]' },
    md: { icon: 'w-9 h-9', title: 'text-xl', sub: 'text-xs' },
    lg: { icon: 'w-12 h-12', title: 'text-2xl', sub: 'text-sm' },
    xl: { icon: 'w-16 h-16', title: 'text-3xl', sub: 'text-base' }
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand Icon Badge */}
      <div
        className={`${sizeClasses.icon} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-[#03098F] to-[#00AFD5] p-1.5 shadow-md shadow-blue-900/20 text-white flex-shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          {/* Water droplet + lightning storm icon */}
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" fill="rgba(255,255,255,0.2)" />
          <path d="M13 10l-3 4h4l-2 5" stroke="#FFFFFF" strokeWidth="2" />
        </svg>
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#00AFD5] rounded-full border-2 border-white animate-pulse" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center tracking-tight font-extrabold font-heading leading-tight">
          <span className={inverted ? 'text-white' : 'text-[#03098F]'}>AQUA</span>
          <span className="text-[#00AFD5]">STORM</span>
          <span className={`ml-1 text-[10px] tracking-widest uppercase font-mono px-1 py-0.5 rounded ${inverted ? 'bg-white/10 text-cyan-200' : 'bg-blue-50 text-[#03098F]'}`}>
            ENT
          </span>
        </div>
        {showSubText && (
          <div className="flex items-center gap-1.5 font-medium tracking-wide">
            <span className={`text-[11px] font-semibold tracking-wider uppercase ${inverted ? 'text-cyan-300' : 'text-[#00AFD5]'}`}>
              Fast. Fresh. Available.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
