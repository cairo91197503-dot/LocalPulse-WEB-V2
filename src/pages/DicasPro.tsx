import React, { useState, useEffect } from 'react';
import { COURSE_MODULES, GOLD_CHECKLIST_ITEMS, Module } from '../data/curso';
import { ArrowLeft, CheckCircle2, ChevronRight, Trophy, Sparkles, BookOpen, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';

export default function DicasPro() {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [goldChecklist, setGoldChecklist] = useState<boolean[]>(
    new Array(GOLD_CHECKLIST_ITEMS.length).fill(false)
  );

  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem('@gmn_completed_modules');
      const savedChecklist = localStorage.getItem('@gmn_gold_checklist');
      if (savedCompleted) {
        setCompletedModules(JSON.parse(savedCompleted));
      }
      if (savedChecklist) {
        setGoldChecklist(JSON.parse(savedChecklist));
      }
    } catch (e) {
      console.error("Erro carregando progresso", e);
    }
  }, []);

  const toggleModuleCompletion = (moduleId: number) => {
    let updated = [...completedModules];
    if (updated.includes(moduleId)) {
      updated = updated.filter(id => id !== moduleId);
    } else {
      updated.push(moduleId);
    }
    setCompletedModules(updated);
    localStorage.setItem('@gmn_completed_modules', JSON.stringify(updated));
  };

  const toggleChecklistItem = (index: number) => {
    const updated = [...goldChecklist];
    updated[index] = !updated[index];
    setGoldChecklist(updated);
    localStorage.setItem('@gmn_gold_checklist', JSON.stringify(updated));
  };

  const handleOpenModule = (module: Module) => {
    setSelectedModule(module);
    setCurrentPageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPage = () => {
    if (!selectedModule) return;
    if (currentPageIndex < selectedModule.pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (!completedModules.includes(selectedModule.id)) {
        toggleModuleCompletion(selectedModule.id);
      }
      setSelectedModule(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (selectedModule) {
    const page = selectedModule.pages[currentPageIndex];
    
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-4">
          <button 
            onClick={() => setSelectedModule(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Fechar Aula
          </button>
          <div className="text-sm font-bold text-gray-400">
            {currentPageIndex + 1} de {selectedModule.pages.length}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{page.title}</h2>
          {page.subtitle && (
            <p className="text-lg text-gray-500 font-medium mb-8">{page.subtitle}</p>
          )}

          <div className="space-y-4 mb-10">
            {page.paragraphs.map((para, pIdx) => (
              <p key={pIdx} className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                {para}
              </p>
            ))}
          </div>

          {page.type === 'rules' && page.visualData && (
            <div className="grid grid-cols-1 gap-4 mt-8">
              {page.visualData.incorrect && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                  <h4 className="text-red-700 font-bold flex items-center gap-2 mb-2">
                    <span className="text-xl">❌</span> Incorreto
                  </h4>
                  <p className="text-gray-800 font-medium">{page.visualData.incorrect}</p>
                </div>
              )}
              {page.visualData.correct && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <h4 className="text-green-700 font-bold flex items-center gap-2 mb-2">
                    <span className="text-xl">✅</span> Correto
                  </h4>
                  <p className="text-gray-800 font-medium">{page.visualData.correct}</p>
                </div>
              )}
            </div>
          )}

          {page.type === 'example' && page.visualData?.items && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mt-8">
              <h4 className="font-bold text-gray-600 mb-4 flex items-center gap-2">
                <span className="text-xl">🔍</span> Pesquisas Comuns no Google Maps:
              </h4>
              <div className="space-y-3">
                {page.visualData.items.map((searchItem, sIdx) => (
                  <div key={sIdx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-gray-800 italic font-medium">
                    {searchItem}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className={`flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl font-bold transition-colors ${
              currentPageIndex === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm'
            }`}
          >
            <ChevronLeft size={20} />
            Anterior
          </button>
          
          <button
            onClick={handleNextPage}
            className="flex-1 py-4 flex items-center justify-center gap-2 rounded-2xl font-bold text-white transition-opacity hover:opacity-90 shadow-md"
            style={{ backgroundColor: selectedModule.color }}
          >
            {currentPageIndex === selectedModule.pages.length - 1 ? (
              <>Concluir Aula <CheckCircle2 size={20} /></>
            ) : (
              <>Avançar <ChevronRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER DO CURSO */}
      <div className="bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
        <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black tracking-widest uppercase mb-4">
          Curso Completo
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">
          Google Meu Negócio
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
          Domine as estratégias práticas do Perfil de Empresa do Google para ranquear no topo do Maps e explodir suas vendas locais.
        </p>
      </div>

      {/* LISTA DOS MÓDULOS */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" />
            Módulos das Lições
          </h2>
          <span className="text-sm font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {completedModules.length} de {COURSE_MODULES.length} Concluídos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURSE_MODULES.map((module) => {
            const isCompleted = completedModules.includes(module.id);
            return (
              <button
                key={module.id}
                onClick={() => handleOpenModule(module)}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-left flex items-start gap-5 hover:border-gray-300 hover:shadow-md transition-all group"
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-sm"
                  style={{ backgroundColor: `${module.color}15`, color: module.color }}
                >
                  {module.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1 truncate group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                    {module.tagline}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500`}
                        style={{ 
                          backgroundColor: isCompleted ? '#22c55e' : module.color,
                          width: isCompleted ? '100%' : '15%'
                        }}
                      ></div>
                    </div>
                    <span className={`text-xs font-bold ${isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
                      {isCompleted ? "Concluído" : "Pendente"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BÔNUS: CHECKLIST DE OURO */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="text-4xl">🏆</div>
            <div>
              <h2 className="text-2xl font-black text-amber-900 tracking-tight">Checklist de Ouro</h2>
              <p className="text-amber-700 font-medium">O mapa definitivo para ranquear</p>
            </div>
          </div>
          
          <p className="text-amber-800/80 mb-8 font-medium">
            Marque os itens que você já executou de forma consistente no perfil do seu negócio local:
          </p>

          <div className="space-y-3">
            {GOLD_CHECKLIST_ITEMS.map((item, index) => {
              const isChecked = goldChecklist[index];
              return (
                <button
                  key={index}
                  onClick={() => toggleChecklistItem(index)}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-amber-100/50 transition-colors text-left group"
                >
                  <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    isChecked 
                      ? 'bg-amber-500 border-amber-500 text-white' 
                      : 'border-amber-300 bg-white group-hover:border-amber-400'
                  }`}>
                    {isChecked && <CheckCircle2 size={16} strokeWidth={3} />}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    isChecked ? 'text-amber-900/50 line-through' : 'text-amber-900'
                  }`}>
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* BÔNUS: FÓRMULA DE CRESCIMENTO */}
        <div className="bg-blue-50 border border-blue-200 rounded-3xl p-8 h-fit">
          <div className="flex items-center gap-4 mb-8">
            <div className="text-4xl">⚙️</div>
            <div>
              <h2 className="text-2xl font-black text-blue-900 tracking-tight">Fórmula de Crescimento</h2>
              <p className="text-blue-700 font-medium">A engenharia do topo do ranking</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-y-3 gap-x-2 mb-8">
            <div className="bg-white border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">📋 Perfil Completo</div>
            <span className="text-blue-400 font-black">+</span>
            <div className="bg-white border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">⭐ Avaliações</div>
            <span className="text-blue-400 font-black">+</span>
            <div className="bg-white border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">📸 Fotos Frequentes</div>
            <span className="text-blue-400 font-black">+</span>
            <div className="bg-white border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">📢 Posts Semanais</div>
            <span className="text-blue-400 font-black">+</span>
            <div className="bg-white border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">🔍 SEO Local</div>
            <span className="text-blue-400 font-black">+</span>
            <div className="bg-white border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">👥 Engajamento</div>
            <span className="text-blue-400 font-black">+</span>
            <div className="bg-white border border-blue-200 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm">📈 Google Ads</div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-sm">
            <h3 className="font-bold text-green-700 mb-2 flex items-center gap-2">
              <Sparkles size={18} /> = Mais Visibilidade e Vendas 💰
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Quando todos os fatores trabalham em sinergia, as chances de aparecer no topo do Maps e de disparar suas conversões de vendas sobem drasticamente!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
