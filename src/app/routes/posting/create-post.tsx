import { Backdrop, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { isAxiosError } from 'axios'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { LuClock, LuFileText, LuLock } from 'react-icons/lu'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router'
import { ClockLoader } from 'react-spinners'

import { ContentLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import type { PostDraft, SocialPlatform } from '@/features/posting'
import {
  CreatePostForm,
  defaultPostDraft,
  MEDIA_MAX_IMAGES,
  MEDIA_MAX_SIZE_MB,
  PostPreview,
  useCreatePost,
  useFacebookPages,
  useInstagramAccounts,
  usePosts,
  usePublishFacebookPost,
  usePublishInstagramPost,
  useUploadMedia,
} from '@/features/posting'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'

const IMAGE_MAX_MB = 10

/** Avoid collisions when Facebook and Instagram SocialAccount ids overlap. */
const PLATFORM_ID_OFFSET: Record<'facebook' | 'instagram', number> = {
  facebook: 0,
  instagram: 1_000_000,
}

type PublishTarget = {
  uiId: number
  platform: 'facebook' | 'instagram'
  socialAccountId: number
  connectedAccountId: number | null
  displayName: string
  handle: string
  label: string
}

function toUiId(platform: 'facebook' | 'instagram', socialAccountId: number) {
  return PLATFORM_ID_OFFSET[platform] + socialAccountId
}

function revokeBlobUrls(urls: string[]) {
  for (const url of urls) {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  }
}

function formatInstagramHandle(pageName: string) {
  const trimmed = pageName.trim()
  if (!trimmed) return '@instagram'
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`
}

function getPublishFailureReason(error: unknown) {
  if (isAxiosError(error)) {
    if (error.response?.status === 413) {
      return 'Upload was rejected as too large (max about 10 MB per image).'
    }
    const data: unknown = error.response?.data
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof data.message === 'string'
    ) {
      return data.message
    }
  }
  if (error instanceof Error && error.message) return error.message
  return null
}

export function CreatePostPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const draftIdParam = searchParams.get('draftId')
  const resumeDraftId = draftIdParam ? Number(draftIdParam) : null

  const { showSuccess, showError, showNotification } = useSnackbar()
  const [draft, setDraft] = useState<PostDraft>(defaultPostDraft)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isPublishing, setIsPublishing] = useState(false)
  const [busyAction, setBusyAction] = useState<
    'publish' | 'schedule' | 'draft' | null
  >(null)
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null)

  const facebookPagesQuery = useFacebookPages()
  const instagramAccountsQuery = useInstagramAccounts()
  const draftsQuery = usePosts('draft', {
    query: { enabled: resumeDraftId !== null && Number.isInteger(resumeDraftId) },
  })

  const publishTargets = useMemo((): PublishTarget[] => {
    const facebook = (facebookPagesQuery.data ?? [])
      .filter((page) => page.isConnected)
      .map((page) => ({
        uiId: toUiId('facebook', page.id),
        platform: 'facebook' as const,
        socialAccountId: page.id,
        connectedAccountId: page.connectedAccountId,
        displayName: page.pageName,
        handle: page.pageName,
        label: `Facebook · ${page.pageName}`,
      }))

    const instagram = (instagramAccountsQuery.data ?? [])
      .filter((account) => account.isConnected)
      .map((account) => ({
        uiId: toUiId('instagram', account.id),
        platform: 'instagram' as const,
        socialAccountId: account.id,
        connectedAccountId: account.connectedAccountId,
        displayName: account.pageName.replace(/^@/, ''),
        handle: formatInstagramHandle(account.pageName),
        label: `Instagram · ${account.pageName}`,
      }))

    return [...facebook, ...instagram]
  }, [facebookPagesQuery.data, instagramAccountsQuery.data])

  const accounts = useMemo(
    () =>
      publishTargets.map((target) => ({
        id: target.uiId,
        socialAccountId: target.socialAccountId,
        platform: target.platform as SocialPlatform,
        accountName: target.displayName,
        handle: target.handle,
        isConnected: true,
      })),
    [publishTargets],
  )

  useEffect(() => {
    if (!resumeDraftId || !draftsQuery.data || editingDraftId === resumeDraftId) {
      return
    }

    const existing = draftsQuery.data.find((item) => item.id === resumeDraftId)
    if (!existing) return

    const selectedUiIds = publishTargets
      .filter(
        (target) =>
          target.connectedAccountId !== null &&
          (existing.selectedAccountIds ?? []).includes(target.connectedAccountId),
      )
      .map((target) => target.uiId)

    setDraft({
      caption: existing.caption === '(untitled draft)' ? '' : existing.caption,
      mediaUrls: existing.mediaUrl ? [existing.mediaUrl] : [],
      mediaType: existing.mediaType ?? (existing.mediaUrl ? 'image' : null),
      selectedAccountIds: selectedUiIds,
      publishMode: 'now',
      scheduledAt: null,
    })
    setMediaFiles([])
    setEditingDraftId(resumeDraftId)
  }, [draftsQuery.data, editingDraftId, publishTargets, resumeDraftId])

  const { mutateAsync: publishFacebook } = usePublishFacebookPost()
  const { mutateAsync: publishInstagram } = usePublishInstagramPost()
  const { mutateAsync: createCmsPost } = useCreatePost()
  const { mutateAsync: uploadMedia } = useUploadMedia()

  const resolveConnectedAccountIds = (selectedAccountIds: number[]) => {
    const ids = publishTargets
      .filter((target) => selectedAccountIds.includes(target.uiId))
      .map((target) => target.connectedAccountId)
      .filter((id): id is number => id !== null)

    return [...new Set(ids)]
  }

  const uploadPrimaryMediaUrl = async (): Promise<string | null> => {
    if (mediaFiles.length > 0) {
      const uploaded = await uploadMedia(mediaFiles[0])
      return uploaded.url
    }

    const publicUrl = draft.mediaUrls.find((url) => !url.startsWith('blob:'))
    return publicUrl ?? null
  }

  const handleCaptionChange = (caption: string) => {
    setDraft((current) => ({ ...current, caption }))
  }

  const handleAddMedia = (files: File[]) => {
    if (files.length === 0) return

    const remaining = MEDIA_MAX_IMAGES - draft.mediaUrls.length
    if (remaining <= 0) {
      showError(`You can add up to ${MEDIA_MAX_IMAGES} images.`)
      return
    }

    const accepted: File[] = []
    for (const file of files.slice(0, remaining)) {
      if (file.size > MEDIA_MAX_SIZE_MB * 1024 * 1024) {
        showError(`Each file must be ${MEDIA_MAX_SIZE_MB} MB or smaller.`)
        continue
      }
      if (!file.type.startsWith('image/')) {
        showNotification(
          'Only image files are supported (JPEG/PNG/GIF/WebP).',
          'warning',
        )
        continue
      }
      if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
        showError(`Each image must be ${IMAGE_MAX_MB} MB or smaller.`)
        continue
      }
      accepted.push(file)
    }

    if (accepted.length === 0) return

    const newUrls = accepted.map((file) => URL.createObjectURL(file))
    setMediaFiles((current) => [...current, ...accepted])
    setDraft((current) => ({
      ...current,
      mediaUrls: [...current.mediaUrls, ...newUrls],
      mediaType: 'image',
    }))
  }

  const handleRemoveMediaAt = (index: number) => {
    setDraft((current) => {
      const url = current.mediaUrls[index]
      if (url?.startsWith('blob:')) {
        URL.revokeObjectURL(url)
      }
      const mediaUrls = current.mediaUrls.filter((_, i) => i !== index)
      return {
        ...current,
        mediaUrls,
        mediaType: mediaUrls.length > 0 ? 'image' : null,
      }
    })
    setMediaFiles((current) => current.filter((_, i) => i !== index))
  }

  const handleClearMedia = () => {
    revokeBlobUrls(draft.mediaUrls)
    setMediaFiles([])
    setDraft((current) => ({
      ...current,
      mediaUrls: [],
      mediaType: null,
    }))
  }

  const handleToggleAccount = (accountId: number, enabled: boolean) => {
    setDraft((current) => {
      const selectedAccountIds = enabled
        ? [...new Set([...current.selectedAccountIds, accountId])]
        : current.selectedAccountIds.filter((id) => id !== accountId)

      return { ...current, selectedAccountIds }
    })
  }

  const handlePublishModeChange = (publishMode: PostDraft['publishMode']) => {
    setDraft((current) => ({
      ...current,
      publishMode,
      scheduledAt:
        publishMode === 'schedule'
          ? (current.scheduledAt ?? dayjs().add(1, 'hour').toISOString())
          : null,
    }))
  }

  const handleScheduledAtChange = (value: Dayjs | null) => {
    setDraft((current) => ({
      ...current,
      scheduledAt: value?.toISOString() ?? null,
    }))
  }

  const resetComposer = () => {
    revokeBlobUrls(draft.mediaUrls)
    setMediaFiles([])
    setDraft(defaultPostDraft)
    setEditingDraftId(null)
  }

  const handleSaveDraft = async () => {
    setBusyAction('draft')
    setIsPublishing(true)
    try {
      const mediaUrl = await uploadPrimaryMediaUrl()
      const selectedAccountIds = resolveConnectedAccountIds(
        draft.selectedAccountIds,
      )

      await createCmsPost({
        caption: draft.caption,
        mediaUrl,
        mediaType: mediaUrl ? 'image' : null,
        selectedAccountIds,
        publishMode: 'draft',
      })

      showSuccess('Draft saved.')
      resetComposer()
      void navigate(paths.posting.drafts.getHref())
    } catch (error) {
      console.error(error)
      showError('Could not save draft.')
    } finally {
      setIsPublishing(false)
      setBusyAction(null)
    }
  }

  const handlePublish = async () => {
    const { selectedAccountIds, caption, mediaUrls, publishMode, scheduledAt } =
      draft

    const selectedTargets = publishTargets.filter((target) =>
      selectedAccountIds.includes(target.uiId),
    )

    if (publishMode === 'schedule') {
      if (selectedTargets.length === 0) {
        showNotification(
          'Select at least one platform account below.',
          'warning',
        )
        return
      }
      if (!caption.trim()) {
        showNotification('Add post content before scheduling.', 'warning')
        return
      }
      if (!scheduledAt) {
        showNotification('Pick a schedule date and time.', 'warning')
        return
      }

      const connectedIds = resolveConnectedAccountIds(selectedAccountIds)
      if (connectedIds.length === 0) {
        showError(
          'Selected accounts are missing CMS links. Reconnect them under Accounts.',
        )
        return
      }

      setBusyAction('schedule')
      setIsPublishing(true)
      try {
        const mediaUrl = await uploadPrimaryMediaUrl()
        const needsInstagramImage = selectedTargets.some(
          (target) => target.platform === 'instagram',
        )
        if (needsInstagramImage && !mediaUrl) {
          showNotification(
            'Instagram scheduled posts require at least one image.',
            'warning',
          )
          return
        }

        await createCmsPost({
          caption,
          mediaUrl,
          mediaType: mediaUrl ? 'image' : null,
          selectedAccountIds: connectedIds,
          publishMode: 'schedule',
          scheduledAt,
        })

        showSuccess('Post scheduled.')
        resetComposer()
        void navigate(paths.posting.scheduled.getHref())
      } catch (error) {
        console.error(error)
        showError('Could not schedule post.')
      } finally {
        setIsPublishing(false)
        setBusyAction(null)
      }
      return
    }

    if (selectedTargets.length === 0) {
      showNotification(
        'Select at least one platform account below.',
        'warning',
      )
      return
    }

    if (!caption.trim()) {
      showNotification('Add post content before publishing.', 'warning')
      return
    }

    const publicImageUrls = mediaUrls.filter((url) => !url.startsWith('blob:'))
    const hasImages = mediaFiles.length > 0 || publicImageUrls.length > 0

    const needsInstagramImage = selectedTargets.some(
      (target) => target.platform === 'instagram',
    )
    if (needsInstagramImage && !hasImages) {
      showNotification(
        'Instagram posts require at least one image (local files or public https URLs).',
        'warning',
      )
      return
    }

    setBusyAction('publish')
    setIsPublishing(true)
    const publishedNames: string[] = []
    const failedNames: string[] = []
    const failureReasons: string[] = []

    try {
      for (const target of selectedTargets) {
        try {
          if (target.platform === 'facebook') {
            const result = await publishFacebook({
              socialAccountId: target.socialAccountId,
              message: caption,
              imageFiles: mediaFiles,
              imageUrls: mediaFiles.length > 0 ? [] : publicImageUrls,
            })
            publishedNames.push(result.pageName)
          } else {
            const result = await publishInstagram({
              socialAccountId: target.socialAccountId,
              caption,
              imageFiles: mediaFiles,
              imageUrls: mediaFiles.length > 0 ? [] : publicImageUrls,
            })
            publishedNames.push(result.pageName)
          }
        } catch (error) {
          failedNames.push(target.label)
          const reason = getPublishFailureReason(error)
          if (reason && !failureReasons.includes(reason)) {
            failureReasons.push(reason)
          }
          console.error(`Publish failed for ${target.label}`, error)
        }
      }

      if (publishedNames.length > 0) {
        showSuccess(`Published to ${publishedNames.join(', ')}.`)
      }
      if (failedNames.length > 0) {
        const detail =
          failureReasons.length > 0 ? ` ${failureReasons.join(' ')}` : ''
        showError(`Failed on ${failedNames.join(', ')}.${detail}`)
      }

      if (publishedNames.length > 0 && failedNames.length === 0) {
        resetComposer()
      }
    } finally {
      setIsPublishing(false)
      setBusyAction(null)
    }
  }

  const busyTitle =
    busyAction === 'draft'
      ? 'Saving draft…'
      : busyAction === 'schedule'
        ? 'Scheduling your post…'
        : 'Publishing your post…'

  const busySubtitle =
    busyAction === 'draft'
      ? 'Uploading media and storing your draft.'
      : 'This can take a few seconds while media uploads to Meta.'

  return (
    <ContentLayout title="Create Social Post">
      <Backdrop
        open={isPublishing}
        sx={{
          zIndex: (theme) => theme.zIndex.modal + 1,
          color: '#fff',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'rgba(15, 23, 42, 0.55)',
        }}
      >
        <ClockLoader color="#ffffff" size={64} speedMultiplier={0.9} />
        <Typography variant="subtitle1" fontWeight={600}>
          {busyTitle}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          {busySubtitle}
        </Typography>
      </Backdrop>

      <Stack spacing={3} sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Create Social Post
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add up to {MEDIA_MAX_IMAGES} images, toggle accounts, then publish
              or schedule everywhere selected.
              {editingDraftId ? ` Editing draft #${editingDraftId}.` : ''}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<LuFileText size={16} />}
              component={RouterLink}
              to={paths.posting.drafts.getHref()}
              disabled={isPublishing}
            >
              Drafts
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to={paths.posting.history.getHref()}
              startIcon={<LuClock size={16} />}
              disabled={isPublishing}
            >
              Post History
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 7 }}>
            <CreatePostForm
              draft={draft}
              accounts={accounts}
              isBusy={isPublishing}
              onCaptionChange={handleCaptionChange}
              onAddMedia={handleAddMedia}
              onRemoveMediaAt={handleRemoveMediaAt}
              onClearMedia={handleClearMedia}
              onToggleAccount={handleToggleAccount}
              onPublishModeChange={handlePublishModeChange}
              onScheduledAtChange={handleScheduledAtChange}
              onSaveDraft={() => {
                void handleSaveDraft()
              }}
              onPublish={() => {
                void handlePublish()
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <PostPreview draft={draft} accounts={accounts} />
          </Grid>
        </Grid>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <LuLock size={14} />
          <Typography variant="caption" color="text.secondary">
            Meta App Secret and Page tokens never leave the API server.
          </Typography>
        </Stack>
      </Stack>
    </ContentLayout>
  )
}
