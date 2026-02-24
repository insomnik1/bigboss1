/*
  Warnings:

  - You are about to drop the column `isDirector` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Employee` DROP COLUMN `isDirector`,
    ADD COLUMN `isBoss` BOOLEAN NOT NULL DEFAULT false;
