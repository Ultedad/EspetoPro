-- CreateTable
CREATE TABLE "AberturaCaixa" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "horario" TEXT NOT NULL,
    "responsavel" TEXT NOT NULL,
    "valorInicial" DOUBLE PRECISION NOT NULL,
    "estoqueInicial" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AberturaCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FechamentoCaixa" (
    "id" SERIAL NOT NULL,
    "aberturaId" INTEGER NOT NULL,
    "responsavel" TEXT NOT NULL,
    "horario" TEXT NOT NULL,
    "vendasSistema" DOUBLE PRECISION NOT NULL,
    "diferencaCaixa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "valorFinal" DOUBLE PRECISION NOT NULL,
    "custosOperacionais" JSONB NOT NULL,
    "estoqueFinal" JSONB NOT NULL,
    "lucroCalculado" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FechamentoCaixa_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FechamentoCaixa_aberturaId_key" ON "FechamentoCaixa"("aberturaId");

-- AddForeignKey
ALTER TABLE "FechamentoCaixa" ADD CONSTRAINT "FechamentoCaixa_aberturaId_fkey" FOREIGN KEY ("aberturaId") REFERENCES "AberturaCaixa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
