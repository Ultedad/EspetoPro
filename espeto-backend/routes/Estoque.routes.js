const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();

const prisma = new PrismaClient();

// GET /estoque/alerta — produtos com estoque baixo ou zerado
router.get('/alerta', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    const alertas = produtos.filter(p => p.estoque <= p.estoqueMinimo);
    res.json(alertas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /estoque/:id/adicionar
router.patch('/:id/adicionar', async (req, res) => {
  try {
    const { quantidade } = req.body;
    const id = Number(req.params.id);

    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const atualizado = await prisma.produto.update({
      where: { id },
      data: { estoque: produto.estoque + Number(quantidade) }
    });

    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /estoque/:id/remover
router.patch('/:id/remover', async (req, res) => {
  try {
    const { quantidade } = req.body;
    const id = Number(req.params.id);

    const produto = await prisma.produto.findUnique({ where: { id } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    const novoEstoque = produto.estoque - Number(quantidade);
    if (novoEstoque < 0) return res.status(400).json({ erro: 'Estoque insuficiente' });

    const atualizado = await prisma.produto.update({
      where: { id },
      data: { estoque: novoEstoque }
    });

    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /estoque/:id — define estoque diretamente
router.patch('/:id', async (req, res) => {
  try {
    const { estoque, estoqueMinimo } = req.body;
    const id = Number(req.params.id);

    const atualizado = await prisma.produto.update({
      where: { id },
      data: {
        ...(estoque       !== undefined && { estoque:       Number(estoque) }),
        ...(estoqueMinimo !== undefined && { estoqueMinimo: Number(estoqueMinimo) }),
      }
    });

    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;