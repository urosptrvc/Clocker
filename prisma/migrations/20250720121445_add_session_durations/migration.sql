-- AlterTable
ALTER TABLE `clock_sessions` ADD COLUMN `durationMinutes` INTEGER NULL,
    ADD COLUMN `overtimeMinutes` INTEGER NULL,
    ADD COLUMN `regularMinutes` INTEGER NULL;
