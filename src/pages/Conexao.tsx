import { useState, useEffect } from "react";
import {
  Store,
  CheckCircle2,
  RefreshCw,
  LogOut,
  MapPin,
  ExternalLink,
  Info,
} from "lucide-react";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";

export default function Conexao() {
  const user = auth.currentUser;
  const [isConnecting, setIsConnecting] = useState(false);
  const [gmbConnected, setGmbConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [, setAccounts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocationName, setSelectedLocationName] = useState<
    string | null
  >(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  const [businessData, setBusinessData] = useState<any>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.gmbConnected) {
            setGmbConnected(true);
            if (data.businessData) {
              setBusinessData(data.businessData);
              if (data.businessData.name) {
                setSelectedLocationName(data.businessData.name);
              }
            }
          }
        }
      }
      setLoading(false);
    };
    fetchStatus();
  }, [user]);

  const loginGoogle = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/business.manage',
    prompt: 'consent',
    onSuccess: async (codeResponse) => {
      if (!user) return;
      setIsConnecting(true);
      const toastId = toast.loading("Conectando ao Google...");
      try {
        // Exchange code for tokens
        const exchangeRes = await fetch("/api/auth/google/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeResponse.code, redirectUri: 'postmessage' }),
        });

        if (!exchangeRes.ok) throw new Error("Erro na troca de código OAuth.");
        const tokens = await exchangeRes.json();
        const { access_token, refresh_token } = tokens;

        // Save refresh token to Firestore
        if (refresh_token) {
          await setDoc(doc(db, "users", user.uid), { gmbRefreshToken: refresh_token }, { merge: true });
        }

        if (access_token) {
          // Fetch accounts
          const accountsRes = await fetch(
            "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
            {
              headers: { Authorization: `Bearer ${access_token}` },
            },
          );
          const accountsData = await accountsRes.json();
          const fetchedAccounts = accountsData.accounts || [];
          setAccounts(fetchedAccounts);

          // Fetch locations for all accounts
          let allLocations: any[] = [];
          for (const account of fetchedAccounts) {
            const locationsRes = await fetch(
              `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,title,metadata,profile,languageCode,storeCode`,
              {
                headers: { Authorization: `Bearer ${access_token}` },
              },
            );
            const locationsData = await locationsRes.json();
            if (locationsData.locations) {
              allLocations = [
                ...allLocations,
                ...locationsData.locations.map((loc: any) => ({
                  ...loc,
                  _account: account,
                  _token: access_token, // Temporary token just for fetching initial data
                })),
              ];
            }
          }
          setLocations(allLocations);
          toast.success("Contas encontradas com sucesso!", { id: toastId });
        }
      } catch (err: any) {
        console.error(err);
        toast.error("Erro ao conectar com Google.", { id: toastId });
      } finally {
        setIsConnecting(false);
      }
    },
    onError: (error) => {
      console.error(error);
      setIsConnecting(false);
      toast.error("Login com Google falhou.");
    }
  });

  const handleConnectGoogle = async () => {
    if (!user) return;
    if (!(import.meta as any).env.VITE_GOOGLE_CLIENT_ID) {
      toast.error("Configure o VITE_GOOGLE_CLIENT_ID no arquivo .env");
      return;
    }
    loginGoogle();
  };

  const handleSelectLocation = async (location: any) => {
    if (!user) return;
    setIsConnecting(true);
    const toastId = toast.loading("Salvando perfil...");
    try {
      let reviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.title || "Minha Empresa")}`;

      if (location.metadata?.newReviewUri) {
        reviewUrl = location.metadata.newReviewUri;
      } else if (location.metadata?.mapsUri) {
        reviewUrl = location.metadata.mapsUri + "/review";
      }

      // Fetch reviews
      try {
        const token = location._token;
        const reviewsRes = await fetch(
          `https://mybusinessreviews.googleapis.com/v1/${location.name}/reviews`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          location.reviews = reviewsData.reviews || [];
        }
      } catch (reviewErr) {
        console.error("Error fetching reviews:", reviewErr);
      }

      // Fetch media (Deprecated v4 removed as per instruction)
      /*
      try {
        const token = location._token;
        const mediaRes = await fetch(
          `https://mybusiness.googleapis.com/v4/${location.name}/media`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          location.media = mediaData.mediaItems || [];
        }
      } catch (mediaErr) {
        console.error("Error fetching media:", mediaErr);
      }
      */

      const cleanLocation = { ...location };
      delete cleanLocation._token; // Do not save token to DB

      await setDoc(
        doc(db, "users", user.uid),
        {
          gmbConnected: true,
          reviewUrl: reviewUrl,
          businessData: cleanLocation,
        },
        { merge: true },
      );

      setGmbConnected(true);
      setSelectedLocationName(location.name);
      toast.success("Perfil salvo com sucesso!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar perfil.", { id: toastId });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectClick = () => {
    setShowDisconnectModal(true);
  };

  const cancelDisconnect = () => {
    setShowDisconnectModal(false);
  };

  const handleDisconnect = async () => {
    setShowDisconnectModal(false);
    if (!user) return;

    setIsConnecting(true);
    const toastId = toast.loading("Desconectando...");
    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          gmbConnected: false,
          reviewUrl: null,
          businessData: null,
        },
        { merge: true },
      );

      setGmbConnected(false);
      setSelectedLocationName(null);
      setLocations([]);
      setAccounts([]);
      toast.success("Perfil desconectado com sucesso!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao desconectar.", { id: toastId });
    } finally {
      setIsConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="py-4">
        <h2 className="text-sm font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-1">
          Configurações
        </h2>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          Conexão de Contas
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Gerencie as integrações do seu negócio com o Google.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 p-6 md:p-8 shadow-sm">
        {user && (
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-700 p-5 rounded-2xl mb-8">
            <div className="flex items-center gap-4 w-full md:w-auto">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "Usuário"}
                  className="w-14 h-14 rounded-full border border-gray-200 dark:border-slate-700"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                  Conta Conectada
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {user.displayName || "Usuário"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="w-full md:w-auto bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 text-gray-700 dark:text-gray-300 font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap shadow-sm"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 bg-white dark:bg-slate-900 rounded-full p-0.5"
                />
                {isConnecting ? "Carregando..." : "Vincular Google Business"}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start justify-between border-b border-gray-100 dark:border-slate-800 pb-8 mb-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Store size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Google Perfil da Empresa
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
                Conecte seu perfil para analisarmos suas avaliações, gerar QR
                codes e usar a Inteligência Artificial para te dar dicas
                precisas.
              </p>
            </div>
          </div>
          <div>
            {(locations.length > 0 || gmbConnected) && (
              <button
                onClick={handleDisconnectClick}
                disabled={isConnecting}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 whitespace-nowrap"
              >
                <LogOut size={18} />
                Desconectar
              </button>
            )}
          </div>
        </div>

        {locations.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Store size={18} className="text-gray-400" />
              Selecione o seu perfil principal
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {locations.map((loc) => {
                const isSelected = selectedLocationName === loc.name;
                return (
                  <div
                    key={loc.name}
                    className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/30/30"
                        : "border-gray-200 dark:border-slate-700 hover:border-teal-300 bg-white dark:bg-slate-900"
                    }`}
                    onClick={() => !isSelected && handleSelectLocation(loc)}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 text-teal-600">
                        <CheckCircle2 size={24} className="fill-teal-100" />
                      </div>
                    )}

                    <h5 className="font-bold text-gray-900 dark:text-white text-lg mb-1 pr-8">
                      {loc.title}
                    </h5>
                    <div className="flex items-start gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <MapPin
                        size={16}
                        className="shrink-0 mt-0.5 text-gray-400"
                      />
                      <span className="line-clamp-2">
                        {loc.profile?.profileUri ? (
                          <a
                            href={loc.profile.profileUri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-blue-600"
                          >
                            Ver no mapa
                          </a>
                        ) : (
                          "Endereço não disponível"
                        )}
                      </span>
                    </div>

                    {isSelected ? (
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/50 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 size={14} />
                        Perfil Ativo
                      </div>
                    ) : (
                      <button
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                        disabled={isConnecting}
                      >
                        {isConnecting
                          ? "Salvando..."
                          : "Selecionar este perfil"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {gmbConnected && !locations.length && (
          <div className="bg-teal-50 dark:bg-teal-900/30 border border-teal-100 dark:border-teal-800/50 p-5 rounded-2xl">
            <div className="flex items-start gap-4 mb-4">
              <CheckCircle2 size={24} className="text-teal-600 shrink-0" />
              <div>
                <h4 className="font-bold text-teal-900 dark:text-teal-100">
                  Conta conectada com sucesso
                </h4>
                <p className="text-sm text-teal-800/80 mt-1">
                  Seu perfil já está vinculado. Para ver outras empresas ou
                  trocar de conta, clique em "Desconectar" acima e faça o login
                  novamente.
                </p>
              </div>
            </div>

            {businessData && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-teal-100 dark:border-teal-800/50 flex items-start gap-3 mt-4">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-lg flex items-center justify-center shrink-0">
                  <Store size={20} />
                </div>
                <div>
                  <h5 className="font-bold text-gray-900 dark:text-white">
                    {businessData.title || "Minha Empresa"}
                  </h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {businessData.profile?.profileUri ? (
                      <a
                        href={businessData.profile.profileUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600"
                      >
                        Ver no mapa
                      </a>
                    ) : (
                      "Perfil conectado"
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {!gmbConnected && locations.length === 0 && (
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-5 mt-8">
            <div className="w-14 h-14 bg-white dark:bg-slate-900 text-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm">
              <Info size={28} />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h4 className="font-bold text-blue-900 text-lg">
                Ainda não tem um Perfil da Empresa?
              </h4>
              <p className="text-sm text-blue-800/80 mt-1 max-w-lg">
                Para aproveitar todos os recursos da nossa plataforma, você
                precisa de um Perfil da Empresa no Google. É gratuito e rápido
                de criar.
              </p>
            </div>
            <a
              href="https://www.google.com/business/"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-white dark:bg-slate-900 text-blue-600 hover:bg-blue-50 border border-blue-200 font-bold py-3 px-6 rounded-xl transition-colors flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center mt-2 sm:mt-0"
            >
              Criar Perfil
              <ExternalLink size={18} />
            </a>
          </div>
        )}
      </div>

      {/* Disconnect Confirmation Modal */}
      {showDisconnectModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Desconectar perfil
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Tem certeza que deseja desconectar seu Perfil da Empresa do Google? Você precisará vinculá-lo novamente para continuar usando os recursos integrados.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDisconnect}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisconnect}
                className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Desconectar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
