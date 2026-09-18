-- Add website-level access without changing existing users' effective access.
CREATE TYPE "WebsiteAccessMode" AS ENUM ('all_websites', 'selected_websites');

ALTER TABLE "users"
  ADD COLUMN "websiteAccessMode" "WebsiteAccessMode" NOT NULL DEFAULT 'all_websites';

ALTER TABLE "roles"
  ADD COLUMN "companyId" INTEGER,
  ADD COLUMN "isSystem" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "roles"
  ADD CONSTRAINT "roles_companyId_fkey"
  FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "roles_companyId_idx" ON "roles"("companyId");

CREATE TABLE "user_website_access" (
  "userId" INTEGER NOT NULL,
  "websiteId" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "user_website_access_pkey" PRIMARY KEY ("userId", "websiteId"),
  CONSTRAINT "user_website_access_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "user_website_access_websiteId_fkey"
    FOREIGN KEY ("websiteId") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "user_website_access_websiteId_idx" ON "user_website_access"("websiteId");

-- Built-in roles are immutable templates shared by all companies.
UPDATE "roles"
SET "isSystem" = true
WHERE "name" IN ('super_admin', 'company_admin', 'cms_sub_admin', 'marketing_admin');

-- Existing accounts retain access to every website through the default all_websites mode.
