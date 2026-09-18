const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const { JSDOM } = require(process.env.JSDOM_MODULE_PATH || 'jsdom')
const script = readFileSync(__dirname + '/cms-bridge.js', 'utf8')
const html =
  '<body><header><a href="/">Genesis</a></header><section id="about"><h2>Our Genesis</h2><p>Hello <strong>world</strong></p><img src="bus.jpg" alt="Bus"></section><section id="booking"><h2>Book now</h2><button id="search">Search</button><input value="keep"></section><footer>Footer</footer></body>'
function setup(preview = true) {
  const dom = new JSDOM(html, {
    url: 'https://demo2.bookna.com/' + (preview ? '?cms-preview=1' : ''),
    runScripts: 'outside-only',
    pretendToBeVisual: true,
  })
  const { window } = dom
  const messages = []
  const parent = {
    postMessage: (data, origin) => {
      assert.equal(origin, 'https://demo3.bookna.com')
      messages.push(data)
    },
  }
  if (preview) Object.defineProperty(window, 'parent', { value: parent })
  window.HTMLElement.prototype.scrollIntoView = () => {}
  function send(data, origin = 'https://demo3.bookna.com', source = parent) {
    window.dispatchEvent(
      new window.MessageEvent('message', { data, origin, source }),
    )
  }
  return { dom, window, messages, send }
}
test('preview authenticates origin/source, edits safely, and reorders without replacing controls', () => {
  const { dom, window, messages, send } = setup()
  window.eval(script)
  send(
    { type: 'GENESIS_INIT', document: null, canEdit: true },
    'https://untrusted.example',
  )
  assert.equal(messages.length, 0)
  send({ type: 'GENESIS_INIT', document: null, canEdit: true })
  const manifest = messages[0]
  const title = manifest.fields.find(
    (field) => field.original === 'Our Genesis',
  )
  const link = manifest.fields.find((field) => field.kind === 'href')
  const input = window.document.querySelector('input')
  send({
    type: 'GENESIS_DOCUMENT',
    document: {
      values: {
        [title.id]: '<script>not HTML</script>',
        [link.id]: 'javascript:alert(1)',
      },
      order: ['s2', 's1'],
    },
  })
  assert.equal(
    window.document.querySelector('#about h2').textContent,
    '<script>not HTML</script>',
  )
  assert.equal(window.document.querySelector('a').getAttribute('href'), '/')
  assert.equal(window.document.querySelectorAll('script').length, 0)
  assert.equal(window.document.querySelector('body > section').id, 'booking')
  assert.equal(window.document.querySelector('input'), input)
  assert.equal(input.value, 'keep')
  send({ type: 'GENESIS_DOCUMENT', document: { values: {}, order: [] } })
  assert.equal(
    window.document.querySelector('#about h2').textContent,
    'Our Genesis',
  )
  assert.equal(window.document.querySelector('body > section').id, 'about')
  const heading = window.document.querySelector('#about h2')
  heading.textContent = 'Inline change'
  heading.dispatchEvent(new window.Event('input', { bubbles: true }))
  assert.equal(messages.at(-1).value, 'Inline change')
  send({
    type: 'GENESIS_DOCUMENT',
    document: { values: { [title.id]: 'Sidebar change' }, order: [] },
  })
  assert.equal(heading.textContent, 'Sidebar change')
  dom.window.close()
})
test('visitors receive published patches and never become contenteditable', async () => {
  const { dom, window } = setup(false)
  window.fetch = async (url) => {
    assert.equal(url, 'https://demo3.bookna.com/api/public/genesis')
    return {
      ok: true,
      json: async () => ({
        publishedAt: 'version1',
        document: { values: { 's1.e1.t0': 'Published heading' }, order: [] },
      }),
    }
  }
  window.eval(script)
  await new Promise((resolve) => setImmediate(resolve))
  assert.equal(
    window.document.querySelector('#about h2').textContent,
    'Published heading',
  )
  assert.equal(window.document.querySelector('[contenteditable]'), null)
  dom.window.close()
})
