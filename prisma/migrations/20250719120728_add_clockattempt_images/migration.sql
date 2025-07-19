-- AlterTable
ALTER TABLE `clock_attempts` ADD COLUMN `BackTruckPath` VARCHAR(191) NULL,
    ADD COLUMN `DashboardPath` VARCHAR(191) NULL,
    ADD COLUMN `FrontTruckPath` VARCHAR(191) NULL;
