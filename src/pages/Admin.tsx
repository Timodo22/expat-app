import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users, Calendar as CalendarIcon, FileText, Building2, Plus, FilePlus, LogOut,
  Trash2, CheckCircle2, Clock, Eye, AlertTriangle, X, ChevronLeft, ChevronRight,
  Download, Filter, ArrowUpDown, ChevronDown, ChevronUp, RefreshCw, XCircle, ShieldCheck,
} from 'lucide-react';
import { authClient, API_URL } from '../lib/authClient';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type LeadStatus = 'getekend' | 'goedgekeurd' | 'afgerond';
type LeadSource = 'b2c' | 'b2b';

// ─── SHARED ADMIN LAYOUT ─────────────────────────────────────────────────────
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.location.href = "/auth";
  };

  const navLinkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
      location.pathname === path
        ? 'bg-white/10 text-white font-medium'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex bg-[#F9FAFB]">
      <aside className="w-64 bg-[#0C3C4C] text-white p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-8 h-8 bg-[#84B5A5] rounded-xl flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Expat Housing</span>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/admin" className={navLinkClass('/admin')}><Users size={18} /> Clients & Leads</Link>
          <Link to="/admin/b2b" className={navLinkClass('/admin/b2b')}><Building2 size={18} /> B2B Partners</Link>
          <Link to="/admin/agenda" className={navLinkClass('/admin/agenda')}><CalendarIcon size={18} /> Agenda</Link>
          <Link to="/admin/invoices" className={navLinkClass('/admin/invoices')}><FilePlus size={18} /> Invoices</Link>
          <Link to="/admin/documents" className={navLinkClass('/admin/documents')}><FileText size={18} /> Documents</Link>
        </nav>
        <div className="mt-auto pt-6 border-t border-white/10">
          <div className="flex items-center justify-between px-2 py-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-medium">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="text-sm">
                <p className="font-medium truncate w-24">{user?.name || 'Admin'}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-white/50 hover:text-white transition-colors" title="Uitloggen">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
};

