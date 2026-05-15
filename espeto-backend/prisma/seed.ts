// limpar.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function limpar() {
  console.log('--- 🧹 Iniciando limpeza do banco de dados ---');

  try {
    // 1. Apagamos os itens que dependem de outras tabelas (as folhas da árvore)
    await prisma.mesaProduto.deleteMany();
    await prisma.itemVendaAvulsa.deleteMany();

    // 2. Apagamos as operações que dependem do Caixa ou do Produto
    await prisma.mesa.deleteMany();
    await prisma.vendaAvulsa.deleteMany();
    await prisma.fechamentoCaixa.deleteMany();

    // 3. Por fim, apagamos as tabelas base (os pilares)
    await prisma.aberturaCaixa.deleteMany();
    await prisma.produto.deleteMany();

    console.log('✅ Tudo limpo com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao limpar o banco:', error);
  }
}

limpar()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });