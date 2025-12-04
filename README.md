# 🏋️ GymManager

**Sistema de gestão de academia** desenvolvido em **React + TypeScript** com foco em modularidade, usabilidade e integração com Supabase.

---

## 🔎 Visão geral

GymManager é uma aplicação web para academias que reúne funcionalidades essenciais para a gestão do dia a dia: cadastro de alunos, agenda de aulas, check-in digital, controle financeiro de mensalidades, relatórios e dashboards com métricas úteis.

O projeto está organizado em módulos principais (Admin, User, LandingPage) para separar responsabilidades e facilitar manutenção e evolução.

---

## ⚙️ Principais funcionalidades

- **Gestão de alunos**: cadastro, atualização, busca, filtros e exportação CSV
- **Planos e cobranças**: gerenciamento de planos, pagamentos e controle de inadimplência
- **Agenda de aulas**: programação semanal, horários e instrutores
- **Check-in digital**: registro de entrada/saída de usuários
- **Dashboard / Relatórios**: KPIs (receita, check-ins, novos alunos), gráficos e tendências (usa *recharts*)
- **Autenticação e permissões**: integração com Supabase Auth; rotas protegidas por perfil (admin / athlete)
- **Armazenamento**: integração com Supabase (sincronização remota) e services locais (em memória) para o landing page
- **Design responsivo**: interface adaptada para desktop, tablet e mobile
- **Testes**: testes unitários e utilitários (Vitest / Testing Library) já presentes no código

---

## 🧱 Arquitetura & organização do repositório

Estrutura de alto nível (pasta `src`):

- `Admin/` — páginas e componentes de administração
- `User/` — área do usuário/atleta (dashboards, métricas individuais)
- `LandingPage/` — páginas públicas, marketing, e serviços utilitários (ex.: `storage.service.ts`)
- `lib/` — integrações externas (ex.: `supabase.ts`)
- `shared/` / `components/` — componentes reutilizáveis, modais, toasts
- `styles/` — CSS global
- `test/` — mock data, setup e utilitários de teste
- `types/` — definições TypeScript centralizadas

> Arquivo importante: `src/lib/supabase.ts` — cria o cliente Supabase e expõe tipos de banco. Verifique as variáveis de ambiente necessárias antes de rodar a aplicação.

---

## 🧩 Tecnologias

- React (v19) + TypeScript
- Vite (bundler / dev server)
- Supabase (Auth, Database)
- Recharts (gráficos)
- Lucide (ícones)
- Vitest + Testing Library (testes)
- ESLint (qualidade de código)

---

## 🛠️ Como rodar localmente

**Requisitos**
- Node.js (recomendado 18+)
- NPM ou Yarn

**Passos**

1. Clone o repositório

```bash
git clone <REPO_URL>
cd gymmanager-main
cd gymmanager-main
```

2. Instale as dependências

```bash
npm install
# ou
# yarn
```

3. Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto (mesma pasta onde está `package.json`) com as variáveis necessárias do Supabase:

```
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

> Observação: o código faz `throw` se as variáveis não estiverem configuradas — ver `src/lib/supabase.ts`.

4. Rodar em modo de desenvolvimento

```bash
npm run dev
```

5. Build para produção

```bash
npm run build
```

6. Pré-visualizar o build

```bash
npm run preview
```

---

## 🔐 Configuração no Supabase

- Crie um projeto no Supabase
- Configure tabelas mínimas (users, profiles, students, classes, payments, checkins, etc.) conforme os tipos usados em `src/lib/supabase.ts`.
- Habilite Auth (e-mail/senha) se quiser usar o fluxo de login padrão.
- Adicione as chaves no Vercel (ou outro host) se for fazer deploy.

---

## 🧪 Testes

O repositório contém testes com Vitest e utilitários da Testing Library. Não há um script `test` no `package.json` por padrão; você pode executar os testes com:

```bash
npx vitest
# ou
npx vitest run
```

Observação: os testes usam mocks de `localStorage` quando necessário (ver `src/*/test`).

---

## 📦 Scripts úteis (conforme `package.json`)

- `npm run dev` — inicia o servidor Vite (desenvolvimento)
- `npm run build` — compila o projeto (TypeScript + Vite)
- `npm run preview` — visualiza o build localmente
- `npm run lint` — executa o ESLint

---

## 🤝 Como contribuir

1. Abra uma issue descrevendo a mudança
2. Crie uma branch `feature/<nome>`
3. Faça commits claros e pequenos
4. Abra um Pull Request

---

## 🧾 Licença

Projeto licenciado conforme o arquivo `LICENSE` presente no repositório.
