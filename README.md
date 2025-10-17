# GymManager - Sistema de Gestão de Academias

## Descrição
GymManager é uma solução SaaS completa para gestão de academias de ginástica, oferecendo funcionalidades de controle de alunos, financeiro, check-in, agendamento de aulas e relatórios.

## Características Principais
- ✅ Autenticação segura com Supabase Auth
- ✅ Gestão multi-tenant (múltiplas academias)
- ✅ Dashboard com KPIs em tempo real
- ✅ Sistema de check-in inteligente
- ✅ Controle financeiro completo
- ✅ Agendamento de aulas
- ✅ Notificações automáticas
- ✅ Row Level Security (RLS) no banco de dados

## Stack Tecnológico

### Frontend
- React 18 com TypeScript
- Tailwind CSS para styling
- React Query para cache/estado servidor
- Zustand para estado global
- Supabase JS Client
- Vite como bundler

### Backend
- Supabase (PostgreSQL + Auth + Realtime)
- Node.js (funções serverless via Vercel)
- JWT para autenticação

### Infraestrutura
- Vercel para deploy (Frontend)
- Supabase para banco e backend
- GitHub Actions para CI/CD

## Arquitetura de Pastas

gymmanager/
├── src/
│   ├── components/         # Componentes React reutilizáveis
│   ├── pages/              # Páginas principais
│   ├── lib/
│   │   ├── api/            # Funções de API
│   │   ├── auth.ts         # Autenticação
│   │   └── supabase.ts     # Cliente Supabase
│   ├── contexts/           # Context API
│   ├── hooks/              # Custom hooks
│   ├── types/              # Tipagens TypeScript
│   ├── store/              # Zustand stores
│   └── App.tsx
├── tests/                  # Testes automatizados
├── .github/
│   └── workflows/          # GitHub Actions
├── .env.local              # Variáveis de ambiente
├── vite.config.ts
└── tsconfig.json

## Configuração Inicial

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta Supabase (gratuita)
- Conta Vercel (gratuita)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/gymmanager.git
cd gymmanager
```

2. Instale dependências:
```bash
npm install
```

3. Configure variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Preencha `.env.local`:

VITE_SUPABASE_URL=sua_url
VITE_SUPABASE_ANON_KEY=sua_chave

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Roadmap de Desenvolvimento

### MVP
- [x] Setup inicial do projeto
- [ ] Autenticação básica
- [ ] CRUD de alunos
- [ ] Dashboard com KPIs
- [ ] Check-in simples

### Fase 2
- [ ] Sistema financeiro completo
- [ ] Agendamento de aulas
- [ ] Notificações

### Fase 3
- [ ] App mobile (React Native)
- [ ] Relatórios avançados
- [ ] Gamificação

## Como Contribuir

1. Faça fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Padrões de Código

### Commits

feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formata código
refactor: reorganiza código
test: adiciona testes
chore: atualiza dependências

### Branch Naming
- `feature/nome-da-feature`
- `fix/descricao-do-bug`
- `docs/descricao-da-doc`

## Status do Projeto

- MVP: Em desenvolvimento
- Frontend: React TypeScript
- Backend: Supabase
- Deploy: Vercel (em breve)

## Licença
GNU GENERAL PUBLIC LICENSE Version 3, 29 June 2007

## Contato
Para dúvidas: criar uma Issue no repositório

---
**Última atualização**: [17/10/2025]
**Mantido por**: Equipe GymManager