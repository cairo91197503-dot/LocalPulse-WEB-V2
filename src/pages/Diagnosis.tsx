import { useState, useEffect } from "react";
import { Sparkles, ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, Target } from "lucide-react";
import { Link } from "react-router";

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

  const fetchDiagnosis = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/diagnosis", { method: "POST" });
      if (!res.ok) throw new Error("Failed to fetch diagnosis");
      const json = await res.json();
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
      <div className="flex items-center gap-4 py-2">
        <Link to="/" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Diagnóstico de Reputação</h1>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin text-blue-600">
            <RefreshCw size={32} />
          </div>
          <p className="text-gray-500 font-medium">Analisando sua presença online...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 text-center">
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
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <h2 className={`text-6xl font-black tracking-tighter mb-2 ${getScoreColor(data.score)}`}>
              {data.score}
            </h2>
            <p className={`text-xl font-bold mb-4 ${getScoreColor(data.score)}`}>{data.nivel}</p>
            
            <div className="h-2 w-full max-w-md mx-auto bg-gray-100 rounded-full overflow-hidden mb-6">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${getScoreBg(data.score)}`} 
                style={{ width: `${data.score}%` }}
              ></div>
            </div>
            
            <p className="text-gray-600 max-w-lg mx-auto leading-relaxed">{data.resumo}</p>
          </div>

          {data.pontos_positivos.length > 0 && (
            <div>
              <h3 className="text-green-700 font-bold flex items-center gap-2 mb-3 px-2">
                <CheckCircle2 size={20} /> Pontos positivos
              </h3>
              <div className="space-y-2">
                {data.pontos_positivos.map((p, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-gray-700 text-sm">
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.pontos_negativos.length > 0 && (
            <div>
              <h3 className="text-red-700 font-bold flex items-center gap-2 mb-3 px-2 mt-6">
                <AlertTriangle size={20} /> Pontos de atenção
              </h3>
              <div className="space-y-2">
                {data.pontos_negativos.map((p, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-gray-700 text-sm">
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.acoes_prioritarias.length > 0 && (
            <div>
              <h3 className="text-blue-700 font-bold flex items-center gap-2 mb-3 px-2 mt-6">
                <Target size={20} /> Ações prioritárias
              </h3>
              <div className="space-y-3">
                {data.acoes_prioritarias.map((acao, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="font-bold text-gray-900">{acao.titulo}</h4>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                        acao.impacto === 'Alto' ? 'bg-red-50 text-red-700' :
                        acao.impacto === 'Médio' ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'
                      }`}>
                        {acao.impacto}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{acao.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
              onClick={fetchDiagnosis}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-colors border border-gray-200"
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
