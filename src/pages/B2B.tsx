import React, { useState, useEffect } from 'react';
import { Building2, Users, LogOut, Settings } from 'lucide-react';
import { authClient, API_URL } from '../lib/authClient';
import SettingsModal from '../components/SettingsModal'; // Check of dit pad klopt voor jouw structuur!

export default function B2BPortal() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', serviceType: 'rent' });
  const [employees, setEmployees] = useState<any[]>([]);

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
    try {
      const res = await authClient.fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setEmployees(data);
      }
    } catch (err) {
      console.error('Kon medewerkers niet ophalen', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authClient.fetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify({
          b2b_company_id: user?.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          service_type: formData.serviceType,
        }),
      });
      if (res.ok) {
        alert('Employee added successfully!');
        setShowModal(false);
        setFormData({ firstName: '', lastName: '', serviceType: 'rent' });
        fetchEmployees();
      } else {
        alert('Failed to add employee');
      }
    } catch (err) {
      alert('Network error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0C3C4C] rounded-xl flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-semibold text-[#0C3C4C] text-lg tracking-tight">
            Expat Housing <span className="text-gray-400 font-normal">| Corporate Portal</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {user?.name || 'HR Department'}
          </span>
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-[#0C3C4C] transition-colors" title="Instellingen">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Uitloggen">
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
            className="bg-[#0C3C4C] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-[#0a2f3b] transition-colors"
            onClick={() => setShowModal(true)}
          >
            <Users size={18} />
            Add New Employee
          </button>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-[#0C3C4C] mb-6">Active Cases</h3>
          {employees.length === 0 ? (
            <p className="text-gray-500 text-sm">No employees added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-sm text-gray-500">
                    <th className="pb-4 font-medium">Employee Name</th>
                    <th className="pb-4 font-medium">Service</th>
                    <th className="pb-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {employees.map((emp, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 font-medium text-gray-900">{emp.first_name} {emp.last_name}</td>
                      <td className="py-4 text-gray-600 capitalize">{emp.service_type}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize">
                          {emp.status || 'active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl max-w-md w-full">
              <h3 className="text-xl font-bold text-[#0C3C4C] mb-4">Add New Employee</h3>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" required className="w-full p-2 border border-gray-200 rounded-lg" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" required className="w-full p-2 border border-gray-200 rounded-lg" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select required className="w-full p-2 border border-gray-200 rounded-lg" value={formData.serviceType} onChange={e => setFormData({ ...formData, serviceType: e.target.value })}>
                    <option value="rent">Rent</option>
                    <option value="buy">Buy</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="flex-1 bg-[#0C3C4C] text-white px-4 py-2 rounded-lg font-medium">Add Employee</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        user={user}
        onUpdate={(newName) => setUser(prev => prev ? { ...prev, name: newName } : null)}
      />
    </div>
  );
}