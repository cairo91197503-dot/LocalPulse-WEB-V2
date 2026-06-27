import { useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { User, Mail, Save, UserCircle, Download } from "lucide-react";

export default function Profile() {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [isEmailScheduled, setIsEmailScheduled] = useState(false);
  const [individualReviewAlerts, setIndividualReviewAlerts] = useState(true);
  const [tipsSummary, setTipsSummary] = useState(true);
  const [dashboardDensity, setDashboardDensity] = useState<
    "compact" | "expanded"
  >("expanded");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setIsEmailScheduled(docSnap.data().weeklyEmail === true);
          setIndividualReviewAlerts(
            docSnap.data().individualReviewAlerts !== false,
          );
          setTipsSummary(docSnap.data().tipsSummary !== false);
          setDashboardDensity(
            docSnap.data().dashboardDensity === "compact"
              ? "compact"
              : "expanded",
          );
        }
      } catch (error: any) {
        if (
          error.code !== "unavailable" &&
          !error.message?.includes("offline")
        ) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      // Atualizar o nome no Firebase Auth
      await updateProfile(user, { displayName });

      // Atualizar preferências no Firestore
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          weeklyEmail: isEmailScheduled,
          individualReviewAlerts,
          tipsSummary,
          dashboardDensity,
        },
        { merge: true },
      );

      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    setExporting(true);
    const toastId = toast.loading("Preparando backup dos seus dados...");

    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();

        // Prepare the export object
        const exportData = {
          exportDate: new Date().toISOString(),
          userInfo: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
          },
          preferences: {
            weeklyEmail: data.weeklyEmail,
            individualReviewAlerts: data.individualReviewAlerts,
            tipsSummary: data.tipsSummary,
            dashboardLayout: data.dashboardLayout,
            dashboardDensity: data.dashboardDensity,
          },
          googleBusinessProfile: {
            gmbConnected: data.gmbConnected,
            reviewUrl: data.reviewUrl,
            businessData: data.businessData,
          },
        };

        // Create a blob and download it
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_perfil_empresa_${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success("Backup exportado com sucesso!", { id: toastId });
      } else {
        toast.error("Nenhum dado encontrado para exportar.", { id: toastId });
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      toast.error("Erro ao exportar backup.", { id: toastId });
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
          <UserCircle className="text-teal-600" size={32} />
          Meu Perfil
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Gerencie suas informações pessoais, preferências e dados da conta.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Informações Básicas */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                Informações Básicas
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Nome de Exibição
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-colors"
                      placeholder="Seu nome"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-mail de Cadastro
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    O e-mail de acesso não pode ser alterado por aqui.
                  </p>
                </div>
              </div>
            </div>

            {/* Configurações de Interface */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                Configurações de Interface
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Densidade do Dashboard
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 transition-colors ${dashboardDensity === "expanded" ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"}`}
                    >
                      <input
                        type="radio"
                        name="density"
                        value="expanded"
                        checked={dashboardDensity === "expanded"}
                        onChange={() => setDashboardDensity("expanded")}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm">
                        Expandido (Padrão)
                      </span>
                    </label>
                    <label
                      className={`cursor-pointer flex items-center justify-center p-3 rounded-xl border-2 transition-colors ${dashboardDensity === "compact" ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300" : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600"}`}
                    >
                      <input
                        type="radio"
                        name="density"
                        value="compact"
                        checked={dashboardDensity === "compact"}
                        onChange={() => setDashboardDensity("compact")}
                        className="sr-only"
                      />
                      <span className="font-medium text-sm">Compacto</span>
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    O modo compacto reduz os espaçamentos no Dashboard,
                    permitindo visualizar mais informações na tela.
                  </p>
                </div>
              </div>
            </div>

            {/* Preferências */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800 pb-2">
                Preferências de Notificação
              </h2>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      checked={isEmailScheduled}
                      onChange={(e) => setIsEmailScheduled(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Resumo Semanal de Métricas
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Receba automaticamente toda semana um e-mail com as
                      principais métricas de desempenho e avaliações do Perfil
                      da Empresa.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      checked={individualReviewAlerts}
                      onChange={(e) =>
                        setIndividualReviewAlerts(e.target.checked)
                      }
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Alertas de Novas Avaliações
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Seja notificado sempre que uma nova avaliação for postada
                      no seu Perfil da Empresa.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 transition-colors">
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type="checkbox"
                      checked={tipsSummary}
                      onChange={(e) => setTipsSummary(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Resumo de Dicas
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Receba dicas estratégicas e personalizadas para melhorar o
                      desempenho e o alcance da sua empresa local.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-teal-600 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-teal-700 focus:ring-4 focus:ring-teal-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Exportar Dados Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Exportar Meus Dados
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Garantimos total soberania sobre as suas informações. Você pode
            fazer o download de um backup completo (em formato JSON) com todos
            os dados do seu Perfil da Empresa armazenados no nosso banco de
            dados.
          </p>

          <button
            onClick={handleExportData}
            disabled={exporting}
            className="bg-gray-900 text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-800 focus:ring-4 focus:ring-gray-900/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {exporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exportando...
              </>
            ) : (
              <>
                <Download size={20} />
                Exportar Backup (JSON)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
