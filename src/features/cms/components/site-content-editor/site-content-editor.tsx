import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { FiArrowDown, FiArrowUp, FiMove, FiSave, FiSend } from 'react-icons/fi'
import { useHasPermission } from '@/lib/auth/hooks'
import { getApiErrorMessage } from '@/features/users/lib/get-api-error-message'
import {
  bridgeMessageSchema,
  useSaveVisualEditor,
  useVisualEditor,
  type VisualDocument,
  type VisualManifest,
  type VisualState,
} from '../../api/use-visual-editor'

const EMPTY_DOCUMENT: VisualDocument = { values: {}, order: [] }
const PREVIEW_TIMEOUT_MS = 15000
const HISTORY_LIMIT = 100
const VIEWPORTS = { desktop: '100%', tablet: '768px', mobile: '390px' }

export function SiteContentEditor() {
  const { data, status, error, refetch } = useVisualEditor()
  return (
    <Box>
      {status === 'pending' && (
        <CircularProgress aria-label="Loading website editor" />
      )}
      {status === 'error' && (
        <Alert
          severity="error"
          action={<Button onClick={() => void refetch()}>Retry</Button>}
        >
          {getApiErrorMessage(error, 'Unable to load editor')}
        </Alert>
      )}
      {status === 'success' && (
        <VisualEditor key={data.websiteId} initial={data} />
      )}
    </Box>
  )
}

