const express = require('express');
const cors = require('cors');

const mesaRoutes    = require('./routes/Mesa.routes');
const produtoRoutes = require('./routes/Produto.routes');
const estoqueRoutes = require('./routes/Estoque.routes');
const relatorioRoutes = require('./routes/Relatorio.routes');
const caixaRoutes = require('./routes/Caixa.routes');
const vendaRoutes = require('./routes/Venda.routes');

const app = express();

app.use(cors({
  origin: '*'
}));
app.use(express.json());

// Rotas
app.use('/mesas',    mesaRoutes);
app.use('/produtos', produtoRoutes);
app.use('/estoque',  estoqueRoutes);
app.use('/relatorio',  relatorioRoutes);
app.use('/caixa',  caixaRoutes);
app.use('/venda', vendaRoutes);

// Health check (boa prática pra deploy)
app.get('/', (req, res) => {
  res.send('API Espeto rodando 🚀');
});

// Porta dinâmica (OBRIGATÓRIO)
const PORT = process.env.PORT || 3000;

// Adicionamos '0.0.0.0' para permitir conexões externas na rede local
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ API rodando em: http://0.0.0.0:${PORT}`);
  console.log(`💡 No celular, use o IP da sua máquina (ex: http://192.168.x.x:${PORT})`);
});