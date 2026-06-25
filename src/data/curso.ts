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
    title: "1. O Que é o Perfil da Empresa?",
    tagline: "Entenda a plataforma atual do Google",
    icon: "🏪",
    color: "#4285F4",
    pages: [
      {
        title: "Ferramenta Gratuita",
        subtitle: "Apresentação na Pesquisa e Maps",
        paragraphs: [
          "O Perfil da Empresa no Google é uma ferramenta gratuita que permite gerenciar como uma empresa aparece na Pesquisa Google e no Google Maps.",
          "Hoje não existe mais o antigo 'Google Meu Negócio' como plataforma separada. O gerenciamento acontece diretamente pela Pesquisa Google, Google Maps e painel do Perfil da Empresa."
        ],
        type: "concept"
      },
      {
        title: "O que o cliente vê?",
        subtitle: "A resposta para pesquisas locais",
        paragraphs: [
          "Quando alguém pesquisa termos como:",
          "• Restaurante perto de mim\n• Advogado em Anápolis\n• Oficina mecânica aberta agora",
          "O Google exibe informações vitais da sua empresa para a tomada de decisão."
        ],
        type: "example",
        visualData: {
          items: [
            "Nome da empresa",
            "Avaliações",
            "Telefone",
            "Endereço e Horário",
            "Fotos",
            "Site e Rotas",
            "Produtos e serviços"
          ]
        }
      }
    ]
  },
  {
    id: 2,
    title: "2. Como o Google Define o Ranking",
    tagline: "Os três pilares do algoritmo local",
    icon: "🎯",
    color: "#EA4335",
    pages: [
      {
        title: "Relevância",
        subtitle: "Correspondência exata",
        paragraphs: [
          "Quão bem seu perfil corresponde ao que o usuário procura.",
          "Exemplo:",
          "Pesquisa: 'Dentista infantil'",
          "Perfil: Categoria 'Odontopediatra'",
          "Resultado: Maior relevância para a pesquisa do usuário."
        ],
        type: "concept"
      },
      {
        title: "Distância",
        subtitle: "O fator geográfico",
        paragraphs: [
          "A proximidade entre o usuário e o negócio.",
          "O Google considera:",
          "• Localização do usuário",
          "• Região pesquisada",
          "Não existe forma legítima de manipular esse fator, mas é fundamental estar visível para os clientes ao seu redor."
        ],
        type: "rules"
      },
      {
        title: "Destaque (Prominence)",
        subtitle: "A autoridade da sua marca",
        paragraphs: [
          "Representa a popularidade e autoridade da empresa. O Google considera:",
          "• Avaliações (Quantidade e Qualidade)",
          "• Citações na internet",
          "• Autoridade do site",
          "• Popularidade da marca"
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 3,
    title: "3. Criação e Verificação",
    tagline: "Primeiros passos no Perfil",
    icon: "✅",
    color: "#34A853",
    pages: [
      {
        title: "Cadastro Inicial",
        subtitle: "Informações obrigatórias",
        paragraphs: [
          "Para começar, você precisará preencher:",
          "• Nome real da empresa",
          "• Categoria principal",
          "• Endereço (quando aplicável)",
          "• Área de atendimento",
          "• Telefone e Site"
        ],
        type: "checklist"
      },
      {
        title: "Processo de Verificação",
        subtitle: "Confirmando sua propriedade",
        paragraphs: [
          "O Google pode solicitar diferentes métodos de verificação para confirmar que o negócio é seu:",
          "• Vídeo de verificação (gravando o local de trabalho)",
          "• Telefone (código por SMS ou chamada)",
          "• E-mail",
          "• Verificação documental",
          "Os métodos disponíveis variam conforme o tipo de negócio e região."
        ],
        type: "rules"
      }
    ]
  },
  {
    id: 4,
    title: "4. Configuração Profissional",
    tagline: "Otimize os dados da sua empresa",
    icon: "⚙️",
    color: "#FBBC05",
    pages: [
      {
        title: "Nome da Empresa",
        subtitle: "Apenas a verdade",
        paragraphs: [
          "Utilize apenas o nome real da sua empresa. Evite colocar termos promocionais ou palavras-chave extras, pois essa prática viola as diretrizes do Google."
        ],
        type: "rules",
        visualData: {
          correct: "Auto Center Brasil",
          incorrect: "Auto Center Brasil Melhor Oficina Mecânica de Anápolis"
        }
      },
      {
        title: "Categorias",
        subtitle: "Principal e Secundárias",
        paragraphs: [
          "CATEGORIA PRINCIPAL: É um dos fatores mais importantes para o ranking. Escolha a categoria mais específica possível. Exemplo: Melhor 'Clínica Odontológica' do que 'Empresa'.",
          "CATEGORIAS SECUNDÁRIAS: Adicione categorias complementares que representem outras áreas do seu negócio (Ex: Dentista, Ortodontista, Implantodontista)."
        ],
        type: "concept"
      }
    ]
  },
  {
    id: 5,
    title: "5. Serviços e Produtos",
    tagline: "Mostre o que você vende",
    icon: "🛍️",
    color: "#00BCD4",
    pages: [
      {
        title: "Serviços",
        subtitle: "Detalhe sua especialidade",
        paragraphs: [
          "Cadastre todos os serviços oferecidos pela sua empresa. Isso ajuda o Google a entender exatamente o que você faz.",
          "Exemplo (Oficina):",
          "• Troca de óleo",
          "• Revisão",
          "• Alinhamento e Balanceamento"
        ],
        type: "checklist"
      },
      {
        title: "Catálogo de Produtos",
        subtitle: "Sua vitrine digital",
        paragraphs: [
          "Para negócios que vendem produtos, o catálogo é essencial. Cada produto cadastrado deve possuir:",
          "• Nome claro",
          "• Foto atrativa e de alta qualidade",
          "• Descrição completa",
          "• Faixa de preço"
        ],
        type: "concept"
      }
    ]
  },
  {
    id: 6,
    title: "6. Fotos e Vídeos",
    tagline: "O visual que converte clientes",
    icon: "📸",
    color: "#9C27B0",
    pages: [
      {
        title: "Fotos Recomendadas",
        subtitle: "Apresente sua empresa",
        paragraphs: [
          "Conteúdo visual influencia diretamente a confiança dos clientes. Tenha fotos de:",
          "• Externa (Fachada)",
          "• Interna (Ambiente)",
          "• Equipe (Humanização)",
          "• Produtos (Mostra qualidade)",
          "• Serviços (Execução real)"
        ],
        type: "checklist"
      },
      {
        title: "Vídeos e Frequência",
        subtitle: "Mantenha a constância",
        paragraphs: [
          "O Google permite vídeos curtos mostrando sua estrutura, atendimento, processos ou produtos.",
          "Recomendação de Frequência: Adicione novas fotos semanalmente. As atualizações contínuas sinalizam que o negócio está ativo."
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 7,
    title: "7. Avaliações",
    tagline: "O motor da sua reputação digital",
    icon: "⭐",
    color: "#FF9800",
    pages: [
      {
        title: "Como pedir avaliações",
        subtitle: "Seja proativo",
        paragraphs: [
          "As avaliações são um dos fatores mais importantes para conversão.",
          "Após o atendimento, peça gentilmente: 'Obrigado pela preferência. Sua avaliação ajuda nossa empresa a melhorar e ajuda outros clientes.'"
        ],
        type: "example"
      },
      {
        title: "O que evitar",
        subtitle: "Práticas proibidas",
        paragraphs: [
          "Nunca compre avaliações, nunca crie avaliações falsas e evite incentivar avaliações positivas em troca de benefícios financeiros ou brindes condicionados (o Google pode penalizar o perfil)."
        ],
        type: "rules"
      },
      {
        title: "Como responder avaliações",
        subtitle: "A etiqueta online",
        paragraphs: [
          "• Positiva: Agradeça e personalize a resposta.",
          "• Negativa: Mantenha a calma, responda profissionalmente, mostre empatia e ofereça uma solução fora do ambiente público (telefone/e-mail)."
        ],
        type: "concept"
      }
    ]
  },
  {
    id: 8,
    title: "8. Mensagens e Contatos",
    tagline: "Comunicação rápida",
    icon: "💬",
    color: "#FF5722",
    pages: [
      {
        title: "Disponibilidade de Contato",
        subtitle: "Esteja alcançável",
        paragraphs: [
          "Dependendo da disponibilidade do Google para sua região e categoria, os recursos de mensagem podem variar.",
          "Mantenha sempre:",
          "• Telefone atualizado e funcional",
          "• Site no ar",
          "• Horários de funcionamento corretos (especialmente em feriados)"
        ],
        type: "checklist"
      }
    ]
  },
  {
    id: 9,
    title: "9. Postagens",
    tagline: "Atualize sua audiência",
    icon: "📰",
    color: "#03A9F4",
    pages: [
      {
        title: "Tipos de Postagens",
        subtitle: "Variedade de conteúdo",
        paragraphs: [
          "As postagens ajudam a manter o perfil atualizado. Use os seguintes formatos:",
          "• Novidades (Novos produtos)",
          "• Ofertas (Promoções)",
          "• Eventos (Datas especiais)",
          "• Conteúdo Educativo (Dicas e orientações)"
        ],
        type: "concept"
      },
      {
        title: "Frequência de Publicação",
        subtitle: "Ritmo ideal",
        paragraphs: [
          "Recomendação de Frequência: 1 a 3 publicações por semana para manter o perfil ativo e relevante."
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 10,
    title: "10. SEO Local",
    tagline: "Apareça nas pesquisas",
    icon: "🔍",
    color: "#4CAF50",
    pages: [
      {
        title: "O que é SEO Local?",
        subtitle: "Otimização geográfica",
        paragraphs: [
          "SEO Local é o processo de otimizar sua presença para pesquisas geográficas."
        ],
        type: "concept"
      },
      {
        title: "Palavras-chave e Consistência",
        subtitle: "Seja encontrado",
        paragraphs: [
          "Palavras-chave (ex: 'Oficina mecânica em Anápolis') devem aparecer naturalmente no site, nas páginas de serviço e conteúdos.",
          "Consistência de Dados (NAP): As informações (Nome, Endereço e Telefone) devem ser iguais em seu Site, Redes Sociais, Diretórios e Perfil da Empresa."
        ],
        type: "rules"
      },
      {
        title: "Backlinks Locais",
        subtitle: "Citações que geram autoridade",
        paragraphs: [
          "Busque parcerias e citações em:",
          "• Associações comerciais",
          "• Portais locais",
          "• Jornais regionais",
          "Isso pode fortalecer a autoridade local da sua empresa."
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 11,
    title: "11. Site e Perfil Juntos",
    tagline: "A dupla perfeita",
    icon: "💻",
    color: "#673AB7",
    pages: [
      {
        title: "O Perfil não substitui um site",
        subtitle: "A importância do site",
        paragraphs: [
          "O Perfil da Empresa é excelente, mas não substitui um site próprio. O ideal é possuir:",
          "• Página Inicial (Apresentação)",
          "• Serviços (Detalhamento)",
          "• Contato (Telefone e localização)",
          "• Blog (Conteúdo educativo)"
        ],
        type: "checklist"
      }
    ]
  },
  {
    id: 12,
    title: "12. Google Maps",
    tagline: "O canal de descoberta",
    icon: "🗺️",
    color: "#F44336",
    pages: [
      {
        title: "Objetivos no Maps",
        subtitle: "Visibilidade em trânsito",
        paragraphs: [
          "O Google Maps é o principal canal de descoberta local. Seus objetivos devem ser:",
          "• Aparecer no pacote local (Local Pack)",
          "• Aparecer nas buscas por proximidade",
          "• Gerar mais rotas e visitas"
        ],
        type: "concept"
      },
      {
        title: "Como melhorar a presença",
        subtitle: "Boas práticas",
        paragraphs: [
          "Para se destacar no Maps, mantenha:",
          "• Perfil completo",
          "• Avaliações frequentes",
          "• Fotos atualizadas",
          "• Site otimizado",
          "• Informações consistentes"
        ],
        type: "checklist"
      }
    ]
  },
  {
    id: 13,
    title: "13. Google Ads",
    tagline: "Anúncios para negócios locais",
    icon: "🚀",
    color: "#1976D2",
    pages: [
      {
        title: "Quando usar",
        subtitle: "Aceleração de resultados",
        paragraphs: [
          "Use Google Ads quando deseja acelerar resultados imediatos.",
          "Campanha de Pesquisa: Aparece quando o cliente procura diretamente pelo serviço (Ex: 'Advogado trabalhista')."
        ],
        type: "concept"
      },
      {
        title: "Performance Max & Extensões",
        subtitle: "O poder do ecossistema Google",
        paragraphs: [
          "A campanha Performance Max (PMax) pode exibir anúncios em Pesquisa, Maps, YouTube, Gmail e Display simultaneamente.",
          "Utilize Extensões de Local para permitir o destaque das informações físicas da sua empresa direto nos anúncios."
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 14,
    title: "14. Métricas e Análise",
    tagline: "Tome decisões com base em dados",
    icon: "📊",
    color: "#009688",
    pages: [
      {
        title: "O que o painel fornece",
        subtitle: "Os números que importam",
        paragraphs: [
          "O Perfil da Empresa fornece métricas vitais sobre o comportamento do cliente:",
          "• Pesquisas (Como encontraram você)",
          "• Cliques (Interações no perfil)",
          "• Ligações (Chamadas geradas a partir do botão)",
          "• Rotas (Solicitações de direção ao local)",
          "• Visualizações de Fotos (Interesse visual)",
          "Esses dados permitem a comparação com o mercado local."
        ],
        type: "stats"
      }
    ]
  },
  {
    id: 15,
    title: "15. Principais Erros",
    tagline: "O que evitar a todo custo",
    icon: "❌",
    color: "#D32F2F",
    pages: [
      {
        title: "Lista de Erros Críticos",
        subtitle: "Não cometa essas falhas",
        paragraphs: [
          "❌ Perfil incompleto ou Categoria incorreta",
          "❌ Horários desatualizados",
          "❌ Avaliações falsas",
          "❌ Site lento ou Fotos antigas",
          "❌ Ignorar avaliações",
          "❌ Informações inconsistentes (NAP divergente)",
          "❌ Perfis duplicados (gera confusão e risco de suspensão)"
        ],
        type: "rules"
      }
    ]
  },
  {
    id: 16,
    title: "16. Estratégia de Ranqueamento",
    tagline: "Plano de ação completo",
    icon: "🏆",
    color: "#FFC107",
    pages: [
      {
        title: "Fases 1 e 2",
        subtitle: "Fundação e Autoridade",
        paragraphs: [
          "FASE 1 (Fundação): Perfil verificado, Configuração completa, Categorias corretas.",
          "FASE 2 (Autoridade): Avaliações contínuas, Respostas constantes, Atualização de fotos frequente."
        ],
        type: "checklist"
      },
      {
        title: "Fases 3 e 4",
        subtitle: "Relevância e Crescimento",
        paragraphs: [
          "FASE 3 (Relevância): Otimização de SEO Local, Conteúdo de valor no site, Páginas de serviço detalhadas.",
          "FASE 4 (Crescimento): Integração com Google Ads, Campanhas sazonais e Monitoramento contínuo de métricas."
        ],
        type: "checklist"
      }
    ]
  }
];

export const GOLD_CHECKLIST_ITEMS = [
  "Perfil: Verificado e com Categoria Correta",
  "Perfil: Telefone, Site e Horários atualizados",
  "Conteúdo: Fotos profissionais, Vídeos e Serviços/Produtos cadastrados",
  "Conteúdo: Postagens frequentes",
  "Reputação: Avaliações constantes e Nota elevada",
  "Reputação: Respostas rápidas",
  "SEO Local: Site otimizado e Dados consistentes",
  "SEO Local: Presença em diretórios e Backlinks locais",
  "Tráfego Pago: Google Ads configurado e campanhas locais",
  "Tráfego Pago: Conversões monitoradas",
  "Gestão Semanal: Novas fotos, respostas a avaliações, métricas e promoções",
  "Gestão Mensal: Revisão de categorias, serviços e concorrentes",
  "Gestão Trimestral: Auditoria completa e planejamento estratégico"
];
