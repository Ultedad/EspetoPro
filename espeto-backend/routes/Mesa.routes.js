const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// ── Helper ─────────────────────────────────────────────────────────────────
async function recalcularTotal(mesaId) {
  const itens = await prisma.mesaProduto.findMany({ where: { mesaId } });
  const total = itens.reduce((acc, i) => acc + i.subtotal, 0);
  await prisma.mesa.update({ where: { id: mesaId }, data: { total } });
  return total;
}

// GET /mesas
router.get('/', async (req, res) => {
  try {
    const mesas = await prisma.mesa.findMany({
      include: { produtos: { include: { produto: true } } }
    });
    res.json(mesas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /mesas/:id
router.get('/:id', async (req, res) => {
  try {
    const mesa = await prisma.mesa.findUnique({
      where: { id: Number(req.params.id) },
      include: { produtos: { include: { produto: true } } }
    });
    if (!mesa) return res.status(404).json({ erro: 'Mesa não encontrada' });
    res.json(mesa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /mesas
router.post('/', async (req, res) => {
  try {
    const { nome, observacao } = req.body;
    const mesa = await prisma.mesa.create({
      data: { nome, observacao, status: 'aberta' }
    });
    res.status(201).json(mesa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /mesas/:id/fechar
router.patch('/:id/fechar', async (req, res) => {
  try {
    const mesa = await prisma.mesa.update({
      where: { id: Number(req.params.id) },
      data: { status: 'fechada' }
    });
    res.json(mesa);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /mesas/:id/produtos
router.post('/:id/produtos', async (req, res) => {
  try {
    const { produtoId, quantidade } = req.body;
    const mesaId = Number(req.params.id);

    const produto = await prisma.produto.findUnique({ where: { id: Number(produtoId) } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

    if (produto.estoque < quantidade) {
      return res.status(400).json({ erro: 'Estoque insuficiente' });
    }

    const precoUnitario = produto.preco;
    const subtotal = precoUnitario * Number(quantidade);

    const item = await prisma.mesaProduto.create({
      data: { mesaId, produtoId: Number(produtoId), quantidade: Number(quantidade), precoUnitario, subtotal }
    });

    await prisma.produto.update({
      where: { id: Number(produtoId) },
      data: { estoque: produto.estoque - Number(quantidade) }
    });

    await recalcularTotal(mesaId);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// PATCH /mesas/:mesaId/mesaprodutos/:mesaProdutoId
router.patch('/:mesaId/mesaprodutos/:mesaProdutoId', async (req, res) => {
  try {
    const { quantidade } = req.body;
    const mesaProdutoId = Number(req.params.mesaProdutoId);

    const item = await prisma.mesaProduto.findUnique({ where: { id: mesaProdutoId } });
    if (!item) return res.status(404).json({ erro: 'Item não encontrado' });

    const produto = await prisma.produto.findUnique({ where: { id: item.produtoId } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });
    const diferenca = quantidade - item.quantidade; // ← positivo = incrementou, negativo = decrementou

    // Verifica estoque se está incrementando
    if (diferenca > 0 && produto.estoque < diferenca) {
      return res.status(400).json({ erro: 'Estoque insuficiente' });
    }
    const subtotal = produto.preco * quantidade;

    const atualizado = await prisma.mesaProduto.update({
      where: { id: mesaProdutoId },
      data: { quantidade, subtotal }
    });

    await prisma.produto.update({
      where: { id: Number(produto.id) },
      data: { estoque: { increment: -diferenca } }
    });

    await recalcularTotal(item.mesaId);
    res.json(atualizado);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// DELETE /mesas/:mesaId/mesaprodutos/:mesaProdutoId
router.delete('/:mesaId/mesaprodutos/:mesaProdutoId', async (req, res) => {
  try {
    const mesaProdutoId = Number(req.params.mesaProdutoId);

    const item = await prisma.mesaProduto.findUnique({ where: { id: mesaProdutoId } });
    if (!item) return res.status(404).json({ erro: 'Item não encontrado' });

    await prisma.produto.update({
      where: { id: item.produtoId },
      data: { estoque: { increment: item.quantidade } }
    });

    await prisma.mesaProduto.delete({ where: { id: mesaProdutoId } });
    await recalcularTotal(item.mesaId);

    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;