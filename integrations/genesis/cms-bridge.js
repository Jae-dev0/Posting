/* Served locally by Genesis. Text-only content patches preserve website controls. */
;(() => {
  'use strict'
  const cmsOrigin = 'https://demo3.bookna.com'
  const preview =
    parent !== window &&
    new URLSearchParams(location.search).get('cms-preview') === '1'
  const roots = [
    ...document.querySelectorAll(
      'body > header, body > section, body > .bookna-hero-wrap, body > footer, body > .bookna-contact-bar',
    ),
  ]
  const fields = new Map()
  const sections = []
  const movable = new Map()
  let connected = false
  let canEdit = false
  let selected
  function send(data) {
    if (preview) parent.postMessage(data, cmsOrigin)
  }
  function safeUrl(value, kind) {
    if (!value.trim()) return kind === 'href'
    try {
      const url = new URL(value, location.href)
      return (
        ['https:', 'http:'].includes(url.protocol) ||
        (kind === 'href' && ['mailto:', 'tel:'].includes(url.protocol))
      )
    } catch {
      return false
    }
  }
  roots.forEach((root, rootIndex) => {
    const section = 's' + rootIndex
    const label =
      root.querySelector('h1,h2,h3')?.textContent.trim() ||
      root.getAttribute('aria-label') ||
      root.id ||
      root.tagName.toLowerCase()
    const reorderable = root.matches('section,.bookna-hero-wrap')
    sections.push({ id: section, label: label.slice(0, 100), reorderable })
    if (reorderable) movable.set(section, root)
    ;[root, ...root.querySelectorAll('*')].forEach((element, index) => {
      if (
        element.closest(
          'script,style,noscript,select,textarea,svg,#passenger_count_display',
        )
      )
        return
      const prefix = `${section}.e${index}`
      function add(id, kind, original, node) {
        fields.set(id, {
          id,
          section,
          element,
          kind,
          original,
          node,
          label:
            kind === 'text'
              ? original.trim().slice(0, 90)
              : `${element.tagName.toLowerCase()} ${kind}`,
        })
      }
      ;[...element.childNodes].forEach((node, i) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim())
          add(`${prefix}.t${i}`, 'text', node.textContent, node)
      })
      const attrs = element.matches('img')
        ? ['src', 'alt']
        : element.matches('video,source')
          ? ['src', 'poster']
          : element.matches('a')
            ? ['href']
            : element.matches('input')
              ? ['placeholder']
              : []
      attrs.forEach((kind) => {
        if (element.hasAttribute(kind))
          add(`${prefix}.${kind}`, kind, element.getAttribute(kind))
      })
    })
  })
  const originalOrder = [...movable.keys()]
  const endMarker = document.createComment('cms-section-end')
  movable.get(originalOrder.at(-1))?.after(endMarker)
  function apply(doc) {
    const values = doc?.values || {}
    fields.forEach((field) => {
      const value = Object.hasOwn(values, field.id)
        ? values[field.id]
        : field.original
      if (typeof value !== 'string') return
      if (field.kind === 'text') {
        if (field.node.textContent !== value) field.node.textContent = value
      } else if (
        !['src', 'poster', 'href'].includes(field.kind) ||
        safeUrl(value, field.kind)
      ) {
        if (field.element.getAttribute(field.kind) !== value) {
          field.element.setAttribute(field.kind, value)
          if (field.kind === 'src') field.element.closest('video')?.load()
        }
      }
    })
    const order = [
      ...new Set([
        ...(doc?.order || []).filter((id) => movable.has(id)),
        ...originalOrder,
      ]),
    ]
    let anchor = endMarker
    ;[...order].reverse().forEach((id) => {
      const element = movable.get(id)
      if (element.nextSibling !== anchor) {
        if ('moveBefore' in Element.prototype)
          element.parentElement.moveBefore(element, anchor)
        else element.parentElement.insertBefore(element, anchor)
      }
      anchor = element
    })
  }
  function select(id) {
    const field = fields.get(id)
    if (!field) return
    selected?.classList.remove('cms-selected')
    selected = field.element
    selected.classList.add('cms-selected')
    selected.scrollIntoView({ block: 'nearest', behavior: 'instant' })
    send({ type: 'GENESIS_SELECT', id })
  }
  if (preview) {
    const style = document.createElement('style')
    style.textContent =
      '.cms-selected{outline:3px solid #2563eb!important;outline-offset:3px}[contenteditable="plaintext-only"]:hover{outline:2px dashed #2563eb}'
    document.head.append(style)
    window.addEventListener('message', (event) => {
      if (event.origin !== cmsOrigin || event.source !== parent || !event.data)
        return
      if (event.data.type === 'GENESIS_INIT') {
        connected = true
        canEdit = event.data.canEdit === true
        fields.forEach((field) => {
          if (
            field.kind !== 'text' ||
            field.element.childNodes.length !== 1 ||
            field.element.matches('button,a,label')
          )
            return
          field.element.contentEditable = canEdit ? 'plaintext-only' : 'false'
          field.element.dataset.cmsText = field.id
        })
        apply(event.data.document)
        send({
          type: 'GENESIS_READY',
          sections,
          fields: [...fields.values()].map(
            ({ id, section, kind, original, label }) => ({
              id,
              section,
              kind,
              original,
              label,
            }),
          ),
        })
      } else if (connected && event.data.type === 'GENESIS_DOCUMENT')
        apply(event.data.document)
      else if (connected && event.data.type === 'GENESIS_FOCUS')
        select(event.data.id)
    })
    document.addEventListener(
      'click',
      (event) => {
        if (!connected || !(event.target instanceof Element)) return
        event.preventDefault()
        event.stopImmediatePropagation()
        const matches = [...fields.values()].filter(
          (field) =>
            field.element === event.target ||
            field.element.contains(event.target),
        )
        const field =
          matches.reverse().find((item) => item.kind === 'text') || matches[0]
        if (field) select(field.id)
      },
      true,
    )
    document.addEventListener(
      'submit',
      (event) => {
        event.preventDefault()
        event.stopImmediatePropagation()
      },
      true,
    )
    document.addEventListener('input', (event) => {
      if (!connected || !canEdit) return
      const id = event.target.dataset?.cmsText
      const field = fields.get(id)
      if (!field) return
      // Keep the live text node reference after the browser replaces an empty text node.
      if (
        event.target.childNodes.length !== 1 ||
        event.target.firstChild.nodeType !== Node.TEXT_NODE
      ) {
        event.target.replaceChildren(
          document.createTextNode(event.target.textContent),
        )
      }
      field.node = event.target.firstChild
      send({ type: 'GENESIS_CHANGE', id, value: event.target.textContent })
    })
  } else {
    let lastVersion
    async function refresh() {
      if (document.hidden) return
      try {
        const response = await fetch(cmsOrigin + '/api/public/genesis', {
          cache: 'no-store',
          credentials: 'omit',
        })
        if (!response.ok) return
        const data = await response.json()
        if (data.publishedAt !== lastVersion) {
          apply(data.document)
          lastVersion = data.publishedAt
        }
      } catch {
        /* Keep the original site available when the CMS is offline. */
      }
    }
    void refresh()
    const refreshIntervalMs = 15000
    window.setInterval(refresh, refreshIntervalMs)
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
  }
})()
