<div align="center">

<img src="https://img.shields.io/badge/React%20Native-Expo-000?style=for-the-badge&logo=expo&logoColor=white" />
<img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" />
<img src="https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />

# 🍢 EspetoPro

**Sistema de gestão para espetinhos e estabelecimentos de comida.**  
Controle de mesas, caixa, estoque, produtos e relatórios — tudo em um só lugar.

</div>

---

## 📱 Screenshots

> Em breve — adicione aqui screenshots das telas principais (Dashboard, Mesas, Relatório, Fechar Caixa).

---

## ✨ Funcionalidades

- 🪑 **Mesas** — Abertura, gerenciamento de itens e fechamento de mesas
- 🛒 **Venda Avulsa** — Registro rápido de vendas sem identificação de mesa
- 💰 **Caixa** — Abertura e fechamento com snapshot de estoque e cálculo de lucro
- 📦 **Estoque** — Controle de produtos com alertas de estoque mínimo
- 📊 **Relatórios** — Histórico de caixas, receita, lucro e auditoria de estoque
- 👥 **Funcionários** — Gestão da equipe do estabelecimento

---

## 🗂 Estrutura do Projeto

```
espetoPro/
├── src/
│   ├── app/                  # Telas (Expo Router)
│   │   ├── index.tsx         # Home / Dashboard
│   │   ├── mesas.tsx
│   │   ├── mesa-detalhes.tsx
│   │   ├── venda-avulsa.tsx
│   │   ├── estoque.tsx
│   │   ├── historico.tsx
│   │   └── relatorio-caixa.tsx
│   ├── components/
│   │   ├── Icons.tsx         # Ícones SVG centralizados
│   │   ├── ItemCard.tsx
│   │   ├── GrideCard.tsx
│   │   └── AdicionarProdutoModal.tsx
│   ├── constants/
│   │   └── colors.ts         # Paleta de cores global (C)
│   ├── context/
│   │   └── NotificationContext.tsx
│   ├── models/               # Interfaces TypeScript
│   │   ├── index.ts
│   │   ├── aberturaCaixa.model.ts
│   │   ├── fechamentoCaixa.model.ts
│   │   ├── mesa.model.ts
│   │   ├── mesaProduto.model.ts
│   │   ├── produto.model.ts
│   │   ├── vendaAvulsa.model.ts
│   │   └── payloads.ts
│   └── services/             # Chamadas à API
│       ├── api.ts            # request() base
│       ├── config.ts         # BASE_URL
│       ├── caixaApi.ts
│       ├── mesaProdutoApi.ts
│       ├── relatorioApi.ts
│       └── vendaApi.ts
│
└── backend/
    ├── routes/
    │   ├── caixa.routes.js
    │   ├── mesa.routes.js
    │   ├── produto.routes.js
    │   ├── relatorio.routes.js
    │   └── venda.routes.js
    ├── prisma/
    │   └── schema.prisma
    └── server.js
```

---

## 🚀 Instalação e Setup

### Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [PostgreSQL](https://www.postgresql.org/) rodando localmente ou na nuvem

---

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/espetoPro.git
cd espetoPro
```

---

### 2. Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env`:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/espetopro"
PORT=3000
```

Rode as migrations e inicie o servidor:

```bash
npx prisma migrate dev --name init
npx prisma generate
node server.js
```

---

### 3. Frontend (Expo)

```bash
cd src
npm install
```

Configure o arquivo `services/config.ts` com o IP da sua máquina:

```typescript
// src/services/config.ts
export const BASE_URL = 'http://SEU_IP_LOCAL:3000';
// Exemplo: 'http://192.168.1.10:3000'
// ⚠️ Não use 'localhost' no celular físico — use o IP da rede local
```

Inicie o app:

```bash
npx expo start
```

Escaneie o QR Code com o app **Expo Go** no celular, ou pressione `a` para Android / `i` para iOS no emulador.

---

## 🗄 Banco de Dados

O projeto usa **Prisma ORM** com **PostgreSQL**. Os principais modelos são:

| Model | Descrição |
|---|---|
| `AberturaCaixa` | Turno de trabalho com snapshot de estoque |
| `FechamentoCaixa` | Encerramento do turno com cálculos financeiros |
| `Mesa` | Mesa do estabelecimento com status e produtos |
| `MesaProduto` | Itens vinculados a uma mesa |
| `Produto` | Cardápio com preço, custo e estoque |
| `VendaAvulsa` | Venda sem identificação de mesa |
| `ItemVendaAvulsa` | Produtos de uma venda avulsa |

Para visualizar o banco pelo Prisma Studio:

```bash
cd backend
npx prisma studio
```

---

## 🔌 Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/caixa/abertura` | Abre o caixa do dia |
| `GET` | `/caixa/abertura/hoje` | Busca abertura ativa |
| `POST` | `/caixa/fechamento` | Fecha o caixa |
| `GET` | `/mesa` | Lista todas as mesas |
| `POST` | `/mesa` | Cria uma nova mesa |
| `PATCH` | `/mesa/:id/fechar` | Fecha uma mesa |
| `DELETE` | `/mesa/:id` | Deleta uma mesa |
| `GET` | `/produto` | Lista produtos |
| `POST` | `/produto` | Cria produto |
| `POST` | `/venda/avulsa/lote` | Registra venda avulsa |
| `GET` | `/relatorio/historico` | Histórico de caixas |
| `GET` | `/relatorio/caixa/:id` | Relatório detalhado de um caixa |

---

## 🛠 Tecnologias

**Frontend**
- [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- [Expo Router](https://expo.github.io/router/) — navegação baseada em arquivos
- [react-native-svg](https://github.com/software-mansion/react-native-svg) — ícones

**Backend**
- [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)

---

## 📄 Licença

MIT © EspetoPro
