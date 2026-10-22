import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className={`border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative flex flex-col transition-colors ${
          isDark 
            ? 'bg-[#141417] border-neutral-800 text-neutral-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer ${
            isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            isDestructive 
              ? isDark 
                ? 'bg-rose-950/70 border-rose-800/80 text-rose-400' 
                : 'bg-rose-50 border-rose-200 text-rose-600'
              : isDark
              ? 'bg-neutral-800 border-neutral-700 text-white'
              : 'bg-slate-100 border-slate-300 text-slate-800'
          }`}>
            {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {title}
            </h3>
            <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              {message}
            </p>
          </div>
        </div>

        <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${
          isDark ? 'border-neutral-800/80' : 'border-slate-200'
        }`}>
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
              isDark 
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white' 
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wide transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                : isDark
                ? 'bg-white hover:bg-neutral-200 text-neutral-950'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
            }`}
          >
            {isDestructive && <Trash2 className="w-3.5 h-3.5" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
