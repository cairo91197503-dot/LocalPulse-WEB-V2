import { useState, useEffect } from "react";
import { Shield, Calendar, MessageSquareText, TrendingUp, ArrowRight, QrCode, Sparkles, Store, Star, ExternalLink, Bell } from "lucide-react";
import { Link } from "react-router";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const user = auth.currentUser;
  const [gmbConnected, setGmbConnected] = useState(false);
  const [businessData, setBusinessData] = useState<any>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'review',
      title: 'Nova avaliação recebida!',
      message: 'Você recebeu uma nova avaliação. Responda rapidamente para melhorar seu engajamento.',
      read: false,
      link: 'https://business.google.com/reviews'
    },
    {
      id: 2,
      type: 'tip',
      title: 'Dica Pro adicionada',
      message: 'Nova dica disponível: Como utilizar o QR Code de forma eficiente no seu balcão.',
      read: false,
      link: '/dicas'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    const checkGmb = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().gmbConnected) {
          setGmbConnected(true);
          setBusinessData(docSnap.data().businessData || null);
        }
      }
    };
    checkGmb();
  }, [user]);

  const features = [
    { icon: Shield, title: "REPUTAÇÃO", desc: "Fortaleça sua presença e conquiste confiança.", color: "text-teal-500 bg-teal-50" },
    { icon: Calendar, title: "HORÁRIOS", desc: "Descubra os melhores horários para postar.", color: "text-purple-600 bg-purple-50" },
    { icon: MessageSquareText, title: "CONTEÚDO COM IA", desc: "Crie posts incríveis com inteligência artificial.", color: "text-blue-500 bg-blue-50" },
    { icon: TrendingUp, title: "RESULTADOS", desc: "Acompanhe métricas e veja seu negócio crescer.", color: "text-emerald-500 bg-emerald-50" }
  ];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="py-4 flex justify-between items-center relative">
        <div>
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-1">Visão Geral</h2>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Bem-vindo, {user?.displayName ? user.displayName.split(' ')[0] : 'ao LocalPulse'}.
          </h1>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center relative hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Bell className="text-gray-600" size={24} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          
          {showNotifications && (
            <>
              {/* Click outside backdrop */}
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              ></div>
              
              <div className="absolute right-0 top-14 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden origin-top-right animate-in fade-in slide-in-from-top-2">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-bold text-gray-900">Notificações</h3>
                  {unreadCount > 0 ? (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">{unreadCount} novas</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">Lidas</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notification => (
                      <div key={notification.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative ${notification.read ? 'opacity-60' : ''}`}>
                        {!notification.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                        <div className="flex gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.type === 'review' ? 'bg-yellow-100 text-yellow-600' : 'bg-purple-100 text-purple-600'}`}>
                            {notification.type === 'review' ? <Star size={18} className="fill-yellow-500" /> : <Sparkles size={18} />}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">{notification.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notification.message}</p>
                            <div className="flex items-center gap-3 mt-2">
                              {notification.type === 'review' ? (
                                <a 
                                  href={notification.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Ver Avaliação <ExternalLink size={12} />
                                </a>
                              ) : (
                                <Link 
                                  to={notification.link}
                                  className="text-xs font-bold text-blue-600 hover:text-blue-700"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Ver Dica
                                </Link>
                              )}
                              {!notification.read && (
                                <button 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                                >
                                  Marcar como lida
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      <Bell size={24} className="mx-auto text-gray-300 mb-2" />
                      Nenhuma notificação no momento.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
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

      {/* Connection Card (Only show if NOT connected) */}
      {!gmbConnected && (
        <div className="bg-gradient-to-r from-teal-500 to-purple-600 rounded-3xl shadow-md overflow-hidden flex flex-col lg:flex-row">
          <div className="p-6 sm:p-8 flex-1 text-white relative">
            <div className="relative z-10 w-full">
              <h2 className="text-2xl font-bold mb-2">
                Conecte sua conta do Perfil da Empresa
              </h2>
              <p className="text-blue-50 max-w-lg mb-6">
                Para ver seus dados reais, histórico de avaliações e obter um diagnóstico verdadeiro usando Inteligência Artificial, precisamos que você conecte o Perfil da sua Empresa.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  to="/conexao"
                  className="bg-white text-purple-700 font-bold px-6 py-3.5 rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Store size={20} />
                  Conectar Conta Google
                </Link>
                
                <Link 
                  to="/dicas" 
                  state={{ openModuleId: 3 }}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold py-3.5 px-6 rounded-xl border border-white/30 transition-colors flex items-center justify-center text-center"
                >
                  Ver Instruções
                </Link>
              </div>
            </div>
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 lg:w-80 border-t lg:border-t-0 lg:border-l border-white/20 flex flex-col justify-center">
             <h3 className="text-white font-bold text-lg mb-2">Ainda não tem um Perfil?</h3>
             <p className="text-white/80 text-sm mb-5">
               Crie sua página no Google gratuitamente e seja encontrado por milhares de novos clientes na sua região.
             </p>
             <a 
                href="https://www.google.com/business/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2 text-center"
              >
                <ExternalLink size={18} />
                Criar Perfil Grátis
              </a>
          </div>
        </div>
      )}

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

      {/* Quick Tips Carousel */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Dicas Rápidas</h3>
            <p className="text-sm text-gray-500 mt-1">Ações simples para melhorar seu posicionamento.</p>
          </div>
          <Sparkles className="text-blue-500 hidden sm:block" size={24} />
        </div>
        
        <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 hide-scrollbar snap-x">
          {[
            {
              title: "Adicione fotos recentes",
              desc: "Perfis com fotos recebem 42% mais solicitações de rotas. Poste fotos do seu espaço, produtos ou equipe.",
              action: "Adicionar Fotos",
              link: "https://business.google.com/photos",
              color: "bg-blue-50 border-blue-100 text-blue-900",
              btnColor: "bg-blue-600 hover:bg-blue-700"
            },
            {
              title: "Atualize horários especiais",
              desc: "Feriados se aproximando? Mantenha seus clientes informados sobre mudanças no horário de funcionamento.",
              action: "Atualizar Horários",
              link: "https://business.google.com/edit/info",
              color: "bg-purple-50 border-purple-100 text-purple-900",
              btnColor: "bg-purple-600 hover:bg-purple-700"
            },
            {
              title: "Responda avaliações",
              desc: "Responder avaliações mostra que você valoriza seus clientes e ajuda a construir confiança com novos clientes.",
              action: "Ver Avaliações",
              link: "https://business.google.com/reviews",
              color: "bg-teal-50 border-teal-100 text-teal-900",
              btnColor: "bg-teal-600 hover:bg-teal-700"
            }
          ].map((tip, idx) => (
            <div key={idx} className={`min-w-[280px] sm:min-w-[320px] p-5 rounded-2xl border ${tip.color} flex flex-col justify-between shrink-0 snap-center`}>
              <div>
                <h4 className="font-bold text-base mb-2">{tip.title}</h4>
                <p className="text-sm opacity-80 mb-4">{tip.desc}</p>
              </div>
              <a 
                href={tip.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-white font-bold text-sm py-2 px-4 rounded-xl text-center transition-colors inline-block ${tip.btnColor}`}
              >
                {tip.action}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Últimas Avaliações</h3>
            <p className="text-sm text-gray-500 mt-1">Responda aos seus clientes e mostre que você se importa.</p>
          </div>
        </div>

        {!gmbConnected ? (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
            <MessageSquareText size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
              Conecte sua conta do Google para visualizar e responder as avaliações dos seus clientes diretamente daqui.
            </p>
            <Link 
              to="/conexao"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Conectar agora
            </Link>
          </div>
        ) : businessData?.reviews && businessData.reviews.length > 0 ? (
          <div className="space-y-4">
            {businessData.reviews.slice(0, 3).map((review: any) => (
              <div key={review.id || review.name} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-gray-900">{review.reviewer?.displayName || "Cliente"}</span>
                      <span className="text-xs text-gray-500">• {review.createTime ? new Date(review.createTime).toLocaleDateString() : 'Recente'}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => {
                        // Handle STAR_RATING_UNSPECIFIED, ONE, TWO, THREE, FOUR, FIVE
                        const ratingMap: Record<string, number> = {
                          "ONE": 1, "TWO": 2, "THREE": 3, "FOUR": 4, "FIVE": 5
                        };
                        const ratingNum = typeof review.starRating === 'string' ? ratingMap[review.starRating] || 5 : review.starRating || 5;
                        return (
                          <Star 
                            key={i} 
                            size={14} 
                            className={i < ratingNum ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} 
                          />
                        );
                      })}
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-2">{review.comment || "Avaliação sem texto."}</p>
                  </div>
                  <a 
                    href="https://business.google.com/reviews" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors"
                  >
                    Responder
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
            <MessageSquareText size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
              Ainda não carregamos suas avaliações recentes ou não há avaliações para exibir no momento.
            </p>
            <a 
              href="https://business.google.com/reviews" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors inline-flex items-center gap-1"
            >
              Acessar avaliações no Google <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
