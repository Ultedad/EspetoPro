-- AlterTable
ALTER TABLE "FechamentoCaixa" ADD COLUMN     "mesasPendente" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "totalPendente" DOUBLE PRECISION NOT NULL DEFAULT 0;
