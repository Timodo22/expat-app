// components/Auth.tsx
import React, { useState, useRef } from 'react';
import { ShieldAlert } from 'lucide-react';
import { authClient, API_URL } from '../lib/authClient';
import logoEH from '../assets/logoEH.png';

type View = 'login' | 'register' | 'verify' | 'admin' | 'forgot-password' | 'reset-password';

// ── Eigen Logo Component ───────────────────────────────────────────────────
const MyLogo = ({ className = "" }: { className?: string }) => (
  <img 
    src={logoEH} 
    alt="EH Logo" 
    className={`object-contain h-24 w-auto ${className}`} 
  />
);

export default function Auth() {
  const [view, setView] = useState<View>('login');
  const [role, setRole] = useState<'b2c' | 'b2b'>('b2c');
  const [name, setName] = useState('');
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
      if (view === 'admin') {
        const res = await fetch(`${API_URL}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json() as any;
        if (!res.ok) throw new Error(data.error || 'Onjuiste admin inloggegevens.');
        
        localStorage.setItem('authToken', data.token);
        if (data.user) localStorage.setItem('authUser', JSON.stringify(data.user));

        setSuccess('Admin login succesvol! Bezig met doorsturen...');
        setTimeout(() => (window.location.href = '/admin'), 1000);
        return;
      }

      if (view === 'register') {
        const result = await authClient.register({ email, password, name, role });
        if (!result.success) throw new Error(result.error);
        switchView('verify');
        return;
      }

      if (view === 'login') {
        const result = await authClient.login({ email, password });
        if (!result.success) {
          if (result.error === 'E-mailadres nog niet geverifieerd.' || result.unverified) {
             setError('Je e-mail is nog niet geverifieerd. Vul je code in.');
             switchView('verify');
             return;
          }
          throw new Error(result.error);
        }
        setSuccess('Login succesvol! Bezig met doorsturen...');
        const target = result.user?.role === 'b2b' ? '/portal/b2b' : '/portal/b2c';
        setTimeout(() => window.location.replace(target), 1000);
        return;
      }

      if (view === 'verify') {
        if (codeValue.length < 6) { setError('Voer alle 6 cijfers in.'); return; }
        const result = await authClient.verifyCode({ email, code: codeValue });
        if (!result.success) throw new Error(result.error);
        setSuccess('E-mailadres geverifieerd! Bezig met doorsturen...');
        const target = result.user?.role === 'b2b' ? '/portal/b2b' : '/portal/b2c';
        setTimeout(() => window.location.replace(target), 1000);
        return;
      }

      if (view === 'forgot-password') {
        const result = await authClient.forgotPassword(email);
        if (result.error) throw new Error(result.error);
        switchView('reset-password');
        setSuccess('Als dit account bestaat, is er een code gestuurd naar je mail.');
        return;
      }

      if (view === 'reset-password') {
        if (codeValue.length < 6) { setError('Voer alle 6 cijfers in.'); return; }
        const result = await authClient.resetPassword({ email, code: codeValue, newPassword: password });
        if (result.error) throw new Error(result.error);
        setSuccess('Wachtwoord succesvol gewijzigd! Je kunt nu inloggen.');
        switchView('login');
        return;
      }

    } catch (err: any) {
      setError(err.message || 'Er is een onbekende fout opgetreden.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = view === 'admin';

  // ── Verify & Reset Screens (Code inputs) ───────────────────────────────────
  if (view === 'verify' || view === 'reset-password') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

          <div className="flex justify-center mb-6">
            <MyLogo />
          </div>

          <h2 className="text-2xl font-bold text-center text-[#0C3C4C] mb-2">
            {view === 'verify' ? 'Voer je verificatiecode in' : 'Wachtwoord resetten'}
          </h2>
          <p className="text-center text-sm text-gray-500 mb-6">
            We hebben een 6-cijferige code gestuurd naar<br />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw Wachtwoord</label>
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
              className="w-full bg-[#0C3C4C] text-white py-2 rounded-lg font-medium hover:bg-[#0a2f3b] transition-colors disabled:opacity-50"
            >
              {loading ? 'Bezig...' : view === 'verify' ? 'Verifieer code' : 'Wachtwoord opslaan'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => switchView(view === 'verify' ? 'register' : 'login')}
            className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Terug naar {view === 'verify' ? 'registreren' : 'inloggen'}
          </button>
        </div>
      </div>
    );
  }

  // ── Main auth screens (Login, Register, Forgot Password, Admin) ────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">

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
          {isAdmin ? 'Admin Portal Login' : 
           view === 'login' ? 'Welcome Back' : 
           view === 'forgot-password' ? 'Wachtwoord vergeten' : 'Account aanmaken'}
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
              Inloggen
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'register' ? 'bg-white shadow-sm text-[#0C3C4C]' : 'text-gray-500'}`}
              onClick={() => switchView('register')}
            >
              Registreren
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volledige naam</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account type</label>
                <select
                  value={role} onChange={e => setRole(e.target.value as 'b2c' | 'b2b')}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
                >
                  <option value="b2c">Expat (B2C)</option>
                  <option value="b2b">Corporate (B2B)</option>
                </select>
              </div>
            </>
          )}

          {view === 'forgot-password' && (
            <p className="text-sm text-gray-500 text-center mb-4">
              Vul je e-mailadres in. We sturen je een code om je wachtwoord te resetten.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
            />
          </div>

          {(view === 'login' || view === 'register' || view === 'admin') && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">Wachtwoord</label>
                {view === 'login' && (
                  <button type="button" onClick={() => switchView('forgot-password')} className="text-xs text-[#0C3C4C] hover:underline">
                    Wachtwoord vergeten?
                  </button>
                )}
              </div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
                required minLength={view === 'register' ? 8 : undefined}
              />
              {view === 'register' && <p className="text-xs text-gray-400 mt-1">Minimaal 8 tekens</p>}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className={`w-full text-white py-2 rounded-lg font-medium mt-2 transition-colors disabled:opacity-60 ${isAdmin ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0C3C4C] hover:bg-[#0a2f3b]'}`}
          >
            {loading ? 'Bezig...' : 
             view === 'register' ? 'Account aanmaken' : 
             view === 'forgot-password' ? 'Stuur code' :
             'Inloggen'}
          </button>
        </form>

        {view === 'forgot-password' && (
          <button
            type="button" onClick={() => switchView('login')}
            className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Terug naar inloggen
          </button>
        )}
      </div>

      {(view === 'login' || view === 'admin') && (
        <button
          type="button" onClick={() => switchView(isAdmin ? 'login' : 'admin')}
          className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          {isAdmin ? '← Terug naar normale login' : 'Admin portal login'}
        </button>
      )}
    </div>
  );
}