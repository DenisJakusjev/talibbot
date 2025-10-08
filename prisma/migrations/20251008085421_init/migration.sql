-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MOD');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('ENEMY', 'FRIEND');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "tgId" BIGINT NOT NULL,
    "nickname" TEXT NOT NULL,
    "nicknameLower" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MOD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" SERIAL NOT NULL,
    "nickname" TEXT NOT NULL,
    "type" "EntryType" NOT NULL,
    "reason" TEXT,
    "addedBy" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_tgId_key" ON "User"("tgId");

-- CreateIndex
CREATE UNIQUE INDEX "User_nicknameLower_key" ON "User"("nicknameLower");

-- CreateIndex
CREATE INDEX "User_nickname_idx" ON "User"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_nickname_type_key" ON "Entry"("nickname", "type");
