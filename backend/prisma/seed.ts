import { PrismaClient, PostStatus, PublishMode, SocialPlatform } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existingCompany = await prisma.company.findFirst()
  if (existingCompany) {
    // Preserve connected Meta accounts across API restarts / logout.
    console.log(
      `Database already has company "${existingCompany.name}" — skipping destructive seed.`,
    )
    return
  }

  const company = await prisma.company.create({
    data: { name: 'Default Company' },
  })

  const passwordHash = await bcrypt.hash('password123', 12)

  await prisma.user.createMany({
    data: [
      {
        email: 'mainadmin@posting.local',
        firstName: 'Main',
        lastName: 'Admin',
        role: 'main_admin',
        passwordHash,
        companyId: company.id,
      },
      {
        email: 'admin@posting.local',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        passwordHash,
        companyId: company.id,
      },
    ],
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

  await prisma.post.create({
    data: {
      companyId: company.id,
      caption: 'Summer sale starts today — up to 40% off selected items.',
      mediaUrl:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop',
      mediaType: 'image',
      publishMode: PublishMode.now,
      status: PostStatus.published,
      publishedAt: new Date('2026-08-28T09:00:00.000Z'),
      accounts: {
        create: [{ accountId: facebook.id }, { accountId: instagram.id }],
      },
    },
  })

  await prisma.post.create({
    data: {
      companyId: company.id,
      caption: 'Behind the scenes at our latest photo shoot.',
      mediaUrl: null,
      mediaType: null,
      publishMode: PublishMode.now,
      status: PostStatus.failed,
      publishedAt: new Date('2026-08-15T16:45:00.000Z'),
      accounts: {
        create: [{ accountId: tiktok.id }],
      },
    },
  })

  await prisma.post.create({
    data: {
      companyId: company.id,
      caption: 'Launch day is here! Join us live at 3 PM.',
      mediaUrl:
        'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&auto=format&fit=crop',
      mediaType: 'image',
      publishMode: PublishMode.schedule,
      status: PostStatus.scheduled,
      scheduledAt: new Date('2026-09-05T07:00:00.000Z'),
      accounts: {
        create: [
          { accountId: facebook.id },
          { accountId: instagram.id },
          { accountId: tiktok.id },
        ],
      },
    },
  })

  await prisma.post.create({
    data: {
      companyId: company.id,
      caption: 'Weekly tips: how to get the most from our platform.',
      mediaUrl: null,
      mediaType: null,
      publishMode: PublishMode.schedule,
      status: PostStatus.scheduled,
      scheduledAt: new Date('2026-09-10T10:00:00.000Z'),
      accounts: {
        create: [{ accountId: instagram.id }],
      },
    },
  })

  console.log('Seeded default company, users, and sample posts.')
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
