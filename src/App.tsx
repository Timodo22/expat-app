import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authClient, API_URL } from './lib/authClient';
import { AdminB2BPartners } from './pages/Admin';
import { AdminDocuments } from './pages/Admin';

// Pagina imports
import Landing from './pages/Landing';
import Intake from './pages/Intake';
import Auth from './pages/Auth';
// ZIE HIER: AdminAgenda toegevoegd aan de import!
import AdminDashboard, { AdminInvoices, AdminAgenda } from './pages/Admin';
import B2BPortal from './pages/B2B';
import B2CPortal from './pages/B2C';

type SessionUser = { id: string; email: string; name: string; role: string } | null;

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) => {
  const [user, setUser] = useState<SessionUser | undefined>(undefined);

  useEffect(() => {
    // 1. Check direct localStorage (Net als in de portal pagina's!)
    // Dit is supersnel en voorkomt haperingen of overbodige API calls
    const storedUser = localStorage.getItem('authUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        return; // Gebruiker gevonden in lokale opslag, we zijn klaar!
      } catch (e) {
        console.error('Kon authUser niet parsen');
      }
    }

    // 2. Fallback: controleer via token als authUser mist
    const token = localStorage.getItem('authToken'); // Gebruik expliciet 'authToken'
    if (!token) {
      setUser(null);
      return;
    }

    // 3. Haal op bij de server als noodoplossing
    fetch(`${API_URL}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error('Sessie niet geldig');
        return r.json();
      })
      .then((data) => {
        // Vangt verschillende structuren op (data.user, data.session.user, of gewoon data)
        const validUser = data?.user || data?.session?.user || data;
        
        if (validUser && validUser.role) {
          setUser(validUser);
          localStorage.setItem('authUser', JSON.stringify(validUser)); // Sla op voor de volgende refresh
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  // Nog aan het laden
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <p className="text-[#0C3C4C] font-medium">Bezig met controleren...</p>
      </div>
    );
  }

  // Niet ingelogd
  if (!user) return <Navigate to="/auth" replace />;

  // Wel ingelogd, maar verkeerde rol? Stuur ze naar hun eigen portaal!
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'b2b') return <Navigate to="/portal/b2b" replace />;
    if (user.role === 'b2c') return <Navigate to="/portal/b2c" replace />;
    
    // Als de rol helemaal onbekend is, log ze uit voor de zekerheid
    localStorage.clear();
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Publieke Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/intake" element={<Intake />} />
        <Route path="/auth" element={<Auth />} />

        {/* Protected Routes */}
        <Route path="/portal/b2c" element={
          <ProtectedRoute allowedRoles={['b2c']}>
            <B2CPortal />
          </ProtectedRoute>
        } />

        <Route path="/portal/b2b" element={
          <ProtectedRoute allowedRoles={['b2b', 'admin']}>
            <B2BPortal />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* ZIE HIER: De nieuwe Agenda route toegevoegd! */}
        <Route path="/admin/agenda" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminAgenda />
          </ProtectedRoute>
        } />
                {/* ZIE HIER: De nieuwe Agenda route toegevoegd! */}
        <Route path="/admin/documents" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDocuments />
          </ProtectedRoute>
        } />
                <Route path="/admin/b2b" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminB2BPartners />
          </ProtectedRoute>
        } />

        <Route path="/admin/invoices" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminInvoices />
          </ProtectedRoute>
        } />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}