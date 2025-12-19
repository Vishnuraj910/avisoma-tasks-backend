/*
  Warnings:

  - The values [in_progress] on the enum `task_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "task_status_new" AS ENUM ('pending', 'in_progress', 'completed');
ALTER TABLE "public"."tasks" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "tasks" ALTER COLUMN "status" TYPE "task_status_new" USING ("status"::text::"task_status_new");
ALTER TYPE "task_status" RENAME TO "task_status_old";
ALTER TYPE "task_status_new" RENAME TO "task_status";
DROP TYPE "public"."task_status_old";
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;
