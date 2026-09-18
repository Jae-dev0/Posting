# Genesis live editor

The CMS editor supports click-to-select content, inline plain-text editing,
image/video URLs and alt text, links, section drag-and-drop (plus keyboard move
buttons), undo/redo, device previews, saved drafts, and publishing.

Drafts and published snapshots are stored separately in the existing
`website_settings` table under `visual-editor:home:v1`. Saving a draft does not
change the public snapshot. Publishing requires `page.publish`; editing requires
`page.edit`. Both enforce company and website assignment. Revision checks reject
stale saves. No schema migration is needed.

## Connected (demo3 ↔ demo2)

| Piece | Location |
|-------|----------|
| CMS UI | `https://demo3.bookna.com` → Company CMS → Pages → Realtime Visual Editor |
| Live site | `https://demo2.bookna.com` (`/srv/apps/genesis_staging/genesis`) |
| Bridge | `genesis/js/cms-bridge.js` (loaded first in `includes/layout-end.php`) |
| Public API | `GET https://demo3.bookna.com/api/public/genesis` |
| Editor API | `GET/PUT /api/visual-editor` (+ `/draft`, `/publish`) |

Installed on 2026-09-08:

1. Copied `integrations/genesis/cms-bridge.js` → Genesis `js/cms-bridge.js`
2. Added `<script src="js/cms-bridge.js?v=20260908"></script>` **before** booking/map
   scripts in `includes/layout-end.php` (must run first so it captures the static DOM)
3. Rebuilt and restarted CMS `api` and `web` containers

The bridge reads only `/api/public/genesis` from the CMS. It uses exact-origin
and parent-window checks for preview messages; no access tokens go into the
iframe. The editor is enabled only in an embedded `?cms-preview=1` page after
the CMS handshake. Visitors fetch the published version on load/focus and every
15 seconds while visible. If the CMS is unavailable, the website's original
content remains available.

`GENESIS_WEBSITE_ID` defaults to the existing website ID 1. Set it explicitly
if Genesis is assigned a different website record. `GENESIS_SITE_URL` defaults
to `https://demo2.bookna.com`.

## How to use

1. Open `https://demo3.bookna.com` and sign in (e.g. `admin@cms.com` / `password123`)
2. Go to **Company CMS → Pages** (Realtime Visual Editor is the default view)
3. Click content in the live preview, edit text/media/links in the side panel
4. Drag sections (or use up/down) to reorder
5. **Save draft** (private) → **Publish** (pushes to demo2 within ~15s)

## Scope

This edits the existing static homepage sections, header, footer, images, and
links. It preserves booking controls and does not edit booking/API results,
chat flows, or add arbitrary new block types. Published changes are applied in
the browser, not PHP-rendered HTML. Shared header/footer content belongs to this
single-page website. Structural changes to PHP templates can change field IDs;
review the saved draft after such changes.

## Checks

Compile the backend and run `node --test backend/tests/visual-editor.test.mjs`.
DOM tests require jsdom 26: `node --test integrations/genesis/cms-bridge.test.cjs`.
An existing jsdom installation can be selected with `JSDOM_MODULE_PATH`.
