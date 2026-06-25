export interface LessonPage {
  title: string;
  subtitle?: string;
  paragraphs: string[];
  type: 'concept' | 'example' | 'stats' | 'rules' | 'checklist' | 'formula';
  visualData?: {
    correct?: string;
    incorrect?: string;
    items?: string[];
  };
}

export interface Module {
  id: number;
  title: string;
  tagline: string;
  icon: string;
  color: string;
  pages: LessonPage[];
}

export const COURSE_MODULES: Module[] = [
  {
    id: 1,
    title: "1. O que é Google Meu Negócio?",
    tagline: "Aprenda o poder do Perfil da Empresa",
    icon: "🏪",
    color: "#4285F4",
    pages: [
      {
        title: "O que é o Perfil da Empresa?",
        subtitle: "Ferramenta Gratuita do Google",
        paragraphs: [
          "O antigo Google Meu Negócio, hoje chamado de Perfil da Empresa no Google, é uma ferramenta totalmente gratuita.",
          "Ela permite que sua empresa apareça de forma destacada no Google Maps e nos resultados tradicionais de pesquisa do Google."
        ],
        type: "concept"
      },
      {
        title: "Veja um exemplo prático",
        subtitle: "Como o cliente te encontra",
        paragraphs: [
          "Quando alguém pesquisa termos como:",
          "• 'Restaurante perto de mim'\n• 'Dentista em Anápolis'\n• 'Oficina mecânica aberta agora'",
          "O Google exibe um mapa com empresas locais. O Perfil da Empresa é o que coloca você no mapa!"
        ],
        type: "example",
        visualData: {
          items: ["Restaurante perto de mim 🍕", "Dentista em Anápolis 🦷", "Oficina mecânica aberta agora 🔧"]
        }
      },
      {
        title: "Principais Benefícios",
        subtitle: "O impacto no seu bolso",
        paragraphs: [
          "Ao otimizar seu Perfil da Empresa, você garante:",
          "📈 Mais visibilidade local",
          "📞 Mais ligações de clientes interessados",
          "🌐 Mais visitas ao seu site",
          "📍 Mais pedidos de rota até sua loja física",
          "💰 Consequentemente, muito mais vendas!"
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 2,
    title: "2. Como o Google Decide o Top 1?",
    tagline: "Os 3 pilares do ranqueamento local",
    icon: "🎯",
    color: "#EA4335",
    pages: [
      {
        title: "Os 3 Pilares do Algoritmo",
        subtitle: "Entenda o mecanismo do Maps",
        paragraphs: [
          "O Google usa três fatores principais para decidir qual empresa aparece primeiro nas buscas locais.",
          "Compreender estes fatores é crucial para otimizar seu perfil e bater a concorrência."
        ],
        type: "concept"
      },
      {
        title: "1. Relevância & 2. Distância",
        subtitle: "Correspondência e Proximidade",
        paragraphs: [
          "🧲 RELEVÂNCIA: O quanto seu perfil corresponde ao que o cliente procura. Exemplo: se procuram 'Pizza em Anápolis', uma pizzaria bem configurada se destaca.",
          "📍 DISTÂNCIA: Quanto mais próximo do usuário, maiores as chances. *Nota: Este fator não pode ser manipulado geograficamente.*"
        ],
        type: "rules"
      },
      {
        title: "3. Popularidade (Autoridade)",
        subtitle: "O fator mais importante",
        paragraphs: [
          "⭐ POPULARIDADE: O quão conhecido e confiável o seu negócio parece para a internet.",
          "O Google analisa constantemente: quantidade de avaliações, notas recebidas, frequência de novas fotos, cliques e menções ao seu nome na web."
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 3,
    title: "3. Configuração Correta do Perfil",
    tagline: "Evite erros e preencha como um profissional",
    icon: "⚙️",
    color: "#FBBC05",
    pages: [
      {
        title: "Nome da Empresa",
        subtitle: "Não faça Keyword Stuffing!",
        paragraphs: [
          "O nome do perfil deve ser exatamente o nome real e oficial da sua empresa.",
          "Evite empilhar palavras-chave promocionais no nome, pois isso gera punição e bloqueio do perfil!"
        ],
        type: "rules",
        visualData: {
          correct: "Oficina do João",
          incorrect: "Oficina do João Melhor Mecânico de Anápolis Preço Baixo"
        }
      },
      {
        title: "Categorias: O Segredo",
        subtitle: "Principal vs. Secundárias",
        paragraphs: [
          "CATEGORIA PRINCIPAL: Escolha a mais específica possível (ex: Clínica Odontológica). É o fator de maior peso.",
          "CATEGORIAS SECUNDÁRIAS: Adicione categorias complementares que também façam parte do seu portfólio (ex: Dentista Estético, Implantodontista, Ortodontista)."
        ],
        type: "concept"
      },
      {
        title: "Horários, Serviços e Produtos",
        subtitle: "Mantenha o catálogo atualizado",
        paragraphs: [
          "• Horários: Atualize em feriados e recessos temporários.",
          "• Serviços: Cadastre cada serviço oferecido detalhadamente.",
          "• Produtos: Cadastre fotos, descrição técnica e preços dos seus itens principais para habilitar a vitrine."
        ],
        type: "checklist"
      }
    ]
  },
  {
    id: 4,
    title: "4. Fotos que Geram Resultados",
    tagline: "O poder visual do seu perfil",
    icon: "📸",
    color: "#34A853",
    pages: [
      {
        title: "Fotos Obrigatórias",
        subtitle: "O que não pode faltar no perfil",
        paragraphs: [
          "Perfis ricos em fotos recebem muito mais interações e trazem maior credibilidade:",
          "🖼️ Fachada: Ajuda clientes a reconhecerem o local ao chegar.",
          "🛋️ Interior: Passa sensação de organização e segurança.",
          "👥 Equipe: Humaniza o atendimento.",
          "📦 Produtos / Serviços: Demonstra os diferenciais do negócio."
        ],
        type: "concept"
      },
      {
        title: "Frequência de Publicação",
        subtitle: "Mantenha a constância",
        paragraphs: [
          "A atualização frequente de imagens sinaliza para o robô do Google que sua empresa está ativa e movimentada.",
          "• Frequência Mínima: 3 a 5 novas fotos por semana.",
          "• Frequência Ideal: 1 nova foto por dia."
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 5,
    title: "5. Estratégia de Avaliações",
    tagline: "Consiga notas altas e avaliações constantes",
    icon: "⭐",
    color: "#FF9900",
    pages: [
      {
        title: "Como Conseguir Mais",
        subtitle: "Gere o hábito de pedir feedback",
        paragraphs: [
          "O gatilho mais forte para novas avaliações é o pedido ativo no encerramento de cada venda:",
          "💬 'Seu feedback é muito importante para nós! Se gostou do nosso atendimento, poderia deixar uma avaliação rápida no Google? Nos ajuda demais!'"
        ],
        type: "example"
      },
      {
        title: "Metas de Crescimento",
        subtitle: "Objetivos claros",
        paragraphs: [
          "Sua primeira grande meta deve ser bater 50 avaliações com uma nota média acima de 4.7.",
          "Depois, busque manter a constância para atingir marcas mais expressivas: 100+, 200+ e até 500+ avaliações."
        ],
        type: "stats"
      },
      {
        title: "Como Responder",
        subtitle: "Responda a absolutamente 100% delas",
        paragraphs: [
          "🟢 POSITIVAS: Agradeça pelo nome e reforce a relação: 'Agradecemos a confiança, João! Volte sempre!'",
          "🔴 NEGATIVAS: Seja polido, assuma o problema e puxe para o offline: 'Sentimos muito por isso. Entre em contato pelo WhatsApp (XX) XXXX-XXXX para resolvermos seu caso.'"
        ],
        type: "rules"
      }
    ]
  },
  {
    id: 6,
    title: "6. Postagens Semanais",
    tagline: "Diferencial de mercado pouco explorado",
    icon: "✍️",
    color: "#9C27B0",
    pages: [
      {
        title: "Sua Vantagem Competitiva",
        subtitle: "Pouquíssimos concorrentes fazem isso",
        paragraphs: [
          "A ferramenta de postagens do Google funciona como uma mini rede social de ofertas.",
          "Usá-la com constância cria uma vantagem gigantesca, pois a maioria das empresas locais abandona essa seção."
        ],
        type: "concept"
      },
      {
        title: "Cronograma de Conteúdo",
        subtitle: "2 a 3 vezes por semana",
        paragraphs: [
          "🏷️ Promoções: Ex: 'Troca de óleo com 15% de desconto para novos clientes.'",
          "🎬 Bastidores: Fotos da equipe trabalhando, organização do ambiente.",
          "🆕 Novidades: Novos aparelhos, serviços ou produtos recebidos.",
          "💬 Prova Social: Depoimentos de clientes satisfeitos convertidos em texto."
        ],
        type: "checklist"
      }
    ]
  },
  {
    id: 7,
    title: "7. SEO Local Avançado",
    tagline: "Otimize seu site e presença digital",
    icon: "🔍",
    color: "#00BCD4",
    pages: [
      {
        title: "Uso de Palavras-chave",
        subtitle: "Otimização sutil",
        paragraphs: [
          "Insira de maneira natural no campo de descrição da empresa, nos posts e nas respostas de avaliações a combinação:",
          "👉 [Serviço] + [Cidade/Bairro]",
          "Exemplo: 'Oficina mecânica especializada em Anápolis.'"
        ],
        type: "example"
      },
      {
        title: "Site Integrado de Qualidade",
        subtitle: "O Google analisa todo o ecossistema",
        paragraphs: [
          "Ter um site limpo conectado ao perfil melhora drasticamente o posicionamento.",
          "Seu site precisa de carregamento rápido, conter a cidade no texto, a lista de serviços oferecidos e o mapa oficial incorporado via iframe do Google Maps."
        ],
        type: "concept"
      },
      {
        title: "Consistência NAP",
        subtitle: "Mantenha os dados idênticos",
        paragraphs: [
          "🔒 NAP (Name, Address, Phone):",
          "Nome, Endereço e Telefone precisam estar idênticos em toda a internet.",
          "Verifique se o formato cadastrado no site, no Instagram, no Facebook e no Google Meu Negócio é exatamente o mesmo."
        ],
        type: "rules"
      }
    ]
  },
  {
    id: 8,
    title: "8. Como Entrar no Top 3?",
    tagline: "A mina de ouro do tráfego local",
    icon: "🏆",
    color: "#FFD700",
    pages: [
      {
        title: "A Importância do Top 3",
        subtitle: "Onde 80% das ligações acontecem",
        paragraphs: [
          "Estar no Top 3 (os primeiros três resultados que aparecem no mapa principal) garante um fluxo constante de clientes sem precisar investir em anúncios diários."
        ],
        type: "concept"
      },
      {
        title: "Checklist dos Campeões",
        subtitle: "O que focar para vencer",
        paragraphs: [
          "✔️ Perfil 100% preenchido e verificado.",
          "✔️ Novas avaliações chegando todas as semanas.",
          "✔️ Fotos novas enviadas semanalmente.",
          "✔️ Atualização frequente através de posts.",
          "✔️ Respostas imediatas a todas as dúvidas/mensagens recebidas.",
          "✔️ Um site estruturado de alta velocidade conectado."
        ],
        type: "checklist"
      }
    ]
  },
  {
    id: 9,
    title: "9. Seção de Perguntas e Respostas",
    tagline: "Antecipe as dúvidas do seu comprador",
    icon: "❓",
    color: "#607D8B",
    pages: [
      {
        title: "FAQ Integrado",
        subtitle: "Você mesmo pode criar as perguntas!",
        paragraphs: [
          "Sabia que você pode usar sua conta pessoal para fazer perguntas no seu perfil e responder com a conta da sua empresa?",
          "Isso ajuda o cliente a tirar dúvidas rápidas e alimenta o SEO com palavras-chave relevantes."
        ],
        type: "concept"
      },
      {
        title: "Sugestões de Perguntas Úteis",
        subtitle: "Facilite a tomada de decisão",
        paragraphs: [
          "❓ P: 'Vocês atendem aos sábados?'\n👉 R: 'Sim, atendemos das 8h às 12h aos sábados.'",
          "❓ P: 'Possuem estacionamento próprio?'\n👉 R: 'Sim, temos vagas exclusivas e gratuitas na frente.'",
          "❓ P: 'Fazem orçamento sem compromisso?'\n👉 R: 'Sim, fazemos sem custo algum.'"
        ],
        type: "example"
      }
    ]
  },
  {
    id: 10,
    title: "10. Google Ads para Negócios",
    tagline: "Acelere seus resultados no primeiro dia",
    icon: "📈",
    color: "#1A73E8",
    pages: [
      {
        title: "Tráfego Pago Imediato",
        subtitle: "Apareça no topo agora mesmo",
        paragraphs: [
          "Se você acabou de criar o perfil, o SEO orgânico pode demorar semanas. O Google Ads coloca você no topo de forma instantânea para buscas específicas como 'dentista anápolis'."
        ],
        type: "concept"
      },
      {
        title: "Campanhas Recomendadas",
        subtitle: "Formatos eficientes",
        paragraphs: [
          "• Campanhas Locais: Focadas em gerar rotas no mapa, ligações e contatos de WhatsApp.",
          "• Performance Max (PMax Local): O próprio Google distribui os anúncios na Pesquisa, Maps, YouTube, Gmail e Rede de Display de forma inteligente."
        ],
        type: "stats"
      },
      {
        title: "Orçamento Inicial",
        subtitle: "Quanto investir?",
        paragraphs: [
          "• Pequenos Negócios Locais: R$ 20,00 a R$ 50,00 por dia são suficientes para dominar o bairro.",
          "• Empresas de Médio/Grande Porte: R$ 100,00+ por dia para cobrir uma cidade inteira de forma massiva."
        ],
        type: "rules"
      }
    ]
  },
  {
    id: 11,
    title: "11. Métricas Importantes",
    tagline: "O que analisar nos relatórios mensais",
    icon: "📊",
    color: "#E91E63",
    pages: [
      {
        title: "Dados que Importam",
        subtitle: "Esqueça métricas de vaidade",
        paragraphs: [
          "Acompanhe mensalmente as seguintes ações dos clientes para entender o retorno do seu trabalho:",
          "👁️ Visualizações: Quantas pessoas encontraram seu negócio.",
          "📞 Ligações: Quantas pessoas ligaram direto do botão do Google.",
          "🗺️ Pedidos de Rota: Pessoas com real intenção de ir à sua loja."
        ],
        type: "stats"
      },
      {
        title: "Cliques no Site e Avaliações",
        subtitle: "Interesse e Reputação",
        paragraphs: [
          "• Cliques no Site: Mostra que o cliente quer conhecer mais sobre seu portfólio de produtos.",
          "• Quantidade e Nota de Avaliações: Deve crescer mês a mês. Se as avaliações caírem, ligue o alerta na sua equipe de atendimento!"
        ],
        type: "concept"
      }
    ]
  },
  {
    id: 12,
    title: "12. Erros que Derrubam Ranking",
    tagline: "O que nunca fazer no seu perfil",
    icon: "🚫",
    color: "#D32F2F",
    pages: [
      {
        title: "Lista de Proibições",
        subtitle: "Ações passíveis de punição",
        paragraphs: [
          "O Google monitora comportamentos suspeitos. Evite a todo custo:",
          "❌ Comprar avaliações falsas em sites paralelos.",
          "❌ Inserir slogans ou serviços no nome oficial da empresa.",
          "❌ Abandonar o perfil sem atualizações ou postagens.",
          "❌ Fornecer endereço incorreto ou usar endereços falsos apenas para fingir proximidade."
        ],
        type: "rules"
      },
      {
        title: "Erros Operacionais",
        subtitle: "Negligências que custam clientes",
        paragraphs: [
          "❌ Deixar avaliações críticas sem nenhuma resposta.",
          "❌ Manter horários desatualizados (fazer o cliente dar viagem perdida).",
          "❌ Criar perfis duplicados para a mesma empresa (gera suspensão em ambos)."
        ],
        type: "rules"
      }
    ]
  },
  {
    id: 13,
    title: "13. Estratégia de 30 Dias",
    tagline: "Seu plano de ação passo a passo",
    icon: "📅",
    color: "#4CAF50",
    pages: [
      {
        title: "Semana 1 & 2",
        subtitle: "Fase de Fundação e Ativação",
        paragraphs: [
          "📅 SEMANA 1 (Preenchimento): Complete todas as lacunas do perfil, suba ao menos 20 fotos ótimas, cadastre todos os serviços e os principais produtos.",
          "📅 SEMANA 2 (Reputação): Consiga as primeiras 10 avaliações de clientes fiéis, responda todos os comentários antigos e crie 3 postagens iniciais."
        ],
        type: "checklist"
      },
      {
        title: "Semana 3 & 4",
        subtitle: "Fase de Escala e Análise",
        paragraphs: [
          "📅 SEMANA 3 (Interação): Crie o FAQ de perguntas frequentes, suba novas fotos dos bastidores e publique a sua primeira grande oferta promocional.",
          "📅 SEMANA 4 (Tração): Inicie suas primeiras campanhas de Google Ads local, analise as métricas do painel e reforce os pedidos de novas avaliações."
        ],
        type: "checklist"
      }
    ]
  }
];

export const GOLD_CHECKLIST_ITEMS = [
  "Perfil verificado pelo Google",
  "Categoria principal e secundárias configuradas",
  "Todos os serviços cadastrados individualmente",
  "Vitrine de produtos ativa com fotos e preços",
  "Site estruturado e conectado ao perfil",
  "Botão de WhatsApp atualizado",
  "Mais de 100 fotos cadastradas no total",
  "Postagens sendo feitas semanalmente",
  "Fluxo de avaliações constantes de clientes",
  "Respostas dadas em 100% das avaliações recebidas",
  "Estratégia de SEO local aplicada",
  "Anúncios ativos no Google Ads",
  "Informações cadastrais sempre atualizadas"
];
