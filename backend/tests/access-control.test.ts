import assert from 'node:assert/strict'
import { after, afterEach, before, mock, test } from 'node:test'
import express from 'express'
import type { Server } from 'node:http'

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.JWT_SECRET = 'access-control-test-secret'

const { prisma } = await import('../src/lib/prisma.js')
const { signAccessToken } = await import('../src/lib/jwt.js')
const { rolesRouter } = await import('../src/routes/roles.js')
const { usersRouter } = await import('../src/routes/users.js')
const { cmsUsersRouter } = await import('../src/routes/cms-users.js')
const { teamRouter } = await import('../src/routes/team.js')
const { syncRolePermissionGrantsSchema } = await import(
  '../src/schemas/roles.js'
)
const { ensureRbacCatalog } = await import('../src/lib/ensure-rbac.js')

let server: Server
let baseUrl: string
const token = signAccessToken({ sub: 1, email: 'actor@example.com' })
const account = {
  id: 1,
  companyId: 10,
  email: 'actor@example.com',
  firstName: 'Test',
  lastName: 'Admin',
  role: 'main_admin',
  status: 'active',
  websiteAccessMode: 'all_websites',
  createdAt: new Date(),
}

const restores: Array<() => void> = []
function stub(
  target: any,
  name: string,
  implementation: (...args: any[]) => any,
) {
  const original = target[name]
  const replacement = mock.fn(implementation)
  target[name] = replacement
  restores.push(() => {
    target[name] = original
  })
  return replacement
}

function authenticate(superAdmin = false) {
  stub(prisma.user, 'findUnique', async () => ({
    ...account,
    roleAssignments: [
      {
        roleId: 1,
        companyId: superAdmin ? null : 10,
        role: {
          name: superAdmin ? 'super_admin' : 'marketing_admin',
          scope: superAdmin ? 'platform' : 'company',
          permissions: ['role.edit', 'role.create', 'role.view'].map(
            (name) => ({ permission: { name } }),
          ),
        },
      },
    ],
  }))
}

async function request(path: string, method = 'GET', body?: unknown) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

before(async () => {
  const app = express()
  app.use(express.json())
  app.use('/roles', rolesRouter)
  app.use('/users', usersRouter)
  app.use('/cms-users', cmsUsersRouter)
  app.use('/team', teamRouter)
  server = app.listen(0, '127.0.0.1')
  await new Promise<void>((resolve) => server.once('listening', resolve))
  const address = server.address()
  assert.ok(address && typeof address !== 'string')
  baseUrl = `http://127.0.0.1:${address.port}`
})
afterEach(() => {
  for (const restore of restores.splice(0).reverse()) restore()
  mock.restoreAll()
})
after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  )
  await prisma.$disconnect()
})

test('role permissions do not allow a tenant admin to mutate the shared catalog', async () => {
  authenticate()
  for (const [path, method] of [
    ['/roles', 'POST'],
    ['/roles/2', 'PATCH'],
    ['/roles/permission-grants', 'PUT'],
  ]) {
    assert.equal((await request(path, method, {})).status, 403)
  }
})

test('Marketing Admin cannot reset another Marketing Admin password or delete them', async () => {
  authenticate()
  stub(prisma.user, 'findFirst', async () => ({ ...account, id: 2 }))
  assert.equal(
    (await request('/users/2', 'PATCH', { password: 'new-password' })).status,
    403,
  )
  assert.equal((await request('/users/2', 'DELETE')).status, 403)
})

test('Marketing Admin cannot promote a Sub Admin', async () => {
  authenticate()
  stub(prisma.user, 'findFirst', async () => ({
    ...account,
    id: 2,
    role: 'admin',
  }))
  assert.equal(
    (await request('/users/2', 'PATCH', { role: 'main_admin' })).status,
    403,
  )
})

test('account lookups are scoped to the company and exclude CMS/platform assignments', async () => {
  authenticate()
  const lookup = stub(prisma.user, 'findFirst', async () => null)
  assert.equal(
    (await request('/users/22', 'PATCH', { firstName: 'Changed' })).status,
    404,
  )
  assert.deepEqual(lookup.mock.calls[0].arguments[0], {
    include: {
      roleAssignments: { select: { role: { select: { name: true } } } },
    },
    where: {
      id: 22,
      companyId: 10,
      roleAssignments: {
        every: {
          companyId: 10,
          role: {
            name: 'marketing_admin',
            scope: 'company',
            OR: [{ companyId: null }, { companyId: 10 }],
          },
        },
      },
    },
  })
  assert.equal((await request('/users?companyId=20')).status, 403)
})

