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
  Bell,
  Download,
  AlertTriangle,
  CalendarDays,
  Trophy,
  FileSpreadsheet,
  Mail,
  Send,
  X,
  WifiOff,
  GripVertical,
} from "lucide-react";
import { Link } from "react-router";
import { auth, db, messaging } from "../lib/firebase";
import { sendEmailVerification } from "firebase/auth";
import { useGmbData } from "../hooks/useGmbData";
import { getToken, onMessage } from "firebase/messaging";
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

  const [isGeneratingReply, setIsGeneratingReply] = useState(false);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
        <MessageSquareText size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
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
      const response = await fetch("/api/generate-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewText, reviewerName }),
      });

      const data = await response.json();
      if (response.ok) {
        setReplyText(data.reply);
        toast.success("Resposta gerada com IA!");
      } else {
        toast.error(
          "Erro ao gerar resposta: " + (data.error || "Desconhecido"),
        );
      }
    } catch (error) {
      console.error("Error generating reply:", error);
      toast.error("Erro na conexão com o servidor.");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error("A resposta não pode estar vazia.");
      return;
    }
    // Simulate API call
    toast
      .promise(new Promise((resolve) => setTimeout(resolve, 1500)), {
        loading: "Enviando resposta via API...",
        success: "Resposta enviada com sucesso!",
        error: "Erro ao enviar resposta.",
      })
      .then(() => {
        setReplyingTo(null);
        setReplyText("");
      });
  };

  return (
    <div className="space-y-4">
      {reviews.slice(0, 3).map((review: any) => {
        const isReplying = replyingTo === (review.id || review.name);

        return (
          <div
            key={review.id || review.name}
            className="bg-gray-50 p-4 rounded-2xl border border-gray-100 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-gray-900">
                    {review.reviewer?.displayName || "Cliente"}
                  </span>
                  <span className="text-xs text-gray-500">
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
                <p className="text-sm text-gray-700 line-clamp-2">
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
              <div className="mt-4 pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-800">
                    Sua Resposta
                  </p>
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
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
                      onClick={() => setReplyText(tpl.text)}
                      className="shrink-0 text-xs font-medium bg-white border border-gray-200 hover:border-teal-300 hover:bg-teal-50 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {tpl.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  className="w-full h-24 p-3 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none mb-3"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendReply}
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
        className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 cursor-grab opacity-0 group-hover/sortable:opacity-100 transition-opacity z-20 text-gray-400 hover:text-gray-600 active:cursor-grabbing hidden md:flex"
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

  const DEFAULT_LAYOUT = [
    "metrics",
    "insights",
    "connection",
    "quick_actions",
    "quick_tips",
    "recent_reviews",
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
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            metrics: dashboardMetrics,
            businessData: businessData,
          }),
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
            const data = await response.json();
            if (response.ok && data.tip) {
              setAiTip(data.tip);
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
            if (userDoc.data().dashboardLayout) {
              const savedLayout = userDoc.data().dashboardLayout;
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

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const setupMessaging = async () => {
      if (messaging && user) {
        try {
          // Request permission
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            const token = await getToken(messaging, {
              vapidKey:
                "BPr7sD0Dq6s4Uf2xN9Hq6g3Z2V9W7Y2X0R4T1Q8M6N5P3L0K7J4H1F8E5C2A9B6", // Optional: Replace with actual VAPID key if you have one
            });
            if (token) {
              await setDoc(
                doc(db, "users", user.uid),
                { fcmToken: token },
                { merge: true },
              );
            }
          }
        } catch (error) {
          console.error("Error setting up Firebase Messaging:", error);
        }

        // Listen for foreground messages
        onMessage(messaging, (payload) => {
          setNotifications((prev) => [
            {
              id: Date.now(),
              type: "push",
              title: payload.notification?.title || "Nova Notificação",
              message: payload.notification?.body || "",
              read: false,
              link: payload.data?.link || "https://business.google.com/reviews",
            },
            ...prev,
          ]);
        });
      }
    };

    setupMessaging();
  }, [user]);

  useEffect(() => {
    if (
      businessData &&
      businessData.reviews &&
      businessData.reviews.length > 0
    ) {
      // Cria uma notificação baseada na última avaliação (apenas como exemplo real)
      const latestReview = businessData.reviews[0];
      setNotifications([
        {
          id: latestReview.reviewId || 1,
          type: "review",
          title: "Nova avaliação recebida!",
          message: `Você recebeu uma avaliação de ${latestReview.reviewer?.displayName || "Cliente"}. Responda para melhorar seu engajamento.`,
          read: false,
          link: "https://business.google.com/reviews",
        },
      ]);
    } else {
      setNotifications([]);
    }
  }, [businessData]);

  // Review Notification Watcher
  const prevReviewsLengthRef = useRef<number>(0);

  useEffect(() => {
    if (businessData && businessData.reviews && user) {
      const currentLength = businessData.reviews.length;
      const prevLength = prevReviewsLengthRef.current;

      if (prevLength > 0 && currentLength > prevLength) {
        // Novas avaliações detectadas
        const newReviewsCount = currentLength - prevLength;
        const latestReview = businessData.reviews[0]; // Assumindo que a mais recente está no índice 0

        const payload = {
          notification: {
            title: "Nova Avaliação Recebida! ⭐",
            body: latestReview
              ? `${latestReview.reviewer.displayName} deixou uma avaliação de ${latestReview.starRating} estrelas.`
              : `Você recebeu ${newReviewsCount} nova(s) avaliação(ões).`,
          },
          data: {
            link: "https://business.google.com/reviews",
          },
        };

        // Disparar Notificação Push (FCM Frontend / Browser API)
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/vite.svg",
            data: payload.data,
          });
        }

        // Adicionar na central de notificações in-app
        setNotifications((prev) => [
          {
            id: Date.now() + Math.floor(Math.random() * 1000),
            type: "review",
            title: payload.notification.title,
            message: payload.notification.body,
            read: false,
            link: payload.data.link,
          },
          ...prev,
        ]);

        toast.success(payload.notification.title, {
          icon: "⭐",
        });
      }

      prevReviewsLengthRef.current = currentLength;
    }
  }, [businessData, user]);

  // Custom Goal Notifications
  useEffect(() => {
    const checkMilestones = async () => {
      if (businessData && businessData.totalReviews && user) {
        // Exemplo de Meta Personalizada: 100 Avaliações
        const TARGET_REVIEWS = 100;

        if (businessData.totalReviews >= TARGET_REVIEWS) {
          const milestoneKey = `fcm_milestone_${TARGET_REVIEWS}_reviews_${businessData.name || "default"}`;
          const hasReachedMilestone = localStorage.getItem(milestoneKey);

          if (!hasReachedMilestone) {
            localStorage.setItem(milestoneKey, "true");

            // Payload simulando notificação FCM
            const payload = {
              notification: {
                title: "Meta Atingida! 🎉",
                body: `Parabéns! Sua empresa alcançou a marca incrível de ${TARGET_REVIEWS} avaliações.`,
              },
              data: {
                link: "https://business.google.com/reviews",
              },
            };

            // Disparar Notificação Push (FCM Frontend / Browser API)
            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification(payload.notification.title, {
                body: payload.notification.body,
                icon: "/vite.svg",
                data: payload.data,
              });
            }

            // Adicionar também na central de notificações in-app
            setNotifications((prev) => [
              {
                id: Date.now() + Math.floor(Math.random() * 1000),
                type: "milestone",
                title: payload.notification.title,
                message: payload.notification.body,
                read: false,
                link: payload.data.link,
              },
              ...prev,
            ]);

            toast.success(
              `Incrível! Você bateu a meta de ${TARGET_REVIEWS} avaliações! 🏆`,
              {
                duration: 5000,
                icon: "🚀",
              },
            );
          }
        }
      }
    };
    checkMilestones();
  }, [businessData, user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const features = [
    {
      icon: Shield,
      title: "REPUTAÇÃO",
      desc: "Fortaleça sua presença e conquiste confiança.",
      color: "text-teal-500 bg-teal-50",
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

  return (
    <div className="space-y-6" ref={dashboardRef}>
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <WifiOff size={18} />
          Modo Offline: Você está sem conexão. Os dados não estão sendo
          atualizados em tempo real.
        </div>
      )}

      {/* Header Info */}
      <div className="py-4 flex justify-between items-center relative">
        <div className="tour-welcome">
          <h2 className="text-sm font-semibold tracking-widest text-gray-500 uppercase mb-1">
            Visão Geral
          </h2>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
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
                className={`w-12 h-12 border rounded-full flex items-center justify-center relative transition-colors shadow-sm disabled:opacity-50 ${isEmailScheduled ? "bg-blue-50 border-blue-200 hover:bg-blue-100" : "bg-white border-gray-200 hover:bg-gray-50"}`}
              >
                {isSchedulingEmail ? (
                  <div
                    className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${isEmailScheduled ? "border-blue-600" : "border-gray-600"}`}
                  ></div>
                ) : (
                  <Mail
                    className={
                      isEmailScheduled ? "text-blue-600" : "text-gray-600"
                    }
                    size={20}
                  />
                )}
              </button>
              <button
                onClick={generateCSV}
                disabled={isGeneratingCsv}
                title="Exportar Métricas para CSV"
                className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center relative hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGeneratingCsv ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FileSpreadsheet className="text-gray-600" size={20} />
                )}
              </button>
              <button
                onClick={generatePDF}
                disabled={isGeneratingPdf}
                title="Gerar Relatório em PDF"
                className="tour-pdf-button w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center relative hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGeneratingPdf ? (
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download className="text-gray-600" size={20} />
                )}
              </button>
            </div>
          )}

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="tour-notifications-button w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center relative hover:bg-gray-50 transition-colors shadow-sm"
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
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">
                      {unreadCount} novas
                    </span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                      Lidas
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors relative ${notification.read ? "opacity-60" : ""}`}
                      >
                        {!notification.read && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                        )}
                        <div className="flex gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              notification.type === "review"
                                ? "bg-yellow-100 text-yellow-600"
                                : notification.type === "milestone"
                                  ? "bg-green-100 text-green-600"
                                  : "bg-purple-100 text-purple-600"
                            }`}
                          >
                            {notification.type === "review" ? (
                              <Star size={18} className="fill-yellow-500" />
                            ) : notification.type === "milestone" ? (
                              <Trophy size={18} className="text-green-500" />
                            ) : (
                              <Sparkles size={18} />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              {notification.type === "review" ? (
                                <a
                                  href={notification.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Ver Avaliação <ExternalLink size={12} />
                                </a>
                              ) : notification.type === "milestone" ? (
                                <a
                                  href={notification.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  Comemorar <ExternalLink size={12} />
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

      {/* AI Tip Banner */}
      {(aiTip || loadingTip) && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-4 sm:p-5 rounded-2xl flex gap-4 items-start relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="absolute right-0 top-0 w-32 h-32 bg-teal-500 opacity-[0.03] rounded-bl-full pointer-events-none"></div>
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
            <Sparkles size={20} className="text-teal-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-teal-900 text-sm mb-1">
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
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="bg-amber-100 text-amber-600 rounded-full p-2 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">
                Verifique seu e-mail
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
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
              className="min-w-[260px] bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4 shrink-0 shadow-sm"
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${feat.color}`}
              >
                <Icon size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {feat.title}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mt-0.5">
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
          <div className="flex flex-col gap-8">
            {layoutItems.map((id) => {
              if (id === "metrics")
                return (
                  <SortableItem key={id} id={id}>
                    {/* Metrics & Chart Section */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Desempenho Geral
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Acompanhe a evolução da sua reputação.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-gray-100">
                          {[7, 30, 90].map((days) => (
                            <button
                              key={days}
                              onClick={() => setDateRange(days as 7 | 30 | 90)}
                              className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${
                                dateRange === days
                                  ? "bg-white text-blue-600 shadow-sm border border-gray-200"
                                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                              }`}
                            >
                              {days} dias
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col justify-center">
                          <div className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-2">
                            <Star size={16} className="text-gray-400" /> Nota
                            Média
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {dashboardMetrics.avgRating > 0
                              ? dashboardMetrics.avgRating.toFixed(1)
                              : "N/A"}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            nos últimos {dateRange} dias
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col justify-center">
                          <div className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-2">
                            <MessageSquareText
                              size={16}
                              className="text-gray-400"
                            />{" "}
                            Total de Avaliações
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {dashboardMetrics.totalReviews}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            nos últimos {dateRange} dias
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col justify-center">
                          <div className="text-sm text-gray-500 font-medium mb-1 flex items-center gap-2">
                            <ExternalLink size={16} className="text-gray-400" />{" "}
                            Cliques no Site
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
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
                                <div className="h-6 bg-white/20 rounded-md w-3/4"></div>
                                <div className="h-4 bg-white/10 rounded-md w-full"></div>
                                <div className="h-4 bg-white/10 rounded-md w-5/6"></div>
                              </div>
                            ) : smartInsights ? (
                              <div className="max-w-3xl">
                                <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
                                  {smartInsights.insightTitle}
                                </h3>
                                <p className="text-indigo-100 text-sm md:text-base leading-relaxed mb-4">
                                  {smartInsights.insightText}
                                </p>
                                <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
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
                            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
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
                    <div className="tour-quick-actions grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Quick Actions */}
                      <Link
                        to="/diagnosis"
                        className="flex items-center gap-4 bg-purple-50 hover:bg-purple-100 transition-colors rounded-3xl p-5 border border-purple-100"
                      >
                        <div className="w-12 h-12 bg-white text-purple-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
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
                        className="flex items-center gap-4 bg-teal-50 hover:bg-teal-100 transition-colors rounded-3xl p-5 border border-teal-100"
                      >
                        <div className="w-12 h-12 bg-white text-teal-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                          <QrCode size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-teal-900 text-sm">
                            QR Code de Avaliações
                          </h3>
                          <p className="text-xs text-teal-700/70 mt-0.5">
                            Gere e compartilhe seu QR Code
                          </p>
                        </div>
                        <ArrowRight size={20} className="text-teal-400" />
                      </Link>
                    </div>
                  </SortableItem>
                );

              if (id === "quick_tips")
                return (
                  <SortableItem key={id} id={id}>
                    {/* Quick Tips Carousel */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Dicas Rápidas
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Ações simples para melhorar seu posicionamento.
                          </p>
                        </div>
                        <Sparkles
                          className="text-blue-500 hidden sm:block"
                          size={24}
                        />
                      </div>

                      <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 hide-scrollbar snap-x">
                        {[
                          {
                            title: "Adicione fotos recentes",
                            desc: "Perfis com fotos recebem 42% mais solicitações de rotas. Poste fotos do seu espaço, produtos ou equipe.",
                            action: "Adicionar Fotos",
                            link: "https://business.google.com/photos",
                            color: "bg-blue-50 border-blue-100 text-blue-900",
                            btnColor: "bg-blue-600 hover:bg-blue-700",
                          },
                          {
                            title: "Atualize horários especiais",
                            desc: "Feriados se aproximando? Mantenha seus clientes informados sobre mudanças no horário de funcionamento.",
                            action: "Atualizar Horários",
                            link: "https://business.google.com/edit/info",
                            color:
                              "bg-purple-50 border-purple-100 text-purple-900",
                            btnColor: "bg-purple-600 hover:bg-purple-700",
                          },
                          {
                            title: "Responda avaliações",
                            desc: "Responder avaliações mostra que você valoriza seus clientes e ajuda a construir confiança com novos clientes.",
                            action: "Ver Avaliações",
                            link: "https://business.google.com/reviews",
                            color: "bg-teal-50 border-teal-100 text-teal-900",
                            btnColor: "bg-teal-600 hover:bg-teal-700",
                          },
                        ].map((tip, idx) => (
                          <div
                            key={idx}
                            className={`min-w-[280px] sm:min-w-[320px] p-5 rounded-2xl border ${tip.color} flex flex-col justify-between shrink-0 snap-center`}
                          >
                            <div>
                              <h4 className="font-bold text-base mb-2">
                                {tip.title}
                              </h4>
                              <p className="text-sm opacity-80 mb-4">
                                {tip.desc}
                              </p>
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
                  </SortableItem>
                );

              if (id === "recent_reviews")
                return (
                  <SortableItem key={id} id={id}>
                    {/* Recent Reviews Section */}
                    <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            Últimas Avaliações
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Responda aos seus clientes e mostre que você se
                            importa.
                          </p>
                        </div>
                      </div>

                      {!gmbConnected ? (
                        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100">
                          <MessageSquareText
                            size={32}
                            className="mx-auto text-gray-300 mb-3"
                          />
                          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-4">
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

              return null;
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Sync Status Footer */}
      {(gmbConnected || loading) && (
        <div className="flex justify-center items-center gap-2 pt-2 pb-6 text-xs text-gray-500">
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
