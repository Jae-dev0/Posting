-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('facebook', 'instagram', 'tiktok');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

-- CreateEnum
CREATE TYPE "PublishMode" AS ENUM ('now', 'schedule', 'draft');

-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('draft', 'scheduled', 'published', 'failed');

-- CreateTable
CREATE TABLE "connected_accounts" (
    "id" SERIAL NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "accountName" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connected_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "caption" TEXT NOT NULL,
    "mediaUrl" TEXT,
    "mediaType" "MediaType",
    "publishMode" "PublishMode" NOT NULL,
    "status" "PostStatus" NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_accounts" (
    "postId" INTEGER NOT NULL,
    "accountId" INTEGER NOT NULL,

    CONSTRAINT "post_accounts_pkey" PRIMARY KEY ("postId","accountId")
);

-- CreateIndex
CREATE UNIQUE INDEX "connected_accounts_platform_handle_key" ON "connected_accounts"("platform", "handle");

-- AddForeignKey
ALTER TABLE "post_accounts" ADD CONSTRAINT "post_accounts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_accounts" ADD CONSTRAINT "post_accounts_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "connected_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
