import React from 'react';

/**
 * HierPrep Professional Geometric Logo Component
 * Precision engineered SVG badge avoiding generic AI tropes.
 */
export const HierPrepLogo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-base', badge: 'text-[9px]' },
    md: { icon: 32, text: 'text-xl', badge: 'text-[10px]' },
    lg: { icon: 40, text: 'text-2xl', badge: 'text-[11px]' },
    xl: { icon: 48, text: 'text-3xl', badge: 'text-xs' }
  };

  const current = sizes[size] || sizes.md;

  return (
    <div className={`inline-flex items-center gap-2.5 font-sans select-none ${className}`}>
      {/* Precision Geometric SVG Emblem */}
      <div className="relative flex items-center justify-center shrink-0">
        <svg
          width={current.icon}
          height={current.icon}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200 hover:scale-105"
        >
          {/* Base rounded squircle */}
          <rect
            width="48"
            height="48"
            rx="12"
            className="fill-slate-900 dark:fill-slate-900"
          />
          {/* Subtle perimeter border */}
          <rect
            x="0.75"
            y="0.75"
            width="46.5"
            height="46.5"
            rx="11.25"
            className="stroke-slate-700/60 dark:stroke-slate-800"
            strokeWidth="1.5"
          />

          {/* Left bracket chevron */}
          <path
            d="M17 15L10 24L17 33"
            stroke="url(#hp-grad-left)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right bracket chevron */}
          <path
            d="M31 15L38 24L31 33"
            stroke="url(#hp-grad-right)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central slash / node */}
          <path
            d="M27 13L21 35"
            stroke="url(#hp-grad-center)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Pulse Core Point */}
          <circle cx="24" cy="24" r="2.2" className="fill-indigo-400" />

          {/* Gradients */}
          <defs>
            <linearGradient id="hp-grad-left" x1="10" y1="15" x2="17" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
            <linearGradient id="hp-grad-right" x1="38" y1="15" x2="31" y2="33" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="hp-grad-center" x1="27" y1="13" x2="21" y2="35" gradientUnits="userSpaceOnUse">
              <stop stopColor="#A855F7" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Wordmark */}
      {showText && (
        <div className="flex flex-col text-left leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${current.text} font-black tracking-tight text-slate-900 dark:text-white`}>
              Hier<span className="text-indigo-600 dark:text-indigo-400">Prep</span>
            </span>
            <span className={`${current.badge} font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 tracking-wider uppercase`}>
              PRO
            </span>
          </div>
          <span className="text-[10px] font-medium text-slate-400 tracking-wide mt-0.5">
            ENGINEERING ECOSYSTEM
          </span>
        </div>
      )}
    </div>
  );
};

export default HierPrepLogo;

