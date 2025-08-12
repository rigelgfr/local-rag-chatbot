/*
  Warnings:

  - You are about to drop the column `schema` on the `document_metadata` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "document_metadata" DROP COLUMN "schema",
ADD COLUMN     "path" TEXT;
