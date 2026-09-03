import React, { useState } from 'react';
import {
  Box,
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import CaptchaCanvas from '../components/CaptchaCanvas.jsx';

export default function Login() {
  const { login, authError, clearAuthError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [actualCaptcha, setActualCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [shake, setShake] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleCaptchaChange = (newCode) => {
    setActualCaptcha(newCode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    if (!username.trim()) {
      setLocalError('Please enter your username');
      triggerShake();
      return;
    }
    if (!password) {
      setLocalError('Please enter your password');
      triggerShake();
      return;
    }
    if (!captchaInput.trim()) {
      setLocalError('Please enter the CAPTCHA verification code');
      triggerShake();
      return;
    }

    setIsLoading(true);

    // Simulate authenticating for realistic polished feel
    setTimeout(async () => {
      const res = await login({
        username,
        password,
        captchaInput,
        actualCaptcha,
      });

      setIsLoading(false);

      if (!res.success) {
        setLocalError(res.error);
        triggerShake();
      } else {
        setLoginSuccess(true);
      }
    }, 400);
  };

  const displayedError = localError || authError;

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center relative overflow-hidden grid-bg px-4 py-8 select-none">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card container */}
      <div
        className={`w-full max-w-md glass rounded-2xl border border-vertex-cyan/30 shadow-2xl p-7 relative z-10 transition-all duration-300 ${
          shake ? 'animate-shake' : ''
        }`}
        style={{
          boxShadow: '0 0 50px rgba(6, 182, 212, 0.15), 0 20px 40px rgba(0, 0, 0, 0.6)',
        }}
      >
        {/* Glowing Top Accent Line */}
        <div className="absolute -top-[1px] left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-vertex-cyan to-transparent" />

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-xl bg-gradient-to-br from-vertex-cyan/20 to-vertex-blue/30 border border-vertex-cyan/40 shadow-glow mb-3">
            <Box size={32} className="text-vertex-cyan animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-wider text-white flex items-center justify-center gap-2">
            VERTEX <span className="text-vertex-cyan text-xs font-mono uppercase px-2 py-0.5 rounded bg-vertex-cyan/10 border border-vertex-cyan/30">v1.0</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
            3D Property Intelligence Platform
          </p>
        </div>

        {/* Error Notification Alert */}
        {displayedError && (
          <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span className="flex-1 font-medium">{displayedError}</span>
          </div>
        )}

        {/* Success Notification Alert */}
        {loginSuccess && (
          <div className="mb-5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
            <span className="flex-1 font-medium">Authentication verified. Launching platform...</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 tracking-wide">
              Username
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <User size={16} />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (displayedError) clearAuthError();
                }}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950/70 border border-vertex-border text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-vertex-cyan focus:ring-1 focus:ring-vertex-cyan transition-all"
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 tracking-wide">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (displayedError) clearAuthError();
                }}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950/70 border border-vertex-border text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-vertex-cyan focus:ring-1 focus:ring-vertex-cyan transition-all"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 focus:outline-none"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* CAPTCHA Section */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-vertex-cyan" />
                Security CAPTCHA
              </label>
              <span className="text-[10px] text-slate-400 font-mono">Case-insensitive</span>
            </div>

            <div className="space-y-2">
              <CaptchaCanvas onCaptchaChange={handleCaptchaChange} />

              <input
                type="text"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  if (displayedError) clearAuthError();
                }}
                placeholder="Type the 6-character code"
                maxLength={6}
                className="w-full px-4 py-2.5 rounded-lg bg-slate-950/70 border border-vertex-border text-slate-100 text-sm font-mono tracking-widest uppercase placeholder:normal-case placeholder:font-sans placeholder-slate-500 focus:outline-none focus:border-vertex-cyan focus:ring-1 focus:ring-vertex-cyan transition-all text-center"
              />
            </div>
          </div>

          {/* Remember me & Security status */}
          <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer hover:text-slate-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-vertex-cyan focus:ring-vertex-cyan"
              />
              <span>Remember session</span>
            </label>
            <span className="text-[11px] font-mono text-vertex-cyan/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-vertex-cyan animate-ping" />
              TLS 256-bit Encrypted
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || loginSuccess}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-vertex-cyan via-sky-500 to-vertex-blue hover:opacity-95 text-slate-950 font-bold text-sm tracking-wide shadow-glow transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : loginSuccess ? (
              <>
                <CheckCircle2 size={18} className="text-slate-950" />
                <span>Authorized</span>
              </>
            ) : (
              <>
                <span>Sign In to CIPHERCORE</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Quick Role Fillers */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Quick Role Demo Sign In
          </div>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => {
                setUsername('surveyor');
                setPassword('surveyor123');
                setCaptchaInput(actualCaptcha || 'ABC123');
              }}
              className="px-2 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/40 text-blue-300 hover:bg-blue-900/60 font-semibold text-[11px] transition-all"
            >
              Surveyor
            </button>
            <button
              type="button"
              onClick={() => {
                setUsername('officer');
                setPassword('officer123');
                setCaptchaInput(actualCaptcha || 'ABC123');
              }}
              className="px-2 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 font-semibold text-[11px] transition-all"
            >
              Officer
            </button>
            <button
              type="button"
              onClick={() => {
                setUsername('admin');
                setPassword('admin123');
                setCaptchaInput(actualCaptcha || 'ABC123');
              }}
              className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-[11px] transition-all"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
