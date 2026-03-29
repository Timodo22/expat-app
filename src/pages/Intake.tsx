// components/IntakeForm.tsx
// Multi-step intake form for Expat Housing B2C onboarding
// Steps: 1 Personal → 2 Home Search → 3 Work Status → 4 Partner → 5 Guarantor → 6 Signature → 7 Verification

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Building2, ChevronRight, ChevronLeft, Check, PenLine, RotateCcw } from 'lucide-react';
import { API_URL } from '../lib/authClient';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1: Personal
  surname: string;
  firstName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  currentAddress: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;

  // Step 2: Home Search
  desiredStartingDate: string;
  rentalPeriod: string;
  familyComposition: string;
  hasPets: boolean;
  desiredArea: string;
  maxBudgetExcl: string;
  numBedrooms: string;
  parkingFacility: boolean;
  propertyType: string;
  furnished: boolean;
  desiredM2: string;
  minimalM2: string;
  viewingPreference: string;
  howFoundUs: string;

  // Step 3: Work Status
  workStatus: 'employed' | 'self_employed' | 'non_working_student' | 'working_student' | '';
  employer: string;
  contractDuration: string;
  profession: string;
  grossIncomeMonthly: string;
  has30Ruling: boolean;
  verifierContact: string;
  companyName: string;
  companyWebsite: string;

  // Step 4: Partner
  hasPartner: boolean | null;
  partnerSurname: string;
  partnerFirstName: string;
  partnerDobPlace: string;
  partnerNationality: string;
  partnerPassportNumber: string;
  partnerPhone: string;
  partnerEmail: string;
  partnerWorkStatus: string;
  partnerEmployer: string;
  partnerContractDuration: string;
  partnerProfession: string;
  partnerGrossIncome: string;
  partnerHas30Ruling: boolean;
  partnerVerifierContact: string;
  partnerCompanyName: string;
  partnerCompanyWebsite: string;

  // Step 5: Student / Guarantor
  isStudent: boolean | null;
  willingToPayUpfront: boolean | null;
  guarantorSurname: string;
  guarantorFirstName: string;
  guarantorDobPlace: string;
  guarantorPassportNumber: string;
  guarantorAddress: string;
  guarantorPhone: string;
  guarantorEmail: string;
  guarantorWorkStatus: string;
  guarantorEmployer: string;
  guarantorContractDuration: string;
  guarantorProfession: string;
  guarantorGrossIncome: string;
  guarantorVerifierContact: string;
  guarantorCompanyName: string;
  guarantorCompanyWebsite: string;

  // Step 6: Consent
  signatureData: string;
  termsAccepted: boolean;
}

const defaultForm: FormData = {
  surname: '', firstName: '', dateOfBirth: '', nationality: '', passportNumber: '',
  currentAddress: '', phoneNumber: '', email: '', password: '', confirmPassword: '',
  desiredStartingDate: '', rentalPeriod: '', familyComposition: '', hasPets: false,
  desiredArea: '', maxBudgetExcl: '', numBedrooms: '', parkingFacility: false,
  propertyType: '', furnished: false, desiredM2: '', minimalM2: '',
  viewingPreference: '', howFoundUs: '',
  workStatus: '', employer: '', contractDuration: '', profession: '',
  grossIncomeMonthly: '', has30Ruling: false, verifierContact: '',
  companyName: '', companyWebsite: '',
  hasPartner: null,
  partnerSurname: '', partnerFirstName: '', partnerDobPlace: '', partnerNationality: '',
  partnerPassportNumber: '', partnerPhone: '', partnerEmail: '', partnerWorkStatus: '',
  partnerEmployer: '', partnerContractDuration: '', partnerProfession: '',
  partnerGrossIncome: '', partnerHas30Ruling: false, partnerVerifierContact: '',
  partnerCompanyName: '', partnerCompanyWebsite: '',
  isStudent: null, willingToPayUpfront: null,
  guarantorSurname: '', guarantorFirstName: '', guarantorDobPlace: '',
  guarantorPassportNumber: '', guarantorAddress: '', guarantorPhone: '', guarantorEmail: '',
  guarantorWorkStatus: '', guarantorEmployer: '', guarantorContractDuration: '',
  guarantorProfession: '', guarantorGrossIncome: '', guarantorVerifierContact: '',
  guarantorCompanyName: '', guarantorCompanyWebsite: '',
  signatureData: '', termsAccepted: false,
};

