import {
  PrismaClient,
  PostStatus,
  PublishMode,
  RoleScope,
  SocialPlatform,
} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const ROLE_NAMES = {
  SUPER_ADMIN: 'super_admin',
  CMS_ADMIN: 'company_admin', // internal key kept for compatibility
  CMS_SUB_ADMIN: 'cms_sub_admin',
  MARKETING_ADMIN: 'marketing_admin',
} as const

const DEMO_PASSWORD = 'password123'

const DEMO_USERS = {
  SUPER_ADMIN: 'admin@admin.com',
  CMS_ADMIN: 'admin@cms.com',
  MARKETING_ADMIN: 'admin@marketing.com',
} as const

const ALL_PERMISSIONS = [
  { name: 'website.view', description: 'View company websites' },
  { name: 'website.create', description: 'Create company websites' },
  { name: 'website.edit', description: 'Edit company websites' },
  { name: 'website.delete', description: 'Delete company websites' },
  { name: 'page.view', description: 'View website pages' },
  { name: 'page.create', description: 'Create website pages' },
  { name: 'page.edit', description: 'Edit website pages' },
  { name: 'page.delete', description: 'Delete website pages' },
  { name: 'page.publish', description: 'Publish website pages' },
  { name: 'navigation.view', description: 'View website navigation' },
  { name: 'navigation.create', description: 'Create website navigation' },
  { name: 'navigation.edit', description: 'Edit website navigation' },
  { name: 'navigation.delete', description: 'Delete website navigation' },
  { name: 'media.view', description: 'View website media' },
  { name: 'media.upload', description: 'Upload website media' },
  { name: 'media.delete', description: 'Delete website media' },
  { name: 'analytics.view', description: 'View CMS analytics' },
  { name: 'cms.view', description: 'View CMS content' },
  { name: 'cms.create', description: 'Create CMS content' },
  { name: 'cms.edit', description: 'Edit CMS content' },
  { name: 'cms.delete', description: 'Delete CMS content' },
  { name: 'cms.publish', description: 'Publish CMS content' },
  { name: 'company.view', description: 'View companies' },
  { name: 'company.create', description: 'Create companies' },
  { name: 'company.edit', description: 'Edit companies' },
  { name: 'company.delete', description: 'Delete or disable companies' },
  { name: 'user.view', description: 'View users' },
  { name: 'user.create', description: 'Create users' },
  { name: 'user.edit', description: 'Edit users' },
  { name: 'user.delete', description: 'Delete users' },
  { name: 'role.view', description: 'View roles' },
  { name: 'role.create', description: 'Create roles' },
  { name: 'role.edit', description: 'Edit roles' },
  { name: 'role.delete', description: 'Delete roles' },
  { name: 'settings.view', description: 'View settings' },
  { name: 'settings.edit', description: 'Edit settings' },
  { name: 'audit.view', description: 'View audit logs' },
  { name: 'platform.dashboard', description: 'View platform dashboard' },
  { name: 'marketing.access', description: 'Access Marketing system' },
] as const

const CMS_ADMIN_PERMISSIONS = [
  'website.view',
  'website.create',
  'website.edit',
  'website.delete',
  'page.view',
  'page.create',
  'page.edit',
  'page.delete',
  'page.publish',
  'navigation.view',
  'navigation.create',
  'navigation.edit',
  'navigation.delete',
  'media.view',
  'media.upload',
  'media.delete',
  'analytics.view',
  'cms.view',
  'cms.create',
  'cms.edit',
  'cms.delete',
  'cms.publish',
  'settings.view',
  'settings.edit',
  'audit.view',
  'user.view',
  'user.create',
  'user.edit',
  'user.delete',
] as const

const CMS_SUB_ADMIN_PERMISSIONS = [
  'website.view',
  'page.view',
  'page.create',
  'page.edit',
  'navigation.view',
  'navigation.create',
  'navigation.edit',
  'media.view',
  'media.upload',
  'cms.view',
  'cms.create',
  'cms.edit',
  'cms.delete',
  'cms.publish',
  'settings.view',
] as const

const MARKETING_ADMIN_PERMISSIONS = ['marketing.access'] as const