// ─── PDF GENERATOR ────────────────────────────────────────────────────────────
const downloadClientPDF = (client: any) => {
  const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
  const val = (v: any) => (v !== null && v !== undefined && v !== '') ? String(v) : '—';
  const bool = (v: any) => v ? 'Ja' : 'Nee';

  const statusLabels: Record<string, string> = {
    getekend: 'Getekend',
    goedgekeurd: 'Goedgekeurd',
    afgerond: 'Afgerond',
  };
  const statusColors: Record<string, string> = {
    getekend: '#854d0e;background:#fef9c3',
    goedgekeurd: '#166534;background:#dcfce7',
    afgerond: '#1e40af;background:#dbeafe',
  };

  const sigHtml = client.signature_data
    ? `<img src="${client.signature_data}" style="max-width:360px;height:auto;border:1px solid #e5e7eb;border-radius:8px;padding:8px;background:#fff;" />`
    : '<p style="color:#aaa;font-style:italic;margin:0;">Geen handtekening beschikbaar</p>';

  const html = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<title>Klantdossier – ${client.first_name} ${client.surname}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;padding:48px;font-size:13px;line-height:1.65;background:#fff}
.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:3px solid #0C3C4C}
.logo-area h1{font-size:22px;font-weight:700;color:#0C3C4C;letter-spacing:-0.5px}
.logo-area p{color:#84B5A5;font-size:12px;margin-top:2px}
.doc-meta{text-align:right;font-size:12px;color:#666}
.doc-meta .doc-id{font-weight:700;color:#0C3C4C;font-size:14px}
.badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;margin-top:6px}
h2{font-size:13px;font-weight:700;color:#0C3C4C;background:#f0f7f5;padding:7px 12px;border-left:4px solid #84B5A5;margin:28px 0 14px;border-radius:0 6px 6px 0}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px 28px;margin-bottom:4px}
.field .lbl{font-size:10px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.6px}
.field .val{color:#1a1a1a;font-size:13px;margin-top:2px;word-break:break-word}
.terms-bar{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;margin-bottom:14px}
.check-circle{width:22px;height:22px;background:#22c55e;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:bold;flex-shrink:0;line-height:1}
.sig-box{border:2px solid #e5e7eb;border-radius:10px;padding:16px;background:#fafafa}
.sig-label{font-size:10px;color:#888;font-weight:700;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px}
.footer{margin-top:40px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:11px;color:#aaa;display:flex;justify-content:space-between}
.full{grid-column:1/-1}
@media print{body{padding:24px}.no-print{display:none}}
</style>
</head>
<body>
<div class="header">
  <div class="logo-area">
    <h1>Expat Housing</h1>
    <p>Klantdossier / Client File</p>
  </div>
  <div class="doc-meta">
    <div class="doc-id">#${(client.id || '').slice(0, 8).toUpperCase()}</div>
    <div>Ingediend: ${fmtDate(client.created_at)}</div>
    <div>Gedownload: ${new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
    <div>Bron: <strong style="text-transform:uppercase">${val(client.source)}${client.b2b_company_name ? ` — ${client.b2b_company_name}` : ''}</strong></div>
    <span class="badge" style="color:${statusColors[client.status] || statusColors.getekend}">
      ${statusLabels[client.status] || 'Getekend'}
    </span>
  </div>
</div>
<h2>Persoonlijke Gegevens</h2>
<div class="grid">
  <div class="field"><div class="lbl">Voornaam</div><div class="val">${val(client.first_name)}</div></div>
  <div class="field"><div class="lbl">Achternaam</div><div class="val">${val(client.surname)}</div></div>
  <div class="field"><div class="lbl">Geboortedatum</div><div class="val">${val(client.date_of_birth)}</div></div>
  <div class="field"><div class="lbl">Nationaliteit</div><div class="val">${val(client.nationality)}</div></div>
  <div class="field"><div class="lbl">Paspoort / ID</div><div class="val">${val(client.passport_number)}</div></div>
  <div class="field"><div class="lbl">Telefoonnummer</div><div class="val">${val(client.phone_number)}</div></div>
  <div class="field full"><div class="lbl">E-mailadres</div><div class="val">${val(client.email)}</div></div>
  <div class="field full"><div class="lbl">Huidig Adres</div><div class="val">${val(client.current_address)}</div></div>
</div>
<h2>Woningwensen</h2>
<div class="grid">
  <div class="field"><div class="lbl">Gewenste Startdatum</div><div class="val">${val(client.desired_starting_date)}</div></div>
  <div class="field"><div class="lbl">Huurperiode</div><div class="val">${val(client.rental_period)}</div></div>
  <div class="field"><div class="lbl">Gewenst Gebied</div><div class="val">${val(client.desired_area)}</div></div>
  <div class="field"><div class="lbl">Max. Budget (excl.)</div><div class="val">€${val(client.max_budget_excl)}/mnd</div></div>
  <div class="field"><div class="lbl">Slaapkamers</div><div class="val">${val(client.num_bedrooms)}</div></div>
  <div class="field"><div class="lbl">Type Woning</div><div class="val">${val(client.property_type)}</div></div>
  <div class="field"><div class="lbl">Gemeubileerd</div><div class="val">${bool(client.furnished)}</div></div>
  <div class="field"><div class="lbl">Parkeerplaats</div><div class="val">${bool(client.parking_facility)}</div></div>
  <div class="field"><div class="lbl">Huisdieren</div><div class="val">${bool(client.has_pets)}</div></div>
  <div class="field"><div class="lbl">Gezinssamenstelling</div><div class="val">${val(client.family_composition)}</div></div>
  <div class="field"><div class="lbl">Gewenste m²</div><div class="val">${val(client.desired_m2)}</div></div>
  <div class="field"><div class="lbl">Minimale m²</div><div class="val">${val(client.minimal_m2)}</div></div>
  <div class="field full"><div class="lbl">Bezichtigingsvoorkeur</div><div class="val">${val(client.viewing_preference)}</div></div>
</div>
<h2>Werkstatus</h2>
<div class="grid">
  <div class="field"><div class="lbl">Werkstatus</div><div class="val">${val(client.work_status)}</div></div>
  <div class="field"><div class="lbl">Werkgever</div><div class="val">${val(client.employer)}</div></div>
  <div class="field"><div class="lbl">Functie / Beroep</div><div class="val">${val(client.profession)}</div></div>
  <div class="field"><div class="lbl">Bruto Inkomen/mnd</div><div class="val">${client.gross_income_monthly ? '€' + client.gross_income_monthly : '—'}</div></div>
  <div class="field"><div class="lbl">Contractduur</div><div class="val">${val(client.contract_duration)}</div></div>
  <div class="field"><div class="lbl">30% Ruling</div><div class="val">${bool(client.has_30_ruling)}</div></div>
  ${client.company_name ? `<div class="field"><div class="lbl">Bedrijfsnaam</div><div class="val">${val(client.company_name)}</div></div>` : ''}
  ${client.company_website ? `<div class="field"><div class="lbl">Website</div><div class="val">${val(client.company_website)}</div></div>` : ''}
</div>
${client.has_partner ? `
<h2>Partner</h2>
<div class="grid">
  <div class="field"><div class="lbl">Voornaam</div><div class="val">${val(client.partner_first_name)}</div></div>
  <div class="field"><div class="lbl">Achternaam</div><div class="val">${val(client.partner_surname)}</div></div>
  <div class="field"><div class="lbl">Nationaliteit</div><div class="val">${val(client.partner_nationality)}</div></div>
  <div class="field"><div class="lbl">E-mail</div><div class="val">${val(client.partner_email)}</div></div>
  <div class="field"><div class="lbl">Werkstatus</div><div class="val">${val(client.partner_work_status)}</div></div>
  <div class="field"><div class="lbl">Bruto Inkomen/mnd</div><div class="val">${client.partner_gross_income ? '€' + client.partner_gross_income : '—'}</div></div>
</div>` : ''}
${client.is_student ? `
<h2>Borg / Garantsteller</h2>
<div class="grid">
  <div class="field"><div class="lbl">Voornaam</div><div class="val">${val(client.guarantor_first_name)}</div></div>
  <div class="field"><div class="lbl">Achternaam</div><div class="val">${val(client.guarantor_surname)}</div></div>
  <div class="field"><div class="lbl">E-mail</div><div class="val">${val(client.guarantor_email)}</div></div>
  <div class="field"><div class="lbl">Telefoon</div><div class="val">${val(client.guarantor_phone)}</div></div>
  <div class="field full"><div class="lbl">Adres</div><div class="val">${val(client.guarantor_address)}</div></div>
</div>` : ''}
<h2>Akkoordverklaring &amp; Handtekening</h2>
<div class="terms-bar">
  <div class="check-circle">&#10003;</div>
  <div>
    <strong>Algemene Voorwaarden &amp; Privacybeleid geaccepteerd</strong><br>
    <span style="color:#555;font-size:12px">
      Datum: <strong>${fmtDate(client.terms_accepted_at)}</strong>
      &nbsp;&nbsp;·&nbsp;&nbsp;
      Tijdstip: <strong>${client.terms_accepted_at ? new Date(client.terms_accepted_at).toLocaleTimeString('nl-NL') : '—'}</strong>
      ${client.submission_ip ? `&nbsp;&nbsp;·&nbsp;&nbsp; IP-adres: <strong>${client.submission_ip}</strong>` : ''}
      &nbsp;&nbsp;·&nbsp;&nbsp;
      Handtekening: <strong>Aanwezig</strong>
    </span>
  </div>
</div>
<div class="sig-box">
  <div class="sig-label">Handtekening klant</div>
  ${sigHtml}
</div>
<div class="footer">
  <span>Expat Housing — Vertrouwelijk klantdossier — Niet openbaar</span>
  <span>Gegenereerd op ${new Date().toLocaleString('nl-NL')}</span>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 600);
  }
};

// ─── STATUS / SOURCE HELPERS ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  getekend:    { label: 'Getekend',    classes: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  goedgekeurd: { label: 'Goedgekeurd', classes: 'bg-green-50 text-green-800 border-green-200'   },
  afgerond:    { label: 'Afgerond',    classes: 'bg-blue-50 text-blue-800 border-blue-200'       },
};

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.getekend;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
      {cfg.label}
    </span>
  );
};

// Source badge — shows "B2B: Company Name" when available
const SourceBadge = ({ source, companyName }: { source: string; companyName?: string }) => {
  if (source === 'b2b') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-purple-50 text-purple-800">
        <Building2 size={10} />
        B2B{companyName ? `: ${companyName}` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-sky-50 text-sky-800">
      B2C
    </span>
  );
};

// ─── MODALS ───────────────────────────────────────────────────────────────────
const DeleteModal = ({ title, name, onConfirm, onCancel, loading }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title || 'Verwijderen?'}</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Weet je zeker dat je <span className="font-medium text-gray-800">{name}</span> wilt verwijderen?
          </p>
        </div>
      </div>
      <div className="flex gap-3 mt-6">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Annuleren</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors disabled:opacity-60">
          {loading ? 'Verwijderen…' : 'Verwijder'}
        </button>
      </div>
    </div>
  </div>
);

const ViewingModal = ({ viewing, clients, onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    client_id:    viewing?.client_id    || '',
    address:      viewing?.address      || '',
    viewing_date: viewing?.viewing_date || '',
    start_time:   viewing?.start_time   || '',
    end_time:     viewing?.end_time     || '',
    employees:    viewing?.employees    ? viewing.employees.split(',') : [],
    notes:        viewing?.notes        || '',
    makelaar:     viewing?.makelaar     || '',
  });

  const toggleEmployee = (emp: string) => {
    setFormData((prev: any) => ({
      ...prev,
      employees: prev.employees.includes(emp)
        ? prev.employees.filter((e: string) => e !== emp)
        : [...prev.employees, emp],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, employees: formData.employees.join(',') });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0C3C4C]">{viewing ? 'Viewing bewerken' : 'Nieuwe Viewing'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select required value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]">
              <option value="">Selecteer een client…</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} {c.surname}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <input required type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Makelaar</label>
            <input type="text" placeholder="Naam van de makelaar" value={formData.makelaar} onChange={e => setFormData({ ...formData, makelaar: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <input required type="date" value={formData.viewing_date} onChange={e => setFormData({ ...formData, viewing_date: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Van</label>
              <input required type="time" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tot</label>
              <input required type="time" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Medewerkers</label>
            <div className="flex gap-4">
              {['Timo', 'Floor'].map(emp => (
                <label key={emp} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formData.employees.includes(emp)} onChange={() => toggleEmployee(emp)} className="rounded text-[#0C3C4C] focus:ring-[#0C3C4C]" />
                  <span className="text-sm">{emp}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notities</label>
            <textarea
              rows={3}
              placeholder="Interne notities voor deze viewing…"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5] resize-none text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-[#0C3C4C] hover:bg-[#0a3040] text-white py-3 rounded-xl font-medium mt-2">Opslaan</button>
        </form>
      </div>
    </div>
  );
};

const ClientModal = ({ client, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(client);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(formData);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#0C3C4C]">Client Details: {client.first_name} {client.surname}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Bron</label>
            <select
              name="source"
              value={formData.source || 'b2c'}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#84B5A5]"
            >
              <option value="b2c">B2C</option>
              <option value="b2b">B2B</option>
            </select>
          </div>
          {Object.entries(formData).map(([key, value]: any) => {
            if (['id', 'user_id', 'created_at', 'signature_data', 'email_verified', 'status', 'source', 'status_updated_at', 'b2b_company_name'].includes(key)) return null;
            return (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-500 capitalize mb-1">{key.replace(/_/g, ' ')}</label>
                <input
                  type="text"
                  name={key}
                  value={value || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg p-2 text-sm outline-none focus:border-[#84B5A5]"
                />
              </div>
            );
          })}
        </div>
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-white">Sluiten</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-xl bg-[#0C3C4C] text-white text-sm font-medium hover:bg-[#0a3040]">
            {saving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── EXPORT 1: ADMIN DASHBOARD (CLIENTS) ─────────────────────────────────────
export default function AdminDashboard() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; userId: string; name: string } | null>(null);
  const [viewClient, setViewClient] = useState<any | null>(null);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const token = localStorage.getItem('authToken');

  const fetchClients = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin/intake`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setForms(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, []);

  const displayedForms = forms
    .filter(f => statusFilter === 'all' || (f.status || 'getekend') === statusFilter)
    .filter(f => sourceFilter === 'all' || (f.source || 'b2c') === sourceFilter)
    .sort((a, b) => {
      const dA = new Date(a.created_at).getTime();
      const dB = new Date(b.created_at).getTime();
      return sortOrder === 'newest' ? dB - dA : dA - dB;
    });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${deleteTarget.userId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setForms(prev => prev.filter(f => f.id !== deleteTarget.id));
    } finally {
      setDeleteLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleSaveClient = async (updatedData: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/intake/${updatedData.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) { setViewClient(null); fetchClients(); }
      else alert('Fout bij opslaan');
    } catch { alert('Netwerkfout'); }
  };

  const handleSaveViewing = async (data: any) => {
    try {
      await fetch(`${API_URL}/api/admin/viewings`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setShowViewingModal(false);
    } catch { alert('Netwerkfout bij opslaan viewing'); }
  };

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    if (newStatus === 'afgerond') {
      const ok = window.confirm('Let op: dit dossier wordt na 3 dagen automatisch verwijderd. Weet je zeker dat je de status op Afgerond zet?');
      if (!ok) return;
    }
    try {
      await fetch(`${API_URL}/api/admin/intake/${clientId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setForms(prev => prev.map(f =>
        f.id === clientId ? { ...f, status: newStatus, status_updated_at: new Date().toISOString() } : f
      ));
    } catch { alert('Fout bij updaten status'); }
  };

  const total       = forms.length;
  const getekend    = forms.filter(f => (f.status || 'getekend') === 'getekend').length;
  const goedgekeurd = forms.filter(f => f.status === 'goedgekeurd').length;
  const afgerond    = forms.filter(f => f.status === 'afgerond').length;
  const b2bCount    = forms.filter(f => f.source === 'b2b').length;

  return (
    <AdminLayout>
      {deleteTarget && (
        <DeleteModal title="Client verwijderen?" name={deleteTarget.name}
          onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />
      )}
      {viewClient && (
        <ClientModal client={viewClient} onClose={() => setViewClient(null)} onSave={handleSaveClient} />
      )}
      {showViewingModal && (
        <ViewingModal clients={forms} onClose={() => setShowViewingModal(false)} onSave={handleSaveViewing} />
      )}

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">Clients & Leads</h1>
          <p className="text-gray-500 mt-1">Overzicht van alle ingediende intakeformulieren.</p>
        </div>
        <button
          onClick={() => setShowViewingModal(true)}
          className="flex items-center gap-2 bg-[#0C3C4C] hover:bg-[#0a3040] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> New Viewing
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Totaal', value: total, color: 'text-[#0C3C4C]' },
          { label: 'Getekend', value: getekend, color: 'text-yellow-600' },
          { label: 'Goedgekeurd', value: goedgekeurd, color: 'text-green-600' },
          { label: 'Afgerond', value: afgerond, color: 'text-blue-600' },
          { label: 'B2B', value: b2bCount, color: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4 flex flex-wrap items-center gap-3">
        <Filter size={16} className="text-gray-400 shrink-0" />
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
          {[
            { key: 'all', label: 'Alle statussen' },
            { key: 'getekend', label: 'Getekend' },
            { key: 'goedgekeurd', label: 'Goedgekeurd' },
            { key: 'afgerond', label: 'Afgerond' },
          ].map(opt => (
            <button key={opt.key} onClick={() => setStatusFilter(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === opt.key ? 'bg-white text-[#0C3C4C] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl">
          {[
            { key: 'all', label: 'Alle bronnen' },
            { key: 'b2c', label: 'B2C' },
            { key: 'b2b', label: 'B2B' },
          ].map(opt => (
            <button key={opt.key} onClick={() => setSourceFilter(opt.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sourceFilter === opt.key ? 'bg-white text-[#0C3C4C] shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>
              {opt.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortOrder(s => s === 'newest' ? 'oldest' : 'newest')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-medium text-gray-600 transition-colors ml-auto"
        >
          <ArrowUpDown size={13} />
          {sortOrder === 'newest' ? 'Nieuwste eerst' : 'Oudste eerst'}
        </button>
        <span className="text-xs text-gray-400 font-medium">{displayedForms.length} resultaten</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 bg-gray-50/60 uppercase tracking-wide">
                <th className="px-6 py-4 font-medium">Naam</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Bron</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Acties</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Laden…</td></tr>
              ) : displayedForms.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Geen clients gevonden.</td></tr>
              ) : (
                displayedForms.map(form => {
                  const status = form.status || 'getekend';
                  const source = form.source || 'b2c';
                  return (
                    <tr key={form.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">{form.first_name} {form.surname}</td>
                      <td className="px-6 py-4 text-gray-600">{form.email}</td>
                      <td className="px-6 py-4">
                        <SourceBadge source={source} companyName={form.b2b_company_name} />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={status}
                          onChange={e => handleStatusChange(form.id, e.target.value)}
                          className={`text-xs font-medium px-2.5 py-1.5 rounded-full border outline-none cursor-pointer transition-colors ${
                            STATUS_CONFIG[status]?.classes || STATUS_CONFIG.getekend.classes
                          }`}
                        >
                          <option value="getekend">Getekend</option>
                          <option value="goedgekeurd">Goedgekeurd</option>
                          <option value="afgerond">Afgerond ⚠</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setViewClient(form)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Bekijk / Bewerk">
                            <Eye size={16} />
                          </button>
                          <button onClick={() => downloadClientPDF(form)}
                            className="p-2 rounded-lg text-gray-400 hover:text-[#0C3C4C] hover:bg-[#0C3C4C]/5 transition-colors" title="Download PDF dossier">
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: form.id, userId: form.user_id, name: `${form.first_name} ${form.surname}` })}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Verwijder">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// ─── EXPORT 2: B2B PARTNERS ───────────────────────────────────────────────────
export const AdminB2BPartners = () => {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const token = localStorage.getItem('authToken');

  useEffect(() => {
    fetch(`${API_URL}/api/admin/intake`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setForms(data); })
      .finally(() => setLoading(false));
  }, []);

  // Group B2B intakes by user_id → one card per company
  const b2bForms = forms.filter(f => f.source === 'b2b');

  const companies = Object.values(
    b2bForms.reduce((acc: Record<string, any>, form) => {
      const key = form.user_id;
      if (!acc[key]) {
        acc[key] = {
          userId: key,
          companyName: form.b2b_company_name || 'Onbekend bedrijf',
          employees: [],
        };
      }
      acc[key].employees.push(form);
      return acc;
    }, {})
  ) as { userId: string; companyName: string; employees: any[] }[];

  companies.sort((a, b) => a.companyName.localeCompare(b.companyName));

  const toggle = (userId: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  };

  return (
    <AdminLayout>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">B2B Partners</h1>
          <p className="text-gray-500 mt-1">Overzicht van alle bedrijven en hun medewerkers.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-purple-50 border border-purple-100 rounded-xl">
          <Building2 size={16} className="text-purple-600" />
          <span className="text-sm font-semibold text-purple-700">{companies.length} bedrijven</span>
          <span className="text-purple-300">·</span>
          <span className="text-sm text-purple-600">{b2bForms.length} medewerkers</span>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#0C3C4C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">Nog geen B2B partners</p>
          <p className="text-sm text-gray-400 mt-1">B2B intakes verschijnen hier zodra ze zijn ingediend.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {companies.map(company => {
            const isOpen = expanded.has(company.userId);
            const pending   = company.employees.filter((e: any) => e.status === 'getekend').length;
            const approved  = company.employees.filter((e: any) => e.status === 'goedgekeurd').length;
            const completed = company.employees.filter((e: any) => e.status === 'afgerond').length;

            return (
              <div key={company.userId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Company header row */}
                <button
                  onClick={() => toggle(company.userId)}
                  className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0C3C4C] text-base">{company.companyName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{company.employees.length} medewerker{company.employees.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Mini stat pills */}
                    {pending > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-100">
                        <Clock size={11} /> {pending} getekend
                      </span>
                    )}
                    {approved > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
                        <CheckCircle2 size={11} /> {approved} goedgekeurd
                      </span>
                    )}
                    {completed > 0 && (
                      <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                        {completed} afgerond
                      </span>
                    )}
                    <div className="ml-2 text-gray-400">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>
                </button>

                {/* Employee table (expandable) */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="bg-gray-50/60 text-xs text-gray-400 uppercase tracking-wide">
                          <th className="px-6 py-3 font-medium">Naam</th>
                          <th className="px-6 py-3 font-medium">Email</th>
                          <th className="px-6 py-3 font-medium">Functie</th>
                          <th className="px-6 py-3 font-medium">Startdatum</th>
                          <th className="px-6 py-3 font-medium">Status</th>
                          <th className="px-6 py-3 font-medium">Ingediend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {company.employees
                          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((emp: any) => (
                            <tr key={emp.id} className="hover:bg-gray-50/40 transition-colors">
                              <td className="px-6 py-3.5 font-medium text-gray-900">
                                {emp.first_name} {emp.surname}
                              </td>
                              <td className="px-6 py-3.5 text-gray-500">{emp.email}</td>
                              <td className="px-6 py-3.5 text-gray-600">
                                {emp.profession || <span className="text-gray-300 italic">—</span>}
                              </td>
                              <td className="px-6 py-3.5 text-gray-500">
                                {emp.desired_starting_date
                                  ? new Date(emp.desired_starting_date).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' })
                                  : <span className="text-gray-300 italic">—</span>}
                              </td>
                              <td className="px-6 py-3.5">
                                <StatusBadge status={emp.status || 'getekend'} />
                              </td>
                              <td className="px-6 py-3.5 text-gray-400 text-xs">
                                {new Date(emp.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

// ─── EXPORT 3: ADMIN AGENDA ───────────────────────────────────────────────────
export const AdminAgenda = () => {
  const [viewings, setViewings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editViewing, setEditViewing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const token = localStorage.getItem('authToken');

  const fetchData = () => {
    fetch(`${API_URL}/api/admin/viewings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => { if (Array.isArray(data)) setViewings(data); });
    fetch(`${API_URL}/api/admin/intake`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => { if (Array.isArray(data)) setClients(data); });
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (data: any) => {
    const isEdit = !!editViewing;
    const url = isEdit ? `${API_URL}/api/admin/viewings/${editViewing.id}` : `${API_URL}/api/admin/viewings`;
    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    setEditViewing(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`${API_URL}/api/admin/viewings/${deleteId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    setDeleteId(null);
    fetchData();
  };

  const startHour = 8;
  const endHour = 20;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const hourHeight = 60;

  const getWeekDays = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      return next;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const prevWeek = () => setCurrentDate(new Date(new Date(currentDate).setDate(currentDate.getDate() - 7)));
  const nextWeek = () => setCurrentDate(new Date(new Date(currentDate).setDate(currentDate.getDate() + 7)));
  const goToday  = () => setCurrentDate(new Date());

  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const getBlockStyle = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const top    = (sH - startHour) * hourHeight + (sM / 60) * hourHeight;
    const height = (eH - sH) * hourHeight + ((eM - sM) / 60) * hourHeight;
    return { top: `${top}px`, height: `${Math.max(height, 28)}px` };
  };

  return (
    <AdminLayout>
      {showModal && (
        <ViewingModal
          viewing={editViewing}
          clients={clients}
          onClose={() => { setShowModal(false); setEditViewing(null); }}
          onSave={handleSave}
        />
      )}
      {deleteId && (
        <DeleteModal title="Viewing verwijderen?" name="deze viewing"
          onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={false} />
      )}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">Agenda</h1>
          <p className="text-gray-500 mt-1">Beheer alle geplande viewings.</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="bg-[#0C3C4C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-[#0a3040] shadow-sm">
          <Plus size={18} /> Nieuwe Viewing
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronLeft size={20} /></button>
            <button onClick={goToday} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg">Vandaag</button>
            <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"><ChevronRight size={20} /></button>
          </div>
          <h2 className="text-lg font-semibold text-[#0C3C4C]">
            {weekDays[0].toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
          </h2>
        </div>

        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <div className="w-16 shrink-0 border-r border-gray-100"></div>
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, i) => {
              const isToday = formatYMD(day) === formatYMD(new Date());
              return (
                <div key={i} className="py-3 text-center border-r border-gray-100 last:border-0">
                  <div className="text-xs font-medium text-gray-500 uppercase">{dayNames[i]}</div>
                  <div className={`mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-lg font-semibold ${
                    isToday ? 'bg-[#0C3C4C] text-white' : 'text-gray-900'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex overflow-y-auto" style={{ height: '600px' }}>
          <div className="w-16 shrink-0 border-r border-gray-100 relative bg-white">
            {hours.map(hour => (
              <div key={hour} className="text-right pr-2 text-xs font-medium text-gray-400"
                style={{ height: `${hourHeight}px`, transform: 'translateY(-6px)' }}>
                {hour}:00
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 relative bg-white">
            <div className="absolute inset-0 pointer-events-none">
              {hours.map(hour => (
                <div key={hour} className="border-b border-gray-100" style={{ height: `${hourHeight}px` }}></div>
              ))}
            </div>

            {weekDays.map((day, i) => {
              const dayStr = formatYMD(day);
              const dayViewings = viewings.filter(v => v.viewing_date === dayStr);
              return (
                <div key={i} className="relative border-r border-gray-100 last:border-0">
                  {dayViewings.map(v => {
                    const style = getBlockStyle(v.start_time, v.end_time);
                    return (
                      <div key={v.id}
                        className="absolute left-1 right-1 bg-[#84B5A5]/20 border border-[#84B5A5] rounded-lg p-1.5 overflow-hidden cursor-pointer hover:bg-[#84B5A5]/30 transition-colors group"
                        style={style}
                        onClick={() => { setEditViewing(v); setShowModal(true); }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-xs text-[#0C3C4C] leading-tight truncate">
                            {v.start_time} – {v.first_name}
                          </div>
                          <button onClick={e => { e.stopPropagation(); setDeleteId(v.id); }}
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded">
                            <Trash2 size={11} />
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-700 mt-0.5 truncate">{v.address}</div>
                        {v.makelaar && <div className="text-[10px] text-[#0C3C4C]/70 mt-0.5 truncate font-medium">{v.makelaar}</div>}
                        <div className="text-[10px] text-gray-500 mt-0.5 truncate">{v.employees?.split(',').join(', ')}</div>
                        {v.notes && <div className="text-[10px] text-gray-400 mt-0.5 truncate italic">{v.notes}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

// ─── EXPORT 5: ADMIN DOCUMENTS ────────────────────────────────────────────────
export const AdminDocuments = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [rejectModal, setRejectModal] = useState<{ id: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const token = localStorage.getItem('authToken');

  const DOC_TYPE_LABELS: Record<string, string> = {
    passport_id_card: 'Passport / ID Card',
    recent_payslip: 'Recent Payslip',
    employment_contract: 'Employment Contract',
  };

  const STATUS_CFG: Record<string, { label: string; classes: string; dot: string }> = {
    pending:  { label: 'In behandeling', classes: 'bg-amber-50 text-amber-800 border-amber-200',  dot: 'bg-amber-400' },
    approved: { label: 'Goedgekeurd',    classes: 'bg-green-50 text-green-800 border-green-200',  dot: 'bg-green-500' },
    rejected: { label: 'Afgekeurd',      classes: 'bg-red-50 text-red-800 border-red-200',        dot: 'bg-red-400' },
  };

  const fetchDocs = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin/documents`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setDocuments(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleApprove = async (docId: string) => {
    setActionLoading(docId);
    try {
      await fetch(`${API_URL}/api/admin/documents/${docId}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      fetchDocs();
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(rejectModal.id);
    try {
      await fetch(`${API_URL}/api/admin/documents/${rejectModal.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejection_reason: rejectReason.trim() }),
      });
      setRejectModal(null);
      setRejectReason('');
      fetchDocs();
    } finally {
      setActionLoading(null);
    }
  };

  const openFile = (docId: string) => {
    const w = window.open(`${API_URL}/api/admin/documents/${docId}/file`, '_blank');
    // Voeg token toe als query param is niet veilig; gebruik fetch + blob voor preview:
    fetch(`${API_URL}/api/admin/documents/${docId}/file`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        if (w) { w.location.href = url; }
        else { window.open(url, '_blank'); }
      });
  };

  const displayed = documents.filter(d => filter === 'all' || d.status === filter);

  // Groepeer per klant voor overzicht
  const grouped = displayed.reduce((acc: Record<string, any>, doc) => {
    const key = doc.user_id;
    if (!acc[key]) {
      acc[key] = {
        clientName: doc.first_name && doc.surname
          ? `${doc.first_name} ${doc.surname}`
          : doc.client_email || 'Onbekend',
        email: doc.client_email,
        intakeStatus: doc.intake_status,
        docs: [],
      };
    }
    acc[key].docs.push(doc);
    return acc;
  }, {});

  const pending   = documents.filter(d => d.status === 'pending').length;
  const approved  = documents.filter(d => d.status === 'approved').length;
  const rejected  = documents.filter(d => d.status === 'rejected').length;

  return (
    <AdminLayout>
      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center shrink-0">
                <XCircle size={20} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Document afkeuren</h3>
                <p className="text-sm text-gray-500">{rejectModal.name}</p>
              </div>
            </div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reden van afkeuring <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-red-300 resize-none"
              placeholder="bijv. Paspoort verlopen, handtekening ontbreekt…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectModal(null); setRejectReason(''); }}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
              >
                Annuleren
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || !!actionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? 'Bezig…' : 'Afkeuren'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">Documents</h1>
          <p className="text-gray-500 mt-1">Beoordeel geüploade documenten per klant.</p>
        </div>
        <button onClick={fetchDocs} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
          <RefreshCw size={15} /> Vernieuwen
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'In behandeling', value: pending,  color: 'text-amber-600' },
          { label: 'Goedgekeurd',    value: approved, color: 'text-green-600' },
          { label: 'Afgekeurd',      value: rejected, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6 bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f ? 'bg-[#0C3C4C] text-white' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {f === 'all' ? 'Alle' : STATUS_CFG[f]?.label}
          </button>
        ))}
      </div>

      {/* Documenten per klant */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#0C3C4C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-gray-400" />
          </div>
          <p className="font-medium text-gray-600">Geen documenten gevonden</p>
          <p className="text-sm text-gray-400 mt-1">Documenten verschijnen hier zodra klanten deze uploaden.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([userId, group]: any) => {
            const allGroupApproved = group.docs.length === 3 && group.docs.every((d: any) => d.status === 'approved');
            const hasRejected = group.docs.some((d: any) => d.status === 'rejected');

            return (
              <div key={userId} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Klant header */}
                <div className={`px-6 py-4 border-b border-gray-100 flex items-center justify-between ${
                  allGroupApproved ? 'bg-green-50/50' : hasRejected ? 'bg-red-50/30' : ''
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0C3C4C]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#0C3C4C] font-semibold text-sm">
                        {group.clientName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#0C3C4C]">{group.clientName}</p>
                      <p className="text-xs text-gray-400">{group.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {allGroupApproved && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 size={12} /> Alle docs goedgekeurd
                      </span>
                    )}
                    {group.intakeStatus && (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        STATUS_CFG[group.intakeStatus as string]?.classes || 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        Intake: {group.intakeStatus}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{group.docs.length}/3 documenten</span>
                  </div>
                </div>

                {/* Document rijen */}
                <div className="divide-y divide-gray-50">
                  {group.docs.map((doc: any) => {
                    const cfg = STATUS_CFG[doc.status] || STATUS_CFG.pending;
                    const isActing = actionLoading === doc.id;
                    return (
                      <div key={doc.id} className="px-6 py-4 flex items-center gap-4">
                        {/* Type label */}
                        <div className="w-48 shrink-0">
                          <p className="text-sm font-medium text-gray-900">
                            {DOC_TYPE_LABELS[doc.document_type] || doc.document_type}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{doc.original_name}</p>
                        </div>

                        {/* Upload datum */}
                        <div className="hidden md:block w-32 shrink-0">
                          <p className="text-xs text-gray-500">
                            {new Date(doc.uploaded_at).toLocaleDateString('nl-NL', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Status */}
                        <div className="flex-1">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.classes}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                          {doc.status === 'rejected' && doc.rejection_reason && (
                            <p className="mt-1 text-xs text-red-600 italic">{doc.rejection_reason}</p>
                          )}
                        </div>

                        {/* Acties */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Preview */}
                          <button
                            onClick={() => openFile(doc.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 transition-colors"
                          >
                            Bekijken
                          </button>

                          {/* Goedkeuren */}
                          {doc.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(doc.id)}
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50"
                            >
                              {isActing ? '…' : 'Goedkeuren'}
                            </button>
                          )}

                          {/* Afkeuren */}
                          {doc.status !== 'rejected' && (
                            <button
                              onClick={() => setRejectModal({
                                id: doc.id,
                                name: `${group.clientName} — ${DOC_TYPE_LABELS[doc.document_type] || doc.document_type}`
                              })}
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors disabled:opacity-50"
                            >
                              Afkeuren
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

// ─── EXPORT 4: ADMIN INVOICES ─────────────────────────────────────────────────
export const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/invoices`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setInvoices(data); })
      .catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">Invoice Tool</h1>
          <p className="text-gray-500 mt-1">Create and manage invoices.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 bg-gray-50/60 uppercase">
              <th className="px-6 py-4 font-medium">Invoice ID</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-gray-50">
            {invoices.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-10 text-center text-gray-400">No invoices generated yet.</td></tr>
            ) : (
              invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-medium text-gray-900">{inv.id}</td>
                  <td className="px-6 py-4 text-gray-600 capitalize">{inv.type?.replace('_', ' ')}</td>
                  <td className="px-6 py-4 font-medium">€{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 capitalize">
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
};