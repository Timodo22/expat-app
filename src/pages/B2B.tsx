// components/B2BPortal.tsx
// B2B Corporate Portal — HR adds employees via embedded intake form.
// No B2C account is created; intake is linked to the company's user_id.
// Steps: 1 Personal → 2 Home Search → 3 Work Status → 4 Partner → 5 Signature

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Building2, LogOut, Settings, Users, ChevronRight, ChevronLeft,
  Check, PenLine, RotateCcw, ArrowLeft, UserPlus, Briefcase,
  Calendar, MapPin, Clock,
} from 'lucide-react';
import { authClient, getToken, API_URL } from '../lib/authClient';
import SettingsModal from '../components/SettingsModal';
import logoEH from '../assets/logoEH.png';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Employee {
  id: string;
  first_name: string;
  surname: string;
  email: string;
  profession: string | null;
  work_status: string;
  status: string;
  created_at: string;
  desired_starting_date: string | null;
}

interface IntakeFormData {
  // Step 1: Personal
  surname: string;
  firstName: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  currentAddress: string;
  phoneNumber: string;
  email: string;

  // Step 2: Home Search
  desiredStartingDate: string;
  rentalPeriod: string;
  familyComposition: string;
  hasPets: boolean | null;
  desiredArea: string;
  maxBudgetExcl: string;
  numBedrooms: string;
  parkingFacility: boolean | null;
  propertyType: string;
  furnished: boolean | null;
  desiredM2: string;
  minimalM2: string;
  viewingPreference: string;
  howFoundUs: string;

  // Step 3: Work Status (always employed)
  contractDuration: string;
  profession: string;
  grossIncomeMonthly: string;
  has30Ruling: boolean | null;
  verifierContact: string;

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
  partnerHas30Ruling: boolean | null;
  partnerVerifierContact: string;
  partnerCompanyName: string;
  partnerCompanyWebsite: string;

  // Step 5: Signature
  signatureData: string;
  termsAccepted: boolean;
}

const defaultIntake: IntakeFormData = {
  surname: '', firstName: '', dateOfBirth: '', nationality: '', passportNumber: '',
  currentAddress: '', phoneNumber: '', email: '',
  desiredStartingDate: '', rentalPeriod: '', familyComposition: '', hasPets: null,
  desiredArea: '', maxBudgetExcl: '', numBedrooms: '', parkingFacility: null,
  propertyType: '', furnished: null, desiredM2: '', minimalM2: '',
  viewingPreference: '', howFoundUs: '',
  contractDuration: '', profession: '',
  grossIncomeMonthly: '', has30Ruling: null, verifierContact: '',
  hasPartner: null,
  partnerSurname: '', partnerFirstName: '', partnerDobPlace: '', partnerNationality: '',
  partnerPassportNumber: '', partnerPhone: '', partnerEmail: '', partnerWorkStatus: '',
  partnerEmployer: '', partnerContractDuration: '', partnerProfession: '',
  partnerGrossIncome: '', partnerHas30Ruling: null, partnerVerifierContact: '',
  partnerCompanyName: '', partnerCompanyWebsite: '',
  signatureData: '', termsAccepted: false,
};

// ─── Shared field components ───────────────────────────────────────────────────

const cls = "w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0C3C4C]/20 focus:border-[#0C3C4C] transition-colors bg-white text-sm";

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
);

