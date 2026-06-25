import { useState, useEffect } from "react";
import { Shield, Calendar, MessageSquareText, TrendingUp, ArrowRight, QrCode, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router";
import { auth, db, signInWithPopup } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleAuthProvider } from "firebase/auth";

export default function Dashboard() {
  const user = auth.currentUser;
  const [isConnecting, setIsConnecting] = useState(false);
  const [gmbConnected, setGmbConnected] = useState(false);

  useEffect(() => {
    const checkGmb = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().gmbConnected) {
          setGmbConnected(true);
        }
      }
    };
    checkGmb();
  }, [user]);

  const handleConnectGMB = async () => {
    if (!user) return;
    setIsConnecting(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/business.manage');
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;
      
      let reviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(user.displayName || 'Minha Empresa')}`;

      if (token) {
        try {
          const accountsRes = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const accountsData = await accountsRes.json();
          const account = accountsData.accounts?.[0];
          
          if (account) {
            const locationsRes = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?readMask=name,metadata`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const locationsData = await locationsRes.json();
            const location = locationsData.locations?.[0];
            
            if (location && location.metadata?.newReviewUri) {
               reviewUrl = location.metadata.newReviewUri;
            } else if (location && location.metadata?.mapsUri) {
               reviewUrl = location.metadata.mapsUri + '/review';
            }
          }
        } catch (apiError) {
           console.error("GMB API Error:", apiError);
        }
      }

      await setDoc(doc(db, "users", user.uid), { 
        gmbConnected: true,
        reviewUrl: reviewUrl 
      }, { merge: true });
      
      setGmbConnected(true);
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        alert("Erro ao conectar: O Google bloqueou o acesso pois o app está em fase de testes. Para resolver, acesse o Google Cloud Console > APIs e Serviços > Tela de consentimento OAuth e adicione seu e-mail na lista de 'Usuários de teste'.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const features = [
    { icon: Shield, title: "REPUTAÇÃO", desc: "Fortaleça sua presença e conquiste confiança.", color: "text-teal-500 bg-teal-50" },
    { icon: Calendar, title: "HORÁRIOS", desc: "Descubra os melhores horários para postar.", color: "text-purple-600 bg-purple-50" },
    { icon: MessageSquareText, title: "CONTEÚDO COM IA", desc: "Crie posts incríveis com inteligência artificial.", color: "text-blue-500 bg-blue-50" },
    { icon: TrendingUp, title: "RESULTADOS", desc: "Acompanhe métricas e veja seu negócio crescer.", color: "text-emerald-500 bg-emerald-50" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="text-center md:text-left py-4">
        <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-1">Visão Geral</h2>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Bem-vindo, {user?.displayName ? user.displayName.split(' ')[0] : 'ao LocalPulse'}.</h1>
      </div>

      {/* Feature Pills (Horizontal Scroll on Mobile) */}
      <div className="flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div key={i} className="min-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-sm">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${feat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">{feat.title}</h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-0.5">{feat.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connection Card */}
      <div className="bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col items-start gap-4">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">
            {gmbConnected ? "Conta Google Meu Negócio Conectada" : "Conecte sua conta do Google Meu Negócio"}
          </h2>
          <p className="text-blue-50 max-w-lg mb-4">
            {gmbConnected
              ? "Seus dados estão sendo sincronizados. O QR Code e o Diagnóstico de Reputação já estão utilizando suas informações reais."
              : "Para ver seus dados reais, histórico de avaliações e obter um diagnóstico verdadeiro usando Inteligência Artificial, precisamos que você conecte o Perfil da sua Empresa."}
          </p>
          {!gmbConnected ? (
            <button 
              onClick={handleConnectGMB}
              disabled={isConnecting}
              className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isConnecting ? "Conectando..." : "Conectar Conta Google"}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-white/20 text-white font-bold px-4 py-2 rounded-xl backdrop-blur-sm">
              <CheckCircle2 size={20} className="text-teal-300" />
              Sincronizado
            </div>
          )}
        </div>
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Link to="/diagnosis" className="flex items-center gap-4 bg-purple-50 hover:bg-purple-100 transition-colors rounded-3xl p-5 border border-purple-100">
          <div className="w-12 h-12 bg-white text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Sparkles size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-purple-900 text-sm">Diagnóstico com IA</h3>
            <p className="text-xs text-purple-700/70 mt-0.5">Analise sua reputação online automaticamente</p>
          </div>
          <ArrowRight size={20} className="text-purple-400" />
        </Link>

        <Link to="/qrcode" className="flex items-center gap-4 bg-teal-50 hover:bg-teal-100 transition-colors rounded-3xl p-5 border border-teal-100">
          <div className="w-12 h-12 bg-white text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <QrCode size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-teal-900 text-sm">QR Code de Avaliações</h3>
            <p className="text-xs text-teal-700/70 mt-0.5">Gere e compartilhe seu QR Code</p>
          </div>
          <ArrowRight size={20} className="text-teal-400" />
        </Link>
      </div>
    </div>
  );
}
