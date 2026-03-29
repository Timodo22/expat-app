// components/SettingsModal.tsx
import React, { useState, useRef } from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { authClient } from '../lib/authClient';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; name: string; email: string } | null;
  onUpdate: (newName: string) => void;
}

export default function SettingsModal({ isOpen, onClose, user, onUpdate }: SettingsModalProps) {
  const [view, setView] = useState<'profile' | 'delete-confirm' | 'reset-password'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!isOpen || !user) return null;

  const resetMessages = () => { setError(''); setSuccess(''); };

  // ── Handlers voor Naam Update ──
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    try {
      const res = await authClient.updateProfile(name);
      if (!res.success) throw new Error(res.error);
      setSuccess('Profiel succesvol bijgewerkt!');
      onUpdate(name);
    } catch (err: any) {
      setError(err.message || 'Fout bij bijwerken.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers voor Wachtwoord Reset ──
  const handleRequestPasswordReset = async () => {
    setLoading(true);
    resetMessages();
    try {
      // We hergebruiken de forgotPassword route, dit stuurt een code naar de user!
      const res = await authClient.forgotPassword(user.email);
      if (!res.success) throw new Error(res.error);
      setView('reset-password');
      setSuccess('Er is een verificatiecode naar je e-mail gestuurd.');
    } catch (err: any) {
      setError(err.message || 'Fout bij aanvragen wachtwoord reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeValue = code.join('');
    if (codeValue.length < 6) return setError('Voer de 6-cijferige code in.');
    if (newPassword.length < 8) return setError('Wachtwoord moet minimaal 8 tekens zijn.');

    setLoading(true);
    resetMessages();
    try {
      const res = await authClient.resetPassword({ email: user.email, code: codeValue, newPassword });
      if (!res.success) throw new Error(res.error);
      
      // Als het gelukt is, reset de velden en ga terug naar profiel overzicht
      setSuccess('Wachtwoord succesvol gewijzigd!');
      setView('profile');
      setCode(['', '', '', '', '', '']);
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Ongeldige of verlopen code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Handlers voor Account Verwijderen ──
  const handleRequestDelete = async () => {
    setLoading(true);
    resetMessages();
    try {
      const res = await authClient.requestDelete();
      if (!res.success) throw new Error(res.error);
      setView('delete-confirm');
      setSuccess('Er is een code naar je e-mail gestuurd.');
    } catch (err: any) {
      setError(err.message || 'Fout bij aanvragen verwijdering.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    const codeValue = code.join('');
    if (codeValue.length < 6) return setError('Voer de 6-cijferige code in.');
    
    setLoading(true);
    resetMessages();
    try {
      const res = await authClient.confirmDelete(codeValue);
      if (!res.success) throw new Error(res.error);
      window.location.href = '/auth'; // Account is weg, stuur naar login
    } catch (err: any) {
      setError(err.message || 'Ongeldige of verlopen code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Code Input Helpers ──
  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...code];
    next[index] = value.slice(-1);
    setCode(next);
    if (value && index < 5) codeRefs.current[index + 1]?.focus();
  };
  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) codeRefs.current[index - 1]?.focus();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-[#0C3C4C] mb-6">
          {view === 'profile' ? 'Account Instellingen' : 
           view === 'reset-password' ? 'Wachtwoord Wijzigen' : 
           'Account Verwijderen'}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{success}</div>}

        {view === 'profile' && (
          <div className="space-y-6">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mailadres</label>
                <input type="email" value={user.email} disabled className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volledige Naam</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0C3C4C]/20 focus:outline-none" />
              </div>
              <button type="submit" disabled={loading || name === user.name} className="w-full bg-[#0C3C4C] text-white py-2 rounded-lg font-medium hover:bg-[#0a2f3b] disabled:opacity-50 transition-colors">
                {loading ? 'Bezig...' : 'Wijzigingen Opslaan'}
              </button>
            </form>

            <div className="pt-6 border-t border-gray-100 mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#0C3C4C] mb-2 flex items-center gap-2">
                  <ShieldCheck size={16} /> Beveiliging
                </h3>
                <button onClick={handleRequestPasswordReset} disabled={loading} className="w-full border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                  Wachtwoord wijzigen via e-mail
                </button>
              </div>

              <div className="pt-4">
                <h3 className="text-sm font-semibold text-red-600 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} /> Gevarenzone
                </h3>
                <p className="text-xs text-gray-500 mb-3">Zodra je je account verwijdert, is er geen weg meer terug. We sturen een code naar je e-mail ter bevestiging.</p>
                <button onClick={handleRequestDelete} disabled={loading} className="w-full border border-red-200 text-red-600 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors text-sm">
                  Verwijder mijn account
                </button>
              </div>
            </div>
          </div>
        )}

        {(view === 'delete-confirm' || view === 'reset-password') && (
          <form onSubmit={view === 'delete-confirm' ? handleConfirmDelete : handleConfirmPasswordReset} className="space-y-6">
            <p className="text-sm text-gray-600 text-center">
              Voer de 6-cijferige code in die naar <strong>{user.email}</strong> is gestuurd.
            </p>
            
            <div className="flex gap-2 justify-center">
              {code.map((digit, i) => (
                <input
                  key={i} ref={el => { codeRefs.current[i] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={e => handleCodeChange(i, e.target.value)} onKeyDown={e => handleCodeKeyDown(i, e)}
                  className={`w-11 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none ${digit ? 'border-[#0C3C4C] bg-[#0C3C4C]/5' : 'border-gray-200'} focus:border-[#0C3C4C]`}
                />
              ))}
            </div>

            {view === 'reset-password' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw Wachtwoord</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20"
                  required minLength={8}
                />
              </div>
            )}

            <button type="submit" disabled={loading || code.join('').length < 6} className={`w-full text-white py-2 rounded-lg font-medium disabled:opacity-50 transition-colors ${view === 'delete-confirm' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#0C3C4C] hover:bg-[#0a2f3b]'}`}>
              {loading ? 'Bezig...' : view === 'delete-confirm' ? 'Definitief Verwijderen' : 'Wachtwoord Opslaan'}
            </button>
            
            <button type="button" onClick={() => { setView('profile'); setCode(['','','','','','']); setNewPassword(''); resetMessages(); }} className="w-full text-gray-500 hover:text-gray-700 text-sm">
              Annuleren
            </button>
          </form>
        )}
      </div>
    </div>
  );
}