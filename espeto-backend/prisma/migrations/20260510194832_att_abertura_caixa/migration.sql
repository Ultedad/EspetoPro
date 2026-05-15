-- AlterTable
ALTER TABLE "Mesa" ADD COLUMN     "aberturaCaixaId" INTEGER;

-- CreateTable
CREATE TABLE "VendaAvulsa" (
    "id" SERIAL NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "aberturaCaixaId" INTEGER,

    CONSTRAINT "VendaAvulsa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemVendaAvulsa" (
    "id" SERIAL NOT NULL,
    "vendaAvulsaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "precoUnitario" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemVendaAvulsa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VendaAvulsa" ADD CONSTRAINT "VendaAvulsa_aberturaCaixaId_fkey" FOREIGN KEY ("aberturaCaixaId") REFERENCES "AberturaCaixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVendaAvulsa" ADD CONSTRAINT "ItemVendaAvulsa_vendaAvulsaId_fkey" FOREIGN KEY ("vendaAvulsaId") REFERENCES "VendaAvulsa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemVendaAvulsa" ADD CONSTRAINT "ItemVendaAvulsa_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mesa" ADD CONSTRAINT "Mesa_aberturaCaixaId_fkey" FOREIGN KEY ("aberturaCaixaId") REFERENCES "AberturaCaixa"("id") ON DELETE SET NULL ON UPDATE CASCADE;