const Input = ({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <Field label={label} required={required}>
    <input className={cls} required={required} {...props} />
  </Field>
);

const Select = ({
  label, required, options, placeholder = '-- Select --', ...props
}: { label: string; required?: boolean; options: { value: string; label: string }[]; placeholder?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <Field label={label} required={required}>
    <select className={cls} required={required} {...props}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </Field>
);

const YesNo = ({ label, value, onChange }: { label: string; value: boolean | null; onChange: (v: boolean) => void }) => (
  <Field label={label}>
    <div className="flex gap-3 mt-1">
      {[{ v: true, l: 'Yes' }, { v: false, l: 'No' }].map(({ v, l }) => (
        <button key={l} type="button" onClick={() => onChange(v)}
          className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all ${
            value === v ? 'border-[#0C3C4C] bg-[#0C3C4C] text-white' : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}>
          {l}
        </button>
      ))}
    </div>
  </Field>
);

const RadioGroup = ({ label, options, value, onChange }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void;
}) => (
  <Field label={label} required>
    <div className="grid gap-2 mt-1">
      {options.map(o => (
        <label key={o.value} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
          value === o.value ? 'border-[#0C3C4C] bg-[#0C3C4C]/5' : 'border-gray-200 hover:border-gray-300'
        }`}>
          <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
            value === o.value ? 'border-[#0C3C4C]' : 'border-gray-300'
          }`}>
            {value === o.value && <span className="w-2 h-2 rounded-full bg-[#0C3C4C]" />}
          </span>
          <input type="radio" className="sr-only" value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
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
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    drawing.current = true;
    const canvas = canvasRef.current!;
    lastPos.current = getPos('touches' in e ? e.touches[0] : (e as React.MouseEvent).nativeEvent, canvas);
  };

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const pos = getPos('touches' in e ? e.touches[0] : (e as React.MouseEvent).nativeEvent, canvas);
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

  const endDraw = () => { drawing.current = false; lastPos.current = null; };

  const clear = () => {
    const canvas = canvasRef.current!;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div>
      <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative">
        <canvas ref={canvasRef} width={800} height={200}
          className="w-full cursor-crosshair touch-none block"
          onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
          onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
        />
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-300 text-sm flex items-center gap-2"><PenLine size={16} /> Sign here</span>
          </div>
        )}
      </div>
      <button type="button" onClick={clear}
        className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
        <RotateCcw size={12} /> Clear signature
      </button>
    </div>
  );
};

// ─── Step Progress Bar ────────────────────────────────────────────────────────

const STEP_LABELS = ['Personal', 'Home Search', 'Work Status', 'Partner', 'Signature'];

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
              done ? 'bg-[#84B5A5] text-white' : active ? 'bg-[#0C3C4C] text-white' : 'bg-gray-100 text-gray-400'
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
      <div className="h-full bg-[#0C3C4C] rounded-full transition-all duration-500"
        style={{ width: `${((step - 1) / 4) * 100}%` }} />
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    getekend: 'bg-blue-50 text-blue-700',
    goedgekeurd: 'bg-amber-50 text-amber-700',
    afgerond: 'bg-green-50 text-green-700',
  };
  const labels: Record<string, string> = {
    getekend: 'Signed',
    goedgekeurd: 'Approved',
    afgerond: 'Completed',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {labels[status] ?? status}
    </span>
  );
};

// ─── Embedded Intake Form ─────────────────────────────────────────────────────

