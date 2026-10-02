import React from 'react';

export const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20 focus:ring-purple-500 border border-transparent',
    secondary: 'bg-slate-200 hover:bg-slate-300 text-slate-800 focus:ring-slate-500 border border-transparent dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 focus:ring-red-500 border border-transparent',
    outline: 'border border-slate-300 bg-transparent text-slate-700 hover:bg-slate-50 focus:ring-slate-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400 dark:text-slate-400 dark:hover:bg-slate-850'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!loading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
export default Button;
