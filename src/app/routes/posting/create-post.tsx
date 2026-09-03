import { Box, Button, Grid, Stack, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { LuClock, LuFileText, LuLock } from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import { ContentLayout } from '@/components/layout'
import { paths } from '@/config/paths'
import type { PostDraft, SocialPlatform } from '@/features/posting'
import {
  CreatePostForm,
  defaultPostDraft,
  MEDIA_MAX_IMAGES,
  MEDIA_MAX_SIZE_MB,
  PostPreview,
  useFacebookPages,
  useInstagramAccounts,
  usePublishFacebookPost,
  usePublishInstagramPost,
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

export function CreatePostPage() {
  const { showSuccess, showError, showNotification } = useSnackbar()
  const [draft, setDraft] = useState<PostDraft>(defaultPostDraft)
  const [mediaFiles, setMediaFiles] = useState<File[]>([])
  const [isPublishing, setIsPublishing] = useState(false)

  const facebookPagesQuery = useFacebookPages()
  const instagramAccountsQuery = useInstagramAccounts()

  const publishTargets = useMemo((): PublishTarget[] => {
    const facebook = (facebookPagesQuery.data ?? [])
      .filter((page) => page.isConnected)
      .map((page) => ({
        uiId: toUiId('facebook', page.id),
        platform: 'facebook' as const,
        socialAccountId: page.id,
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

  const { mutateAsync: publishFacebook } = usePublishFacebookPost()
  const { mutateAsync: publishInstagram } = usePublishInstagramPost()

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
          ? (current.scheduledAt ?? dayjs().hour(10).minute(0).toISOString())
          : null,
    }))
  }

  const handleScheduledAtChange = (value: Dayjs | null) => {
    setDraft((current) => ({
      ...current,
      scheduledAt: value?.toISOString() ?? null,
    }))
  }

  const handleSaveDraft = () => {
    showSuccess('Draft kept locally. Server draft save can be added next.')
  }

  const handlePublish = async () => {
    const { selectedAccountIds, caption, mediaUrls, publishMode } = draft

    const selectedTargets = publishTargets.filter((target) =>
      selectedAccountIds.includes(target.uiId),
    )

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

    if (publishMode === 'schedule') {
      showNotification(
        'Scheduling via Meta is not wired yet. Use Publish Everywhere for immediate publish.',
        'warning',
      )
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

    setIsPublishing(true)
    const publishedNames: string[] = []
    const failedNames: string[] = []

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
          console.error(`Publish failed for ${target.label}`, error)
        }
      }

      if (publishedNames.length > 0) {
        showSuccess(`Published to ${publishedNames.join(', ')}.`)
      }
      if (failedNames.length > 0) {
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
              everywhere selected.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<LuFileText size={16} />}
              onClick={handleSaveDraft}
            >
              Drafts
            </Button>
            <Button
              variant="outlined"
              component={RouterLink}
              to={paths.posting.history.getHref()}
              startIcon={<LuClock size={16} />}
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
              onCaptionChange={handleCaptionChange}
              onAddMedia={handleAddMedia}
              onRemoveMediaAt={handleRemoveMediaAt}
              onClearMedia={handleClearMedia}
              onToggleAccount={handleToggleAccount}
              onPublishModeChange={handlePublishModeChange}
              onScheduledAtChange={handleScheduledAtChange}
              onSaveDraft={handleSaveDraft}
              onPublish={() => {
                void handlePublish()
              }}
            />
            {isPublishing ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Publishing to selected accounts…
              </Typography>
            ) : null}
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
