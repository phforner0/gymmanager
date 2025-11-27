# 🏋️ GymManager - Sistema de Gestão de Academia

Sistema completo para gestão de academias desenvolvido em React + TypeScript com arquitetura modular e componentizada.

## 📋 Características

- **Gestão de Alunos**: Cadastro completo, busca, filtros e exportação CSV
- **Agenda de Aulas**: Calendário semanal com gestão de horários e instrutores
- **Check-in Digital**: Sistema rápido de registro de entrada
- **Financeiro**: Controle de pagamentos, mensalidades e inadimplência
- **Relatórios**: Dashboard com métricas, gráficos e análises
- **Design Responsivo**: Interface adaptável para desktop, tablet e mobile

## 🚀 Tecnologias

- **React 18** - Biblioteca UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos
- **LocalStorage** - Persistência de dados local

## 📁 Estrutura do Projeto

```
gym-manager/
├── src/
│   ├── Admin/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.html
│   │   ├── components/
│   │   │   ├── Modal.tsx
│   │   │   └── Toast.tsx
│   │   ├── context/
│   │   │   └── AppContext.tsx
│   │   ├── pages/
│   │   │   ├── Checkin.tsx
│   │   │   └── ... (outras páginas do Admin)
│   │   ├── services/
│   │   │   └── ... (serviços específicos do Admin)
│   │   └── styles/
│   │       └── ... 
│   │
│   ├── LandingPage/
│   │   ├── pages/
│   │   │   └── LandingPage.tsx
│   │   ├── hooks/
│   │   │   ├── useScrolled.tsx
│   │   │   └── useToast.tsx
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── storage.service.ts
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── utils/
│   │       ├── constants.ts
│   │       └── validation.ts
│   │
│   ├── athlete-dashboard.tsx
│   ├── App.tsx
│   ├── LandingPage.tsx
│   └── main.tsx
│
├── README.md

```

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/gym-manager.git
cd gym-manager
```

2. **Instale as dependências**
```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

4. **Acesse no navegador**
```
http://localhost:3000
```

## 📦 Build para Produção

```bash
npm run build
# ou
yarn build
# ou
pnpm build
```

Os arquivos otimizados estarão em `dist/`

## 🎯 Funcionalidades Detalhadas

### Dashboard
- Cards com métricas principais (total de alunos, ativos, receita, check-ins)
- Gráfico de evolução de membros (últimos 6 meses)
- Gráfico de check-ins (últimos 7 dias)
- Feed de atividades recentes
- Alertas de inadimplência

### Gestão de Alunos
- Cadastro completo (nome, email, telefone, CPF, data nascimento)
- Busca por nome, email ou telefone
- Filtros por status (ativo, inativo, inadimplente)
- Paginação inteligente
- Edição inline de dados
- Exportação para CSV
- Status visual (badges coloridos)

### Agenda de Aulas
- Calendário semanal interativo
- Cadastro de aulas com horário e instrutor
- Controle de capacidade e inscritos
- Edição e exclusão de aulas
- Visualização por dia da semana

### Check-in
- Busca rápida de aluno por nome, email ou ID
- Confirmação de check-in com um clique
- Validação de status do aluno
- Alerta para inadimplentes
- Histórico dos últimos check-ins
- Opção de desfazer check-in

### Financeiro
- Listagem de todos os pagamentos
- Filtros por status (pago, pendente, vencido)
- Filtros por período (data inicial/final)
- Cards com totalizadores
- Confirmação rápida de pagamento
- Indicadores visuais de status

### Relatórios
- Taxa de retenção por coorte
- Gráfico de horários de pico
- Distribuição de aulas por instrutor
- Análises de tendências

### Configurações
- Visualização de planos disponíveis
- Exportação completa de dados (backup JSON)
- Limpeza de dados do sistema

## 💾 Persistência de Dados

Os dados são armazenados localmente usando **LocalStorage**:

- ✅ Persistência automática entre sessões
- ✅ Cache em memória para performance
- ✅ Backup/restore via JSON
- ✅ 50 alunos de demonstração ao iniciar

### Estrutura de Dados

```typescript
// Students
interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  joinDate: string;
  plan: string;
  monthlyFee: number;
  status: 'active' | 'inactive';
  paymentStatus: 'up-to-date' | 'overdue';
  lastCheckin: string;
  notes: string;
}

// Classes
interface ClassSchedule {
  id: number;
  name: string;
  instructor: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  description: string;
}

// Payments
interface Payment {
  id: number;
  studentId: number;
  amount: number;
  date: string;
  method: string;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

// Checkins
interface Checkin {
  id: number;
  studentId: number;
  timestamp: string;
}
```

## 🎨 Personalização

### Cores
Edite `src/styles/global.css` para alterar o esquema de cores:

```css
/* Cores principais */
--primary: #6366f1;
--success: #10b981;
--danger: #ef4444;
--warning: #f59e0b;
```

## 🔒 Segurança

- Validação de formulários
- Confirmação para ações destrutivas
- Sanitização de entradas
- Prevenção de XSS

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar fixa
- **Tablet**: Ajuste de grids (4 colunas → 2 colunas)
- **Mobile**: Menu colapsável, layout single-column

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 🏃‍♂️ Sprints

Abaixo estão os **Sprints** planejados para o projeto. Cada sprint tem objetivo, issues incluídos e critérios de aceitação.

---

### Sprint 01
**Objetivo:** Finalizar work in progress e revisar/aceitar autenticação e redirecionamento para permitir deploy estável.  
**Issues atribuídos:** `#8`, `#14`, `#1`, `#17`

**Critérios de aceitação (por issue):**
- **#8 — Interface de busca para check-in**
  - Busca retorna lista paginada / filtrada por nome/CPF.
  - UI mostra estado de loading e mensagem quando não há resultados.
  - Teste manual OK em navegadores suportados.
- **#1 — Autenticação com Supabase (revisão)**
  - PR revisado e aprovado; fluxo de login/logout testado.
- **#17 — Validar redirecionamento pós-login**
  - Login redireciona `user` → `/athlete-dashboard`.
  - Evidências de teste anexadas à issue.

**Checklist do sprint**
- [ ] Mover issues para a coluna In progress no Project
- [ ] Entregar e fechar issues até o fim do sprint

---

### Sprint 02 — *Features & Refactor*
**Período:** 2025-12-15 → 2025-12-28  
**Objetivo:** Entregar autenticação real, testes automatizados, KPIs do dashboard, refatorar componentes compartilhados e proteger rotas.  
**Issues atribuídos:** `#13`, `#12`, `#7`, `#15`, `#16`

**Critérios de aceitação (por issue):**
- **#7 — Dashboard com KPIs principais**
  - KPIs (receita, check-ins diários, novos alunos) visíveis e atualizados.
- **#15 — Refatorar componentes compartilhados**
  - `Modal` e `Toast` movidos para `src/shared/components` e imports atualizados.
- **#16 — PrivateRoute / proteção de rotas**
  - Guards implementados para rotas admin e athlete; testes manuais OK.

---

## 📄 Licença

Veja o arquivo `LICENSE` para mais detalhes.

---
