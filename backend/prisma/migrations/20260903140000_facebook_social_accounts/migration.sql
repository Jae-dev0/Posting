-- CreateTable
CREATE TABLE "companies" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- Seed default company for existing data
INSERT INTO "companies" ("id", "name", "createdAt", "updatedAt")
VALUES (1, 'Default Company', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

SELECT setval(pg_get_serial_sequence('companies', 'id'), (SELECT MAX(id) FROM "companies"));

-- AlterTable users
ALTER TABLE "users" ADD COLUMN "companyId" INTEGER;

UPDATE "users" SET "companyId" = 1 WHERE "companyId" IS NULL;

ALTER TABLE "users" ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "users_companyId_idx" ON "users"("companyId");

-- AlterTable connected_accounts: drop old unique, add companyId
ALTER TABLE "connected_accounts" ADD COLUMN "companyId" INTEGER;

UPDATE "connected_accounts" SET "companyId" = 1 WHERE "companyId" IS NULL;

ALTER TABLE "connected_accounts" ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE "connected_accounts" DROP CONSTRAINT IF EXISTS "connected_accounts_platform_handle_key";

ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_companyId_platform_handle_key"
  UNIQUE ("companyId", "platform", "handle");

ALTER TABLE "connected_accounts" ADD CONSTRAINT "connected_accounts_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "connected_accounts_companyId_idx" ON "connected_accounts"("companyId");

-- AlterTable posts
ALTER TABLE "posts" ADD COLUMN "companyId" INTEGER;
ALTER TABLE "posts" ADD COLUMN "createdById" INTEGER;
ALTER TABLE "posts" ADD COLUMN "externalPostId" TEXT;
ALTER TABLE "posts" ADD COLUMN "publishError" TEXT;

UPDATE "posts" SET "companyId" = 1 WHERE "companyId" IS NULL;

ALTER TABLE "posts" ALTER COLUMN "companyId" SET NOT NULL;

ALTER TABLE "posts" ADD CONSTRAINT "posts_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "posts" ADD CONSTRAINT "posts_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "posts_companyId_idx" ON "posts"("companyId");
CREATE INDEX "posts_externalPostId_idx" ON "posts"("externalPostId");

-- CreateTable social_accounts
CREATE TABLE "social_accounts" (
    "id" SERIAL NOT NULL,
    "companyId" INTEGER NOT NULL,
    "connectedByUserId" INTEGER,
    "connectedAccountId" INTEGER,
    "platform" "SocialPlatform" NOT NULL,
    "facebookUserId" TEXT,
    "pageId" TEXT NOT NULL,
    "pageName" TEXT NOT NULL,
    "accessTokenEnc" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3),
    "isConnected" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "social_accounts_connectedAccountId_key" ON "social_accounts"("connectedAccountId");
CREATE UNIQUE INDEX "social_accounts_companyId_platform_pageId_key" ON "social_accounts"("companyId", "platform", "pageId");
CREATE INDEX "social_accounts_companyId_idx" ON "social_accounts"("companyId");

ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_connectedByUserId_fkey"
  FOREIGN KEY ("connectedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_connectedAccountId_fkey"
  FOREIGN KEY ("connectedAccountId") REFERENCES "connected_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
