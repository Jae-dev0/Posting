<<<<<<< HEAD
import { Backdrop, Box, Button, Grid, Stack, Typography } from '@mui/material'
import { isAxiosError } from 'axios'
import dayjs, { Dayjs } from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { LuClock, LuFileText, LuLock } from 'react-icons/lu'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router'
import { ClockLoader } from 'react-spinners'
=======
import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { LuClock, LuFileText, LuLock } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'
>>>>>>> origin/main

import { ContentLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import type { PostDraft, SocialPlatform } from '@/features/posting'
import {
  CreatePostForm,
  defaultPostDraft,
  MEDIA_MAX_IMAGES,
  MEDIA_MAX_SIZE_MB,
  PostPreview,
<<<<<<< HEAD
  useCreatePost,
  useFacebookPages,
  useInstagramAccounts,
  useTikTokAccounts,
  usePosts,
  usePublishFacebookPost,
  usePublishInstagramPost,
  usePublishTikTokPost,
  useUploadMedia,
  useUpdatePost,
=======
  useFacebookPages,
  useInstagramAccounts,
  usePublishFacebookPost,
  usePublishInstagramPost,
>>>>>>> origin/main
} from '@/features/posting'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'

const IMAGE_MAX_MB = 10

/** Avoid collisions when Facebook and Instagram SocialAccount ids overlap. */
<<<<<<< HEAD
const PLATFORM_ID_OFFSET: Record<'facebook' | 'instagram' | 'tiktok', number> =
  {
    facebook: 0,
    instagram: 1_000_000,
    tiktok: 2_000_000,
  }

type PublishTarget = {
  uiId: number
  platform: 'facebook' | 'instagram' | 'tiktok'
  socialAccountId: number
  connectedAccountId: number | null
=======
const PLATFORM_ID_OFFSET: Record<'facebook' | 'instagram', number> = {
  facebook: 0,
  instagram: 1_000_000,
}

type PublishTarget = {
  uiId: number
  platform: 'facebook' | 'instagram'
  socialAccountId: number
>>>>>>> origin/main
  displayName: string
  handle: string
  label: string
}

<<<<<<< HEAD
function toUiId(
  platform: 'facebook' | 'instagram' | 'tiktok',
  socialAccountId: number,
) {
=======
function toUiId(platform: 'facebook' | 'instagram', socialAccountId: number) {
>>>>>>> origin/main
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

<<<<<<< HEAD
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
  const editIdParam = searchParams.get('postId') ?? searchParams.get('draftId')
  const resumeDraftId = editIdParam ? Number(editIdParam) : null

  const { showSuccess, showError, showNotification } = useSnackbar()
  const [draft, setDraft] = useState<PostDraft>(defaultPostDraft)
  const [mediaFiles, setMediaFiles] = useState<Record<string, File>>({})
  const [isPublishing, setIsPublishing] = useState(false)
  const [busyAction, setBusyAction] = useState<
    'publish' | 'schedule' | 'draft' | null
  >(null)
  const [editingDraftId, setEditingDraftId] = useState<number | null>(null)

  const facebookPagesQuery = useFacebookPages()
  const instagramAccountsQuery = useInstagramAccounts()
  const tiktokAccountsQuery = useTikTokAccounts()
  const draftsQuery = usePosts('all', {
    query: {
      enabled: resumeDraftId !== null && Number.isInteger(resumeDraftId),
    },
  })
=======
export function CreatePostPage() {
  const { showSuccess, showError, showNotification } = useSnackbar()
  const [draft, setDraft] = useState<PostDraft>(defaultPostDraft)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isPublishing, setIsPublishing] = useState(false)

  const facebookPagesQuery = useFacebookPages()
  const instagramAccountsQuery = useInstagramAccounts()
>>>>>>> origin/main

  const publishTargets = useMemo((): PublishTarget[] => {
    const facebook = (facebookPagesQuery.data ?? [])
      .filter((page) => page.isConnected)
      .map((page) => ({
        uiId: toUiId('facebook', page.id),
        platform: 'facebook' as const,
        socialAccountId: page.id,
<<<<<<< HEAD
        connectedAccountId: page.connectedAccountId,
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
        connectedAccountId: account.connectedAccountId,
=======
>>>>>>> origin/main
        displayName: account.pageName.replace(/^@/, ''),
        handle: formatInstagramHandle(account.pageName),
        label: `Instagram · ${account.pageName}`,
      }))

<<<<<<< HEAD
    const tiktok = (tiktokAccountsQuery.data ?? [])
      .filter((account) => account.isConnected)
      .map((account) => ({
        uiId: toUiId('tiktok', account.id),
        platform: 'tiktok' as const,
        socialAccountId: account.id,
        connectedAccountId: account.connectedAccountId,
        displayName: account.displayName,
        handle: account.displayName,
        label: `TikTok · ${account.displayName}`,
      }))

    return [...facebook, ...instagram, ...tiktok]
  }, [
    facebookPagesQuery.data,
    instagramAccountsQuery.data,
    tiktokAccountsQuery.data,
  ])
=======
    return [...facebook, ...instagram]
  }, [facebookPagesQuery.data, instagramAccountsQuery.data])
>>>>>>> origin/main

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

<<<<<<< HEAD
  useEffect(() => {
    if (
      !resumeDraftId ||
      !draftsQuery.data ||
      editingDraftId === resumeDraftId
    ) {
      return
    }

    const existing = draftsQuery.data.find((item) => item.id === resumeDraftId)
    if (!existing) return

    const selectedUiIds = publishTargets
      .filter(
        (target) =>
          target.connectedAccountId !== null &&
          (existing.selectedAccountIds ?? []).includes(
            target.connectedAccountId,
          ),
      )
      .map((target) => target.uiId)

    setDraft({
      caption: existing.caption === '(untitled draft)' ? '' : existing.caption,
      mediaUrls: existing.media.map((item) => item.url),
      mediaType: existing.media[0]?.type ?? null,
      selectedAccountIds: selectedUiIds,
      publishMode: existing.publishMode === 'schedule' ? 'schedule' : 'now',
      scheduledAt: existing.scheduledAt ?? null,
    })
    setMediaFiles({})
    setEditingDraftId(resumeDraftId)
  }, [draftsQuery.data, editingDraftId, publishTargets, resumeDraftId])

  const { mutateAsync: publishFacebook } = usePublishFacebookPost()
  const { mutateAsync: publishInstagram } = usePublishInstagramPost()
  const { mutateAsync: publishTikTok } = usePublishTikTokPost()
  const { mutateAsync: createCmsPost } = useCreatePost()
  const { mutateAsync: updateCmsPost } = useUpdatePost()
  const { mutateAsync: uploadMedia } = useUploadMedia()

  const resolveConnectedAccountIds = (selectedAccountIds: number[]) => {
    const ids = publishTargets
      .filter((target) => selectedAccountIds.includes(target.uiId))
      .map((target) => target.connectedAccountId)
      .filter((id): id is number => id !== null)

    return [...new Set(ids)]
  }

  const uploadPostMedia = async () =>
    Promise.all(
      draft.mediaUrls.map(async (url) => {
        const file = mediaFiles[url]
        if (file) return uploadMedia(file)
        return { url, type: draft.mediaType ?? 'image' }
      }),
    )

  const mediaFileList = Object.values(mediaFiles)
=======
  const { mutateAsync: publishFacebook } = usePublishFacebookPost()
  const { mutateAsync: publishInstagram } = usePublishInstagramPost()
>>>>>>> origin/main

  const handleCaptionChange = (caption: string) => {
    setDraft((current) => ({ ...current, caption }))
  }

  const handleAddMedia = (files: File[]) => {
    if (files.length === 0) return

<<<<<<< HEAD
    const isVideo = files[0]?.type === 'video/mp4'
    if (isVideo && files.length > 1) {
      showError('A post can contain one video or up to ten images.')
      return
    }
    if (
      draft.mediaUrls.length > 0 &&
      (isVideo || draft.mediaType === 'video')
    ) {
      showError('Replace the existing media before adding a video or images.')
      return
    }
    const remaining = isVideo ? 1 : MEDIA_MAX_IMAGES - draft.mediaUrls.length
=======
    const remaining = MEDIA_MAX_IMAGES - draft.mediaUrls.length
>>>>>>> origin/main
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
<<<<<<< HEAD
      if (!file.type.startsWith('image/') && file.type !== 'video/mp4') {
        showNotification(
          'Only JPEG, PNG, GIF, WebP, or MP4 files are supported.',
=======
      if (!file.type.startsWith('image/')) {
        showNotification(
          'Only image files are supported (JPEG/PNG/GIF/WebP).',
>>>>>>> origin/main
          'warning',
        )
        continue
      }
<<<<<<< HEAD
      if (
        file.type.startsWith('image/') &&
        file.size > IMAGE_MAX_MB * 1024 * 1024
      ) {
=======
      if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
>>>>>>> origin/main
        showError(`Each image must be ${IMAGE_MAX_MB} MB or smaller.`)
        continue
      }
      accepted.push(file)
    }

    if (accepted.length === 0) return

    const newUrls = accepted.map((file) => URL.createObjectURL(file))
<<<<<<< HEAD
    setMediaFiles((current) => ({
      ...current,
      ...Object.fromEntries(
        newUrls.map((url, index) => [url, accepted[index]]),
      ),
    }))
    setDraft((current) => ({
      ...current,
      mediaUrls: [...current.mediaUrls, ...newUrls],
      mediaType: isVideo ? 'video' : 'image',
=======
    setMediaFiles((current) => [...current, ...accepted])
    setDraft((current) => ({
      ...current,
      mediaUrls: [...current.mediaUrls, ...newUrls],
      mediaType: 'image',
>>>>>>> origin/main
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
<<<<<<< HEAD
    const removedUrl = draft.mediaUrls[index]
    setMediaFiles((current) =>
      Object.fromEntries(
        Object.entries(current).filter(([key]) => key !== removedUrl),
      ),
    )
=======
    setMediaFiles((current) => current.filter((_, i) => i !== index))
>>>>>>> origin/main
  }

  const handleClearMedia = () => {
    revokeBlobUrls(draft.mediaUrls)
<<<<<<< HEAD
    setMediaFiles({})
=======
    setMediaFiles([])
>>>>>>> origin/main
    setDraft((current) => ({
      ...current,
      mediaUrls: [],
      mediaType: null,
    }))
  }

<<<<<<< HEAD
  const handleMoveMedia = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const target = index + direction
      if (target < 0 || target >= current.mediaUrls.length) return current
      const mediaUrls = [...current.mediaUrls]
      ;[mediaUrls[index], mediaUrls[target]] = [
        mediaUrls[target],
        mediaUrls[index],
      ]
      return { ...current, mediaUrls }
    })
  }

=======
>>>>>>> origin/main
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
<<<<<<< HEAD
          ? (current.scheduledAt ?? dayjs().add(1, 'hour').toISOString())
=======
          ? (current.scheduledAt ?? dayjs().hour(10).minute(0).toISOString())
>>>>>>> origin/main
          : null,
    }))
  }

  const handleScheduledAtChange = (value: Dayjs | null) => {
    setDraft((current) => ({
      ...current,
      scheduledAt: value?.toISOString() ?? null,
    }))
  }

<<<<<<< HEAD
  const resetComposer = () => {
    revokeBlobUrls(draft.mediaUrls)
    setMediaFiles({})
    setDraft(defaultPostDraft)
    setEditingDraftId(null)
  }

  const handleSaveDraft = async () => {
    setBusyAction('draft')
    setIsPublishing(true)
    try {
      const media = await uploadPostMedia()
      const selectedAccountIds = resolveConnectedAccountIds(
        draft.selectedAccountIds,
      )

      const input = {
        caption: draft.caption,
        media,
        selectedAccountIds,
        publishMode: 'draft',
      } as const
      if (editingDraftId) {
        await updateCmsPost({ postId: editingDraftId, ...input })
      } else {
        await createCmsPost(input)
      }

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
=======
  const handleSaveDraft = () => {
    showSuccess('Draft kept locally. Server draft save can be added next.')
  }

  const handlePublish = async () => {
    const { selectedAccountIds, caption, mediaUrls, publishMode } = draft
>>>>>>> origin/main

    const selectedTargets = publishTargets.filter((target) =>
      selectedAccountIds.includes(target.uiId),
    )

<<<<<<< HEAD
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
        const media = await uploadPostMedia()
        const needsInstagramImage = selectedTargets.some(
          (target) => target.platform === 'instagram',
        )
        if (needsInstagramImage && media.length === 0) {
          showNotification(
            'Instagram scheduled posts require at least one image.',
            'warning',
          )
          return
        }
        const needsTikTokVideo = selectedTargets.some(
          (target) => target.platform === 'tiktok',
        )
        if (needsTikTokVideo && draft.mediaType !== 'video') {
          showNotification(
            'TikTok scheduled posts require one video.',
            'warning',
          )
          return
        }

        const input = {
          caption,
          media,
          selectedAccountIds: connectedIds,
          publishMode: 'schedule',
          scheduledAt,
        } as const
        if (editingDraftId) {
          await updateCmsPost({ postId: editingDraftId, ...input })
        } else {
          await createCmsPost(input)
        }

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
      showNotification('Select at least one platform account below.', 'warning')
=======
    if (selectedTargets.length === 0) {
      showNotification(
        'Select at least one platform account below.',
        'warning',
      )
>>>>>>> origin/main
      return
    }

    if (!caption.trim()) {
      showNotification('Add post content before publishing.', 'warning')
      return
    }

<<<<<<< HEAD
    const publicImageUrls = mediaUrls.filter((url) => !url.startsWith('blob:'))
    const hasImages = mediaFileList.length > 0 || publicImageUrls.length > 0
=======
    if (publishMode === 'schedule') {
      showNotification(
        'Scheduling via Meta is not wired yet. Use Publish Everywhere for immediate publish.',
        'warning',
      )
      return
    }

    const publicImageUrls = mediaUrls.filter((url) => !url.startsWith('blob:'))
    const hasImages = mediaFiles.length > 0 || publicImageUrls.length > 0
>>>>>>> origin/main

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

<<<<<<< HEAD
    const needsTikTokVideo = selectedTargets.some(
      (target) => target.platform === 'tiktok',
    )
    if (needsTikTokVideo && draft.mediaType !== 'video') {
      showNotification('TikTok Direct Posts require one video.', 'warning')
      return
    }

    setBusyAction('publish')
    setIsPublishing(true)
    const publishedNames: string[] = []
    const failedNames: string[] = []
    const failureReasons: string[] = []
=======
    setIsPublishing(true)
    const publishedNames: string[] = []
    const failedNames: string[] = []
>>>>>>> origin/main

    try {
      for (const target of selectedTargets) {
        try {
          if (target.platform === 'facebook') {
            const result = await publishFacebook({
              socialAccountId: target.socialAccountId,
              message: caption,
<<<<<<< HEAD
              imageFiles: mediaFileList,
              imageUrls: mediaFileList.length > 0 ? [] : publicImageUrls,
            })
            publishedNames.push(result.pageName)
          } else if (target.platform === 'instagram') {
            const result = await publishInstagram({
              socialAccountId: target.socialAccountId,
              caption,
              imageFiles: mediaFileList,
              imageUrls: mediaFileList.length > 0 ? [] : publicImageUrls,
            })
            publishedNames.push(result.pageName)
          } else {
            const videoUrl = mediaUrls[0]
            const result = await publishTikTok({
              socialAccountId: target.socialAccountId,
              caption,
              videoFile: videoUrl ? mediaFiles[videoUrl] : undefined,
              videoUrl:
                videoUrl && !videoUrl.startsWith('blob:')
                  ? videoUrl
                  : undefined,
            })
            publishedNames.push(result.displayName)
          }
        } catch (error) {
          failedNames.push(target.label)
          const reason = getPublishFailureReason(error)
          if (reason && !failureReasons.includes(reason)) {
            failureReasons.push(reason)
          }
=======
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
>>>>>>> origin/main
          console.error(`Publish failed for ${target.label}`, error)
        }
      }

      if (publishedNames.length > 0) {
        showSuccess(`Published to ${publishedNames.join(', ')}.`)
      }
      if (failedNames.length > 0) {
<<<<<<< HEAD
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

=======
        showError(`Failed on ${failedNames.join(', ')}.`)
      }

      if (publishedNames.length > 0 && failedNames.length === 0) {
        revokeBlobUrls(mediaUrls)
        setMediaFiles([])
        setDraft(defaultPostDraft)
      }
    } finally {
      setIsPublishing(false)
    }
  }

  return (
    <ContentLayout title="Create Social Post">
>>>>>>> origin/main
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
<<<<<<< HEAD
              or schedule everywhere selected.
              {editingDraftId ? ` Editing post #${editingDraftId}.` : ''}
=======
              everywhere selected.
>>>>>>> origin/main
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<LuFileText size={16} />}
<<<<<<< HEAD
              component={RouterLink}
              to={paths.posting.drafts.getHref()}
              disabled={isPublishing}
=======
              onClick={handleSaveDraft}
>>>>>>> origin/main
            >
              Drafts
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to={paths.posting.history.getHref()}
              startIcon={<LuClock size={16} />}
<<<<<<< HEAD
              disabled={isPublishing}
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
              isBusy={isPublishing}
              onCaptionChange={handleCaptionChange}
              onAddMedia={handleAddMedia}
              onRemoveMediaAt={handleRemoveMediaAt}
              onMoveMedia={handleMoveMedia}
=======
              onCaptionChange={handleCaptionChange}
              onAddMedia={handleAddMedia}
              onRemoveMediaAt={handleRemoveMediaAt}
>>>>>>> origin/main
              onClearMedia={handleClearMedia}
              onToggleAccount={handleToggleAccount}
              onPublishModeChange={handlePublishModeChange}
              onScheduledAtChange={handleScheduledAtChange}
<<<<<<< HEAD
              onSaveDraft={() => {
                void handleSaveDraft()
              }}
=======
              onSaveDraft={handleSaveDraft}
>>>>>>> origin/main
              onPublish={() => {
                void handlePublish()
              }}
            />
<<<<<<< HEAD
=======
            {isPublishing ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Publishing to selected accounts…
              </Typography>
            ) : null}
>>>>>>> origin/main
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
