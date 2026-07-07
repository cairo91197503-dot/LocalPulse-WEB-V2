import { useState, useEffect, useRef, useMemo, memo } from "react";
import {
  Shield,
  Calendar,
  MessageSquareText,
  TrendingUp,
  ArrowRight,
  QrCode,
  Sparkles,
  Store,
  Star,
  ExternalLink,
  Download,
  AlertTriangle,
  CalendarDays,
  FileSpreadsheet,
  Mail,
  Send,
  X,
  WifiOff,
  GripVertical,
  Camera,
} from "lucide-react";
import { useNavigate, Link } from "react-router";
import { auth, db, analytics } from "../lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { logEvent } from "firebase/analytics";
import { useGmbData } from "../hooks/useGmbData";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";
import { Joyride, EventData, STATUS, Step } from "react-joyride";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const PerformanceChart = memo(({ data }: { data: any[] }) => {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#E5E7EB"
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            yAxisId="left"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#6B7280", fontSize: 12 }}
            dx={-10}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="avaliacoes"
            name="Avaliações"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

const ReviewsList = memo(({ reviews }: { reviews: any[] }) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyType, setReplyType] = useState<"manual" | "ai" | "template">(
    "manual",
  );
  const [replyTemplateName, setReplyTemplateName] = useState<string>("");

  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
        <MessageSquareText size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
          Ainda não carregamos suas avaliações recentes ou não há avaliações
          para exibir no momento.
        </p>
      </div>
    );
  }

  const templates = [
    {
      label: "Obrigado!",
      text: "Muito obrigado pelo feedback positivo! Ficamos felizes em ajudar.",
    },
    {
      label: "Volte sempre",
      text: "Agradecemos a avaliação! Esperamos vê-lo novamente em breve.",
    },
    {
      label: "Desculpas",
      text: "Lamentamos que sua experiência não tenha sido a ideal. Por favor, entre em contato para resolvermos.",
    },
  ];

  const handleGenerateReply = async (
    reviewText: string,
    reviewerName: string,
  ) => {
    setIsGeneratingReply(true);
    setReplyText("");

    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ reviewText, reviewerName }),
      });

      if (!response.ok) {
        const text = await response.text();
        let errorMsg = "Desconhecido";
        try { errorMsg = JSON.parse(text).error; } catch(e) {}
        toast.error("Erro ao gerar resposta: " + errorMsg);
        return;
      }
      const data = await response.json();
      setReplyText(data.reply);
      setReplyType("ai");
      toast.success("Resposta gerada com IA!");
    } catch (error) {
      console.error("Error generating reply:", error);
      toast.error("Erro na conexão com o servidor.");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendReply = async (review: any) => {
    if (!replyText.trim()) {
      toast.error("A resposta não pode estar vazia.");
      return;
    }

    const toastId = toast.loading("Enviando resposta...");

    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const refreshToken = userDoc.data()?.gmbRefreshToken;

      if (!refreshToken) {
        toast.error(
          "Por favor, reconecte sua conta do Google na página de Configurações.",
          { id: toastId },
        );
        return;
      }

      // Get fresh access token using refresh token
      const refreshRes = await fetch("/api/auth/google/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!refreshRes.ok) {
        throw new Error("Erro ao renovar sessão. Por favor, reconecte.");
      }

      const refreshContentType = refreshRes.headers.get("content-type"); if (!refreshContentType || refreshContentType.indexOf("application/json") === -1) throw new Error("Expected JSON but got " + refreshContentType); const tokens = await refreshRes.json();
      const token = tokens.access_token;

      if (!token) {
        toast.error("Não foi possível obter o token de acesso.", {
          id: toastId,
        });
        return;
      }

      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/reviews/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          token,
          reviewName: review.name,
          comment: replyText,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro na API do Google");
      }

      if (analytics) {
        logEvent(analytics, "reply_sent", {
          reply_type: replyType,
          template_name:
            replyType === "template" ? replyTemplateName : undefined,
        });
      }

      toast.success("Resposta enviada com sucesso!", { id: toastId });
      setReplyingTo(null);
      setReplyText("");
      setReplyType("manual");
      setReplyTemplateName("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar resposta. Tente reconectar.", {
        id: toastId,
      });
    }
  };

  return (
    <div className="space-y-4">
      {reviews.slice(0, 3).map((review: any) => {
        const isReplying = replyingTo === (review.id || review.name);

        return (
          <div
            key={review.id || review.name}
            className="bg-gray-50 dark:bg-slate-950 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-900 dark:text-white">
                    {review.reviewer?.displayName || "Cliente"}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    •{" "}
                    {review.createTime
                      ? new Date(review.createTime).toLocaleDateString()
                      : "Recente"}
                  </span>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => {
                    const ratingMap: Record<string, number> = {
                      ONE: 1,
                      TWO: 2,
                      THREE: 3,
                      FOUR: 4,
                      FIVE: 5,
                    };
                    const ratingNum =
                      typeof review.starRating === "string"
                        ? ratingMap[review.starRating] || 5
                        : review.starRating || 5;
                    return (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < ratingNum
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    );
                  })}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                  {review.comment || "Avaliação sem texto."}
                </p>
              </div>

              {!isReplying && (
                <button
                  onClick={() => {
                    setReplyingTo(review.id || review.name);
                    setReplyText("");
                  }}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Responder
                  <MessageSquareText size={14} />
                </button>
              )}
            </div>

            {isReplying && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Sua Resposta
                  </p>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide items-center">
                  <button
                    onClick={() =>
                      handleGenerateReply(
                        review.comment || "",
                        review.reviewer?.displayName || "Cliente",
                      )
                    }
                    disabled={isGeneratingReply}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Sparkles
                      size={14}
                      className={isGeneratingReply ? "animate-pulse" : ""}
                    />
                    {isGeneratingReply ? "Gerando..." : "Gerar com IA"}
                  </button>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  {templates.map((tpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setReplyText(tpl.text);
                        setReplyType("template");
                        setReplyTemplateName(tpl.label);
                      }}
                      className="shrink-0 text-xs font-medium bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/40 dark:bg-teal-900/30 text-gray-600 dark:text-gray-400 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => {
                    setReplyText(e.target.value);
                    setReplyType("manual");
                    setReplyTemplateName("");
                  }}
                  placeholder="Escreva sua resposta..."
                  className="w-full h-24 p-3 text-sm bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none mb-3"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => handleSendReply(review)}
                    disabled={!replyText.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                  >
                    <Send size={16} />
                    Enviar Resposta
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as any,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group/sortable w-full"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 cursor-grab opacity-0 group-hover/sortable:opacity-100 transition-opacity z-20 text-gray-400 hover:text-gray-600 dark:text-gray-400 active:cursor-grabbing hidden md:flex"
      >
        <GripVertical size={24} />
      </div>
      {children}
    </div>
  );
}

export default function Dashboard() {
  const user = auth.currentUser;
  const { gmbConnected, businessData, loading, lastUpdated } = useGmbData();
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingCsv, setIsGeneratingCsv] = useState(false);
  const [isEmailScheduled, setIsEmailScheduled] = useState(false);
  const [dashboardDensity, setDashboardDensity] = useState<
    "compact" | "expanded"
  >("expanded");
  const [isSchedulingEmail, setIsSchedulingEmail] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [smartInsights, setSmartInsights] = useState<{
    insightTitle: string;
    insightText: string;
    recommendation: string;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const [aiTip, setAiTip] = useState<string | null>(null);
  const [loadingTip, setLoadingTip] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !gmbConnected) {
      navigate('/conexao');
    }
  }, [loading, gmbConnected, navigate]);

  const DEFAULT_LAYOUT = [
    "metrics",
    "insights",
    "connection",
    "quick_actions",
    "recent_reviews",
    "photos",
  ];
  const [layoutItems, setLayoutItems] = useState(DEFAULT_LAYOUT);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = layoutItems.indexOf(active.id);
      const newIndex = layoutItems.indexOf(over.id);
      const newLayout = arrayMove(layoutItems, oldIndex, newIndex);
      setLayoutItems(newLayout);
      if (user) {
        try {
          await setDoc(
            doc(db, "users", user.uid),
            { dashboardLayout: newLayout },
            { merge: true },
          );
        } catch (error) {
          console.error("Error saving layout", error);
        }
      }
    }
  };

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Joyride State
  const [runTour, setRunTour] = useState(false);
  const [tourSteps] = useState<Step[]>([
    {
      target: ".tour-welcome",
      content:
        "Bem-vindo ao LocalPulse! Aqui você acompanha a reputação da sua empresa.",
      skipBeacon: true,
    },
    {
      target: ".tour-pdf-button",
      content:
        "Gere relatórios em PDF com as principais métricas de desempenho com um único clique.",
    },
    {
      target: ".tour-notifications-button",
      content:
        "Fique por dentro das novidades e receba alertas de novas avaliações do Google.",
    },
    {
      target: ".tour-features",
      content:
        "Estas são as principais áreas em que o LocalPulse vai ajudar você a crescer.",
    },
    {
      target: ".tour-quick-actions",
      content:
        "Acesse rapidamente o Diagnóstico com IA e a geração de QR Code para facilitar avaliações.",
    },
  ]);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem("localpulse_has_seen_joyride");
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem("localpulse_has_seen_joyride", "true");
    }
  };

  // Date range state and derived metrics
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);

  const dashboardMetrics = useMemo(() => {
    if (!businessData)
      return { avgRating: 0, totalReviews: 0, websiteClicks: 0, chartData: [] };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    const reviews = businessData.reviews || [];
    const recentReviews = reviews.filter((r: any) => {
      if (!r.createTime) return true;
      return new Date(r.createTime) >= startDate;
    });

    let avgRating = 0;
    if (recentReviews.length > 0) {
      const sum = recentReviews.reduce((acc: number, review: any) => {
        let rating = 0;
        if (review.starRating === "FIVE") rating = 5;
        if (review.starRating === "FOUR") rating = 4;
        if (review.starRating === "THREE") rating = 3;
        if (review.starRating === "TWO") rating = 2;
        if (review.starRating === "ONE") rating = 1;
        return acc + rating;
      }, 0);
      avgRating = sum / recentReviews.length;
    }

    // Real chart data from reviews
    const reviewsByDate: Record<string, { count: number; sumRating: number }> =
      {};

    // Initialize dates in range with 0
    for (let i = dateRange; i >= 0; i -= dateRange === 90 ? 3 : 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("pt-BR", {
        month: "short",
        day: "numeric",
      });
      reviewsByDate[dateStr] = { count: 0, sumRating: 0 };
    }

    recentReviews.forEach((review: any) => {
      if (review.createTime) {
        const d = new Date(review.createTime);
        const dateStr = d.toLocaleDateString("pt-BR", {
          month: "short",
          day: "numeric",
        });
        if (reviewsByDate[dateStr]) {
          reviewsByDate[dateStr].count += 1;
          let rating = 5;
          if (review.starRating === "FIVE") rating = 5;
          if (review.starRating === "FOUR") rating = 4;
          if (review.starRating === "THREE") rating = 3;
          if (review.starRating === "TWO") rating = 2;
          if (review.starRating === "ONE") rating = 1;
          reviewsByDate[dateStr].sumRating += rating;
        }
      }
    });

    const chartData = Object.keys(reviewsByDate).map((dateStr) => {
      const item = reviewsByDate[dateStr];
      return {
        date: dateStr,
        avaliacoes: item.count,
        nota:
          item.count > 0
            ? parseFloat((item.sumRating / item.count).toFixed(1))
            : 0,
      };
    });

    const performanceMetrics = businessData.performanceMetrics || {};
    const websiteClicks =
      performanceMetrics.websiteClicks || businessData.websiteClicks || 0;

    return {
      avgRating: avgRating || businessData.averageRating || 0,
      totalReviews: recentReviews.length || businessData.totalReviews || 0,
      websiteClicks,
      chartData,
    };
  }, [businessData, dateRange]);

  useEffect(() => {
    const fetchInsights = async () => {
      if (
        !businessData ||
        !dashboardMetrics ||
        dashboardMetrics.totalReviews === 0
      )
        return;

      setLoadingInsights(true);
      try {
        const idToken = await auth.currentUser?.getIdToken();
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            metrics: dashboardMetrics,
            businessData: businessData,
          }),
        });
        });

        if (response.ok) {
          const data = await response.json();
          setSmartInsights(data);
        }
      } catch (error) {
        console.error("Error fetching insights:", error);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchInsights();
  }, [businessData, dashboardMetrics]);

  const profileCompleteness = useMemo(() => {
    if (!businessData) return 0;
    let score = 20; // Base score for having an account
    if (businessData.title || businessData.name) score += 20;
    if (businessData.profile?.description) score += 20;
    if (businessData.storeCode || businessData.metadata?.mapsUri) score += 20;
    if (businessData.phoneNumbers?.primaryPhone || businessData.languageCode)
      score += 20;

    return Math.min(score, 100);
  }, [businessData]);

  useEffect(() => {
    const fetchTip = async () => {
      if (businessData?.reviews && businessData.reviews.length > 0) {
        setLoadingTip(true);
        try {
          // get the most recent reviews with text
          const recentReviews = businessData.reviews
            .filter((r: any) => r.comment && r.comment.trim() !== "")
            .slice(0, 10);

          if (recentReviews.length > 0) {
            const response = await fetch("/api/generate-tip", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                recentReviews: recentReviews.map((r: any) => ({
                  starRating: r.starRating,
                  comment: r.comment,
                })),
              }),
            });
            if (response.ok) {
              const data = await response.json();
              if (data.tip) {
                setAiTip(data.tip);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch tip:", error);
        } finally {
          setLoadingTip(false);
        }
      }
    };

    // Only fetch if we have a connection and data, and tip is not yet loaded
    if (gmbConnected && !loading && !aiTip && !loadingTip) {
      fetchTip();
    }
  }, [businessData, gmbConnected, loading, aiTip]);

  const handleResendVerification = async () => {
    if (!user) return;
    setIsSendingVerification(true);
    const toastId = toast.loading("Enviando e-mail de verificação...");
    try {
      await sendEmailVerification(user);
      toast.success(
        "E-mail de verificação enviado! Verifique sua caixa de entrada.",
        { id: toastId },
      );
    } catch (error: any) {
      console.error(error);
      if (error.code === "auth/too-many-requests") {
        toast.error(
          "Muitas tentativas. Aguarde um momento e tente novamente.",
          { id: toastId },
        );
      } else {
        toast.error("Erro ao enviar e-mail de verificação.", { id: toastId });
      }
    } finally {
      setIsSendingVerification(false);
    }
  };

  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setIsEmailScheduled(userDoc.data().weeklyEmail === true);
            if (userDoc.data().dashboardDensity) {
              setDashboardDensity(userDoc.data().dashboardDensity);
            }
            if (userDoc.data().dashboardLayout) {
              let savedLayout = userDoc.data().dashboardLayout;
              savedLayout = savedLayout.filter((item: string) => item !== "quick_tips");
              // Ensure all default items exist in saved layout (in case we add new features later)
              const missingItems = DEFAULT_LAYOUT.filter(
                (item) => !savedLayout.includes(item),
              );
              setLayoutItems([...savedLayout, ...missingItems]);
            }
          }
        } catch (error: any) {
          if (
            error.code !== "unavailable" &&
            !error.message?.includes("offline")
          ) {
            console.error("Error loading user preferences:", error);
          }
        }
      }
    };
    loadPreferences();
  }, [user]);

  const toggleEmailSchedule = async () => {
    if (!user) return;

    setIsSchedulingEmail(true);
    try {
      const newValue = !isEmailScheduled;
      await setDoc(
        doc(db, "users", user.uid),
        { weeklyEmail: newValue },
        { merge: true },
      );
      setIsEmailScheduled(newValue);

      if (newValue) {
        toast.success(
          "Resumo semanal agendado com sucesso! Você receberá por e-mail.",
        );
      } else {
        toast.success("Envio de resumo semanal desativado.");
      }
    } catch (error) {
      console.error("Error toggling email schedule:", error);
      toast.error("Erro ao atualizar preferência. Tente novamente.");
    } finally {
      setIsSchedulingEmail(false);
    }
  };

  const generateCSV = () => {
    setIsGeneratingCsv(true);

    try {
      const { avgRating, totalReviews, chartData } = dashboardMetrics;

      const headers = ["Data", "Avaliações", "Nota Média"];
      const rows = chartData.map((data: any) => [
        data.date,
        data.avaliacoes,
        data.nota,
      ]);

      const summaryRows = [
        ["Métricas Gerais", "", ""],
        ["Empresa", businessData?.name || "LocalPulse", ""],
        ["Período", `Últimos ${dateRange} dias`, ""],
        ["Total de Avaliações no Período", totalReviews.toString(), ""],
        ["Nota Média no Período", avgRating.toFixed(1), ""],
        ["", "", ""],
        headers,
      ];

      // Use standard formatting for CSV output (BOM for Excel UTF-8 support)
      const csvContent =
        "data:text/csv;charset=utf-8,\uFEFF" +
        summaryRows
          .concat(rows)
          .map((e) => e.join(";"))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `Metricas_LocalPulse_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);

      link.click();
      document.body.removeChild(link);

      toast.success("Relatório CSV gerado com sucesso!");
    } catch (error) {
      console.error("Error generating CSV:", error);
      toast.error("Erro ao gerar o CSV. Tente novamente.");
    } finally {
      setIsGeneratingCsv(false);
    }
  };

  const generatePDF = () => {
    setIsGeneratingPdf(true);

    try {
      const pdf = new jsPDF();

      pdf.setFontSize(22);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Relatório de Desempenho", 20, 20);

      pdf.setFontSize(14);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Empresa: ${businessData?.name || "LocalPulse"}`, 20, 30);
      pdf.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 20, 38);
      pdf.text(`Período analisado: Últimos ${dateRange} dias`, 20, 46);

      pdf.setFontSize(18);
      pdf.setTextColor(40, 40, 40);
      pdf.text("Métricas Principais", 20, 60);

      pdf.setFontSize(14);
      pdf.setTextColor(60, 60, 60);

      const { avgRating, totalReviews } = dashboardMetrics;

      pdf.text(`Avaliações no período: ${totalReviews}`, 20, 70);
      pdf.text(
        `Nota Média no período: ${avgRating > 0 ? avgRating.toFixed(1) : "N/A"} / 5.0`,
        20,
        80,
      );

      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, 90, 190, 90);

      pdf.setFontSize(10);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Gerado por LocalPulse", 20, 100);

      pdf.save(
        `Relatorio_Metricas_${new Date().toISOString().split("T")[0]}.pdf`,
      );

      toast.success("Relatório gerado com sucesso!");
    } catch (err: any) {
      console.error("Erro ao gerar PDF:", err);
      toast.error("Erro ao gerar relatório.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };



  const features = [
    {
      icon: Shield,
      title: "REPUTAÇÃO",
      desc: "Fortaleça sua presença e conquiste confiança.",
      color: "text-teal-500 bg-teal-50 dark:bg-teal-900/30",
    },
    {
      icon: Calendar,
      title: "HORÁRIOS",
      desc: "Descubra os melhores horários para postar.",
      color: "text-purple-600 bg-purple-50",
    },
    {
      icon: MessageSquareText,
      title: "CONTEÚDO COM IA",
      desc: "Crie posts incríveis com inteligência artificial.",
      color: "text-blue-500 bg-blue-50",
    },
    {
      icon: TrendingUp,
      title: "RESULTADOS",
      desc: "Acompanhe métricas e veja seu negócio crescer.",
      color: "text-emerald-500 bg-emerald-50",
    },
  ];

  const cardPaddingClass = dashboardDensity === "compact" ? "p-4" : "p-6";
  const sectionGapClass = dashboardDensity === "compact" ? "gap-4" : "gap-8";
  const dashboardSpaceClass =
    dashboardDensity === "compact" ? "space-y-4" : "space-y-6";

  return (
    <div className={`${dashboardSpaceClass}`} ref={dashboardRef}>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        onEvent={handleJoyrideCallback}
        options={{
          primaryColor: "#2563eb", // blue-600
          zIndex: 1000,
          showProgress: true,
        }}
        locale={{
          back: "Voltar",
          close: "Fechar",
          last: "Concluir",
          next: "Próximo",
          skip: "Pular",
        }}
      />

      {isOffline && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 text-amber-900 dark:text-amber-100 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4 text-sm animate-in fade-in slide-in-from-top-2 shadow-sm mb-4">
          <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full shrink-0 text-amber-700 dark:text-amber-300">
            <WifiOff size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-900 dark:text-amber-100 text-base mb-1">
              Modo Offline Ativado
            </h3>
            <p className="text-amber-800 dark:text-amber-200 mb-2">
              Você está sem conexão com a internet no momento.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-amber-100/50 dark:border-amber-700/30">
                <span className="block font-semibold mb-1">✅ Disponível:</span>
                <ul className="list-disc pl-4 space-y-0.5 opacity-90">
                  <li>Visualização de dados salvos</li>
                  <li>Consulta às últimas avaliações</li>
                  <li>Leitura das dicas e insights</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-slate-900/60 p-3 rounded-xl border border-amber-100/50 dark:border-amber-700/30">
                <span className="block font-semibold mb-1">
                  ⏳ Aguardando conexão:
                </span>
                <ul className="list-disc pl-4 space-y-0.5 opacity-90">
                  <li>Responder a avaliações</li>
                  <li>Sincronizar novos dados do Google</li>
                  <li>Gerar novas dicas com IA</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="py-4 flex justify-between items-center relative">
        <div className="tour-welcome">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-1">
            Visão Geral
          </h2>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Bem-vindo,{" "}
            {user?.displayName
              ? user.displayName.split(" ")[0]
              : "ao LocalPulse"}
            .
          </h1>
        </div>

        <div className="relative flex items-center gap-3">
          {gmbConnected && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleEmailSchedule}
                disabled={isSchedulingEmail}
                title={
                  isEmailScheduled
                    ? "Desativar Resumo Semanal"
                    : "Agendar Resumo Semanal"
                }
                className={`w-12 h-12 border rounded-full flex items-center justify-center relative transition-colors shadow-sm disabled:opacity-50 ${isEmailScheduled ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950"}`}
              >
                {isSchedulingEmail ? (
                  <div
                    className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${isEmailScheduled ? "border-blue-600" : "border-gray-600"}`}
                  ></div>
                ) : (
                  <Mail
                    className={
                      isEmailScheduled
                        ? "text-blue-600"
                        : "text-gray-600 dark:text-gray-400"
                    }
                    size={20}
                  />
                )}
              </button>
              <button
                onClick={generateCSV}
                disabled={isGeneratingCsv}
                title="Exportar Métricas para CSV"
                className="w-12 h-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center relative hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGeneratingCsv ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileSpreadsheet
                    className="text-gray-600 dark:text-gray-400"
                    size={20}
                  />
                )}
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPdf}
                title="Gerar Relatório em PDF"
                className="tour-pdf-button w-12 h-12 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-full flex items-center justify-center relative hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download
                    className="text-gray-600 dark:text-gray-400"
                    size={20}
                  />
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* AI Tip Banner */}
      {/* Profile Completeness */}
      {gmbConnected && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                    Saúde do Perfil
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Completude das informações no Google
                  </p>
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {profileCompleteness}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
            </div>
            {profileCompleteness < 100 && (
              <a
                href="https://business.google.com/edit/info"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-sm font-semibold bg-gray-900 text-white py-2 px-4 rounded-xl hover:bg-black transition-colors flex items-center gap-2"
              >
                Completar Perfil
              </a>
            )}
          </div>
        </div>
      )}

      {(aiTip || loadingTip) && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 dark:border-teal-800/50 p-4 sm:p-5 rounded-2xl flex gap-4 items-start relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500 opacity-[0.03] rounded-bl-full pointer-events-none"></div>
          <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-teal-900 dark:text-teal-100 text-sm mb-1">
              Dica da IA (Histórico Recente)
            </h3>
            {loadingTip ? (
              <div className="h-4 bg-teal-200/50 rounded w-3/4 sm:w-96 animate-pulse mt-2"></div>
            ) : (
              <p className="text-sm text-teal-800 leading-relaxed pr-8">
                {aiTip}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Email Verification Warning */}
      {user && !user.emailVerified && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 dark:bg-amber-900/50 text-amber-600 rounded-full p-2 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100 text-sm">
                Verifique seu e-mail
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                Para garantir a segurança da sua conta e habilitar todos os
                recursos, por favor confirme seu endereço de e-mail.
              </p>
            </div>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={isSendingVerification}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-xl transition-colors shrink-0 disabled:opacity-50"
          >
            {isSendingVerification ? "Enviando..." : "Reenviar e-mail"}
          </button>
        </div>
      )}

      {/* Feature Pills (Horizontal Scroll on Mobile) */}
      <div className="tour-features flex overflow-x-auto gap-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 hide-scrollbar">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <div
              key={i}
              className="min-w-[260px] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-sm"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${feat.color}`}
              >
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mt-0.5">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={layoutItems}
          strategy={verticalListSortingStrategy}
        >
          <div className={`flex flex-col ${sectionGapClass}`}>
            {layoutItems.map((id) => {
              if (id === "metrics")
                return (
                  <SortableItem key={id} id={id}>
                    {/* Metrics & Chart Section */}
                    <div
                      className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 ${cardPaddingClass} shadow-sm overflow-hidden`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Desempenho Geral
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Acompanhe a evolução da sua reputação.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-950 p-1 rounded-xl border border-gray-100 dark:border-slate-800">
                          {[7, 30, 90].map((days) => (
                            <button
                              key={days}
                              onClick={() => setDateRange(days as 7 | 30 | 90)}
                              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                                dateRange === days
                                  ? "bg-white dark:bg-slate-900 text-blue-600 shadow-sm border border-gray-200 dark:border-slate-700"
                                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800"
                              }`}
                            >
                              {days} dias
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-50 dark:bg-slate-950 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 flex flex-col justify-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-2">
                            <Star size={16} className="text-gray-400" /> Nota
                            Média
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {dashboardMetrics.avgRating > 0
                              ? dashboardMetrics.avgRating.toFixed(1)
                              : "N/A"}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            nos últimos {dateRange} dias
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-950 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 flex flex-col justify-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-2">
                            <MessageSquareText
                              size={16}
                              className="text-gray-400"
                            />{" "}
                            Total de Avaliações
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {dashboardMetrics.totalReviews}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            nos últimos {dateRange} dias
                          </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-950 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 flex flex-col justify-center">
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-2">
                            <ExternalLink size={16} className="text-gray-400" />{" "}
                            Cliques no Site
                          </div>
                          <div className="text-3xl font-bold text-gray-900 dark:text-white">
                            {dashboardMetrics.websiteClicks}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            nos últimos {dateRange} dias
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 flex flex-col justify-center relative overflow-hidden">
                          <div className="relative z-10">
                            <div className="text-sm text-blue-700 font-medium mb-1 flex items-center gap-2">
                              <CalendarDays
                                size={16}
                                className="text-blue-500"
                              />{" "}
                              Período
                            </div>
                            <div className="text-xl font-bold text-blue-900">
                              Últimos {dateRange} dias
                            </div>
                            <p className="text-xs text-blue-600/70 mt-1">
                              Filtro aplicado
                            </p>
                          </div>
                          <Sparkles className="absolute -right-4 -bottom-4 text-blue-200 w-24 h-24 opacity-50" />
                        </div>
                      </div>

                      <div className="h-64 w-full">
                        <PerformanceChart data={dashboardMetrics.chartData} />
                      </div>
                    </div>
                  </SortableItem>
                );

              if (id === "insights")
                return gmbConnected ? (
                  <SortableItem key={id} id={id}>
                    {/* Smart Insights Card */}
                    {gmbConnected && (
                      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg border border-indigo-800 mb-8">
                        <Sparkles className="absolute -right-8 -top-8 text-purple-500/30 w-48 h-48" />
                        <div className="relative z-10 flex flex-col md:flex-row gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-indigo-200 mb-3 text-sm font-semibold tracking-wider uppercase">
                              <Sparkles size={16} /> Análise Inteligente
                            </div>

                            {loadingInsights ? (
                              <div className="animate-pulse space-y-4 max-w-2xl">
                                <div className="h-6 bg-white dark:bg-slate-900/20 rounded-md w-3/4"></div>
                                <div className="h-4 bg-white dark:bg-slate-900/10 rounded-md w-full"></div>
                                <div className="h-4 bg-white dark:bg-slate-900/10 rounded-md w-5/6"></div>
                              </div>
                            ) : smartInsights ? (
                              <div className="max-w-3xl">
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
                                  {smartInsights.insightTitle}
                                </h3>
                                <p className="text-indigo-100 text-sm md:text-base leading-relaxed mb-4">
                                  {smartInsights.insightText}
                                </p>
                                <div className="inline-block bg-white dark:bg-slate-900/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                                  <p className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                                    <TrendingUp
                                      size={16}
                                      className="text-green-400"
                                    />
                                    Recomendação Prática
                                  </p>
                                  <p className="text-indigo-50 text-sm">
                                    {smartInsights.recommendation}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="text-indigo-200 text-sm">
                                Não foi possível gerar a análise inteligente no
                                momento.
                              </div>
                            )}
                          </div>

                          <div className="hidden md:flex flex-col justify-center items-end shrink-0">
                            <div className="w-24 h-24 bg-white dark:bg-slate-900/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                              <TrendingUp size={40} className="text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </SortableItem>
                ) : null;

              if (id === "connection")
                return !gmbConnected ? (
                  <SortableItem key={id} id={id}>
                    {/* Connection Card (Only show if NOT connected) */}
                    {!gmbConnected && (
                      <div className="bg-gradient-to-r from-teal-500 to-purple-600 rounded-3xl shadow-md overflow-hidden flex flex-col lg:flex-row">
                        <div className="p-6 sm:p-8 flex-1 text-white relative">
                          <div className="relative z-10 w-full">
                            <h2 className="text-2xl font-bold mb-2">
                              Conecte sua conta do Perfil da Empresa
                            </h2>
                            <p className="text-blue-50 max-w-lg mb-6">
                              Para ver seus dados reais, histórico de avaliações
                              e obter um diagnóstico verdadeiro usando
                              Inteligência Artificial, precisamos que você
                              conecte o Perfil da sua Empresa.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                              <Link
                                to="/conexao"
                                className="bg-white dark:bg-slate-900 text-purple-700 font-bold px-6 py-3.5 rounded-xl shadow-sm hover:bg-gray-50 dark:hover:bg-slate-800/50 dark:bg-slate-950 transition-colors flex items-center justify-center gap-2"
                              >
                                <Store size={20} />
                                Conectar Conta Google
                              </Link>

                              <Link
                                to="/dicas"
                                state={{ openModuleId: 3 }}
                                className="bg-white dark:bg-slate-900/20 hover:bg-white dark:bg-slate-900/30 text-white font-bold py-3.5 px-6 rounded-xl border border-white/30 transition-colors flex items-center justify-center text-center"
                              >
                                Ver Instruções
                              </Link>
                            </div>
                          </div>
                          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white dark:bg-slate-900/20 rounded-full blur-2xl"></div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/10 backdrop-blur-md p-6 sm:p-8 lg:w-80 border-t lg:border-t-0 lg:border-l border-white/20 flex flex-col justify-center">
                          <h3 className="text-white font-bold text-lg mb-2">
                            Ainda não tem um Perfil?
                          </h3>
                          <p className="text-white/80 text-sm mb-5">
                            Crie sua página no Google gratuitamente e seja
                            encontrado por milhares de novos clientes na sua
                            região.
                          </p>
                          <a
                            href="https://business.google.com/create"
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
                  </SortableItem>
                ) : null;

              if (id === "quick_actions")
                return (
                  <SortableItem key={id} id={id}>
                    <div
                      className={`tour-quick-actions grid grid-cols-1 md:grid-cols-2 ${dashboardSpaceClass === "space-y-4" ? "gap-4" : "gap-6"}`}
                    >
                      {/* Quick Actions */}
                      <Link
                        to="/diagnosis"
                        className="flex items-center gap-4 bg-purple-50 hover:bg-purple-100 transition-colors rounded-3xl p-5 border border-purple-100"
                      >
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                          <Sparkles size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-purple-900 text-sm">
                            Diagnóstico com IA
                          </h3>
                          <p className="text-xs text-purple-700/70 mt-0.5">
                            Analise sua reputação online automaticamente
                          </p>
                        </div>
                        <ArrowRight size={20} className="text-purple-400" />
                      </Link>

                      <Link
                        to="/qrcode"
                        className="flex items-center gap-4 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:bg-teal-900/50 dark:hover:bg-teal-800/50 transition-colors rounded-3xl p-5 border border-teal-100 dark:border-teal-800/50"
                      >
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                          <QrCode size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-teal-900 dark:text-teal-100 text-sm">
                            QR Code de Avaliações
                          </h3>
                          <p className="text-xs text-teal-700 dark:text-teal-300/70 mt-0.5">
                            Gere e compartilhe seu QR Code
                          </p>
                        </div>
                        <ArrowRight size={20} className="text-teal-400" />
                      </Link>
                    </div>
                  </SortableItem>
                );

              if (id === "recent_reviews")
                return (
                  <SortableItem key={id} id={id}>
                    {/* Recent Reviews Section */}
                    <div
                      className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 ${cardPaddingClass} shadow-sm`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Últimas Avaliações
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Responda aos seus clientes e mostre que você se
                            importa.
                          </p>
                        </div>
                      </div>

                      {!gmbConnected ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                          <MessageSquareText
                            size={32}
                            className="mx-auto text-gray-300 mb-3"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                            Conecte sua conta do Google para visualizar e
                            responder as avaliações dos seus clientes
                            diretamente daqui.
                          </p>
                          <Link
                            to="/conexao"
                            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Conectar agora
                          </Link>
                        </div>
                      ) : (
                        <ReviewsList reviews={businessData?.reviews || []} />
                      )}
                    </div>
                  </SortableItem>
                );

              if (id === "photos")
                return (
                  <SortableItem key={id} id={id}>
                    <div
                      className={`bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 ${cardPaddingClass} shadow-sm`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Fotos Recentes
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Últimas imagens publicadas no seu Perfil da Empresa.
                          </p>
                        </div>
                      </div>

                      {!gmbConnected ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                          <Camera
                            size={32}
                            className="mx-auto text-gray-300 mb-3"
                          />
                          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-4">
                            Conecte sua conta para visualizar as fotos do seu
                            perfil.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {businessData?.media &&
                          businessData.media.length > 0 ? (
                            businessData.media
                              .slice(0, 3)
                              .map((mediaItem: any, index: number) => (
                                <div
                                  key={index}
                                  className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 relative group"
                                >
                                  {mediaItem.googleUrl ? (
                                    <img
                                      src={mediaItem.googleUrl}
                                      alt={`Foto ${index + 1} do perfil`}
                                      referrerPolicy="no-referrer"
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Camera size={32} />
                                    </div>
                                  )}
                                </div>
                              ))
                          ) : (
                            <div className="col-span-1 sm:col-span-3 text-center py-10 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800">
                              <Camera
                                size={32}
                                className="mx-auto text-gray-300 dark:text-gray-600 mb-3"
                              />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Nenhuma foto encontrada no seu perfil.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </SortableItem>
                );

              return null;
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Sync Status Footer */}
      {(gmbConnected || loading) && (
        <div className="flex justify-center items-center gap-2 pt-2 pb-6 text-xs text-gray-500 dark:text-gray-400">
          {loading ? (
            <>
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Atualizando dados em tempo real...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                Sincronizado{" "}
                {lastUpdated
                  ? `hoje às ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "agora mesmo"}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
