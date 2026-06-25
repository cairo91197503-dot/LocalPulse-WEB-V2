import { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link, useLocation } from "react-router";
import { Home, Sparkles, QrCode, LogOut, Settings, GraduationCap } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import QrCodeView from "./pages/QrCodeView";
import DicasPro from "./pages/DicasPro";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import { auth, onAuthStateChanged, signOut, db } from "./lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { Logo, LogoText } from "./components/Logo";

function Layout({ children, onLogout, userPhoto }: { children: React.ReactNode, onLogout: () => void, userPhoto: string | null }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Início", icon: Home },
    { path: "/diagnosis", label: "Diagnóstico IA", icon: Sparkles },
    { path: "/qrcode", label: "QR Code", icon: QrCode },
    { path: "/dicas", label: "Curso GMN", icon: GraduationCap },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <LogoText className="text-2xl font-bold tracking-tight" />
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? "bg-teal-50 text-teal-700 font-medium" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={20} className={isActive ? "text-teal-600" : "text-gray-400"} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-gray-600 hover:bg-gray-100 transition-colors">
            <Settings size={20} className="text-gray-400" />
            Configurações
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-red-600 hover:bg-red-50 transition-colors mt-1"
          >
            <LogOut size={20} className="text-red-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <LogoText className="text-xl font-bold tracking-tight" />
          </div>
          <button onClick={onLogout} className="p-2 text-red-600 bg-red-50 rounded-full flex items-center gap-2">
            {userPhoto ? (
               <img src={userPhoto} alt="Perfil" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
            ) : (
               <LogOut size={16} />
            )}
            <span className="text-xs font-bold">Sair</span>
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around items-center p-3 z-10 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? "text-teal-600" : "text-gray-500"
              }`}
            >
              <Icon size={24} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserPhoto(user.photoURL);
        
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists() || !docSnap.data().hasSeenOnboarding) {
            setNeedsOnboarding(true);
          } else {
            setNeedsOnboarding(false);
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          // Default to false on error to not block the user
          setNeedsOnboarding(false);
        }
      } else {
        setIsAuthenticated(false);
        setUserPhoto(null);
        setNeedsOnboarding(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleCompleteOnboarding = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(doc(db, "users", user.uid), { hasSeenOnboarding: true }, { merge: true });
        setNeedsOnboarding(false);
      } catch (error) {
        console.error("Error saving onboarding status:", error);
        setNeedsOnboarding(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (needsOnboarding) {
    return <Onboarding onComplete={handleCompleteOnboarding} />;
  }

  return (
    <Router>
      <Layout onLogout={handleLogout} userPhoto={userPhoto}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/diagnosis" element={<Diagnosis />} />
          <Route path="/qrcode" element={<QrCodeView />} />
          <Route path="/dicas" element={<DicasPro />} />
        </Routes>
      </Layout>
    </Router>
  );
}
