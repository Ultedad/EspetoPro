/*
  Warnings:

  - You are about to drop the column `total` on the `Mesa` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mesa" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "observacao" TEXT,
    "status" TEXT NOT NULL DEFAULT 'aberta',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Mesa" ("createdAt", "id", "nome", "observacao", "status", "updatedAt") SELECT "createdAt", "id", "nome", "observacao", "status", "updatedAt" FROM "Mesa";
DROP TABLE "Mesa";
ALTER TABLE "new_Mesa" RENAME TO "Mesa";
CREATE TABLE "new_MesaProduto" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "quantidade" INTEGER NOT NULL DEFAULT 1,
    "mesaId" INTEGER NOT NULL,
    "produtoId" INTEGER NOT NULL,
    "precoUnitario" REAL NOT NULL DEFAULT 0,
    "subtotal" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "MesaProduto_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MesaProduto_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MesaProduto" ("id", "mesaId", "produtoId", "quantidade") SELECT "id", "mesaId", "produtoId", "quantidade" FROM "MesaProduto";
DROP TABLE "MesaProduto";
ALTER TABLE "new_MesaProduto" RENAME TO "MesaProduto";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
