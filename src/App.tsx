import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router";
import {
  Home,
  Sparkles,
  QrCode,
  LogOut,
  Settings,
  GraduationCap,
  CheckCircle2,
  Store,
  Moon,
  Sun,
} from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Diagnosis from "./pages/Diagnosis";
import QrCodeView from "./pages/QrCodeView";
import DicasPro from "./pages/DicasPro";
import Conexao from "./pages/Conexao";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import { useTheme } from "./contexts/ThemeContext";
import {
  auth,
  onAuthStateChanged,
  signOut,
  db,
  analytics,
} from "./lib/firebase";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { logEvent } from "firebase/analytics";

import { Logo, LogoText } from "./components/Logo";
import { Toaster } from "react-hot-toast";
import { NotificationBell } from "./components/NotificationBell";

function Layout({
  children,
  onLogout,
  userPhoto,
  gmbConnected,
}: {
  children: React.ReactNode;
  onLogout: () => void;
  userPhoto: string | null;
  gmbConnected: boolean;
}) {
  const location = useLocation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const [stepsEnabled, setStepsEnabled] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenNavTour");
    // Show tour on desktop where sidebar is visible
    if (!hasSeenTour && window.innerWidth >= 768) {
      const timer = setTimeout(() => {
        setStepsEnabled(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const onExit = () => {
    setStepsEnabled(false);
    localStorage.setItem("hasSeenNavTour", "true");
  };

  const steps = [
    {
      element: "#tour-nav-inicio",
      intro: "Acompanhe as métricas e avaliações gerais do seu negócio.",
    },
    {
      element: "#tour-nav-diagnosis",
      intro:
        "Receba um diagnóstico inteligente usando Inteligência Artificial.",
    },
    {
      element: "#tour-nav-qrcode",
      intro: "Crie e baixe QR Codes para facilitar avaliações dos clientes.",
    },
    {
      element: "#tour-nav-dicas",
      intro:
        "Explore dicas exclusivas e estratégias para melhorar sua reputação online.",
    },
    {
      element: "#tour-nav-conexao",
      intro: "Gerencie a conexão da sua conta com o Google Business Profile.",
    },
  ];

  useEffect(() => {
    if (analytics) {
      logEvent(analytics, "page_view", {
        page_path: location.pathname,
        page_search: location.search,
        page_hash: location.hash,
      });
    }
  }, [location]);

  const navItems = [
    { path: "/", label: "Início", icon: Home, id: "tour-nav-inicio" },
    {
      path: "/diagnosis",
      label: "Diagnóstico IA",
      icon: Sparkles,
      id: "tour-nav-diagnosis",
    },
    { path: "/qrcode", label: "QR Code", icon: QrCode, id: "tour-nav-qrcode" },
    {
      path: "/dicas",
      label: "Dicas Pro",
      icon: GraduationCap,
      id: "tour-nav-dicas",
    },
    { path: "/conexao", label: "Conexão", icon: Store, id: "tour-nav-conexao" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white">
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={0}
        onExit={onExit}
        options={{
          nextLabel: "Próximo",
          prevLabel: "Anterior",
          doneLabel: "Concluir",
          showProgress: true,
        }}
      />
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800">
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <LogoText className="text-2xl font-bold tracking-tight" />
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                id={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-medium"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-800"
                }`}
              >
                <Icon
                  size={20}
                  className={isActive ? "text-teal-600" : "text-gray-400"}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2 px-4 py-2">
            {gmbConnected && (
              <div
                className="flex items-center gap-1.5 text-teal-600 bg-teal-50 dark:bg-teal-900/30 dark:bg-teal-900/30 dark:border-teal-800 px-3 py-1.5 rounded-full border border-teal-100 dark:border-teal-800/50"
                title="Perfil da Empresa Conectado"
              >
                <Store size={16} />
                <CheckCircle2 size={16} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-slate-800 transition-colors"
            >
              {theme === "dark" ? (
                <>
                  <Sun size={20} className="text-gray-400" />
                  Claro
                </>
              ) : (
                <>
                  <Moon size={20} className="text-gray-400" />
                  Escuro
                </>
              )}
            </button>
            <div className="flex-shrink-0 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
              <NotificationBell />
            </div>
          </div>
          <Link
            to="/perfil"
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings size={20} className="text-gray-400" />
            Configurações
          </Link>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-red-600 hover:bg-red-50 dark:bg-red-900/20 transition-colors mt-1"
          >
            <LogOut size={20} className="text-red-400" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <LogoText className="text-xl font-bold tracking-tight" />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:bg-slate-800 rounded-full flex items-center gap-2"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <NotificationBell />
            {gmbConnected && (
              <div
                className="flex items-center gap-1.5 text-teal-600 bg-teal-50 dark:bg-teal-900/30 px-2.5 py-1.5 rounded-full border border-teal-100 dark:border-teal-800/50"
                title="Perfil da Empresa Conectado"
              >
                <Store size={16} />
                <CheckCircle2 size={16} />
              </div>
            )}
            <button
              onClick={onLogout}
              className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center gap-2"
            >
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt="Perfil"
                  className="w-6 h-6 rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <LogOut size={16} />
              )}
              <span className="text-xs font-bold">Sair</span>
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-around items-center p-3 z-10 safe-area-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 ${
                isActive ? "text-teal-600" : "text-gray-500 dark:text-gray-400"
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
  const [gmbConnected, setGmbConnected] = useState<boolean>(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    let snapshotUnsubscribe: (() => void) | undefined;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUserPhoto(user.photoURL);

        try {
          const docRef = doc(db, "users", user.uid);

          snapshotUnsubscribe = onSnapshot(docRef, (docSnap) => {
            if (!docSnap.exists() || !docSnap.data().hasSeenOnboarding) {
              setNeedsOnboarding(true);
            } else {
              setNeedsOnboarding(false);
            }
            if (docSnap.exists() && docSnap.data().gmbConnected) {
              setGmbConnected(true);
            } else {
              setGmbConnected(false);
            }
          }, (error) => {
            if ((error as any).code !== "unavailable" && !(error as any).message?.includes("offline")) { console.error("Firebase Snapshot Error (onboarding check):", error); } else { console.warn("Offline: Firebase Snapshot Error (onboarding check)"); }
            setNeedsOnboarding(false);
          });
        } catch (error) {
          if ((error as any).code !== "unavailable" && !(error as any).message?.includes("offline")) { console.error("Error checking onboarding status:", error); } else { console.warn("Offline: Error checking onboarding status"); }
          // Default to false on error to not block the user
          setNeedsOnboarding(false);
        }
      } else {
        setIsAuthenticated(false);
        setUserPhoto(null);
        setNeedsOnboarding(false);
        setGmbConnected(false);
        if (snapshotUnsubscribe) {
          snapshotUnsubscribe();
        }
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (snapshotUnsubscribe) {
        snapshotUnsubscribe();
      }
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await signOut(auth);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleCompleteOnboarding = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await setDoc(
          doc(db, "users", user.uid),
          { hasSeenOnboarding: true },
          { merge: true },
        );
        setNeedsOnboarding(false);
      } catch (error) {
        console.error("Error saving onboarding status:", error);
        setNeedsOnboarding(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
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
    <>
      <Router>
        <Layout
          onLogout={handleLogoutClick}
          userPhoto={userPhoto}
          gmbConnected={gmbConnected}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/qrcode" element={<QrCodeView />} />
            <Route path="/dicas" element={<DicasPro />} />
            <Route path="/conexao" element={<Conexao />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </Layout>
      </Router>

      <Toaster position="top-right" />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Sair do aplicativo
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tem certeza que deseja sair da sua conta? Você precisará fazer
              login novamente para acessar.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelLogout}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
