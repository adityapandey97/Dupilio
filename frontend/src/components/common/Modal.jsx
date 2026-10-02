import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Card from './Card';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md', // sm, md, lg, xl
  closeOnOutsideClick = true
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={handleOutsideClick}
    >
      <div className={`w-full ${sizeClasses[size]} transform transition-all duration-300 scale-100`}>
        <Card className="relative overflow-hidden border border-slate-200/80 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
            {title && (
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800"
            >
              <X size={18} />
            </button>
          </div>
          <div className="max-h-[75vh] overflow-y-auto">
            {children}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Modal;
