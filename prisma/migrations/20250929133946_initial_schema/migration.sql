-- DropForeignKey
ALTER TABLE `Computer` DROP FOREIGN KEY `Computer_employeeId_fkey`;

-- DropIndex
DROP INDEX `Computer_employeeId_fkey` ON `Computer`;

-- AlterTable
ALTER TABLE `Computer` MODIFY `employeeId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Computer` ADD CONSTRAINT `Computer_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
