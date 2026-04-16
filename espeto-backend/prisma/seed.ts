// limpar.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function limpar() {
  await prisma.mesaProduto.deleteMany(); // ← primeiro os filhos
  await prisma.mesa.deleteMany();
  await prisma.produto.deleteMany();
  console.log('✅ Banco limpo!');
}

limpar()
  .catch(console.error)
  .finally(() => prisma.$disconnect());