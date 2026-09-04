import {
  Avatar,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import {
  LuBookmark,
  LuChevronLeft,
  LuChevronRight,
  LuGlobe,
  LuHeart,
  LuMessageCircle,
  LuSend,
  LuShare2,
  LuThumbsUp,
} from 'react-icons/lu'

import type { ConnectedAccount, PostDraft, SocialPlatform } from '../../types'
import { SocialPlatformEnum } from '../../types'
import {
  getPlatformColor,
  getPlatformIcon,
  getPlatformLabel,
} from '../platform-utils'

export type PostPreviewProps = {
  draft: PostDraft
  accounts: ConnectedAccount[]
}

function initialsFromName(name: string) {
  const parts = name.replace(/^@/, '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
}

function MediaCarousel({
  mediaUrls,
  activeIndex,
  onIndexChange,
  aspectRatio,
  maxHeight,
}: {
  mediaUrls: string[]
  activeIndex: number
  onIndexChange: (index: number) => void
  aspectRatio?: string
  maxHeight?: number
}) {
  if (mediaUrls.length === 0) return null

  const safeIndex = Math.min(activeIndex, mediaUrls.length - 1)
  const activeUrl = mediaUrls[safeIndex]

  return (
    <Box sx={{ position: 'relative', bgcolor: '#000' }}>
      <Box
        component="img"
        src={activeUrl}
        alt={`Preview image ${safeIndex + 1}`}
        sx={{
          width: '100%',
          display: 'block',
          aspectRatio: aspectRatio ?? 'auto',
          maxHeight: maxHeight ?? 'none',
          objectFit: 'cover',
        }}
      />

      {mediaUrls.length > 1 ? (
        <>
          <IconButton
            size="small"
            aria-label="Previous image"
            onClick={() =>
              onIndexChange(
                (safeIndex - 1 + mediaUrls.length) % mediaUrls.length,
              )
            }
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.85)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
            }}
          >
            <LuChevronLeft size={16} />
          </IconButton>
          <IconButton
            size="small"
            aria-label="Next image"
            onClick={() => onIndexChange((safeIndex + 1) % mediaUrls.length)}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255,255,255,0.85)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.95)' },
            }}
          >
            <LuChevronRight size={16} />
          </IconButton>
          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              px: 1,
              py: 0.25,
              borderRadius: 999,
              bgcolor: 'rgba(0,0,0,0.55)',
              color: 'common.white',
              fontWeight: 600,
            }}
          >
            {safeIndex + 1}/{mediaUrls.length}
          </Typography>
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="center"
            sx={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              right: 0,
            }}
          >
            {mediaUrls.map((_, index) => (
              <Box
                key={index}
                component="button"
                type="button"
                aria-label={`Go to image ${index + 1}`}
                onClick={() => onIndexChange(index)}
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  border: 0,
                  p: 0,
                  cursor: 'pointer',
                  bgcolor:
                    index === safeIndex
                      ? 'common.white'
                      : 'rgba(255,255,255,0.45)',
                }}
              />
            ))}
          </Stack>
        </>
      ) : null}
    </Box>
  )
}