test('unknown grants are rejected before any transaction', async () => {
  authenticate(true)
  stub(prisma.role, 'findMany', async () => [])
  stub(prisma.permission, 'count', async () => 1)
  const transaction = stub(prisma, '$transaction', async () => {
    throw new Error('Must not mutate')
  })
  assert.equal(
    (
      await request('/roles/permission-grants', 'PUT', {
        permissionIds: [1],
        grants: [{ roleId: 999, permissionId: 1, granted: true }],
      })
    ).status,
    400,
  )
  assert.equal(transaction.mock.callCount(), 0)
})

test('duplicate and empty permission edits are rejected', () => {
  const grant = { roleId: 2, permissionId: 1, granted: true }
  assert.equal(
    syncRolePermissionGrantsSchema.safeParse({ permissionIds: [1], grants: [] })
      .success,
    false,
  )
  assert.equal(
    syncRolePermissionGrantsSchema.safeParse({
      permissionIds: [1],
      grants: [grant, { ...grant, granted: false }],
    }).success,
    false,
  )
})

test('startup preserves revoked permissions on existing roles', async () => {
  stub(prisma.permission, 'upsert', async () => ({}))
  stub(prisma.permission, 'findMany', async () => [{ id: 1, name: 'cms.view' }])
  const names = [
    'super_admin',
    'company_admin',
    'cms_sub_admin',
    'marketing_admin',
  ]
  stub(prisma.role, 'findMany', async () => names.map((name) => ({ name })))
  stub(
    prisma.role,
    'upsert',
    async ({ where }: { where: { name: string } }) => ({
      id: names.indexOf(where.name) + 1,
    }),
  )
  const grant = stub(prisma.rolePermission, 'upsert', async () => ({}))
  await ensureRbacCatalog()
  assert.equal(grant.mock.callCount(), 1)
  assert.equal(grant.mock.calls[0].arguments[0].create.roleId, 1)
})

test('last active Marketing Admin is protected inside a serializable transaction', async () => {
  authenticate(true)
  stub(prisma.user, 'findFirst', async () => ({ ...account, id: 2 }))
  const update = mock.fn(async () => {
    throw new Error('Must not update')
  })
  const transaction = stub(prisma, '$transaction', async (run) =>
    run({ user: { count: async () => 1, update } }),
  )
  assert.equal(
    (await request('/users/2', 'PATCH', { role: 'admin' })).status,
    400,
  )
  assert.equal(update.mock.callCount(), 0)
  assert.deepEqual(transaction.mock.calls[0].arguments[1], {
    isolationLevel: 'Serializable',
  })
})

test('Marketing Admin can update a Marketing Sub Admin', async () => {
  authenticate()
  const target = { ...account, id: 2, role: 'admin' }
  stub(prisma.user, 'findFirst', async () => target)
  stub(prisma, '$transaction', async (run) =>
    run({
      user: { update: async () => ({ ...target, firstName: 'Updated' }) },
    }),
  )
  stub(prisma.auditLog, 'create', async () => ({}))
  const response = await request('/users/2', 'PATCH', { firstName: 'Updated' })
  assert.equal(response.status, 200)
  assert.equal((await response.json()).firstName, 'Updated')
})

test('authentication ignores foreign-company and malformed Super Admin assignments', async () => {
  const { buildAuthContext } = await import('../src/lib/auth-context.js')
  const user = buildAuthContext(
    account as never,
    [
      {
        roleId: 2,
        companyId: 20,
        role: {
          name: 'editor',
          scope: 'company',
          companyId: 20,
          permissions: [{ permission: { name: 'cms.edit' } }],
        },
      },
      {
        roleId: 3,
        companyId: 10,
        role: {
          name: 'super_admin',
          scope: 'company',
          companyId: null,
          permissions: [],
        },
      },
    ] as never,
  )
  assert.equal(user.isSuperAdmin, false)
  assert.deepEqual(user.permissions, [])
})

// Evaluate the Prisma predicates against a mixed-company fixture so route tests
// check the returned department membership, not only the presence of a filter.
function matches(row: any, where: any): boolean {
  return Object.entries(where).every(([key, value]: [string, any]) => {
    if (key === 'OR')
      return value.some((condition: any) => matches(row, condition))
    if (value === null || typeof value !== 'object') return row[key] === value
    if ('in' in value && !value.in.includes(row[key])) return false
    if ('notIn' in value && value.notIn.includes(row[key])) return false
    if ('in' in value || 'notIn' in value) return true
    if ('some' in value || 'every' in value) {
      return (
        (!value.some ||
          row[key].some((item: any) => matches(item, value.some))) &&
        (!value.every ||
          row[key].every((item: any) => matches(item, value.every)))
      )
    }
    return matches(row[key], value)
  })
}

