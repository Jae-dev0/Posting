import { test } from 'node:test'
import assert from 'node:assert/strict'

// An unreachable database URL ensures these tests cannot mutate a real database.
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test'
process.env.JWT_SECRET = 'isolated-visual-editor-test-secret'
const { default: express } = await import('express')
const { prisma } = await import('../dist/lib/prisma.js')
const { signAccessToken } = await import('../dist/lib/jwt.js')
const { visualEditorRouter, publicVisualRouter } = await import(
  '../dist/routes/visual-editor.js'
)
let stored = null
let permissions = ['page.view', 'page.edit', 'page.publish']
let access = true
prisma.user.findUnique = async () => ({
  id: 1,
  email: 'editor@example.test',
  firstName: 'Test',
  lastName: 'Editor',
  companyId: 1,
  role: 'user',
  status: 'active',
  createdAt: new Date(),
  websiteAccessMode: 'selected_websites',
  roleAssignments: [
    {
      companyId: 1,
      roleId: 1,
      role: {
        name: 'editor',
        scope: 'company',
        companyId: 1,
        permissions: permissions.map((name) => ({ permission: { name } })),
      },
    },
  ],
})
prisma.website.findFirst = async ({ where }) =>
  where.companyId === 1 ? { id: 1, companyId: 1 } : null
prisma.userWebsiteAccess.findMany = async () =>
  access ? [{ websiteId: 1 }] : []
prisma.websiteSetting.findUnique = async () => stored
prisma.$transaction = async (fn) =>
  fn({
    websiteSetting: {
      findUnique: async () => stored,
      upsert: async ({ create, update }) => {
        stored = { value: stored ? update.value : create.value }
        return stored
      },
    },
    auditLog: { create: async () => ({}) },
  })

test('drafts stay private; publish checks permission, assignment, tenant, revision, and URLs', async () => {
  const app = express()
  app.use(express.json())
  app.use('/editor', visualEditorRouter)
  app.use('/public', publicVisualRouter)
  app.use((error, _req, res, _next) =>
    res.status(400).json({ message: error.message }),
  )
  const server = app.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))
  const origin = `http://127.0.0.1:${server.address().port}`
  const token = signAccessToken({ sub: 1, email: 'editor@example.test' })
  const request = async (path, body, headers = {}) =>
    fetch(origin + path, {
      method: body ? 'PUT' : 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
  try {
    assert.equal((await fetch(origin + '/editor')).status, 401)
    assert.equal(
      (await request('/editor', null, { 'X-Company-Id': '2' })).status,
      403,
    )
    access = false
    assert.equal((await request('/editor')).status, 403)
    access = true
    const document = { values: { 's1.e1.t0': 'Saved draft' }, order: [] }
    let response = await request('/editor/draft', { revision: 0, document })
    assert.equal(response.status, 200)
    assert.equal((await response.json()).revision, 1)
    assert.equal((await (await request('/public')).json()).document, null)
    assert.equal(
      (await request('/editor/draft', { revision: 0, document })).status,
      409,
    )
    permissions = ['page.view', 'page.edit']
    assert.equal(
      (await request('/editor/publish', { revision: 1 })).status,
      403,
    )
    permissions.push('page.publish')
    assert.equal(
      (await request('/editor/publish', { revision: 1 })).status,
      200,
    )
    assert.deepEqual(
      (await (await request('/public')).json()).document,
      document,
    )
    assert.equal(
      (
        await request('/editor/draft', {
          revision: 2,
          document: { values: { 's1.href': 'javascript:alert(1)' }, order: [] },
        })
      ).status,
      400,
    )
    const next = { values: { 's1.e1.t0': 'Unpublished edit' }, order: [] }
    assert.equal(
      (await request('/editor/draft', { revision: 2, document: next })).status,
      200,
    )
    assert.deepEqual(
      (await (await request('/public')).json()).document,
      document,
    )
  } finally {
    await new Promise((resolve) => server.close(resolve))
    await prisma.$disconnect()
  }
})
