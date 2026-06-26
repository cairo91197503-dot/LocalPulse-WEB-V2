import { useState } from 'react';
import { Shield, Sparkles } from 'lucide-react';
import { signInWithPopup, auth, googleProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from '../lib/firebase';
import { Logo, LogoText } from '../components/Logo';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
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
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center flex flex-col items-center">
        <div className="flex justify-center mb-6">
          <Logo className="w-20 h-20" />
        </div>
        <LogoText className="text-4xl font-black justify-center tracking-tight mb-2" />
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Reputação. Conteúdo. Resultados.
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
            
            <div className="flex items-center justify-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                Permanecer conectado
              </label>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center font-medium">{error}</p>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              Não tem uma conta?{' '}
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="font-bold text-blue-600 hover:text-blue-500 transition-colors disabled:opacity-50"
              >
                Criar conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
