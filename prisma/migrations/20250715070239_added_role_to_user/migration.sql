-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MOD');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