// ─── Reusable field components ────────────────────────────────────────────────

const cls = "w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20 focus:border-[#0C3C4C] transition-colors bg-white text-sm";

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({
  label, required, ...props
}: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <Field label={label} required={required}>
    <input className={cls} required={required} {...props} />
  </Field>
);

const Select = ({
  label, required, options, placeholder = '-- Select --', ...props
}: {
  label: string; required?: boolean; options: { value: string; label: string }[];
  placeholder?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <Field label={label} required={required}>
    <select className={cls} required={required} {...props}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
);

const YesNo = ({
  label, value, onChange,
}: { label: string; value: boolean | null; onChange: (v: boolean) => void }) => (
  <Field label={label}>
    <div className="flex gap-3 mt-1">
      {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
        <button
          key={l} type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
            value === v
              ? 'border-[#0C3C4C] bg-[#0C3C4C] text-white'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  </Field>
);

const RadioGroup = ({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) => (
  <Field label={label} required>
    <div className="grid gap-2 mt-1">
      {options.map(o => (
        <label
          key={o.value}
          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
            value === o.value
              ? 'border-[#0C3C4C] bg-[#0C3C4C]/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            value === o.value ? 'border-[#0C3C4C]' : 'border-gray-300'
          }`}>
            {value === o.value && <span className="w-2 h-2 rounded-full bg-[#0C3C4C]" />}
          </span>
          <input
            type="radio" className="sr-only"
            value={o.value} checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span className="text-sm font-medium text-gray-800">{o.label}</span>
        </label>
      ))}
    </div>
  </Field>
);

const SectionTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <div className="mb-5 pb-3 border-b border-gray-100">
    <h3 className="font-semibold text-[#0C3C4C]">{title}</h3>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
  </div>
);

// ─── Signature Pad ────────────────────────────────────────────────────────────

const SignaturePad = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  const getPos = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current!;
    const pos = getPos(
      'touches' in e ? e.touches[0] : (e as React.MouseEvent).nativeEvent,
      canvas
    );
    lastPos.current = pos;
  };

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos(
      'touches' in e ? e.touches[0] : (e as React.MouseEvent).nativeEvent,
      canvas
    );
    ctx.beginPath();
    ctx.strokeStyle = '#0C3C4C';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
    onChange(canvas.toDataURL('image/png'));
  }, [onChange]);

  const endDraw = () => {
    drawing.current = false;
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div>
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={220}
          className="w-full cursor-crosshair touch-none block"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-300 text-sm flex items-center gap-2">
              <PenLine size={16} /> Sign here
            </span>
          </div>
        )}
      </div>
      <button
        type="button" onClick={clear}
        className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
      >
        <RotateCcw size={12} /> Clear signature
      </button>
    </div>
  );
};

// ─── Code Input (Verification Step) ──────────────────────────────────────────

const CodeInput = ({
  code, onChange,
}: { code: string[]; onChange: (code: string[]) => void }) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[i] = val.slice(-1);
    onChange(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    const next = [...code];
    digits.forEach((d, i) => { next[i] = d; });
    onChange(next);
    const idx = next.findIndex(d => !d);
    refs.current[idx === -1 ? 5 : idx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {code.map((digit, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text" inputMode="numeric" maxLength={1} value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className={`w-11 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-colors
            ${digit ? 'border-[#0C3C4C] bg-[#0C3C4C]/5' : 'border-gray-200'} focus:border-[#0C3C4C]`}
        />
      ))}
    </div>
  );
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────

const STEP_LABELS = [
  'Personal', 'Home Search', 'Work Status', 'Partner', 'Guarantor', 'Signature', 'Verify'
];

const StepBar = ({ step }: { step: number }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-2">
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={label} className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              done ? 'bg-[#84B5A5] text-white' :
              active ? 'bg-[#0C3C4C] text-white' :
              'bg-gray-100 text-gray-400'
            }`}>
              {done ? <Check size={14} /> : num}
            </div>
            <span className={`text-[10px] font-medium hidden sm:block ${active ? 'text-[#0C3C4C]' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-[#0C3C4C] rounded-full transition-all duration-500"
        style={{ width: `${((step - 1) / 6) * 100}%` }}
      />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function IntakeForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);

  const set = (field: keyof FormData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const isEmployed = form.workStatus === 'employed';
  const isSelfEmployed = form.workStatus === 'self_employed';

  // ── Validation per step ──
  const validateStep = (): string => {
    switch (step) {
      case 1:
        if (!form.surname || !form.firstName || !form.dateOfBirth || !form.nationality ||
            !form.passportNumber || !form.currentAddress || !form.phoneNumber || !form.email)
          return 'Please fill in all required personal details.';
        if (!form.password || form.password.length < 8)
          return 'Password must be at least 8 characters.';
        if (form.password !== form.confirmPassword)
          return 'Passwords do not match.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
          return 'Please enter a valid email address.';
        break;
      case 2:
        if (!form.desiredStartingDate || !form.rentalPeriod || !form.desiredArea ||
            !form.maxBudgetExcl || !form.numBedrooms || !form.viewingPreference)
          return 'Please fill in all required home search details.';
        break;
      case 3:
        if (!form.workStatus) return 'Please select your work status.';
        if (isEmployed && (!form.employer || !form.contractDuration || !form.profession || !form.grossIncomeMonthly))
          return 'Please complete all employment details.';
        if (isSelfEmployed && (!form.profession || !form.grossIncomeMonthly || !form.companyName))
          return 'Please complete all self-employment details.';
        break;
      case 4:
        if (form.hasPartner === null) return 'Please indicate whether you have a partner.';
        if (form.hasPartner) {
          if (!form.partnerSurname || !form.partnerFirstName || !form.partnerDobPlace ||
              !form.partnerNationality || !form.partnerPassportNumber ||
              !form.partnerPhone || !form.partnerEmail || !form.partnerWorkStatus)
            return "Please complete your partner's required details.";
          if (form.partnerWorkStatus === 'employed' &&
              (!form.partnerEmployer || !form.partnerContractDuration || !form.partnerProfession))
            return "Please complete your partner's employment details.";
          if (form.partnerWorkStatus === 'self_employed' &&
              (!form.partnerProfession || !form.partnerCompanyName))
            return "Please complete your partner's company details.";
        }
        break;
      case 5:
        if (form.isStudent === null) return 'Please indicate whether you are a student.';
        if (form.isStudent) {
          if (form.willingToPayUpfront === null) return 'Please indicate your upfront payment preference.';
          if (!form.guarantorSurname || !form.guarantorFirstName || !form.guarantorDobPlace ||
              !form.guarantorPassportNumber || !form.guarantorAddress ||
              !form.guarantorPhone || !form.guarantorEmail || !form.guarantorWorkStatus)
            return 'Please complete all required guarantor details.';
          if (form.guarantorWorkStatus === 'employed' &&
              (!form.guarantorEmployer || !form.guarantorContractDuration || !form.guarantorProfession))
            return "Please complete the guarantor's employment details.";
          if (form.guarantorWorkStatus === 'self_employed' &&
              (!form.guarantorProfession || !form.guarantorCompanyName))
            return "Please complete the guarantor's company details.";
        }
        break;
      case 6:
        if (!form.signatureData) return 'Please sign the form before proceeding.';
        if (!form.termsAccepted) return 'You must accept the General Terms and Conditions.';
        break;
    }
    return '';
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setError('');
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Submit (step 6 → sends form + triggers verification email) ──
  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/intake/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          isStudent: form.isStudent ?? false,
          willingToPayUpfront: form.willingToPayUpfront ?? false,
          hasPartner: form.hasPartner ?? false,
        }),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      setStep(7);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify code (step 7) ──
  const handleVerify = async () => {
    const codeStr = code.join('');
    if (codeStr.length < 6) { setError('Please enter all 6 digits.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: codeStr }),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error || 'Invalid code.');
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        if (data.user) localStorage.setItem('authUser', JSON.stringify(data.user));
      }
      window.location.href = '/portal/b2c';
    } catch (e: any) {
      setError(e.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-3 sticky top-0 z-10">
        <div className="w-8 h-8 bg-[#0C3C4C] rounded-xl flex items-center justify-center">
          <Building2 size={18} className="text-white" />
        </div>
        <span className="font-semibold text-[#0C3C4C] text-lg tracking-tight">
          Expat Housing <span className="text-gray-400 font-normal">| Intake Form</span>
        </span>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6">
        <StepBar step={step} />

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5 border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* ── STEP 1: PERSONAL DATA ─────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={e => { e.preventDefault(); next(); }} className="space-y-4">
              <SectionTitle title="Personal Details" subtitle="Your basic personal information" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Surname" required value={form.surname}
                  onChange={e => set('surname', e.target.value)} />
                <Input label="First Name" required value={form.firstName}
                  onChange={e => set('firstName', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Date of Birth" required type="date" value={form.dateOfBirth}
                  onChange={e => set('dateOfBirth', e.target.value)} />
                <Input label="Nationality" required value={form.nationality}
                  onChange={e => set('nationality', e.target.value)} />
              </div>
              <Input label="Passport / ID Number" required value={form.passportNumber}
                onChange={e => set('passportNumber', e.target.value)} />
              <Input label="Current Address" required value={form.currentAddress}
                onChange={e => set('currentAddress', e.target.value)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Phone Number" required type="tel" value={form.phoneNumber}
                  onChange={e => set('phoneNumber', e.target.value)} />
                <Input label="Email Address" required type="email" value={form.email}
                  onChange={e => set('email', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Create Password" required type="password" value={form.password}
                  onChange={e => set('password', e.target.value)}
                  minLength={8} placeholder="Min. 8 characters" />
                <Input label="Confirm Password" required type="password" value={form.confirmPassword}
                  onChange={e => set('confirmPassword', e.target.value)} />
              </div>
              <p className="text-xs text-gray-400">
                Your data is processed in accordance with our privacy policy and GDPR regulations.
              </p>
            </form>
          )}

          {/* ── STEP 2: HOME SEARCH ───────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <SectionTitle title="Home Search Details" subtitle="Tell us about your ideal rental" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Desired Starting Date" required type="date"
                  value={form.desiredStartingDate}
                  onChange={e => set('desiredStartingDate', e.target.value)} />
                <Select label="Indication Rental Period" required
                  value={form.rentalPeriod}
                  onChange={e => set('rentalPeriod', e.target.value)}
                  options={[
                    { value: '3_months', label: '3 months' },
                    { value: '6_months', label: '6 months' },
                    { value: '12_months', label: '12 months' },
                    { value: '2_years', label: '2 years' },
                    { value: 'indefinite', label: 'Long term / Open-ended' },
                  ]}
                />
              </div>
              <Input label="Family Composition" value={form.familyComposition}
                placeholder="e.g. 2 adults, 1 child"
                onChange={e => set('familyComposition', e.target.value)} />
              <YesNo label="Do you have pets?" value={form.hasPets}
                onChange={v => set('hasPets', v)} />
              <Input label="Desired Town / Area" required value={form.desiredArea}
                placeholder="e.g. Amsterdam, Utrecht"
                onChange={e => set('desiredArea', e.target.value)} />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Max Budget (excl.)" required type="number"
                  value={form.maxBudgetExcl} placeholder="€ per month"
                  onChange={e => set('maxBudgetExcl', e.target.value)} />
                <Input label="Number of Bedrooms" required type="number" min="0"
                  value={form.numBedrooms}
                  onChange={e => set('numBedrooms', e.target.value)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <YesNo label="Parking facility?" value={form.parkingFacility}
                  onChange={v => set('parkingFacility', v)} />
                <YesNo label="Furnished?" value={form.furnished}
                  onChange={v => set('furnished', v)} />
              </div>
              <Select label="Type of Property" value={form.propertyType}
                onChange={e => set('propertyType', e.target.value)}
                options={[
                  { value: 'apartment', label: 'Apartment' },
                  { value: 'house', label: 'House' },
                  { value: 'studio', label: 'Studio' },
                  { value: 'room', label: 'Room' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Desired m²" type="number" value={form.desiredM2}
                  onChange={e => set('desiredM2', e.target.value)} />
                <Input label="Minimum m²" type="number" value={form.minimalM2}
                  onChange={e => set('minimalM2', e.target.value)} />
              </div>
              <RadioGroup
                label="Regarding viewings"
                value={form.viewingPreference}
                onChange={v => set('viewingPreference', v)}
                options={[
                  { value: 'on_my_behalf', label: 'I want you to go on my behalf' },
                  { value: 'together', label: 'I want to go together' },
                  { value: 'myself', label: 'I will go to viewings myself' },
                ]}
              />
              <Select label="How did you find us?" value={form.howFoundUs}
                onChange={e => set('howFoundUs', e.target.value)}
                options={[
                  { value: 'google', label: 'Google' },
                  { value: 'social_media', label: 'Social Media' },
                  { value: 'referral', label: 'Referral / Word of mouth' },
                  { value: 'linkedin', label: 'LinkedIn' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          )}

          {/* ── STEP 3: WORK STATUS ───────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <SectionTitle title="Work Status" subtitle="Your current employment situation" />
              <RadioGroup
                label="I am..."
                value={form.workStatus}
                onChange={v => set('workStatus', v)}
                options={[
                  { value: 'employed', label: 'Employed' },
                  { value: 'self_employed', label: 'Self Employed' },
                  { value: 'non_working_student', label: 'A non-working student' },
                  { value: 'working_student', label: 'A working student' },
                ]}
              />

              {/* Employed sub-fields */}
              {isEmployed && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                  <SectionTitle title="Employment Details" />
                  <Input label="Employer" required value={form.employer}
                    onChange={e => set('employer', e.target.value)} />
                  <Select label="Contract Duration" required value={form.contractDuration}
                    onChange={e => set('contractDuration', e.target.value)}
                    options={[
                      { value: 'fixed', label: 'Fixed term' },
                      { value: 'indefinite', label: 'Indefinite term' },
                    ]}
                  />
                  <Input label="Profession / Function" required value={form.profession}
                    onChange={e => set('profession', e.target.value)} />
                  <Input label="Gross Income p/month (€)" required type="number"
                    value={form.grossIncomeMonthly}
                    onChange={e => set('grossIncomeMonthly', e.target.value)} />
                  <YesNo label="Do you have 30% ruling?"
                    value={form.has30Ruling} onChange={v => set('has30Ruling', v)} />
                  <Input label="Person to verify your position (name + contact)"
                    value={form.verifierContact}
                    onChange={e => set('verifierContact', e.target.value)} />
                </div>
              )}

              {/* Self-employed sub-fields */}
              {isSelfEmployed && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100 mt-2">
                  <SectionTitle title="Self-Employment Details" />
                  <Input label="Profession / Function" required value={form.profession}
                    onChange={e => set('profession', e.target.value)} />
                  <Input label="Gross Income p/month (€)" required type="number"
                    value={form.grossIncomeMonthly}
                    onChange={e => set('grossIncomeMonthly', e.target.value)} />
                  <Input label="Company Name" required value={form.companyName}
                    onChange={e => set('companyName', e.target.value)} />
                  <Input label="Company Website" type="url" value={form.companyWebsite}
                    placeholder="https://"
                    onChange={e => set('companyWebsite', e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* ── STEP 4: PARTNER ───────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <SectionTitle title="Partner" subtitle="Do you have a partner moving with you?" />
              <YesNo label="Do you have a partner?" value={form.hasPartner}
                onChange={v => set('hasPartner', v)} />

              {form.hasPartner && (
                <>
                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <SectionTitle title="Partner Personal Details" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Surname" required value={form.partnerSurname}
                        onChange={e => set('partnerSurname', e.target.value)} />
                      <Input label="First Name" required value={form.partnerFirstName}
                        onChange={e => set('partnerFirstName', e.target.value)} />
                    </div>
                    <Input label="Date & Place of Birth" required value={form.partnerDobPlace}
                      placeholder="01-01-1990, Amsterdam"
                      onChange={e => set('partnerDobPlace', e.target.value)} />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Nationality" required value={form.partnerNationality}
                        onChange={e => set('partnerNationality', e.target.value)} />
                      <Input label="Passport / ID Number" required value={form.partnerPassportNumber}
                        onChange={e => set('partnerPassportNumber', e.target.value)} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Phone Number" required type="tel" value={form.partnerPhone}
                        onChange={e => set('partnerPhone', e.target.value)} />
                      <Input label="Email Address" required type="email" value={form.partnerEmail}
                        onChange={e => set('partnerEmail', e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <SectionTitle title="Partner Work Status" />
                    <RadioGroup
                      label="Work status partner"
                      value={form.partnerWorkStatus}
                      onChange={v => set('partnerWorkStatus', v)}
                      options={[
                        { value: 'employed', label: 'Employed' },
                        { value: 'self_employed', label: 'Self Employed' },
                        { value: 'doesnt_work_or_student', label: "Doesn't work or is a student" },
                      ]}
                    />
                    {form.partnerWorkStatus === 'employed' && (
                      <div className="space-y-4">
                        <Input label="Employer" required value={form.partnerEmployer}
                          onChange={e => set('partnerEmployer', e.target.value)} />
                        <Select label="Contract Duration" required value={form.partnerContractDuration}
                          onChange={e => set('partnerContractDuration', e.target.value)}
                          options={[
                            { value: 'fixed', label: 'Fixed term' },
                            { value: 'indefinite', label: 'Indefinite term' },
                          ]}
                        />
                        <Input label="Profession / Function" required value={form.partnerProfession}
                          onChange={e => set('partnerProfession', e.target.value)} />
                        <Input label="Gross Income p/month (€)" type="number" value={form.partnerGrossIncome}
                          onChange={e => set('partnerGrossIncome', e.target.value)} />
                        <YesNo label="30% ruling?" value={form.partnerHas30Ruling}
                          onChange={v => set('partnerHas30Ruling', v)} />
                        <Input label="Person to verify position" value={form.partnerVerifierContact}
                          onChange={e => set('partnerVerifierContact', e.target.value)} />
                      </div>
                    )}
                    {form.partnerWorkStatus === 'self_employed' && (
                      <div className="space-y-4">
                        <Input label="Profession / Function" required value={form.partnerProfession}
                          onChange={e => set('partnerProfession', e.target.value)} />
                        <Input label="Gross Income p/month (€)" type="number" value={form.partnerGrossIncome}
                          onChange={e => set('partnerGrossIncome', e.target.value)} />
                        <Input label="Company Name" required value={form.partnerCompanyName}
                          onChange={e => set('partnerCompanyName', e.target.value)} />
                        <Input label="Company Website" type="url" value={form.partnerCompanyWebsite}
                          placeholder="https://"
                          onChange={e => set('partnerCompanyWebsite', e.target.value)} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 5: STUDENT / GUARANTOR ───────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-4">
              <SectionTitle title="Student & Guarantor" subtitle="Required if you are a student" />
              <YesNo label="Are you a student?" value={form.isStudent}
                onChange={v => set('isStudent', v)} />

              {form.isStudent && (
                <>
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-amber-700">
                    <strong>Note:</strong> We advise students to pay rent upfront — typically a few months to a year — to increase their chances of finding a property.
                  </div>
                  <YesNo label="Are you willing to pay upfront?" value={form.willingToPayUpfront}
                    onChange={v => set('willingToPayUpfront', v)} />

                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <SectionTitle title="Guarantor Personal Details" subtitle="Personal details of your guarantor" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Surname" required value={form.guarantorSurname}
                        onChange={e => set('guarantorSurname', e.target.value)} />
                      <Input label="First Name" required value={form.guarantorFirstName}
                        onChange={e => set('guarantorFirstName', e.target.value)} />
                    </div>
                    <Input label="Date & Place of Birth" required value={form.guarantorDobPlace}
                      placeholder="01-01-1970, Rotterdam"
                      onChange={e => set('guarantorDobPlace', e.target.value)} />
                    <Input label="Passport / ID Number" required value={form.guarantorPassportNumber}
                      onChange={e => set('guarantorPassportNumber', e.target.value)} />
                    <Input label="Current Address" required value={form.guarantorAddress}
                      onChange={e => set('guarantorAddress', e.target.value)} />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Phone Number" required type="tel" value={form.guarantorPhone}
                        onChange={e => set('guarantorPhone', e.target.value)} />
                      <Input label="Email Address" required type="email" value={form.guarantorEmail}
                        onChange={e => set('guarantorEmail', e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <SectionTitle title="Guarantor Work Status" />
                    <RadioGroup
                      label="Work status guarantor"
                      value={form.guarantorWorkStatus}
                      onChange={v => set('guarantorWorkStatus', v)}
                      options={[
                        { value: 'employed', label: 'Employed' },
                        { value: 'self_employed', label: 'Self Employed' },
                      ]}
                    />
                    {form.guarantorWorkStatus === 'employed' && (
                      <div className="space-y-4">
                        <Input label="Employer" required value={form.guarantorEmployer}
                          onChange={e => set('guarantorEmployer', e.target.value)} />
                        <Select label="Contract Duration" required value={form.guarantorContractDuration}
                          onChange={e => set('guarantorContractDuration', e.target.value)}
                          options={[
                            { value: 'fixed', label: 'Fixed term' },
                            { value: 'indefinite', label: 'Indefinite term' },
                          ]}
                        />
                        <Input label="Profession / Function" required value={form.guarantorProfession}
                          onChange={e => set('guarantorProfession', e.target.value)} />
                        <Input label="Gross Income p/month (€)" type="number"
                          value={form.guarantorGrossIncome}
                          onChange={e => set('guarantorGrossIncome', e.target.value)} />
                        <Input label="Person to verify position" value={form.guarantorVerifierContact}
                          onChange={e => set('guarantorVerifierContact', e.target.value)} />
                      </div>
                    )}
                    {form.guarantorWorkStatus === 'self_employed' && (
                      <div className="space-y-4">
                        <Input label="Profession / Function" required value={form.guarantorProfession}
                          onChange={e => set('guarantorProfession', e.target.value)} />
                        <Input label="Gross Income p/month (€)" type="number"
                          value={form.guarantorGrossIncome}
                          onChange={e => set('guarantorGrossIncome', e.target.value)} />
                        <Input label="Company Name" required value={form.guarantorCompanyName}
                          onChange={e => set('guarantorCompanyName', e.target.value)} />
                        <Input label="Company Website" type="url" value={form.guarantorCompanyWebsite}
                          placeholder="https://"
                          onChange={e => set('guarantorCompanyWebsite', e.target.value)} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 6: SIGNATURE + TERMS ─────────────────────────────────── */}
          {step === 6 && (
            <div className="space-y-5">
              <SectionTitle
                title="Signature & Agreement"
                subtitle="Please sign below and accept the terms to proceed"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your signature <span className="text-red-400">*</span>
                </label>
                <SignaturePad
                  value={form.signatureData}
                  onChange={v => set('signatureData', v)}
                />
              </div>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.termsAccepted ? 'border-[#0C3C4C] bg-[#0C3C4C]/5' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  form.termsAccepted ? 'bg-[#0C3C4C]' : 'border-2 border-gray-300'
                }`}>
                  {form.termsAccepted && <Check size={12} className="text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={form.termsAccepted}
                  onChange={e => set('termsAccepted', e.target.checked)}
                />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a
                    href="/terms" target="_blank" rel="noopener noreferrer"
                    className="text-[#0C3C4C] underline font-medium"
                    onClick={e => e.stopPropagation()}
                  >
                    General Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a
                    href="/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-[#0C3C4C] underline font-medium"
                    onClick={e => e.stopPropagation()}
                  >
                    Privacy Policy
                  </a>
                  . I confirm that all provided information is accurate and complete.{' '}
                  <span className="text-red-400">*</span>
                </span>
              </label>

              <p className="text-xs text-gray-400 leading-relaxed">
                Your data is stored securely and processed in accordance with GDPR (AVG). 
                We will only use your information to provide our relocation services. 
                After submitting, you will receive a verification email to activate your account.
              </p>
            </div>
          )}

          {/* ── STEP 7: EMAIL VERIFICATION ────────────────────────────────── */}
          {step === 7 && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-[#84B5A5]/20 rounded-full flex items-center justify-center mx-auto">
                <Check size={28} className="text-[#84B5A5]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0C3C4C] mb-2">Verify your email</h3>
                <p className="text-gray-500 text-sm">
                  We've sent a 6-digit code to <strong>{form.email}</strong>.<br />
                  Enter it below to activate your account.
                </p>
              </div>
              <CodeInput code={code} onChange={setCode} />
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || code.join('').length < 6}
                className="w-full bg-[#0C3C4C] text-white py-3 rounded-xl font-medium hover:bg-[#0a2f3b] transition-colors disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Activate Account'}
              </button>
              <p className="text-xs text-gray-400">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-[#0C3C4C] underline"
                >
                  resend the code
                </button>.
              </p>
            </div>
          )}

        </div>

        {/* Navigation buttons */}
        {step < 7 && (
          <div className="flex gap-3 mt-5">
            {step > 1 && (
              <button
                type="button" onClick={prev}
                className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <button
              type="button"
              onClick={step === 6 ? handleSubmit : next}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-[#0C3C4C] text-white py-3 rounded-xl font-medium hover:bg-[#0a2f3b] transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : step === 6 ? 'Submit & Verify Email' : 'Continue'}
              {!loading && step < 6 && <ChevronRight size={16} />}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}