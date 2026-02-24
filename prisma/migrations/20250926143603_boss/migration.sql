-- CreateTable
CREATE TABLE `Boss` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siret` VARCHAR(20) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(191) NULL,
    `employeeId` INTEGER NOT NULL,

    UNIQUE INDEX `Boss_siret_key`(`siret`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Computer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mac` VARCHAR(20) NOT NULL,
    `employeeId` INTEGER NOT NULL,
    `bossId` INTEGER NOT NULL,

    UNIQUE INDEX `Computer_mac_key`(`mac`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Employee` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `mail` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `age` INTEGER NULL,
    `genre` VARCHAR(191) NULL,
    `isDirector` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Employee_mail_key`(`mail`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Boss` ADD CONSTRAINT `Boss_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Computer` ADD CONSTRAINT `Computer_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `Employee`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Computer` ADD CONSTRAINT `Computer_bossId_fkey` FOREIGN KEY (`bossId`) REFERENCES `Boss`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
