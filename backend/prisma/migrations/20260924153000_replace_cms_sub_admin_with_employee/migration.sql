INSERT INTO "roles" ("name", "description", "scope", "isSystem")
VALUES ('employee', 'Employee — standard non-admin account', 'company', true)
ON CONFLICT ("name") DO UPDATE
SET "description" = EXCLUDED."description", "scope" = EXCLUDED."scope", "isSystem" = true;

INSERT INTO "user_roles" ("userId", "roleId", "companyId", "createdAt")
SELECT assignment."userId", employee."id", assignment."companyId", assignment."createdAt"
FROM "user_roles" assignment
JOIN "roles" obsolete ON obsolete."id" = assignment."roleId" AND obsolete."name" = 'cms_sub_admin'
CROSS JOIN "roles" employee
WHERE employee."name" = 'employee'
ON CONFLICT ("userId", "roleId", "companyId") DO NOTHING;

DELETE FROM "roles" WHERE "name" = 'cms_sub_admin';
