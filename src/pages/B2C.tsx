import React, { useState, useEffect } from 'react';
import { Building2, CheckCircle2, FileText, MessageCircle, LogOut, Settings } from 'lucide-react';
import { authClient, API_URL } from '../lib/authClient';
import SettingsModal from '../components/SettingsModal'; // Check of dit pad klopt voor jouw structuur!

export default function B2CPortal() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/auth";
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType.toLowerCase().replace(/ \/ | /g, '_'));

    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        credentials: 'include', 
        body: formData
      });

      if (res.ok) {
        alert(`${documentType} succesvol geüpload!`);
      } else {
        alert('Upload mislukt.');
      }
    } catch (error) {
      alert('Netwerkfout bij uploaden.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0C3C4C] rounded-xl flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="font-semibold text-[#0C3C4C] text-lg tracking-tight">
            Expat Housing <span className="text-gray-400 font-normal">| B2C Portal</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">
            {user?.name || 'Expat'}
          </span>
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-[#0C3C4C] transition-colors" title="Instellingen">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Uitloggen">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">
            Welcome to your Portal, {(user?.name || '').split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-500 mt-1">Track your process and upload required documents.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 space-y-8">
            {/* Status Tracker */}
            <div className="card-apple bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-[#0C3C4C] mb-6">Application Status</h3>
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>
                <div className="space-y-6 relative">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#84B5A5] flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Intake Completed</h4>
                      <p className="text-sm text-gray-500">You have successfully submitted your details.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-[#84B5A5] flex items-center justify-center shrink-0 z-10">
                      <div className="w-2 h-2 rounded-full bg-[#84B5A5]"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-[#0C3C4C]">Document Upload</h4>
                      <p className="text-sm text-gray-500">Please upload your required documents for verification.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Upload */}
            <div className="card-apple bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-[#0C3C4C] mb-6">Required Documents</h3>
              <div className="space-y-4">
                {['Passport / ID Card', 'Recent Payslip', 'Employment Contract'].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                        <FileText size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc}</p>
                        <p className="text-xs text-gray-500">PDF, JPG or PNG (Max 5MB)</p>
                      </div>
                    </div>
                    <div className="relative">
                      <input 
                        type="file" 
                        id={`file-${i}`} 
                        className="hidden" 
                        onChange={(e) => handleFileUpload(e, doc)}
                        disabled={uploading}
                      />
                      <label 
                        htmlFor={`file-${i}`} 
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm px-4 py-2 rounded-lg cursor-pointer transition-colors inline-block font-medium"
                      >
                        {uploading ? 'Uploading...' : 'Upload'}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <div className="bg-[#0C3C4C] p-6 rounded-2xl text-white shadow-sm">
              <h3 className="font-semibold mb-2">Need Help?</h3>
              <p className="text-sm text-white/70 mb-6 leading-relaxed">
                Our support team is ready to assist you with your relocation process.
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <MessageCircle size={16} />
                Contact Support
              </button>
            </div>
          </div>
        </div>
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