async function ensureRolePermissions(
  roleId: number,
  permissionNames: readonly string[],
  byName: Map<string, { id: number }>,
) {
  const permissionIds = permissionNames.flatMap((name) => {
    const permission = byName.get(name)
    return permission ? [permission.id] : []
  })

  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
      permissionId: { notIn: permissionIds },
    },
  })

  for (const name of permissionNames) {
    const permission = byName.get(name)
    if (!permission) continue
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId: permission.id,
        },
      },
      create: {
        roleId,
        permissionId: permission.id,
      },
      update: {},
    })
  }
}

async function ensureRbacCatalog() {
  for (const permission of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      create: { ...permission },
      update: { description: permission.description },
    })
  }

  const allPermissions = await prisma.permission.findMany()
  const byName = new Map(allPermissions.map((p) => [p.name, p]))

  const superAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.SUPER_ADMIN },
    create: {
      name: ROLE_NAMES.SUPER_ADMIN,
      description: 'Super Admin — overall platform access; sees all accounts',
      scope: RoleScope.platform,
    },
    update: {
      description: 'Super Admin — overall platform access; sees all accounts',
      scope: RoleScope.platform,
    },
  })

  const cmsAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.CMS_ADMIN },
    create: {
      name: ROLE_NAMES.CMS_ADMIN,
      description: 'CMS Admin — Website CMS + create CMS sub-admins',
      scope: RoleScope.company,
    },
    update: {
      description: 'CMS Admin — Website CMS + create CMS sub-admins',
      scope: RoleScope.company,
    },
  })

  const cmsSubAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.CMS_SUB_ADMIN },
    create: {
      name: ROLE_NAMES.CMS_SUB_ADMIN,
      description: 'CMS Sub Admin — CMS content only',
      scope: RoleScope.company,
    },
    update: {
      description: 'CMS Sub Admin — CMS content only',
      scope: RoleScope.company,
    },
  })

  const marketingAdmin = await prisma.role.upsert({
    where: { name: ROLE_NAMES.MARKETING_ADMIN },
    create: {
      name: ROLE_NAMES.MARKETING_ADMIN,
      description: 'Marketing Admin — Marketing + create Marketing sub-admins',
      scope: RoleScope.company,
    },
    update: {
      description: 'Marketing Admin — Marketing + create Marketing sub-admins',
      scope: RoleScope.company,
    },
  })

  await ensureRolePermissions(
    superAdmin.id,
    allPermissions.map((permission) => permission.name),
    byName,
  )

  await ensureRolePermissions(cmsAdmin.id, CMS_ADMIN_PERMISSIONS, byName)
  await ensureRolePermissions(cmsSubAdmin.id, CMS_SUB_ADMIN_PERMISSIONS, byName)
  await ensureRolePermissions(
    marketingAdmin.id,
    MARKETING_ADMIN_PERMISSIONS,
    byName,
  )

  return { superAdmin, cmsAdmin, cmsSubAdmin, marketingAdmin }
}

async function ensureDefaultWebsite(
  companyId: number,
  name: string,
  domain?: string | null,
) {
  const existing = await prisma.website.findFirst({
    where: { companyId, isPrimary: true },
  })
  if (existing) return existing

  return prisma.website.create({
    data: {
      companyId,
      name: `${name} Website`,
      domain: domain ?? null,
      isPrimary: true,
    },
  })
}

