import React, { useRef } from 'react';
import { MONTH_NAMES } from '../utils/calendar';
import { useTheme } from '../context/ThemeContext';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw,
  Sun,
  Moon,
  Smartphone,
  Sparkles
} from 'lucide-react';

interface HeaderPanelProps {
  year: number;
  month: number;
  currentTime?: Date;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onOpenAddModal: () => void;
  onOpenInstallModal: () => void;
  onResetData: () => void;
  onExport: () => void;
  onImport: (content: string) => void;
}

export const HeaderPanel: React.FC<HeaderPanelProps> = ({
  year,
  month,
  currentTime,
  onYearChange,
  onMonthChange,
  onOpenAddModal,
  onOpenInstallModal,
  onResetData,
  onExport,
  onImport,
}) => {
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const years = Array.from({ length: 8 }, (_, i) => 2024 + i); // 2024 to 2031

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(11);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(0);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  const handleGoToday = () => {
    const today = new Date();
    onYearChange(today.getFullYear());
    onMonthChange(today.getMonth());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImport(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`border rounded-xl p-5 shadow-xl flex flex-col justify-between h-full relative overflow-hidden transition-colors duration-200 ${
      isDark 
        ? 'bg-[#121214] border-neutral-800/80 text-neutral-100' 
        : 'bg-white border-slate-200 shadow-slate-200/50 text-slate-900'
    }`}>
      {/* Background glow */}
      <div className={`absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
        isDark ? 'bg-blue-500/5' : 'bg-emerald-500/10'
      }`} />

      {/* Top Header Label & Persistence Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold shadow-inner ${
              isDark 
                ? 'bg-neutral-900 border-neutral-700/60 text-white' 
                : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}>
              <CalendarIcon className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <span className={`text-[10px] tracking-widest font-mono uppercase font-semibold block leading-tight ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                SPREADSHEET OS
              </span>
              <div className="flex items-center gap-2">
                <h1 className={`text-2xl font-extrabold tracking-tight flex items-center gap-2 ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  HaBity
                </h1>
                {currentTime && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1.5 shadow-2xs ${
                    isDark 
                      ? 'bg-neutral-900/90 border-neutral-700/80 text-emerald-400' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bright / Dark Mode Toggle Switch */}
          <div className={`flex items-center p-0.5 rounded-lg border text-xs font-medium transition-colors ${
            isDark 
              ? 'bg-neutral-900 border-neutral-800 text-neutral-300' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}>
            <button
              onClick={() => setTheme('light')}
              title="Switch to Bright (Light) Mode"
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                !isDark 
                  ? 'bg-white text-amber-600 font-bold shadow-2xs' 
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px]">Bright</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              title="Switch to Dark Mode"
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-all cursor-pointer ${
                isDark 
                  ? 'bg-neutral-800 text-white font-bold shadow-2xs' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px]">Dark</span>
            </button>
          </div>
        </div>

        <p className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
          High-performance habit ledger with real-time spreadsheet analytics and wellness logging.
        </p>

        {/* Quick Mobile / Desktop Download Banner */}
        <div 
          onClick={onOpenInstallModal}
          className={`mb-3 p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
            isDark 
              ? 'bg-neutral-900/90 hover:bg-neutral-800/90 border-emerald-500/30 text-neutral-200' 
              : 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2">
            <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-semibold">Download / Install on Mobile or Desktop</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
            Get App &rarr;
          </span>
        </div>

        {/* Calendar Settings: Year & Month Selectors */}
        <div className={`space-y-3 p-3.5 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-[#0d0d0f] border-neutral-800/80' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`text-[10px] uppercase font-mono tracking-wider font-semibold flex items-center justify-between ${
            isDark ? 'text-neutral-400' : 'text-slate-500'
          }`}>
            <span>Calendar Settings</span>
            <button
              onClick={handleGoToday}
              className={`text-[11px] transition-colors cursor-pointer flex items-center gap-1 px-2 py-0.5 rounded border ${
                isDark
                  ? 'text-neutral-300 hover:text-white bg-neutral-800/60 hover:bg-neutral-800 border-neutral-700/50'
                  : 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-300 shadow-2xs'
              }`}
            >
              Today
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Year Selector */}
            <div className="space-y-1">
              <label className={`text-[10px] font-mono uppercase ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Year
              </label>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => onYearChange(Number(e.target.value))}
                  className={`w-full border rounded-md px-3 py-1.5 text-sm font-semibold focus:outline-none cursor-pointer appearance-none transition-colors ${
                    isDark
                      ? 'bg-[#17171a] border-neutral-700/80 text-white focus:ring-1 focus:ring-neutral-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:ring-1 focus:ring-slate-400 shadow-2xs'
                  }`}
                >
                  {years.map((y) => (
                    <option key={y} value={y} className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>
                      {y}
                    </option>
                  ))}
                </select>
                <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${
                  isDark ? 'text-neutral-400' : 'text-slate-400'
                }`}>
                  ▼
                </div>
              </div>
            </div>

            {/* Month Selector */}
            <div className="space-y-1">
              <label className={`text-[10px] font-mono uppercase ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Month
              </label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => onMonthChange(Number(e.target.value))}
                  className={`w-full border rounded-md px-3 py-1.5 text-sm font-semibold focus:outline-none cursor-pointer appearance-none transition-colors ${
                    isDark
                      ? 'bg-[#17171a] border-neutral-700/80 text-white focus:ring-1 focus:ring-neutral-400'
                      : 'bg-white border-slate-300 text-slate-900 focus:ring-1 focus:ring-slate-400 shadow-2xs'
                  }`}
                >
                  {MONTH_NAMES.map((m, index) => (
                    <option key={m} value={index} className={isDark ? 'bg-neutral-900 text-white' : 'bg-white text-slate-900'}>
                      {m}
                    </option>
                  ))}
                </select>
                <div className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${
                  isDark ? 'text-neutral-400' : 'text-slate-400'
                }`}>
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Quick Month stepper */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handlePrevMonth}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors border cursor-pointer ${
                isDark
                  ? 'text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border-neutral-800'
                  : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200 shadow-2xs'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className={`text-xs font-mono font-bold ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
              {MONTH_NAMES[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors border cursor-pointer ${
                isDark
                  ? 'text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border-neutral-800'
                  : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-200 shadow-2xs'
              }`}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons & Utilities */}
      <div className={`mt-4 pt-4 border-t flex flex-col gap-2 ${
        isDark ? 'border-neutral-800/80' : 'border-slate-200'
      }`}>
        <button
          onClick={onOpenAddModal}
          className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98] cursor-pointer ${
            isDark
              ? 'bg-white hover:bg-neutral-200 text-neutral-950'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New Task / Habit</span>
        </button>

        <button
          onClick={onOpenInstallModal}
          className={`w-full py-2 px-3 rounded-lg border font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            isDark
              ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700/80 text-emerald-400'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Get Downloadable App (Mobile / Desktop)</span>
        </button>

        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={onExport}
            title="Export all data to JSON"
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded border text-[11px] transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Download className="w-3 h-3" />
            <span>Backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Import data from JSON backup"
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded border text-[11px] transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300 hover:text-white'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Restore</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={onResetData}
            title="Clear all habits and reset to an empty app"
            className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded border text-[11px] transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-rose-400'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-600 hover:text-rose-600'
            }`}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear All</span>
          </button>
        </div>
      </div>
    </div>
  );
};
