import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, FileText, Building2, Plus, FilePlus, LogOut, Trash2, CheckCircle2, Clock, Eye, AlertTriangle, X, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { authClient, API_URL } from '../lib/authClient';

// --- SHARED ADMIN LAYOUT ---
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    window.location.href = "/auth";
  };

  const navLinkClass = (path: string) => `flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
    location.pathname === path ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'
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
      <main className="flex-1 p-10 overflow-auto">
        {children}
      </main>
    </div>
  );
};

// --- MODALS ---
const DeleteModal = ({ title, name, onConfirm, onCancel, loading }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} className="text-red-500" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{title || "Verwijderen?"}</h3>
          <p className="text-sm text-gray-500 mt-0.5">Weet je zeker dat je <span className="font-medium text-gray-800">{name}</span> wilt verwijderen?</p>
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
    client_id: viewing?.client_id || '',
    address: viewing?.address || '',
    viewing_date: viewing?.viewing_date || '',
    start_time: viewing?.start_time || '',
    end_time: viewing?.end_time || '',
    employees: viewing?.employees ? viewing.employees.split(',') : []
  });

  const toggleEmployee = (emp: string) => {
    setFormData((prev: any) => ({
      ...prev,
      employees: prev.employees.includes(emp) 
        ? prev.employees.filter((e: string) => e !== emp)
        : [...prev.employees, emp]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, employees: formData.employees.join(',') });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0C3C4C]">{viewing ? 'Viewing bewerken' : 'Nieuwe Viewing'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select required value={formData.client_id} onChange={e => setFormData({...formData, client_id: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]">
              <option value="">Selecteer een client...</option>
              {clients.map((c: any) => <option key={c.id} value={c.id}>{c.first_name} {c.surname}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
            <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
            <input required type="date" value={formData.viewing_date} onChange={e => setFormData({...formData, viewing_date: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Van</label>
              <input required type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tot</label>
              <input required type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full border border-gray-200 rounded-xl p-2.5 outline-none focus:border-[#84B5A5]" />
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
          <button type="submit" className="w-full bg-[#0C3C4C] hover:bg-[#0a3040] text-white py-3 rounded-xl font-medium mt-4">Opslaan</button>
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
          {Object.entries(formData).map(([key, value]: any) => {
            if (['id', 'user_id', 'created_at', 'signature_data', 'email_verified'].includes(key)) return null;
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


// --- EXPORT 1: ADMIN DASHBOARD (CLIENTS) ---
export default function AdminDashboard() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; userId: string; name: string } | null>(null);
  const [viewClient, setViewClient] = useState<any | null>(null);
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const token = localStorage.getItem('authToken');

  const fetchClients = () => {
    fetch(`${API_URL}/api/admin/intake`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setForms(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${deleteTarget.userId}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setForms(prev => prev.filter(f => f.id !== deleteTarget.id));
    } finally {
      setDeleteLoading(false); setDeleteTarget(null);
    }
  };

  const handleSaveClient = async (updatedData: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/intake/${updatedData.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) { setViewClient(null); fetchClients(); }
      else alert("Fout bij opslaan");
    } catch { alert("Netwerkfout"); }
  };

  const handleSaveViewing = async (data: any) => {
    try {
      await fetch(`${API_URL}/api/admin/viewings`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      setShowViewingModal(false);
    } catch { alert("Netwerkfout bij opslaan viewing"); }
  };

  return (
    <AdminLayout>
      {deleteTarget && <DeleteModal title="Client verwijderen?" name={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
      {viewClient && <ClientModal client={viewClient} onClose={() => setViewClient(null)} onSave={handleSaveClient} />}
      {showViewingModal && <ViewingModal clients={forms} onClose={() => setShowViewingModal(false)} onSave={handleSaveViewing} />}

      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">Clients & Leads</h1>
          <p className="text-gray-500 mt-1">All submitted intake forms and registered users.</p>
        </div>
        <button onClick={() => setShowViewingModal(true)} className="flex items-center gap-2 bg-[#0C3C4C] hover:bg-[#0a3040] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus size={18} /> New Viewing
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Leads</p>
          <p className="text-3xl font-bold text-[#0C3C4C]">{forms.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Verified</p>
          <p className="text-3xl font-bold text-green-600">{forms.filter(f => f.email_verified).length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-500">{forms.filter(f => !f.email_verified).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-500 bg-gray-50/60 uppercase tracking-wide">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Nationality</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Acties</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading…</td></tr>
              ) : forms.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No clients found.</td></tr>
              ) : (
                forms.map(form => (
                  <tr key={form.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-gray-900">{form.first_name} {form.surname}</td>
                    <td className="px-6 py-4 text-gray-600">{form.email}</td>
                    <td className="px-6 py-4 text-gray-600">{form.nationality || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${form.email_verified ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {form.email_verified ? <><CheckCircle2 size={11} /> Verified</> : <><Clock size={11} /> Pending</>}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* OPACITY CLASSES VERWIJDERD: Altijd zichtbaar */}
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewClient(form)} className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors" title="Bekijk/Bewerk"><Eye size={18} /></button>
                        <button onClick={() => setDeleteTarget({ id: form.id, userId: form.user_id, name: `${form.first_name} ${form.surname}` })} className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Verwijder"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

// --- EXPORT 2: ADMIN AGENDA (OUTLOOK STYLE CALENDAR) ---
export const AdminAgenda = () => {
  const [viewings, setViewings] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editViewing, setEditViewing] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Kalender navigatie state
  const [currentDate, setCurrentDate] = useState(new Date());

  const token = localStorage.getItem('authToken');

  const fetchData = () => {
    fetch(`${API_URL}/api/admin/viewings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setViewings(data));
    fetch(`${API_URL}/api/admin/intake`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json()).then(data => setClients(data));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async (data: any) => {
    const isEdit = !!editViewing;
    const url = isEdit ? `${API_URL}/api/admin/viewings/${editViewing.id}` : `${API_URL}/api/admin/viewings`;
    await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setShowModal(false);
    setEditViewing(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`${API_URL}/api/admin/viewings/${deleteId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` }});
    setDeleteId(null);
    fetchData();
  };

  // --- Kalender Logica ---
  const startHour = 8;
  const endHour = 20;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);
  const hourHeight = 60; // Pixels per uur

  const getWeekDays = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Pas aan voor Zondag
    const monday = new Date(d.setDate(diff));
    return Array.from({ length: 7 }, (_, i) => {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      return next;
    });
  };

  const weekDays = getWeekDays(currentDate);
  const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const prevWeek = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)));
  const nextWeek = () => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)));
  const goToday = () => setCurrentDate(new Date());

  const formatYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helpertje voor het berekenen van de positie (top & height) van een blok
  const getBlockStyle = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    const top = ((sH - startHour) * hourHeight) + (sM / 60) * hourHeight;
    const height = ((eH - sH) * hourHeight) + ((eM - sM) / 60) * hourHeight;
    return { top: `${top}px`, height: `${height}px` };
  };

  return (
    <AdminLayout>
      {showModal && <ViewingModal viewing={editViewing} clients={clients} onClose={() => { setShowModal(false); setEditViewing(null); }} onSave={handleSave} />}
      {deleteId && <DeleteModal title="Viewing verwijderen?" name="deze viewing" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={false} />}

      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">Agenda</h1>
          <p className="text-gray-500 mt-1">Beheer alle geplande viewings in Outlook-stijl.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-[#0C3C4C] text-white px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-[#0a3040] shadow-sm">
          <Plus size={18} /> Nieuwe Viewing
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        {/* Kalender Header Navigatie */}
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

        {/* Kalender Dagen Header */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <div className="w-16 shrink-0 border-r border-gray-100"></div> {/* Tijdskolom spacer */}
          <div className="flex-1 grid grid-cols-7">
            {weekDays.map((day, i) => {
              const isToday = formatYMD(day) === formatYMD(new Date());
              return (
                <div key={i} className="py-3 text-center border-r border-gray-100 last:border-0">
                  <div className="text-xs font-medium text-gray-500 uppercase">{dayNames[i]}</div>
                  <div className={`mt-1 w-8 h-8 mx-auto flex items-center justify-center rounded-full text-lg font-semibold ${isToday ? 'bg-[#0C3C4C] text-white' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kalender Grid (Tijden + Blokken) */}
        <div className="flex overflow-y-auto" style={{ height: '600px' }}>
          {/* Tijd-as (Links) */}
          <div className="w-16 shrink-0 border-r border-gray-100 relative bg-white">
            {hours.map((hour) => (
              <div key={hour} className="text-right pr-2 text-xs font-medium text-gray-400" style={{ height: `${hourHeight}px`, transform: 'translateY(-6px)' }}>
                {hour}:00
              </div>
            ))}
          </div>

          {/* Dagen Raster */}
          <div className="flex-1 grid grid-cols-7 relative bg-white">
            {/* Achtergrond Lijnen */}
            <div className="absolute inset-0 pointer-events-none">
              {hours.map((hour) => (
                <div key={hour} className="border-b border-gray-100" style={{ height: `${hourHeight}px` }}></div>
              ))}
            </div>

            {/* Dagen Kolommen (voor de afspraken blokken) */}
            {weekDays.map((day, i) => {
              const dayStr = formatYMD(day);
              const dayViewings = viewings.filter(v => v.viewing_date === dayStr);

              return (
                <div key={i} className="relative border-r border-gray-100 last:border-0">
                  {dayViewings.map(v => {
                    const style = getBlockStyle(v.start_time, v.end_time);
                    return (
                      <div 
                        key={v.id} 
                        className="absolute left-1 right-1 bg-[#84B5A5]/20 border border-[#84B5A5] rounded-lg p-2 overflow-hidden cursor-pointer hover:bg-[#84B5A5]/30 transition-colors group"
                        style={style}
                        onClick={() => { setEditViewing(v); setShowModal(true); }}
                        title={`${v.first_name} ${v.surname}\n${v.start_time} - ${v.end_time}\n${v.address}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="font-semibold text-xs text-[#0C3C4C] leading-tight truncate">
                            {v.start_time} - {v.first_name}
                          </div>
                          {/* Trash icoon verschijnt in blok bij hover */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setDeleteId(v.id); }} 
                            className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-700 mt-0.5 truncate">{v.address}</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium truncate">{v.employees.split(',').join(', ')}</div>
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

// --- EXPORT 3: ADMIN INVOICES ---
export const AdminInvoices = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

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
        <button
          className="bg-[#0C3C4C] hover:bg-[#0a3040] text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
          onClick={() => setShowModal(true)}
        >
          <Plus size={18} />
          Create Invoice
        </button>
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