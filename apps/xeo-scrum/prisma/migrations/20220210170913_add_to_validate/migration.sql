-- AlterTable
ALTER TABLE `NotionStatusLink` MODIFY `status` ENUM('DONE', 'IN_PROGRESS', 'TO_VALIDATE', 'SPRINT_BACKLOG', 'UNKNOWN') NOT NULL;