function departmentFixture() {
  const assignment = (
    name: string,
    companyId: number | null,
    owner: number | null = null,
  ) => ({
    roleId: 1,
    companyId,
    role: {
      id: 1,
      name,
      scope: name === 'super_admin' ? 'platform' : 'company',
      companyId: owner,
    },
  })
  return [
    { ...account, id: 1, roleAssignments: [assignment('super_admin', null)] },
    { ...account, id: 2, roleAssignments: [assignment('company_admin', 10)] },
    { ...account, id: 3, roleAssignments: [assignment('marketing_admin', 10)] },
    { ...account, id: 4, roleAssignments: [assignment('cms_sub_admin', 10)] },
    {
      ...account,
      id: 5,
      roleAssignments: [assignment('content_editor', 10, 10)],
    },
    { ...account, id: 6, role: 'admin', roleAssignments: [] },
    {
      ...account,
      id: 7,
      companyId: 20,
      roleAssignments: [assignment('company_admin', 20)],
    },
    {
      ...account,
      id: 8,
      roleAssignments: [
        assignment('company_admin', 10),
        assignment('super_admin', null),
      ],
    },
    {
      ...account,
      id: 9,
      roleAssignments: [
        assignment('company_admin', 10),
        assignment('marketing_admin', 10),
      ],
    },
  ].map((row) => ({ ...row, websiteAccesses: [] }))
}

function stubDepartmentUsers() {
  const users = departmentFixture()
  stub(prisma.user, 'findMany', async ({ where }) =>
    users.filter((row) => matches(row, where)),
  )
  stub(
    prisma.user,
    'findFirst',
    async ({ where }) => users.find((row) => matches(row, where)) ?? null,
  )
}

test('Super Admin sees only CMS accounts inside CMS, including custom company roles', async () => {
  authenticate(true)
  stubDepartmentUsers()
  const response = await request('/cms-users')
  assert.equal(response.status, 200)
  assert.deepEqual(
    (await response.json()).map((user: any) => user.id),
    [2, 4, 5],
  )
})

test('Super Admin sees only Marketing accounts inside Marketing', async () => {
  authenticate(true)
  stubDepartmentUsers()
  const response = await request('/users')
  assert.equal(response.status, 200)
  assert.deepEqual(
    (await response.json()).map((user: any) => user.id),
    [3, 6],
  )
})

test('CMS rejects direct edits and suspension of other departments, even for Super Admin', async () => {
  authenticate(true)
  stubDepartmentUsers()
  for (const id of [3, 6, 7, 8, 9]) {
    assert.equal(
      (await request(`/cms-users/${id}`, 'PATCH', { firstName: 'Changed' }))
        .status,
      404,
    )
    assert.equal(
      (await request(`/cms-users/${id}/suspend`, 'POST')).status,
      404,
    )
  }
  assert.equal(
    (await request('/cms-users/1', 'PATCH', { firstName: 'Changed' })).status,
    404,
  )
})

test('Marketing rejects direct edits of CMS and platform identities', async () => {
  authenticate(true)
  stubDepartmentUsers()
  for (const id of [1, 2, 4, 5, 7, 8, 9]) {
    assert.equal(
      (await request(`/users/${id}`, 'PATCH', { firstName: 'Changed' })).status,
      404,
    )
  }
})

test('Marketing team picker and permission list use the same department boundary', async () => {
  authenticate(true)
  stubDepartmentUsers()
  stub(prisma.connectedAccount, 'findMany', async () => [])
  const permissions = stub(prisma.accountPermission, 'findMany', async () => [])
  stub(prisma.auditLog, 'findMany', async () => [])
  stub(prisma.post, 'findMany', async () => [])
  const response = await request('/team/overview')
  assert.equal(response.status, 200)
  assert.deepEqual(
    (await response.json()).users.map((user: any) => user.id),
    [3, 6],
  )
  const predicate = permissions.mock.calls[0].arguments[0].where.user
  assert.deepEqual(
    departmentFixture()
      .filter((row) => matches(row, predicate))
      .map((row) => row.id),
    [3, 6],
  )
})

test('Marketing cannot assign publishing permissions to a CMS account', async () => {
  authenticate(true)
  stubDepartmentUsers()
  stub(prisma.connectedAccount, 'findFirst', async () => ({
    id: 1,
    companyId: 10,
  }))
  assert.equal(
    (
      await request('/team/permissions', 'PUT', {
        userId: 2,
        connectedAccountId: 1,
        canPublish: true,
      })
    ).status,
    404,
  )
})