async function ensureCompanyWithSampleData(passwordHash: string) {
  let company = await prisma.company.findFirst({ orderBy: { id: 'asc' } })

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'Default Company',
        domain: 'default.local',
        status: 'active',
      },
    })

    const accounts = await Promise.all([
      prisma.connectedAccount.create({
        data: {
          companyId: company.id,
          platform: SocialPlatform.facebook,
          accountName: 'Company Official Page',
          handle: 'Company Official Page',
          isConnected: false,
        },
      }),
      prisma.connectedAccount.create({
        data: {
          companyId: company.id,
          platform: SocialPlatform.instagram,
          accountName: '@companyofficial',
          handle: '@companyofficial',
          isConnected: true,
        },
      }),
      prisma.connectedAccount.create({
        data: {
          companyId: company.id,
          platform: SocialPlatform.tiktok,
          accountName: '@companyofficial',
          handle: '@companyofficial',
          isConnected: true,
        },
      }),
    ])

    const [facebook, instagram, tiktok] = accounts

    await prisma.post.create({
      data: {
        companyId: company.id,
        caption:
          'Introducing our newest product. Available now across all our channels.',
        mediaUrl:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&auto=format&fit=crop',
        mediaType: 'image',
        publishMode: PublishMode.now,
        status: PostStatus.published,
        publishedAt: new Date('2026-09-02T14:30:00.000Z'),
        accounts: {
          create: [
            { accountId: facebook.id },
            { accountId: instagram.id },
            { accountId: tiktok.id },
          ],
        },
      },
    })

    console.log('Seeded default company and sample Marketing posts.')
  } else {
    console.log(
      `Database already has company "${company.name}" — preserving company data.`,
    )
  }

  await ensureDefaultWebsite(company.id, company.name, company.domain)
  return company
}

async function removeNonDemoUsers() {
  const keep = Object.values(DEMO_USERS)
  const removed = await prisma.user.deleteMany({
    where: {
      email: { notIn: [...keep] },
    },
  })
  if (removed.count > 0) {
    console.log(`Removed ${removed.count} non-demo user account(s).`)
  }
}

async function upsertDemoUser(input: {
  email: string
  firstName: string
  lastName: string
  role: 'main_admin' | 'admin'
  passwordHash: string
  companyId: number
}) {
  const { email, firstName, lastName, role, passwordHash, companyId } = input
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      firstName,
      lastName,
      role,
      passwordHash,
      companyId,
      status: 'active',
    },
    update: {
      firstName,
      lastName,
      role,
      passwordHash,
      companyId,
      status: 'active',
    },
  })
}

async function ensureAssignment(input: {
  userId: number
  roleId: number
  companyId: number | null
}) {
  const { userId, roleId, companyId } = input
  const existing = await prisma.userRoleAssignment.findFirst({
    where: { userId, roleId, companyId },
  })
  if (existing) return existing
  return prisma.userRoleAssignment.create({
    data: { userId, roleId, companyId },
  })
}

async function main() {
  const { superAdmin, cmsAdmin, marketingAdmin } = await ensureRbacCatalog()
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const company = await ensureCompanyWithSampleData(passwordHash)

  await removeNonDemoUsers()

  const superAdminUser = await upsertDemoUser({
    email: DEMO_USERS.SUPER_ADMIN,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'main_admin',
    passwordHash,
    companyId: company.id,
  })

  const cmsAdminUser = await upsertDemoUser({
    email: DEMO_USERS.CMS_ADMIN,
    firstName: 'CMS',
    lastName: 'Admin',
    role: 'admin',
    passwordHash,
    companyId: company.id,
  })

  const marketingAdminUser = await upsertDemoUser({
    email: DEMO_USERS.MARKETING_ADMIN,
    firstName: 'Marketing',
    lastName: 'Admin',
    role: 'main_admin',
    passwordHash,
    companyId: company.id,
  })

  // Clear role assignments for demo users, then grant exactly one department role each.
  await prisma.userRoleAssignment.deleteMany({
    where: {
      userId: {
        in: [superAdminUser.id, cmsAdminUser.id, marketingAdminUser.id],
      },
    },
  })

  await ensureAssignment({
    userId: superAdminUser.id,
    roleId: superAdmin.id,
    companyId: null,
  })
  await ensureAssignment({
    userId: cmsAdminUser.id,
    roleId: cmsAdmin.id,
    companyId: company.id,
  })
  await ensureAssignment({
    userId: marketingAdminUser.id,
    roleId: marketingAdmin.id,
    companyId: company.id,
  })

  console.log('Admin accounts reset to 3 departments:')
  console.log(`  ${DEMO_USERS.SUPER_ADMIN}     → Super Admin (overall)`)
  console.log(`  ${DEMO_USERS.CMS_ADMIN}       → CMS Admin`)
  console.log(`  ${DEMO_USERS.MARKETING_ADMIN} → Marketing Admin`)
  console.log(`  password: ${DEMO_PASSWORD}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
