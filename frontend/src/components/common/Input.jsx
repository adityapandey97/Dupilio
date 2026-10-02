import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  type = 'text',
  error,
  placeholder = '',
  className = '',
  icon,
  required = false,
  ...props
}, ref) => {
  return (
    <div className={`w-full text-left ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 dark:text-slate-400">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative rounded-md shadow-sm">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={`block w-full rounded-lg border ${
            error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-200 focus:border-purple-500 focus:ring-purple-500 dark:border-slate-800'
          } ${
            icon ? 'pl-10' : 'pl-4'
          } pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 dark:bg-slate-900/40 dark:hover:bg-slate-900 dark:focus:bg-slate-950 dark:text-slate-200`}
          placeholder={placeholder}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error.message || error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
