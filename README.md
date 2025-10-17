# GymManager - Sistema de Gestão de Academias

## Descrição
Nós somos uma solução completa para gestão de academias de musculação, oferecendo funcionalidades de controle de alunos, financeiro, check-in, agendamento de aulas e relatórios.

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
- CSS para styling
- React Query para cache/estado servidor
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
**Mantido por**: Pedro Henrique Forner; Iran Moreira Freitas; Gabriel Mendonça do Patrocinio; Rodrigo Cunha