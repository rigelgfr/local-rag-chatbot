-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN     "last_online_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