function FacebookPreviewFrame({
  account,
  caption,
  mediaUrls,
  activeIndex,
  onIndexChange,
}: {
  account?: ConnectedAccount
  caption: string
  mediaUrls: string[]
  activeIndex: number
  onIndexChange: (index: number) => void
}) {
  const displayName = account?.accountName ?? 'Your Page'
  const fbBlue = '#1877F2'

  return (
    <Box
      sx={{
        border: '1px solid #DADDE1',
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        color: '#050505',
        fontFamily:
          'Segoe UI, Helvetica, Arial, sans-serif',
      }}
    >
      <Stack spacing={1.25} sx={{ p: 1.5, pb: 1 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: fbBlue,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {initialsFromName(displayName)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.2,
                color: '#050505',
              }}
              noWrap
            >
              {displayName}
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography sx={{ fontSize: 12, color: '#65676B' }}>
                Just now
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#65676B' }}>·</Typography>
              <LuGlobe size={11} color="#65676B" />
            </Stack>
          </Box>
        </Stack>

        <Typography
          sx={{
            fontSize: 15,
            whiteSpace: 'pre-wrap',
            color: '#050505',
            lineHeight: 1.3333,
          }}
        >
          {caption || 'Write something…'}
        </Typography>
      </Stack>

      <MediaCarousel
        mediaUrls={mediaUrls}
        activeIndex={activeIndex}
        onIndexChange={onIndexChange}
        maxHeight={320}
      />

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 1.5, py: 0.75 }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              bgcolor: fbBlue,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <LuThumbsUp size={10} color="#fff" />
          </Box>
          <Typography sx={{ fontSize: 13, color: '#65676B' }}>0</Typography>
        </Stack>
        <Typography sx={{ fontSize: 13, color: '#65676B' }}>
          0 comments · 0 shares
        </Typography>
      </Stack>

      <Box sx={{ borderTop: '1px solid #CED0D4', mx: 1.5 }} />

      <Stack
        direction="row"
        justifyContent="space-around"
        sx={{ px: 0.5, py: 0.5 }}
      >
        {[
          { icon: LuThumbsUp, label: 'Like' },
          { icon: LuMessageCircle, label: 'Comment' },
          { icon: LuShare2, label: 'Share' },
        ].map(({ icon: Icon, label }) => (
          <Stack
            key={label}
            direction="row"
            spacing={0.75}
            alignItems="center"
            justifyContent="center"
            sx={{
              flex: 1,
              py: 1,
              borderRadius: 1,
              color: '#65676B',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Icon size={18} />
            {label}
          </Stack>
        ))}
      </Stack>
    </Box>
  )
}

function InstagramPreviewFrame({
  account,
  caption,
  mediaUrls,
  activeIndex,
  onIndexChange,
}: {
  account?: ConnectedAccount
  caption: string
  mediaUrls: string[]
  activeIndex: number
  onIndexChange: (index: number) => void
}) {
  const rawName = account?.accountName ?? 'yourbrand'
  const username = rawName.startsWith('@')
    ? rawName.slice(1)
    : (account?.handle?.replace(/^@/, '') ?? rawName)

  return (
    <Box
      sx={{
        border: '1px solid #DBDBDB',
        borderRadius: 1.5,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        color: '#262626',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        maxWidth: 420,
        mx: 'auto',
      }}
    >
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        sx={{ px: 1.25, py: 1 }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: '#E1306C',
            fontSize: 12,
            fontWeight: 700,
            background:
              'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
          }}
        >
          {initialsFromName(username)}
        </Avatar>
        <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>
          {username}
        </Typography>
      </Stack>

      <MediaCarousel
        mediaUrls={mediaUrls}
        activeIndex={activeIndex}
        onIndexChange={onIndexChange}
        aspectRatio="1 / 1"
      />

      <Stack spacing={1} sx={{ px: 1.25, py: 1.25 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <LuHeart size={24} />
            <LuMessageCircle size={24} />
            <LuSend size={22} />
          </Stack>
          <LuBookmark size={24} />
        </Stack>

        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>0 likes</Typography>

        <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
          <Box component="span" sx={{ fontWeight: 600, mr: 0.75 }}>
            {username}
          </Box>
          {caption || 'Your caption will appear here.'}
        </Typography>

        <Typography
          sx={{
            fontSize: 10,
            letterSpacing: 0.2,
            color: '#8E8E8E',
            textTransform: 'uppercase',
          }}
        >
          Just now
        </Typography>
      </Stack>
    </Box>
  )
}

export function PostPreview({ draft, accounts }: PostPreviewProps) {
  const { caption, mediaUrls, selectedAccountIds } = draft
  const selectedAccounts = useMemo(
    () =>
      accounts.filter((account) => selectedAccountIds.includes(account.id)),
    [accounts, selectedAccountIds],
  )

  const previewPlatforms = useMemo(() => {
    const selected = [
      ...new Set(selectedAccounts.map((account) => account.platform)),
    ].filter(
      (platform) =>
        platform === SocialPlatformEnum.Facebook ||
        platform === SocialPlatformEnum.Instagram,
    )

    return selected.length > 0
      ? selected
      : ([
          SocialPlatformEnum.Facebook,
          SocialPlatformEnum.Instagram,
        ] as SocialPlatform[])
  }, [selectedAccounts])

  const defaultPlatform = previewPlatforms[0] ?? SocialPlatformEnum.Facebook
  const [activePlatform, setActivePlatform] =
    useState<SocialPlatform>(defaultPlatform)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  useEffect(() => {
    if (!previewPlatforms.includes(activePlatform)) {
      setActivePlatform(defaultPlatform)
    }
  }, [activePlatform, defaultPlatform, previewPlatforms])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [mediaUrls.length])

  const activeAccount =
    selectedAccounts.find((account) => account.platform === activePlatform) ??
    accounts.find((account) => account.platform === activePlatform)

  return (
    <Card
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}
    >
      <CardContent sx={{ p: 3, height: '100%' }}>
        <Stack spacing={2} sx={{ height: '100%' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Preview
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Approximate Facebook / Instagram layout. Engagement counts stay at
              0 until the post is live.
            </Typography>
          </Box>

          <Tabs
            value={activePlatform}
            onChange={(_, value: SocialPlatform) => setActivePlatform(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {previewPlatforms.map((platform) => {
              const Icon = getPlatformIcon(platform)
              return (
                <Tab
                  key={platform}
                  value={platform}
                  label={getPlatformLabel(platform)}
                  icon={<Icon size={14} color={getPlatformColor(platform)} />}
                  iconPosition="start"
                />
              )
            })}
          </Tabs>

          {activePlatform === SocialPlatformEnum.Instagram ? (
            <InstagramPreviewFrame
              account={activeAccount}
              caption={caption}
              mediaUrls={mediaUrls}
              activeIndex={activeImageIndex}
              onIndexChange={setActiveImageIndex}
            />
          ) : (
            <FacebookPreviewFrame
              account={activeAccount}
              caption={caption}
              mediaUrls={mediaUrls}
              activeIndex={activeImageIndex}
              onIndexChange={setActiveImageIndex}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}
