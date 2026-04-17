const express = require('express');
const cors = require('cors');

const mesaRoutes    = require('./routes/mesa.routes');
const produtoRoutes = require('./routes/produto.routes');
const estoqueRoutes = require('./routes/estoque.routes');

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Rotas
app.use('/mesas',    mesaRoutes);
app.use('/produtos', produtoRoutes);
app.use('/estoque',  estoqueRoutes);

// Health check (boa prática pra deploy)
app.get('/', (req, res) => {
  res.send('API Espeto rodando 🚀');
});

// Porta dinâmica (OBRIGATÓRIO)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
});