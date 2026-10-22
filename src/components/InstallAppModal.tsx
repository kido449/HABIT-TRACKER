import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useTheme } from '../context/ThemeContext';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Sparkles,
  QrCode,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { isInstallable, isInstalled, isIOS, isAndroid, isMobile, install } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'mobile' | 'desktop' | 'qr'>('mobile');
  const [copied, setCopied] = useState(false);

  // Compute best app URL to share/install
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const appUrl = currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')
    ? 'https://ais-pre-knya4ckb3gguvgohtl3sdk-680462031417.asia-east1.run.app'
    : currentOrigin || 'https://ais-pre-knya4ckb3gguvgohtl3sdk-680462031417.asia-east1.run.app';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDark 
            ? 'bg-[#121214] border-neutral-800 text-neutral-100' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          isDark ? 'border-neutral-800 bg-[#161619]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              isDark ? 'bg-neutral-900 border-neutral-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}>
              <Download className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Download &amp; Install HaBity
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono font-semibold">
                  PWA Ready
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Install on your Mobile home screen or Desktop taskbar with zero app-store hassle.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick 1-Click Install Button if supported by browser */}
        {isInstallable && (
          <div className={`p-4 border-b flex items-center justify-between gap-3 ${
            isDark ? 'border-neutral-800 bg-emerald-950/20' : 'border-slate-200 bg-emerald-50/60'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <p className={`text-xs font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-900'}`}>
                  Direct 1-Click Installation Available
                </p>
                <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Your browser supports instant installation right now.
                </p>
              </div>
            </div>

            <button
              onClick={handleNativeInstall}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Install Now</span>
            </button>
          </div>
        )}

        {/* Shareable App Link Card */}
        <div className="p-6 space-y-4">
          <div className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-[#18181c] border-neutral-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="min-w-0 flex-1 text-left">
              <span className={`text-[10px] font-mono uppercase tracking-wider block font-semibold ${
                isDark ? 'text-neutral-400' : 'text-slate-500'
              }`}>
                Direct App Link (Universal Mobile &amp; Desktop)
              </span>
              <span className={`text-xs font-mono font-medium truncate block mt-0.5 ${
                isDark ? 'text-neutral-200' : 'text-slate-800'
              }`}>
                {appUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : isDark
                    ? 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-white'
                    : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-2xs'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={appUrl}
                target="_blank"
                rel="noreferrer"
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  isDark ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white' : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
                }`}
                title="Open in new window"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Device Tabs */}
          <div className="flex items-center border-b border-neutral-800">
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'mobile'
                  ? 'border-emerald-500 text-emerald-500'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (iOS / Android)</span>
            </button>

            <button
              onClick={() => setActiveTab('desktop')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'desktop'
                  ? 'border-emerald-500 text-emerald-500'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (Mac / PC)</span>
            </button>

            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'qr'
                  ? 'border-emerald-500 text-emerald-500'
                  : isDark
                  ? 'border-transparent text-neutral-400 hover:text-neutral-200'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Scan QR Code</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="pt-2">
            {activeTab === 'mobile' && (
              <div className="space-y-3 text-xs leading-relaxed">
                {/* iPhone / iPad */}
                <div className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#151518] border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm">🍎 On iPhone / iPad (Safari)</span>
                  </div>
                  <ol className={`space-y-1.5 list-decimal list-inside ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    <li>Open this app link in <strong>Safari</strong> on your phone.</li>
                    <li>Tap the <strong>Share</strong> button <Share2 className="w-3 h-3 inline text-blue-400 mx-0.5" /> (square with upward arrow).</li>
                    <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                    <li>Tap <strong>&quot;Add&quot;</strong> in the top right. The app will appear on your home screen!</li>
                  </ol>
                </div>

                {/* Android / Chrome */}
                <div className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#151518] border-neutral-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm">🤖 On Android (Chrome / Brave / Edge)</span>
                  </div>
                  <ol className={`space-y-1.5 list-decimal list-inside ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    <li>Open this app link in <strong>Chrome</strong> on your phone.</li>
                    <li>Tap the <strong>three dots menu (&vellip;)</strong> in the top right.</li>
                    <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                    <li>Confirm install. The app launches standalone like a native APK.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeTab === 'desktop' && (
              <div className={`p-4 rounded-xl border space-y-3 ${
                isDark ? 'bg-[#151518] border-neutral-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-sm">💻 Desktop (Chrome, Edge, Brave, Safari)</span>
                </div>
                <p className={isDark ? 'text-neutral-300 text-xs' : 'text-slate-700 text-xs'}>
                  You can install this habit ledger as a desktop application with its own window, taskbar shortcut, and offline capabilities:
                </p>
                <div className={`p-3 rounded-lg border text-xs font-mono ${
                  isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-300' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  1. In <strong>Chrome / Edge</strong>, look at the right side of the address bar for the <strong>Install [&#x2B07;]</strong> icon.<br />
                  2. Click it and select <strong>&quot;Install&quot;</strong>.<br />
                  3. You can pin it to your Mac Dock or Windows Taskbar!
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="flex flex-col items-center justify-center p-4 space-y-3 text-center">
                <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-200">
                  <QRCodeSVG
                    value={appUrl}
                    size={180}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className={`text-xs font-semibold ${isDark ? 'text-neutral-200' : 'text-slate-800'}`}>
                  Point your phone&apos;s camera at this QR code to open the app instantly.
                </p>
                <p className={`text-[11px] ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Works with iPhone Camera, Android Camera, or Google Lens.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between text-xs font-mono ${
          isDark ? 'border-neutral-800 bg-[#161619] text-neutral-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center gap-1.5 text-emerald-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Works 100% Offline with Local State</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
              isDark ? 'bg-neutral-800 hover:bg-neutral-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
