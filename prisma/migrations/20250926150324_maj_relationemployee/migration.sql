/*
  Warnings:

  - You are about to drop the column `employeeId` on the `Boss` table. All the data in the column will be lost.
  - You are about to drop the column `isBoss` on the `Employee` table. All the data in the column will be lost.
  - Added the required column `bossId` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Boss` DROP FOREIGN KEY `Boss_employeeId_fkey`;

-- DropIndex
DROP INDEX `Boss_employeeId_fkey` ON `Boss`;

-- AlterTable
ALTER TABLE `Boss` DROP COLUMN `employeeId`;

-- AlterTable
ALTER TABLE `Employee` DROP COLUMN `isBoss`,
    ADD COLUMN `bossId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Employee` ADD CONSTRAINT `Employee_bossId_fkey` FOREIGN KEY (`bossId`) REFERENCES `Boss`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