function EmployeeIntakeForm({
  onBack,
  onSuccess,
  companyName,
}: {
  onBack: () => void;
  onSuccess: () => void;
  companyName: string;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<IntakeFormData>(defaultIntake);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const set = (field: keyof IntakeFormData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validateStep = (): string => {
    switch (step) {
      case 1:
        if (!form.surname || !form.firstName || !form.dateOfBirth || !form.nationality ||
            !form.passportNumber || !form.currentAddress || !form.phoneNumber || !form.email)
          return 'Please fill in all required personal details.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
          return 'Please enter a valid email address.';
        break;
      case 2:
        if (!form.desiredStartingDate || !form.rentalPeriod || !form.desiredArea ||
            !form.maxBudgetExcl || !form.numBedrooms || !form.viewingPreference)
          return 'Please fill in all required home search details.';
        break;
      case 3:
        if (!form.contractDuration || !form.profession || !form.grossIncomeMonthly)
          return 'Please complete all employment details.';
        break;
      case 4:
        if (form.hasPartner === null) return 'Please indicate whether the employee has a partner.';
        if (form.hasPartner) {
          if (!form.partnerSurname || !form.partnerFirstName || !form.partnerDobPlace ||
              !form.partnerNationality || !form.partnerPassportNumber ||
              !form.partnerPhone || !form.partnerEmail || !form.partnerWorkStatus)
            return "Please complete the partner's required details.";
          if (form.partnerWorkStatus === 'employed' &&
              (!form.partnerEmployer || !form.partnerContractDuration || !form.partnerProfession))
            return "Please complete the partner's employment details.";
          if (form.partnerWorkStatus === 'self_employed' &&
              (!form.partnerProfession || !form.partnerCompanyName))
            return "Please complete the partner's company details.";
        }
        break;
      case 5:
        if (!form.signatureData) return 'A signature is required.';
        if (!form.termsAccepted) return 'Please accept the General Terms and Conditions.';
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

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      // ✅ FIX: use getToken() which reads the correct 'session_token' key
      const token = getToken();
      const res = await fetch(`${API_URL}/api/intake/submit-b2b`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          // Personal
          surname: form.surname,
          firstName: form.firstName,
          dateOfBirth: form.dateOfBirth,
          nationality: form.nationality,
          passportNumber: form.passportNumber,
          currentAddress: form.currentAddress,
          phoneNumber: form.phoneNumber,
          email: form.email,
          // Home search
          desiredStartingDate: form.desiredStartingDate,
          rentalPeriod: form.rentalPeriod,
          familyComposition: form.familyComposition,
          hasPets: form.hasPets ?? false,
          desiredArea: form.desiredArea,
          maxBudgetExcl: form.maxBudgetExcl,
          numBedrooms: form.numBedrooms,
          parkingFacility: form.parkingFacility ?? false,
          propertyType: form.propertyType,
          furnished: form.furnished ?? false,
          desiredM2: form.desiredM2,
          minimalM2: form.minimalM2,
          viewingPreference: form.viewingPreference,
          howFoundUs: form.howFoundUs,
          // Work — always employed
          workStatus: 'employed',
          employer: '',
          contractDuration: form.contractDuration,
          profession: form.profession,
          grossIncomeMonthly: form.grossIncomeMonthly,
          has30Ruling: form.has30Ruling ?? false,
          verifierContact: form.verifierContact,
          companyName: '',
          companyWebsite: '',
          // Partner
          hasPartner: form.hasPartner ?? false,
          partnerSurname: form.partnerSurname,
          partnerFirstName: form.partnerFirstName,
          partnerDobPlace: form.partnerDobPlace,
          partnerNationality: form.partnerNationality,
          partnerPassportNumber: form.partnerPassportNumber,
          partnerPhone: form.partnerPhone,
          partnerEmail: form.partnerEmail,
          partnerWorkStatus: form.partnerWorkStatus,
          partnerEmployer: form.partnerEmployer,
          partnerContractDuration: form.partnerContractDuration,
          partnerProfession: form.partnerProfession,
          partnerGrossIncome: form.partnerGrossIncome,
          partnerHas30Ruling: form.partnerHas30Ruling ?? false,
          partnerVerifierContact: form.partnerVerifierContact,
          partnerCompanyName: form.partnerCompanyName,
          partnerCompanyWebsite: form.partnerCompanyWebsite,
          // Guarantor / student — not applicable
          isStudent: false,
          willingToPayUpfront: false,
          // Signature
          signatureData: form.signatureData,
          termsAccepted: form.termsAccepted,
          source: 'b2b',
        }),
      });
      const data = await res.json() as any;
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
        <IntakeHeader onBack={onBack} />
        <main className="flex-1 max-w-2xl w-full mx-auto p-6 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center space-y-5 w-full">
            <div className="w-16 h-16 bg-[#84B5A5]/20 rounded-full flex items-center justify-center mx-auto">
              <Check size={28} className="text-[#84B5A5]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#0C3C4C] mb-2">Employee added successfully</h3>
              <p className="text-gray-500 text-sm">
                The intake for <strong>{form.firstName} {form.surname}</strong> has been submitted
                and is now visible in your dashboard and in the admin panel.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setForm(defaultIntake); setStep(1); setDone(false); }}
                className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Add another employee
              </button>
              <button
                onClick={onSuccess}
                className="flex-1 bg-[#0C3C4C] text-white py-3 rounded-xl font-medium hover:bg-[#0a2f3b] transition-colors"
              >
                Back to dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <IntakeHeader onBack={onBack} />

      <main className="flex-1 max-w-2xl w-full mx-auto p-6">
        {/* Company context banner */}
        <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-[#0C3C4C]/5 border border-[#0C3C4C]/10 rounded-xl">
          <Briefcase size={15} className="text-[#0C3C4C]" />
          <span className="text-sm text-[#0C3C4C] font-medium">
            Adding employee for <span className="font-bold">{companyName}</span>
          </span>
        </div>

        <StepBar step={step} />

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-5 border border-red-100">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* ── STEP 1: PERSONAL ─────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <SectionTitle title="Personal Details" subtitle="Employee's personal information" />
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
              <p className="text-xs text-gray-400">
                Employee data is processed in accordance with GDPR regulations.
              </p>
            </div>
          )}

          {/* ── STEP 2: HOME SEARCH ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <SectionTitle title="Home Search Details" subtitle="Housing preferences" />
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
                placeholder="e.g. Amsterdam, Eindhoven"
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
                  { value: 'on_my_behalf', label: 'Go on my behalf' },
                  { value: 'together', label: 'Go together' },
                  { value: 'myself', label: 'Go myself' },
                ]}
              />
              <Select label="How did you find us?" value={form.howFoundUs}
                onChange={e => set('howFoundUs', e.target.value)}
                options={[
                  { value: 'google', label: 'Google' },
                  { value: 'social_media', label: 'Social Media' },
                  { value: 'referral', label: 'Referral / Word of mouth' },
                  { value: 'linkedin', label: 'LinkedIn' },
                  { value: 'employer', label: 'Through my employer' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          )}

          {/* ── STEP 3: WORK STATUS (always employed) ────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <SectionTitle title="Employment Details" subtitle="Employee's employment information" />

              {/* Informational pill — no radio needed */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#0C3C4C]/5 border border-[#0C3C4C]/10 rounded-xl">
                <Briefcase size={14} className="text-[#0C3C4C]" />
                <span className="text-sm text-[#0C3C4C] font-medium">Employed</span>
              </div>

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
              <YesNo label="Do they have 30% ruling?"
                value={form.has30Ruling} onChange={v => set('has30Ruling', v)} />
              <Input label="Person to verify position (name + contact)"
                value={form.verifierContact}
                onChange={e => set('verifierContact', e.target.value)} />
            </div>
          )}

          {/* ── STEP 4: PARTNER ──────────────────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <SectionTitle title="Partner" subtitle="Is a partner moving along?" />
              <YesNo label="Does the employee have a partner?" value={form.hasPartner}
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
                      label="Partner's work status"
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
                          placeholder="https://" onChange={e => set('partnerCompanyWebsite', e.target.value)} />
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── STEP 5: SIGNATURE ────────────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              <SectionTitle
                title="Signature & Agreement"
                subtitle="Employee signs below to confirm the intake"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee's signature <span className="text-red-400">*</span>
                </label>
                <SignaturePad value={form.signatureData} onChange={v => set('signatureData', v)} />
              </div>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.termsAccepted ? 'border-[#0C3C4C] bg-[#0C3C4C]/5' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  form.termsAccepted ? 'bg-[#0C3C4C]' : 'border-2 border-gray-300'
                }`}>
                  {form.termsAccepted && <Check size={12} className="text-white" />}
                </div>
                <input type="checkbox" className="sr-only"
                  checked={form.termsAccepted}
                  onChange={e => set('termsAccepted', e.target.checked)} />
                <span className="text-sm text-gray-700">
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer"
                    className="text-[#0C3C4C] underline font-medium"
                    onClick={e => e.stopPropagation()}>
                    General Terms and Conditions
                  </a>{' '}and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer"
                    className="text-[#0C3C4C] underline font-medium"
                    onClick={e => e.stopPropagation()}>
                    Privacy Policy
                  </a>.
                  I confirm that all provided information is accurate and complete.{' '}
                  <span className="text-red-400">*</span>
                </span>
              </label>

              <p className="text-xs text-gray-400 leading-relaxed">
                Data is stored securely and processed in accordance with GDPR (AVG).
                No personal account will be created for the employee.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-5">
          {step > 1 ? (
            <button type="button" onClick={prev}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <button type="button" onClick={onBack}
              className="flex items-center gap-2 px-5 py-3 border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-colors">
              <ChevronLeft size={16} /> Cancel
            </button>
          )}
          <button type="button"
            onClick={step === 5 ? handleSubmit : next}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-[#0C3C4C] text-white py-3 rounded-xl font-medium hover:bg-[#0a2f3b] transition-colors disabled:opacity-50">
            {loading ? 'Submitting...' : step === 5 ? 'Submit Intake' : 'Continue'}
            {!loading && step < 5 && <ChevronRight size={16} />}
          </button>
        </div>
      </main>
    </div>
  );
}

// ─── Intake page header ───────────────────────────────────────────────────────

function IntakeHeader({ onBack }: { onBack: () => void }) {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center gap-3 sticky top-0 z-10">
      <button onClick={onBack}
        className="p-2 text-gray-400 hover:text-[#0C3C4C] transition-colors rounded-lg hover:bg-gray-50">
        <ArrowLeft size={18} />
      </button>
      <div className="w-8 h-8 bg-[#0C3C4C] rounded-xl flex items-center justify-center">
        <UserPlus size={16} className="text-white" />
      </div>
      <span className="font-semibold text-[#0C3C4C] text-lg tracking-tight">
        Expat Housing <span className="text-gray-400 font-normal">| Employee Intake</span>
      </span>
    </header>
  );
}

// ─── Main B2B Portal ──────────────────────────────────────────────────────────

type PortalView = 'dashboard' | 'intake';

export default function B2BPortal() {
  const [view, setView] = useState<PortalView>('dashboard');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/auth';
  };

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    try {
      // ✅ FIX: use getToken() which reads the correct 'session_token' key
      const token = getToken();
      const res = await fetch(`${API_URL}/api/b2b/my-intakes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json() as Employee[];
        setEmployees(data);
      }
    } catch (err) {
      console.error('Could not fetch employees', err);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ── Show intake form ──
  if (view === 'intake') {
    return (
      <EmployeeIntakeForm
        companyName={user?.name ?? 'Your Company'}
        onBack={() => setView('dashboard')}
        onSuccess={() => { fetchEmployees(); setView('dashboard'); }}
      />
    );
  }

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logoEH} alt="EH Logo" className="h-10 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-[#0C3C4C] text-lg tracking-tight">
              EXPAT HOUSING BRAINPORT{' '}
              <span className="text-gray-400 font-normal">| Corporate Portal</span>
            </span>
            <span className="text-xs text-[#84B5A5] font-medium tracking-wide">
              Where international talent finds home
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">{user?.name ?? 'HR Department'}</span>
          <button onClick={() => setShowSettings(true)}
            className="p-2 text-gray-400 hover:text-[#0C3C4C] transition-colors" title="Settings">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Log out">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">Corporate Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your employees' relocation processes.</p>
          </div>
          <button
            onClick={() => setView('intake')}
            className="bg-[#0C3C4C] text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-[#0a2f3b] transition-colors"
          >
            <UserPlus size={18} />
            Add New Employee
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: <Users size={18} />, label: 'Total Employees', value: employees.length },
            {
              icon: <Clock size={18} />,
              label: 'Pending',
              value: employees.filter(e => e.status === 'getekend').length,
            },
            {
              icon: <Check size={18} />,
              label: 'Completed',
              value: employees.filter(e => e.status === 'afgerond').length,
            },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-[#0C3C4C]/8 rounded-xl flex items-center justify-center text-[#0C3C4C]">
                {s.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0C3C4C]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Employee table */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#0C3C4C] mb-6">Active Cases</h3>

          {loadingEmployees ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#0C3C4C] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No employees added yet</p>
              <p className="text-gray-400 text-xs mt-1">Click "Add New Employee" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Email</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Start date</span>
                    </th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {employees.map(emp => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-medium text-gray-900">
                        {emp.first_name} {emp.surname}
                      </td>
                      <td className="py-4 text-gray-500">{emp.email}</td>
                      <td className="py-4 text-gray-600">
                        {emp.profession ?? (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </td>
                      <td className="py-4 text-gray-500 flex items-center gap-1.5">
                        <MapPin size={12} className="text-gray-300 shrink-0" />
                        {emp.desired_starting_date
                          ? new Date(emp.desired_starting_date).toLocaleDateString('en-NL', { day: '2-digit', month: 'short', year: 'numeric' })
                          : <span className="text-gray-300 italic">—</span>}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={emp.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onUpdate={newName => setUser(prev => prev ? { ...prev, name: newName } : null)}
      />
    </div>
  );
}