/*
  Warnings:

  - You are about to alter the column `lastTotalViews` on the `Artist` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - A unique constraint covering the columns `[name]` on the table `Artist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Artist" ALTER COLUMN "genre" DROP NOT NULL,
ALTER COLUMN "lastTotalViews" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");
