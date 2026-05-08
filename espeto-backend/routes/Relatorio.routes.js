const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// ── Helper ────────────────────────────────────────────────────────────────────
function calcularItens(mesasFechadas) {
  const map = {};
  for (const mesa of mesasFechadas) {
    for (const mp of mesa.produtos) {
      const pid = mp.produtoId;
      if (!map[pid]) {
        map[pid] = {
          produtoId: pid,
          nome: mp.produto.nome,
          categoria: mp.produto.categoria,
          precoVenda: mp.precoUnitario,
          custoUnitario: mp.produto.custo,
          quantidadeVendida: 0,
          receita: 0,
          custo: 0,
          lucro: 0,
        };
      }
      map[pid].quantidadeVendida += mp.quantidade;
      map[pid].receita += mp.precoUnitario * mp.quantidade;
      map[pid].custo   += mp.produto.custo  * mp.quantidade;
      map[pid].lucro    = map[pid].receita - map[pid].custo;
    }
  }
  const itens        = Object.values(map);
  const receitaTotal = itens.reduce((a, i) => a + i.receita, 0);
  const custoTotal   = itens.reduce((a, i) => a + i.custo,   0);
  const lucroBruto   = receitaTotal - custoTotal;
  return { itens, receitaTotal, custoTotal, lucroBruto };
}

// ── GET /relatorio/historico ──────────────────────────────────────────────────
router.get('/historico', async (req, res) => {
  try {
    const aberturas = await prisma.aberturaCaixa.findMany({
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: { fechamento: true },
    });

    const historico = await Promise.all(aberturas.map(async (ab) => {
      const fim = ab.fechamento?.createdAt ?? new Date();
      const mesas = await prisma.mesa.findMany({
        where: { status: 'fechada', updatedAt: { gte: ab.createdAt, lte: fim } },
        include: { produtos: { include: { produto: true } } },
      });
      const { receitaTotal, lucroBruto } = calcularItens(mesas);
      const custoOp = ab.fechamento?.custosOperacionais
        ? Object.values(ab.fechamento.custosOperacionais).reduce((a, b) => a + Number(b), 0)
        : 0;
      return {
        id:                    ab.id,
        data:                  ab.createdAt,
        horarioAbertura:       ab.horario,
        horarioFechamento:     ab.fechamento?.horario ?? null,
        responsavelAbertura:   ab.responsavel,
        responsavelFechamento: ab.fechamento?.responsavel ?? null,
        valorInicial:          ab.valorInicial,
        valorFinal:            ab.fechamento?.valorFinal ?? null,
        status:                ab.fechamento ? 'fechado' : 'aberto',
        receitaTotal,
        lucroBruto,
        custoOperacional:      custoOp,
        lucroLiquido:          ab.fechamento?.lucroCalculado ?? (lucroBruto - custoOp),
        totalMesas:            mesas.length,
      };
    }));

    res.json(historico);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /relatorio/caixa/:aberturaId ─────────────────────────────────────────

router.get('/caixa/:aberturaId', async (req, res) => {
  try {
    const aberturaId = Number(req.params.aberturaId);
    const abertura = await prisma.aberturaCaixa.findUnique({
      where: { id: aberturaId },
      include: { fechamento: true },
    });
    if (!abertura) return res.status(404).json({ erro: 'Abertura não encontrada' });

    const fim = abertura.fechamento?.createdAt ?? new Date();
    const mesas = await prisma.mesa.findMany({
      where: { status: 'fechada', updatedAt: { gte: abertura.createdAt, lte: fim } },
      include: { produtos: { include: { produto: true } } },
    });

    const { itens, receitaTotal, custoTotal, lucroBruto } = calcularItens(mesas);
    const custosOp = abertura.fechamento?.custosOperacionais ?? {};
    const custoOperacional = Object.values(custosOp).reduce((a, b) => a + Number(b), 0);
    const lucroLiquido     = lucroBruto - custoOperacional;

    // Auditoria
    let auditoriaEstoque = [];
    if (abertura.fechamento?.estoqueFinal && abertura.estoqueInicial) {
      auditoriaEstoque = abertura.estoqueInicial.map(ini => {
        const fin = abertura.fechamento.estoqueFinal.find(f => f.produtoId === ini.produtoId);
        return {
          nome:      ini.nome,
          inicial:   ini.estoque,
          final:     fin?.estoque ?? 0,
          saidaReal: ini.estoque - (fin?.estoque ?? 0),
          custo:     ini.custo,
        };
      });
    }

    res.json({
      abertura: {
        id:             abertura.id,
        data:           abertura.createdAt,
        horario:        abertura.horario,
        responsavel:    abertura.responsavel,
        valorInicial:   abertura.valorInicial,
        estoqueInicial: abertura.estoqueInicial,
      },
      fechamento: abertura.fechamento ? {
        id:                 abertura.fechamento.id,
        horario:            abertura.fechamento.horario,
        responsavel:        abertura.fechamento.responsavel,
        valorFinal:         abertura.fechamento.valorFinal,
        custosOperacionais: custosOp,
        lucroCalculado:     abertura.fechamento.lucroCalculado,
      } : null,
      status: abertura.fechamento ? 'fechado' : 'aberto',
      itens,
      totais: {
        receitaTotal,
        custoTotal,
        lucroBruto,
        custoOperacional,
        lucroLiquido,
        lucroCalculado: abertura.fechamento?.lucroCalculado ?? lucroLiquido,
        totalMesas: mesas.length,
      },
      auditoriaEstoque,
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// ── GET /relatorio/dia (legado) ───────────────────────────────────────────────
router.get('/dia', async (req, res) => {
  try {
    const mesas = await prisma.mesa.findMany({
      where: { status: 'fechada' },
      include: { produtos: { include: { produto: true } } },
    });
    const { itens, receitaTotal, custoTotal, lucroBruto } = calcularItens(mesas);
    res.json({ itens, totais: { receitaTotal, custoTotal, lucroBruto, totalMesasFechadas: mesas.length } });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;