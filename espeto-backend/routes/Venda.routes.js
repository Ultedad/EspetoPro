const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

router.post('/avulsa/lote', async (req, res) => {
  try {
    const { itens } = req.body;
    // itens: [{ produtoId: number, quantidade: number }]

    if (!itens || itens.length === 0) {
      return res.status(400).json({ erro: 'Nenhum item informado' });
    }

    // Valida se todos os produtos existem
    const ids = itens.map(i => i.produtoId);
    const produtos = await prisma.produto.findMany({
      where: { id: { in: ids } },
    });

    if (produtos.length !== ids.length) {
      return res.status(404).json({ erro: 'Um ou mais produtos não encontrados' });
    }

    // Cria a venda avulsa com os itens num único transaction
    const venda = await prisma.$transaction(async (tx) => {
      const novaVenda = await tx.vendaAvulsa.create({
        data: {
          dataHora: new Date(),
          itens: {
            create: itens.map(i => ({
              produtoId: i.produtoId,
              quantidade: i.quantidade,
              precoUnitario: produtos.find(p => p.id === i.produtoId).preco,
            })),
          },
        },
        include: { itens: true },
      });
      return novaVenda;
    });

    res.status(201).json(venda);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;