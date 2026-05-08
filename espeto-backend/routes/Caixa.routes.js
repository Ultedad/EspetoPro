const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');

const router = Router();
const prisma = new PrismaClient();

// POST /caixa/abertura — registra a abertura do caixa
router.post('/abertura', async (req, res) => {
  try {
    const { responsavel, valorInicial, horario } = req.body;

    // Snapshot do estoque atual
    const produtos = await prisma.produto.findMany({
      select: {
        id: true,
        nome: true,
        categoria: true,
        estoque: true,
        preco: true,
        custo: true,
      }
    });

    const estoqueInicial = produtos.map(p => ({
      produtoId:  p.id,    
      nome:       p.nome,
      categoria:  p.categoria,
      estoque:    p.estoque,
      preco:      p.preco,
      custo:      p.custo,
    }));
    

    const abertura = await prisma.aberturaCaixa.create({
      data: {
        responsavel,
        valorInicial: Number(valorInicial),
        horario,
        estoqueInicial: estoqueInicial,
      }
    });

    res.status(201).json(abertura);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /caixa/abertura/hoje — busca a abertura do dia atual
router.get('/abertura/hoje', async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const abertura = await prisma.aberturaCaixa.findFirst({
      where: {
        createdAt: { gte: hoje, lt: amanha },
        fechamento: {
          is: null 
        }
      },
      orderBy: { createdAt: 'desc' },
      include: { fechamento: true } 
    });

    res.json(abertura ?? null);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// GET /caixa/abertura — lista todas as aberturas
router.get('/abertura', async (req, res) => {
  try {
    const aberturas = await prisma.aberturaCaixa.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json(aberturas);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

// POST /caixa/fechamento
router.post('/fechamento', async (req, res) => {
  try {
    const { aberturaId, responsavel, valorFinal, horario, custosOperacionais } = req.body;

    const abertura = await prisma.aberturaCaixa.findUnique({
      where: { id: Number(aberturaId) }
    });

    if (!abertura) return res.status(404).json({ erro: "Abertura não encontrada." });

    const produtosAtuais = await prisma.produto.findMany();
    const estoqueFinal = produtosAtuais.map(p => ({
      produtoId: p.id,
      nome: p.nome,
      categoria:  p.categoria,
      estoque: p.estoque,
      custo: p.custo,
      preco: p.preco
    }));

    const mesasAbertas = await prisma.mesa.findMany({
      where: { status: 'aberta' }
    });
    if (mesasAbertas.length > 0) {
      return res.status(400).json({
        erro: `Existem ${mesasAbertas.length} mesa(s) em aberto. Feche todas antes de encerrar o caixa.`,
        mesasAbertas: mesasAbertas.map(m => ({ id: m.id, nome: m.nome }))
      });
    }

    const mesasPendente = await prisma.mesa.findMany({
      where: {
        status: 'pendente',
        updatedAt: { gte: abertura.createdAt }
      },
      include: { produtos: { include: { produto: true } } }
    });

    const totalPendente = mesasPendente.reduce((acc, m) => acc + (m.total ?? 0), 0);

    // 1. CÁLCULO DE VENDAS DO SISTEMA (Baseado nas mesas fechadas desde a abertura)
    // Buscamos mesas fechadas que foram criadas após a data de abertura do caixa
    const mesasFechadas = await prisma.mesa.findMany({
      where: {
        status: 'fechada',
        updatedAt: { gte: abertura.createdAt }
      },
      include: { produtos: { include: { produto: true } } }
    });

    const vendasSistema = mesasFechadas.reduce((acc, mesa) => acc + mesa.total, 0);

    // 2. CÁLCULOS FINANCEIROS
    const totalCustosOp = Object.values(custosOperacionais).reduce((a, b) => a + Number(b), 0);
    const vf = Number(valorFinal);
    
    // Lucro = O que sobrou no bolso (Valor Final) - O que começou - Gastos extras
    const lucroCalculado = vf - abertura.valorInicial - totalCustosOp;

    // Diferença = Valor Final - (Valor Inicial + Vendas do Sistema - Custos Operacionais)
    const saldoEsperado = abertura.valorInicial + vendasSistema - totalCustosOp;
    const diferencaCaixa = vf - saldoEsperado;

    // 3. SALVA O FECHAMENTO (Agora com todos os campos obrigatórios do Prisma)
    const fechamento = await prisma.fechamentoCaixa.create({
      data: {
        aberturaId: abertura.id,
        responsavel,
        horario,
        valorFinal: vf,
        vendasSistema: vendasSistema, // Campo que estava faltando
        diferencaCaixa: diferencaCaixa,
        custosOperacionais,
        estoqueFinal,
        lucroCalculado,
        totalPendente,
        mesasPendente: mesasPendente.map(m => ({ id: m.id, nome: m.nome, total: m.total })),
      }
    });

    // 4. AUDITORIA DE ESTOQUE
    const auditoriaEstoque = (abertura.estoqueInicial || []).map(itemIni => {
      const itemFin = estoqueFinal.find(f => f.produtoId === itemIni.produtoId);
      return {
        nome: itemIni.nome,
        inicial: itemIni.estoque,
        final: itemFin ? itemFin.estoque : 0,
        saidaReal: itemIni.estoque - (itemFin ? itemFin.estoque : 0)
      };
    });

    res.status(201).json({ fechamento, auditoriaEstoque });
  } catch (err) {
    console.error(err); // Importante para você ver o erro real no terminal do VS Code
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;