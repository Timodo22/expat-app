import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2, FileText, MessageCircle, LogOut, Settings,
  Upload, Clock, XCircle, RefreshCw, AlertCircle, ShieldCheck
} from 'lucide-react';
// LET OP: getToken is hier toegevoegd aan de import!
import { authClient, API_URL, getToken } from '../lib/authClient';
import SettingsModal from '../components/SettingsModal';
import logoEH from '../assets/logoEH.png';

const DOCUMENT_TYPES = [
  {
    key: 'passport_id_card',
    label: 'Passport / ID Card',
    description: 'Een geldig paspoort of identiteitsbewijs',
  },
  {
    key: 'recent_payslip',
    label: 'Recent Payslip',
    description: 'Loonstrook van de afgelopen 3 maanden',
  },
  {
    key: 'employment_contract',
    label: 'Employment Contract',
    description: 'Arbeidscontract of bewijsstuk van dienstverband',
  },
];

type DocStatus = 'pending' | 'approved' | 'rejected';

interface Document {
  id: string;
  document_type: string;
  original_name: string;
  file_size: number;
  status: DocStatus;
  rejection_reason: string | null;
  uploaded_at: string;
}

const DOC_STATUS_CONFIG: Record<DocStatus, { label: string; icon: React.ReactNode; classes: string; bg: string }> = {
  pending:  {
    label: 'In behandeling',
    icon: <Clock size={14} />,
    classes: 'text-amber-700 border-amber-200',
    bg: 'bg-amber-50',
  },
  approved: {
    label: 'Goedgekeurd',
    icon: <CheckCircle2 size={14} />,
    classes: 'text-green-700 border-green-200',
    bg: 'bg-green-50',
  },
  rejected: {
    label: 'Afgekeurd',
    icon: <XCircle size={14} />,
    classes: 'text-red-700 border-red-200',
    bg: 'bg-red-50',
  },
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function B2CPortal() {
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [intakeStatus, setIntakeStatus] = useState<string>('getekend');

  // GECORRIGEERD: Haal het token nu direct en veilig op via de authClient functie
  const token = getToken();

  useEffect(() => {
    const stored = localStorage.getItem('authUser');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/documents/my-documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error('Fout bij ophalen documenten:', err);
    }
  }, [token]);

  const fetchIntakeStatus = useCallback(async () => {
    if (!token) return;
    try {
      // Intake status logic indien nodig
    } catch {}
  }, [token]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    const approvedTypes = documents.filter(d => d.status === 'approved').map(d => d.document_type);
    const allApproved = ['passport_id_card', 'recent_payslip', 'employment_contract']
      .every(t => approvedTypes.includes(t));
    if (allApproved) {
      setIntakeStatus('goedgekeurd');
    } else {
      setIntakeStatus('getekend');
    }
  }, [documents]);

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = "/auth";
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!ALLOWED.includes(file.type)) {
      alert('Alleen PDF, JPG of PNG bestanden zijn toegestaan.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Bestand is te groot. Maximum is 5MB.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    setUploading(documentType);
    try {
      // Hier pakt hij nu dynamisch de juiste ingelogde token
      const currentToken = getToken(); 
      
      const res = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
        body: formData,
      });

      if (res.ok) {
        await fetchDocuments();
      } else {
        const err = await res.json();
        alert(err.error || 'Upload mislukt.');
      }
    } catch {
      alert('Netwerkfout bij uploaden.');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const getDocForType = (type: string): Document | undefined =>
    documents.find(d => d.document_type === type);

  const allApproved = ['passport_id_card', 'recent_payslip', 'employment_contract']
    .every(t => documents.find(d => d.document_type === t)?.status === 'approved');

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const rejectedCount = documents.filter(d => d.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src={logoEH} alt="EH Logo" className="h-10 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-[#0C3C4C] text-lg tracking-tight">
              EXPAT HOUSING BRAINPORT <span className="text-gray-400 font-normal">| B2C Portal</span>
            </span>
            <span className="text-xs text-[#84B5A5] font-medium tracking-wide">
              Where international talent finds home
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600">{user?.name || 'Expat'}</span>
          <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-[#0C3C4C] transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0C3C4C] tracking-tight">
            Welcome, {(user?.name || '').split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-500 mt-1">Track your process and upload required documents.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="md:col-span-2 space-y-6">

            {/* ─── Status Tracker ───────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-[#0C3C4C] mb-6">Application Status</h3>
              <div className="relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100" />
                <div className="space-y-6 relative">
                  {/* Stap 1: Intake */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#84B5A5] flex items-center justify-center shrink-0 z-10">
                      <CheckCircle2 size={16} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Intake Completed</h4>
                      <p className="text-sm text-gray-500">You have successfully submitted your details.</p>
                    </div>
                  </div>

                  {/* Stap 2: Document Upload */}
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      approvedCount > 0 ? 'bg-[#84B5A5]' : 'bg-white border-2 border-[#84B5A5]'
                    }`}>
                      {approvedCount > 0
                        ? <CheckCircle2 size={16} className="text-white" />
                        : <div className="w-2 h-2 rounded-full bg-[#84B5A5]" />
                      }
                    </div>
                    <div>
                      <h4 className="font-medium text-[#0C3C4C]">Document Upload</h4>
                      <p className="text-sm text-gray-500">
                        {approvedCount === 3
                          ? 'All documents approved!'
                          : `${approvedCount}/3 documents approved`}
                        {rejectedCount > 0 && ` · ${rejectedCount} rejected — please re-upload`}
                      </p>
                    </div>
                  </div>

                  {/* Stap 3: Goedkeuring */}
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                      allApproved ? 'bg-[#84B5A5]' : 'bg-white border-2 border-gray-200'
                    }`}>
                      {allApproved
                        ? <CheckCircle2 size={16} className="text-white" />
                        : <div className="w-2 h-2 rounded-full bg-gray-300" />
                      }
                    </div>
                    <div>
                      <h4 className={`font-medium ${allApproved ? 'text-[#0C3C4C]' : 'text-gray-400'}`}>
                        Application Approved
                      </h4>
                      <p className="text-sm text-gray-500">
                        {allApproved
                          ? '🎉 Your application has been approved!'
                          : 'Pending document verification by our team.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goedgekeurd banner */}
              {allApproved && (
                <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                  <ShieldCheck size={20} className="text-green-600 shrink-0" />
                  <p className="text-sm font-medium text-green-800">
                    Your application is approved! Our team will contact you soon.
                  </p>
                </div>
              )}
            </div>

            {/* ─── Document Upload ──────────────────────────────────────── */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-[#0C3C4C]">Required Documents</h3>
                <button
                  onClick={fetchDocuments}
                  className="p-1.5 text-gray-400 hover:text-[#0C3C4C] transition-colors rounded-lg hover:bg-gray-50"
                  title="Vernieuwen"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {DOCUMENT_TYPES.map(docType => {
                  const existing = getDocForType(docType.key);
                  const isUploading = uploading === docType.key;
                  const statusCfg = existing ? DOC_STATUS_CONFIG[existing.status] : null;

                  return (
                    <div
                      key={docType.key}
                      className={`p-4 border rounded-2xl transition-colors ${
                        existing?.status === 'approved'
                          ? 'border-green-200 bg-green-50/30'
                          : existing?.status === 'rejected'
                          ? 'border-red-200 bg-red-50/20'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            existing?.status === 'approved' ? 'bg-green-100' :
                            existing?.status === 'rejected' ? 'bg-red-100' : 'bg-gray-50'
                          }`}>
                            <FileText size={20} className={
                              existing?.status === 'approved' ? 'text-green-600' :
                              existing?.status === 'rejected' ? 'text-red-500' : 'text-gray-400'
                            } />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">{docType.label}</p>
                            <p className="text-xs text-gray-500">{docType.description}</p>
                            {existing && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {existing.original_name} · {formatBytes(existing.file_size)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {/* Status badge */}
                          {statusCfg && (
                            <span className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusCfg.bg} ${statusCfg.classes}`}>
                              {statusCfg.icon}
                              {statusCfg.label}
                            </span>
                          )}

                          {/* Upload / Re-upload knop */}
                          {existing?.status !== 'approved' && (
                            <div className="relative">
                              <input
                                type="file"
                                id={`file-${docType.key}`}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => handleFileUpload(e, docType.key)}
                                disabled={isUploading}
                              />
                              <label
                                htmlFor={`file-${docType.key}`}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                                  isUploading
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : existing
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                {isUploading ? (
                                  <>
                                    <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                                    Uploading…
                                  </>
                                ) : existing ? (
                                  <><RefreshCw size={13} /> Re-upload</>
                                ) : (
                                  <><Upload size={13} /> Upload</>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Reden afkeuring */}
                      {existing?.status === 'rejected' && existing.rejection_reason && (
                        <div className="mt-3 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-xl">
                          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-red-700">
                            <strong>Reden:</strong> {existing.rejection_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-gray-400 flex items-center gap-1.5">
                <ShieldCheck size={12} />
                Your documents are stored securely and are only accessible to our team. Compliant with GDPR / AVG.
              </p>
            </div>
          </div>

          {/* ─── Sidebar ─────────────────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Progress kaart */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h4 className="text-sm font-semibold text-[#0C3C4C] mb-4">Document Progress</h4>
              <div className="space-y-2">
                {[
                  { label: 'Approved', count: approvedCount, color: 'bg-green-500' },
                  { label: 'Pending', count: pendingCount, color: 'bg-amber-400' },
                  { label: 'Rejected', count: rejectedCount, color: 'bg-red-400' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.color}`} />
                      <span className="text-gray-600">{s.label}</span>
                    </div>
                    <span className="font-semibold text-gray-900">{s.count}/3</span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#84B5A5] rounded-full transition-all duration-500"
                  style={{ width: `${(approvedCount / 3) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-400 text-right">{approvedCount}/3 complete</p>
            </div>

            {/* Contact */}
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
        onUpdate={newName => setUser(prev => prev ? { ...prev, name: newName } : null)}
      />
    </div>
  );
}