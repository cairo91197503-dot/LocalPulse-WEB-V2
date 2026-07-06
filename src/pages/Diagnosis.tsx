import { useState, useEffect } from "react";
import {
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Target,
  Store,
} from "lucide-react";
import { Link } from "react-router";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";

interface Action {
  titulo: string;
  descricao: string;
  impacto: "Alto" | "Médio" | "Baixo";
}

interface DiagnosisResult {
  score: number;
  nivel: string;
  resumo: string;
  pontos_positivos: string[];
  pontos_negativos: string[];
  acoes_prioritarias: Action[];
}

export default function Diagnosis() {
  const [data, setData] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [stepsEnabled, setStepsEnabled] = useState(false);
  const [hasSeenTour, setHasSeenTour] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("hasSeenDiagnosisTour");
    if (seen === "true") {
      setHasSeenTour(true);
    }
  }, []);

  useEffect(() => {
    if (data && !loading && !hasSeenTour) {
      // Delay slightly to ensure DOM elements are rendered
      const timer = setTimeout(() => {
        setStepsEnabled(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [data, loading, hasSeenTour]);

  const onExit = () => {
    setStepsEnabled(false);
    setHasSeenTour(true);
    localStorage.setItem("hasSeenDiagnosisTour", "true");
  };

  const steps = [
    {
      element: "#tour-diagnosis-score",
      intro:
        "Esta é sua nota geral de reputação. Ela é calculada com base no volume, frequência e qualidade das suas avaliações.",
    },
    {
      element: "#tour-diagnosis-positive",
      intro:
        "Estes são os pontos fortes da sua empresa, identificados pela IA nas suas avaliações.",
    },
    {
      element: "#tour-diagnosis-negative",
      intro:
        "Aqui estão os pontos de atenção. Foque nessas áreas para melhorar a experiência do cliente.",
    },
    {
      element: "#tour-diagnosis-actions",
      intro:
        "Estas são sugestões de ações práticas, priorizadas por impacto, para você aplicar imediatamente.",
    },
  ];

  const fetchDiagnosis = async () => {
    setLoading(true);
    setError("");
    try {
      const user = auth.currentUser;
      let businessContext = "";

      console.log("[Diagnosis UI] Iniciando diagnóstico...");

      if (user) {
        console.log("[Diagnosis UI] Usuário detectado:", user.uid);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.businessData) {
            businessContext = JSON.stringify(userData.businessData);
            setBusinessName(userData.businessData.title || "");
            console.log(
              "[Diagnosis UI] Dados da empresa encontrados:",
              userData.businessData,
            );
          } else {
            console.log(
              "[Diagnosis UI] Usuário NÃO possui 'businessData' no Firestore.",
            );
          }
        }
      }

      if (!businessContext) {
        setLoading(false);
        return; // Don't call the API if not connected
      }

      console.log("[Diagnosis UI] Payload a ser enviado para /api/diagnosis:", {
        businessData: businessContext,
      });

      const res = await fetch("/api/diagnosis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessData: businessContext }),
      });

      console.log("[Diagnosis UI] Status da API /diagnosis:", res.status);

      if (!res.ok) {
        console.error(
          "[Diagnosis UI] Erro da API /diagnosis:",
          res.status,
          res.statusText,
        );
        throw new Error("Failed to fetch diagnosis");
      }
      const contentType = res.headers.get("content-type");
      if (!contentType || contentType.indexOf("application/json") === -1) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }
      const json = await res.json();
      console.log("[Diagnosis UI] Resposta recebida da API (JSON):", json);
      setData(json);
    } catch (err) {
      setError("Não foi possível gerar o diagnóstico. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosis();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-500";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-blue-600";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-600";
  };

  return (
    <div className="space-y-6">
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
      <div className="flex items-center gap-4 py-2">
        <Link
          to="/"
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-gray-600 dark:text-gray-400 transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Diagnóstico de Reputação
        </h1>
      </div>

      {businessName && !loading && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-2xl flex items-center gap-3 shadow-sm">
          <div className="p-2 bg-purple-50 rounded-lg">
            <Store size={20} className="text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Analisando empresa
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{businessName}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin text-purple-600">
            <RefreshCw size={32} />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Analisando sua presença online...
          </p>
        </div>
      )}

      {!loading && !businessName && !data && !error && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Store size={28} className="text-purple-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Conecte sua Empresa
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Para gerar um diagnóstico preciso utilizando Inteligência
            Artificial, você precisa conectar o Perfil da Empresa no Google.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors"
            >
              Conectar no Início
            </Link>
            <Link
              to="/dicas"
              state={{ openModuleId: 3 }}
              className="bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold py-3.5 px-6 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors"
            >
              Ver Instruções
            </Link>
            <a
              href="https://www.google.com/business/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold py-3.5 px-6 rounded-xl border border-blue-200 transition-colors"
            >
              Criar Perfil
            </a>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-6 rounded-2xl border border-red-100 text-center">
          <p className="font-medium mb-4">{error}</p>
          <button
            onClick={fetchDiagnosis}
            className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div
            id="tour-diagnosis-score"
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm text-center"
          >
            <h2
              className={`text-6xl font-black tracking-tighter mb-2 ${getScoreColor(data.score)}`}
            >
              {data.score}
            </h2>
            <p
              className={`text-xl font-bold mb-4 ${getScoreColor(data.score)}`}
            >
              {data.nivel}
            </p>

            <div className="h-2 w-full max-w-md mx-auto bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden mb-6">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getScoreBg(data.score)}`}
                style={{ width: `${data.score}%` }}
              ></div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
              {data.resumo}
            </p>
          </div>

          {data.pontos_positivos.length > 0 && (
            <div id="tour-diagnosis-positive">
              <h3 className="text-green-700 font-bold flex items-center gap-2 mb-3 px-2">
                <CheckCircle2 size={20} /> Pontos positivos
              </h3>
              <div className="space-y-2">
                {data.pontos_positivos.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.pontos_negativos.length > 0 && (
            <div id="tour-diagnosis-negative">
              <h3 className="text-red-700 dark:text-red-300 font-bold flex items-center gap-2 mb-3 px-2 mt-6">
                <AlertTriangle size={20} /> Pontos de atenção
              </h3>
              <div className="space-y-2">
                {data.pontos_negativos.map((p, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm text-gray-700 dark:text-gray-300 text-sm"
                  >
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.acoes_prioritarias.length > 0 && (
            <div id="tour-diagnosis-actions">
              <h3 className="text-purple-700 font-bold flex items-center gap-2 mb-3 px-2 mt-6">
                <Target size={20} /> Ações prioritárias
              </h3>
              <div className="space-y-3">
                {data.acoes_prioritarias.map((acao, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm"
                  >
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white">{acao.titulo}</h4>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                          acao.impacto === "Alto"
                            ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                            : acao.impacto === "Médio"
                              ? "bg-orange-50 text-orange-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {acao.impacto}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {acao.descricao}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              onClick={fetchDiagnosis}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 dark:bg-slate-950 hover:bg-gray-100 dark:hover:bg-slate-800 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-2xl transition-colors border border-gray-200 dark:border-slate-700"
            >
              <RefreshCw size={20} />
              Novo diagnóstico
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
