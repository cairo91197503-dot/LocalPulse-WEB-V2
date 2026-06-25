import { useState } from 'react';
import { Shield, TrendingUp, Sparkles } from 'lucide-react';
import { signInWithPopup, auth, googleProvider } from '../lib/firebase';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <TrendingUp size={32} />
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">
          LocalPulse
        </h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Domine o Google Maps e exploda suas vendas locais
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-blue-900/5 sm:rounded-3xl sm:px-10 border border-gray-100">
          
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Shield size={20} />
              </div>
              <p className="text-sm font-medium text-gray-700">Construa uma reputação imbatível no Google.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <p className="text-sm font-medium text-gray-700">Diagnósticos com Inteligência Artificial.</p>
            </div>
          </div>

          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              {loading ? 'Conectando...' : 'Entrar com o Google'}
            </button>
            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