function VisualEditor({ initial }: { initial: VisualState }) {
  const [saved, setSaved] = useState(initial)
  const [document, setDocument] = useState<VisualDocument>(
    initial.draft ?? initial.published ?? EMPTY_DOCUMENT,
  )
  const [manifest, setManifest] = useState<VisualManifest | null>(null)
  const [selected, setSelected] = useState('')
  const [section, setSection] = useState('')
  const [device, setDevice] = useState<keyof typeof VIEWPORTS>('desktop')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [history, setHistory] = useState<VisualDocument[]>([])
  const [future, setFuture] = useState<VisualDocument[]>([])
  const iframe = useRef<HTMLIFrameElement>(null)
  const documentRef = useRef(document)
  const dragged = useRef<string | null>(null)
  const mutation = useSaveVisualEditor()
  const canEdit = useHasPermission('page.edit')
  const canPublish = useHasPermission('page.publish')
  const origin = new URL(initial.siteUrl).origin
  const dirty =
    JSON.stringify(document) !==
    JSON.stringify(saved.draft ?? saved.published ?? EMPTY_DOCUMENT)
  const field = manifest?.fields.find((item) => item.id === selected)
  const order = [
    ...new Set([
      ...document.order,
      ...(manifest?.sections
        .filter((item) => item.reorderable)
        .map((item) => item.id) ?? []),
    ]),
  ]

  function change(next: VisualDocument) {
    if (!canEdit || mutation.isPending) return
    const previous = documentRef.current
    setHistory((items) => [...items.slice(-HISTORY_LIMIT), previous])
    setFuture([])
    documentRef.current = next
    setDocument(next)
    setMessage('')
  }
  const changeRef = useRef(change)
  useEffect(() => {
    changeRef.current = change
  })
  useEffect(() => {
    documentRef.current = document
    iframe.current?.contentWindow?.postMessage(
      { type: 'GENESIS_DOCUMENT', document },
      origin,
    )
  }, [document, origin])
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== origin ||
        event.source !== iframe.current?.contentWindow
      )
        return
      const parsed = bridgeMessageSchema.safeParse(event.data)
      if (!parsed.success) return
      const data = parsed.data
      if (data.type === 'GENESIS_READY') {
        setManifest(data)
        setError('')
        setSection((value) => value || data.sections[0]?.id || '')
      } else if (data.type === 'GENESIS_SELECT') {
        setSelected(data.id)
      } else if (data.type === 'GENESIS_CHANGE') {
        changeRef.current({
          ...documentRef.current,
          values: {
            ...documentRef.current.values,
            [data.id]: data.value,
          },
        })
      }
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [origin])
  useEffect(() => {
    if (manifest) return
    const timer = window.setTimeout(
      () =>
        setError(
          'The website preview has not connected. Check the Genesis bridge and reload this page.',
        ),
      PREVIEW_TIMEOUT_MS,
    )
    return () => window.clearTimeout(timer)
  }, [manifest])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault()
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const activeSection = field?.section ?? section
  function choose(id: string) {
    setSelected(id)
    iframe.current?.contentWindow?.postMessage(
      { type: 'GENESIS_FOCUS', id },
      origin,
    )
  }
  function move(id: string, target: number) {
    const next = order.filter((item) => item !== id)
    next.splice(target, 0, id)
    change({ ...document, order: next })
  }
  async function save(action: 'draft' | 'publish') {
    setError('')
    setMessage('')
    try {
      let state = saved
      if (action === 'draft' || dirty || !saved.draft) {
        state = await mutation.mutateAsync({
          action: 'draft',
          revision: state.revision,
          document,
        })
        setSaved(state)
      }
      if (action === 'publish') {
        state = await mutation.mutateAsync({
          action: 'publish',
          revision: state.revision,
        })
        setSaved(state)
      }
      setMessage(
        action === 'publish'
          ? 'Published to Genesis. New visits see the update; open pages refresh within 15 seconds.'
          : 'Draft saved. The public website has not changed.',
      )
    } catch (cause) {
      setError(getApiErrorMessage(cause, 'Unable to save website'))
    }
  }
  const disabled = !manifest || mutation.isPending
  return (
    <Stack spacing={2}>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5">Genesis live editor</Typography>
          <Typography color="text.secondary">
            Click content to edit. Drag sections to rearrange, then save or
            publish.
          </Typography>
        </Box>
        <Chip
          label={
            dirty
              ? 'Unsaved changes'
              : saved.publishedAt &&
                  JSON.stringify(saved.draft) ===
                    JSON.stringify(saved.published)
                ? 'Published'
                : 'Draft'
          }
        />
        <Button
          href={initial.siteUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View website
        </Button>
        <Button
          disabled={disabled || !canEdit}
          startIcon={<FiSave />}
          onClick={() => void save('draft')}
        >
          Save draft
        </Button>
        <Button
          variant="contained"
          disabled={disabled || !canPublish || (dirty && !canEdit)}
          startIcon={<FiSend />}
          onClick={() => void save('publish')}
        >
          {mutation.isPending ? 'Saving…' : 'Publish'}
        </Button>
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}
      {!manifest && (
        <Alert severity="info">Connecting to the Genesis preview…</Alert>
      )}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Button
          disabled={!history.length || !canEdit || mutation.isPending}
          onClick={() => {
            const previous = history[history.length - 1]!
            setFuture((items) => [document, ...items])
            setHistory(history.slice(0, -1))
            setDocument(previous)
          }}
        >
          Undo
        </Button>
        <Button
          disabled={!future.length || !canEdit || mutation.isPending}
          onClick={() => {
            setHistory([...history, document])
            setDocument(future[0])
            setFuture(future.slice(1))
          }}
        >
          Redo
        </Button>
        <Button
          disabled={disabled || !canEdit || !saved.published}
          onClick={() => change(saved.published!)}
        >
          Restore published version
        </Button>
        <TextField
          select
          size="small"
          label="Preview size"
          value={device}
          onChange={(event) =>
            setDevice(event.target.value as keyof typeof VIEWPORTS)
          }
          sx={{ minWidth: 150 }}
        >
          {Object.keys(VIEWPORTS).map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' },
          gap: 2,
        }}
      >
        <Paper
          variant="outlined"
          sx={{ p: 2, maxHeight: '80vh', overflow: 'auto' }}
        >
          <Stack spacing={2}>
            <Typography variant="h6">Content</Typography>
            <TextField
              select
              label="Section"
              value={activeSection}
              onChange={(event) => {
                setSection(event.target.value)
                setSelected('')
              }}
            >
              {manifest?.sections.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Text, image or link"
              value={field?.section === activeSection ? selected : ''}
              onChange={(event) => choose(event.target.value)}
            >
              {manifest?.fields
                .filter((item) => item.section === activeSection)
                .map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.label}
                  </MenuItem>
                ))}
            </TextField>
            {field && (
              <TextField
                label={field.kind === 'text' ? 'Text content' : field.kind}
                multiline
                minRows={field.kind === 'text' ? 3 : 1}
                disabled={!canEdit || mutation.isPending}
                value={document.values[field.id] ?? field.original}
                onChange={(event) =>
                  change({
                    ...document,
                    values: {
                      ...document.values,
                      [field.id]: event.target.value,
                    },
                  })
                }
                helperText={
                  ['src', 'poster'].includes(field.kind)
                    ? 'Use a website image path or an HTTPS image/video URL.'
                    : 'Changes appear in the preview immediately.'
                }
              />
            )}
            <Typography variant="h6">Section order</Typography>
            <Typography variant="body2">
              Drag a section or use its up/down buttons.
            </Typography>
            {order.map((id, index) => (
              <Paper
                key={id}
                variant="outlined"
                draggable={canEdit && !mutation.isPending}
                onDragStart={(event) => {
                  dragged.current = id
                  event.dataTransfer.setData('text/plain', id)
                }}
                onDragEnd={() => {
                  dragged.current = null
                }}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  if (dragged.current) move(dragged.current, index)
                  dragged.current = null
                }}
                sx={{ p: 1 }}
              >
                <Stack direction="row" alignItems="center">
                  <FiMove />
                  <Typography sx={{ flex: 1, px: 1 }} variant="body2">
                    {manifest?.sections.find((item) => item.id === id)?.label}
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  aria-label={`Move section ${index + 1} up`}
                  disabled={!canEdit || mutation.isPending || index === 0}
                  onClick={() => move(id, index - 1)}
                >
                  <FiArrowUp /> Up
                </Button>
                <Button
                  size="small"
                  aria-label={`Move section ${index + 1} down`}
                  disabled={
                    !canEdit || mutation.isPending || index === order.length - 1
                  }
                  onClick={() => move(id, index + 1)}
                >
                  <FiArrowDown /> Down
                </Button>
              </Paper>
            ))}
          </Stack>
        </Paper>
        <Paper
          variant="outlined"
          sx={{ p: 1, bgcolor: 'grey.100', overflow: 'auto' }}
        >
          <Box
            component="iframe"
            ref={iframe}
            title="Genesis website live editing preview"
            src={`${initial.siteUrl}/?cms-preview=1`}
            onLoad={() =>
              iframe.current?.contentWindow?.postMessage(
                {
                  type: 'GENESIS_INIT',
                  document: documentRef.current,
                  canEdit,
                },
                origin,
              )
            }
            sx={{
              display: 'block',
              width: VIEWPORTS[device],
              maxWidth: '100%',
              height: '80vh',
              mx: 'auto',
              border: 0,
              bgcolor: 'white',
            }}
          />
        </Paper>
      </Box>
    </Stack>
  )
}
