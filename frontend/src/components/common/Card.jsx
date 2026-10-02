import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  onClick
}) => {
  const baseStyle = 'rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 dark:border-slate-800/80 dark:bg-slate-900/60';
  const hoverStyle = hoverEffect ? 'hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 cursor-pointer' : '';
  const glassStyle = glass ? 'backdrop-blur-md bg-white/70 dark:bg-slate-900/50' : '';
  const clickHandler = onClick ? { onClick, tabIndex: 0, role: 'button' } : {};

  return (
    <div
      className={`${baseStyle} ${hoverStyle} ${glassStyle} ${className}`}
      {...clickHandler}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-semibold text-slate-800 dark:text-slate-100 ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`${className}`}>{children}</div>
);

export default Card;
