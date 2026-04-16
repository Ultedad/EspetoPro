const express = require('express');
const cors = require('cors');

const mesaRoutes    = require('./routes/mesa.routes');
const produtoRoutes = require('./routes/produto.routes');
const estoqueRoutes = require('./routes/estoque.routes');

const app = express();

app.use(cors());
app.use(express.json());

// ── Rotas ──────────────────────────────────────────
app.use('/mesas',    mesaRoutes);
app.use('/produtos', produtoRoutes);
app.use('/estoque',  estoqueRoutes);

// ── Inicia o servidor ──────────────────────────────
app.listen(3000, () => console.log('✅ API rodando em http://localhost:3000'));