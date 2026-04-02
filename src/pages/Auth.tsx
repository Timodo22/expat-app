// components/Auth.tsx
import React, { useState, useRef } from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { authClient, API_URL } from '../lib/authClient';
import logoEH from '../assets/logoEH.png';

type View = 'login' | 'register' | 'verify' | 'admin' | 'admin-verify' | 'forgot-password' | 'reset-password';

// ── Custom Logo Component ──────────────────────────────────────────────────
const MyLogo = ({ className = "" }: { className?: string }) => (
  <img 
    src={logoEH} 
    alt="EH Logo" 
    className={`object-contain h-24 w-auto ${className}`} 
  />
);

export default function Auth() {
  const [view, setView] = useState<View>('login');
  const [name, setName] = useState(''); // Used as "Company Name" during register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const reset = () => { setError(''); setSuccess(''); };

  const switchView = (v: View) => { reset(); setView(v); setCode(['', '', '', '', '', '']); };

  // ── Code input helpers ─────────────────────────────────────────────────────
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...code];
    digits.forEach((d, i) => { next[i] = d; });
    setCode(next);
    const nextEmpty = next.findIndex(d => !d);
    codeRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const codeValue = code.join('');

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    reset();

    try {
      // 1. ADMIN LOGIN (Step 1: check password, send email)
      if (view === 'admin') {
        const res = await fetch(`${API_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json() as any;
        if (!res.ok) throw new Error(data.error || 'Incorrect admin credentials.');
        
        setSuccess('Please check your email for the 6-digit 2FA code.');
        switchView('admin-verify');
        return;
      }

      // 2. ADMIN VERIFY (Step 2: check 2FA code)
      if (view === 'admin-verify') {
        if (codeValue.length < 6) { setError('Please enter all 6 digits.'); return; }
        const res = await fetch(`${API_URL}/api/admin/verify-2fa`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: codeValue }),
        });
        const data = await res.json() as any;
        if (!res.ok) throw new Error(data.error || 'Invalid code.');

        localStorage.setItem('authToken', data.token);
        if (data.user) localStorage.setItem('authUser', JSON.stringify(data.user));

        setSuccess('2FA Successful! Redirecting...');
        setTimeout(() => (window.location.href = '/admin'), 1000);
        return;
      }

      // 3. B2B REGISTRATION (Hardcoded role: 'b2b')
      if (view === 'register') {
        const result = await authClient.register({ email, password, name, role: 'b2b' });
        if (!result.success) throw new Error(result.error);
        switchView('verify');
        return;
      }

      // 4. NORMAL LOGIN (B2B or existing B2C)
      if (view === 'login') {
        const result = await authClient.login({ email, password });
        if (!result.success) {
          if (result.error === 'E-mailadres nog niet geverifieerd.' || result.unverified || result.error.includes('verified')) {
             setError('Your email is not verified yet. Please enter your code.');
             switchView('verify');
             return;
          }
          throw new Error(result.error);
        }
        setSuccess('Login successful! Redirecting...');
        const target = result.user?.role === 'b2b' ? '/portal/b2b' : '/portal/b2c';
        setTimeout(() => window.location.replace(target), 1000);
        return;
      }

      // 5. EMAIL VERIFICATION (New accounts)
      if (view === 'verify') {
        if (codeValue.length < 6) { setError('Please enter all 6 digits.'); return; }
        const result = await authClient.verifyCode({ email, code: codeValue });
        if (!result.success) throw new Error(result.error);
        setSuccess('Email address verified! Redirecting...');
        const target = result.user?.role === 'b2b' ? '/portal/b2b' : '/portal/b2c';
        setTimeout(() => window.location.replace(target), 1000);
        return;
      }

      // 6. FORGOT PASSWORD
      if (view === 'forgot-password') {
        const result = await authClient.forgotPassword(email);
        if (result.error) throw new Error(result.error);
        switchView('reset-password');
        setSuccess('If this account exists, a reset code has been sent to your email.');
        return;
      }

      // 7. RESET PASSWORD
      if (view === 'reset-password') {
        if (codeValue.length < 6) { setError('Please enter all 6 digits.'); return; }
        const result = await authClient.resetPassword({ email, code: codeValue, newPassword: password });
        if (result.error) throw new Error(result.error);
        setSuccess('Password successfully changed! You can now log in.');
        switchView('login');
        return;
      }

    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = view === 'admin' || view === 'admin-verify';

  // ── Verify & Reset Screens (Code inputs) ───────────────────────────────────
  if (view === 'verify' || view === 'reset-password' || view === 'admin-verify') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

          <div className="flex justify-center mb-6">
            {view === 'admin-verify' ? (
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
                <ShieldAlert size={24} className="text-white" />
              </div>
            ) : <MyLogo />}
          </div>

          <h2 className="text-2xl font-bold text-center text-[#0C3C4C] mb-2">
            {view === 'reset-password' ? 'Reset Password' : 
             view === 'admin-verify' ? 'Admin 2FA Verification' : 
             'Enter your verification code'}
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            We have sent a 6-digit code to<br />
            <strong>{email}</strong>
          </p>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-100">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handleCodePaste}>
              {code.map((digit, i) => (
                <input
                  key={i} ref={el => { codeRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleCodeChange(i, e.target.value)}
                  onKeyDown={e => handleCodeKeyDown(i, e)}
                  className={`w-11 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-colors ${digit ? 'border-[#0C3C4C] bg-[#0C3C4C]/5' : 'border-gray-200'} focus:border-[#0C3C4C]`}
                />
              ))}
            </div>

            {view === 'reset-password' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
                  required minLength={8}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || codeValue.length < 6}
              className={`w-full text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 ${view === 'admin-verify' ? 'bg-red-600' : 'bg-[#0C3C4C]'}`}
            >
              {loading ? 'Loading...' : view === 'reset-password' ? 'Save Password' : 'Verify code'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => switchView(view === 'admin-verify' ? 'admin' : view === 'verify' ? 'register' : 'login')}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── Main auth screens (Login, Register, Forgot Password, Admin) ────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
      
      {/* ── Main Auth Block ── */}
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 z-10">
        <div className="flex justify-center mb-6">
          {isAdmin ? (
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
              <ShieldAlert size={24} className="text-white" />
            </div>
          ) : (
            <MyLogo />
          )}
        </div>

        <h2 className="text-2xl font-bold text-center text-[#0C3C4C] mb-6">
          {isAdmin ? 'Admin Login' : 
           view === 'login' ? 'Portal Login' : 
           view === 'forgot-password' ? 'Forgot Password' : 'Company Registration'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-100">{success}</div>}

        {!isAdmin && view !== 'forgot-password' && (
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'login' ? 'bg-white shadow-sm text-[#0C3C4C]' : 'text-gray-500'}`}
              onClick={() => switchView('login')}
            >
              Log in
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'register' ? 'bg-white shadow-sm text-[#0C3C4C]' : 'text-gray-500'}`}
              onClick={() => switchView('register')}
            >
              Register
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
                placeholder="e.g. Tech Corp B.V."
              />
            </div>
          )}

          {view === 'forgot-password' && (
            <p className="text-sm text-gray-500 text-center mb-4">
              Enter your email address. We will send you a code to reset your password.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
            />
          </div>

          {(view === 'login' || view === 'register' || view === 'admin') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                {view === 'login' && (
                  <button type="button" onClick={() => switchView('forgot-password')} className="text-xs text-[#0C3C4C] hover:underline">
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
                required minLength={view === 'register' ? 8 : undefined}
              />
              {view === 'register' && <p className="text-xs text-gray-400 mt-1">Minimum 8 characters</p>}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className={`w-full text-white py-2 rounded-lg font-medium mt-2 transition-colors disabled:opacity-60 ${isAdmin ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0C3C4C] hover:bg-[#0a2f3b]'}`}
          >
            {loading ? 'Loading...' : 
             view === 'register' ? 'Register Company' : 
             view === 'forgot-password' ? 'Send code' :
             'Log in'}
          </button>
        </form>

        {view === 'forgot-password' && (
          <button
            type="button" onClick={() => switchView('login')}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Back to log in
          </button>
        )}
      </div>

      {/* ── B2C Redirection Block (ONLY visible during registration) ── */}
      {view === 'register' && (
        <div className="max-w-md w-full mt-6 bg-[#0C3C4C]/5 border border-[#0C3C4C]/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-[#0C3C4C]">Are you an expat (B2C)?</h4>
            <p className="text-xs text-gray-600 mt-0.5">Fill in your intake form directly here.</p>
          </div>
          <button 
            onClick={() => window.location.href = '/intake'} // Pas deze route aan naar jouw B2C intake pagina
            className="bg-white border border-gray-200 text-[#0C3C4C] text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2 transition-colors shrink-0 ml-4"
          >
            Go to intake <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Admin Toggle ── */}
      {(view === 'login' || view === 'admin') && (
        <button
          type="button" onClick={() => switchView(isAdmin ? 'login' : 'admin')}
          className="mt-6 text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isAdmin ? '← Back to portal login' : 'Admin portal login'}
        </button>
      )}
    </div>
  );
}