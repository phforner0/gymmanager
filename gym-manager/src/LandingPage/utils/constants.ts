import { Testimonial, PricePlan } from '../types';

// ============ TESTIMONIALS ============
export const TESTIMONIALS: Testimonial[] = [
  {
    text: 'Perdi 15kg em 4 meses com o acompanhamento da equipe. O ambiente é incrível e os professores sempre motivam. Melhor decisão que tomei!',
    author: 'Carlos Pereira',
    avatar: 'CP',
    info: 'Aluno há 8 meses • Plano Anual'
  },
  {
    text: 'As aulas de HIIT são incríveis! Nunca pensei que conseguiria me exercitar com tanta intensidade. A estrutura é de primeiro mundo.',
    author: 'Rafaela Santos',
    avatar: 'RS',
    info: 'Aluna há 1 ano • Plano Trimestral'
  },
  {
    text: 'Consegui ganhar 8kg de massa magra em 6 meses. O acompanhamento nutricional fez toda diferença. Recomendo demais!',
    author: 'Paulo Oliveira',
    avatar: 'PO',
    info: 'Aluno há 6 meses • Plano Mensal'
  }
];

// ============ PRICE PLANS ============
export const PRICE_PLANS: PricePlan[] = [
  {
    id: 'mensal',
    name: 'Mensal',
    description: 'Flexibilidade total',
    price: 149,
    period: '/mês',
    features: [
      'Acesso ilimitado 24/7',
      'App com treinos',
      'Área de musculação',
      'Vestiários e armários'
    ]
  },
  {
    id: 'trimestral',
    name: 'Trimestral',
    description: 'Mais economia',
    price: 399,
    period: '/3 meses',
    featured: true,
    badge: 'MAIS POPULAR',
    features: [
      'Tudo do plano Mensal',
      'Economia de 10%',
      'Avaliação física gratuita',
      'Plano de treino personalizado',
      'Consultoria nutricional',
      'Suporte prioritário'
    ]
  },
  {
    id: 'anual',
    name: 'Anual',
    description: 'Máximo benefício',
    price: 1299,
    period: '/ano',
    features: [
      'Tudo do plano Trimestral',
      'Economia de 27%',
      '2 sessões de personal',
      'Acompanhamento mensal',
      'Acesso a eventos exclusivos',
      '1 guest pass por mês',
      'Toalha e shaker grátis'
    ]
  }
];

// ============ CONTACT INFO ============
export const CONTACT_INFO = {
  phone: '(12) 3633-9999',
  email: 'contato@impacto.com',
  address: 'Rua Emílio Winther, 123 - Centro',
  hours: 'Aberto 24 horas'
};

// ============ STATS ============
export const GYM_STATS = {
  activeStudents: '2.500+',
  yearsExperience: '15',
  satisfaction: '98%'
};

// ============ TIME SLOTS ============
export const TIME_SLOTS = [
  { value: 'manha', label: 'Manhã (6h - 12h)' },
  { value: 'tarde', label: 'Tarde (12h - 18h)' },
  { value: 'noite', label: 'Noite (18h - 22h)' }
];