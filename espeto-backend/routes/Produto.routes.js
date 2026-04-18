const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// GET /produtos
router.get('/', async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /produtos/:id
router.get('/:id', async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /produtos
router.post('/', async (req, res) => {
  try {
    const { nome, descricao, custo, preco, categoria, estoque, estoqueMinimo } = req.body;
    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        custo,
        preco,
        categoria,
        estoque:       estoque       ? Number(estoque)       : 0,
        estoqueMinimo: estoqueMinimo ? Number(estoqueMinimo) : 0,
      }
    });
    res.status(201).json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PUT /produtos/:id
router.put('/:id', async (req, res) => {
  try {
    const { nome, descricao, custo, preco, categoria, estoqueMinimo } = req.body;
    const produto = await prisma.produto.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(nome          !== undefined && { nome }),
        ...(descricao     !== undefined && { descricao }),
        ...(custo         !== undefined && { custo:         Number(custo) }),
        ...(preco         !== undefined && { preco:         Number(preco) }),
        ...(categoria     !== undefined && { categoria }),
        ...(estoqueMinimo !== undefined && { estoqueMinimo: Number(estoqueMinimo) }),
      }
    });
    res.json(produto);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /produtos/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.produto.delete({ where: { id: Number(req.params.id) } });
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;