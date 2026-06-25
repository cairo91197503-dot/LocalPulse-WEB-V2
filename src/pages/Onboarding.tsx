import { useState } from 'react';
import { ArrowRight, TrendingUp, Sparkles, QrCode } from 'lucide-react';
import { Logo } from '../components/Logo';

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);

  const slides = [
    {
      title: "Bem-vindo ao LocalPulse!",
      desc: "Reputação. Conteúdo. Resultados. Vamos impulsionar a sua presença local.",
      icon: <Logo className="w-24 h-24 drop-shadow-xl" />,
      color: "from-blue-500 to-teal-400"
    },
    {
      title: "Diagnóstico com IA",
      desc: "Avalie automaticamente a saúde do seu Perfil da Empresa no Google usando a nossa Inteligência Artificial.",
      icon: <Sparkles className="w-24 h-24 text-purple-600 drop-shadow-md" />,
      color: "from-purple-500 to-indigo-500"
    },
    {
      title: "Colete Avaliações",
      desc: "Gere seu QR Code exclusivo e facilite o processo de receber novas avaliações dos seus clientes.",
      icon: <QrCode className="w-24 h-24 text-teal-600 drop-shadow-md" />,
      color: "from-teal-400 to-emerald-500"
    },
    {
      title: "Acompanhe seus Resultados",
      desc: "Transforme a sua reputação em aumento real de vendas e crescimento sustentável.",
      icon: <TrendingUp className="w-24 h-24 text-blue-600 drop-shadow-md" />,
      color: "from-blue-500 to-cyan-500"
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center animate-in fade-in zoom-in duration-500">
        
        <div className="mb-12 flex justify-center">
          {slides[step].icon}
        </div>

        <div className="text-center px-4">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
            {slides[step].title}
          </h2>
          <p className="text-lg text-gray-600 font-medium leading-relaxed max-w-sm mx-auto min-h-[80px]">
            {slides[step].desc}
          </p>
        </div>

        <div className="mt-12 w-full px-6 flex flex-col items-center gap-8">
          <div className="flex gap-3">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-teal-500' : 'w-2.5 bg-gray-300'}`} 
              />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className={`w-full py-4 px-6 flex justify-center items-center gap-2 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:opacity-90 transition-all bg-gradient-to-r ${slides[step].color}`}
          >
            {step === slides.length - 1 ? "Começar Agora" : "Próximo"}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
