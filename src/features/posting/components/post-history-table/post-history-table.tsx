import {
  Alert,
  Box,
  Button,
  Chip,
<<<<<<< HEAD
  Skeleton,
=======
  CircularProgress,
>>>>>>> origin/main
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import { LuChartNoAxesColumn } from 'react-icons/lu'

<<<<<<< HEAD
import { EmptyState } from '@/components/layout'
=======
>>>>>>> origin/main
import type { Status } from '@/types/common'

import type { PublishedPost } from '../../types'
import { getPlatformIcon, getPlatformLabel } from '../platform-utils'

export type PostHistoryTableProps = {
  data: PublishedPost[]
  status: Status
<<<<<<< HEAD
  errorMessage?: string
=======
>>>>>>> origin/main
  onViewFacebookEngagement?: (postId: number) => void
  onViewInstagramEngagement?: (postId: number) => void
}

export function PostHistoryTable({
  data,
  status,
<<<<<<< HEAD
  errorMessage,
  onViewFacebookEngagement,
  onViewInstagramEngagement,
}: PostHistoryTableProps) {
  const renderContent = () => {
    if (status === 'pending') {
      return (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={36} />
          ))}
        </Stack>
      )
    }

    if (status === 'error') {
      return (
        <Alert severity="error">
          {errorMessage ?? 'Unable to load post history. Please try again.'}
        </Alert>
      )
    }

    if (data.length === 0) {
      return (
        <EmptyState
          title="No posts published yet"
          description="Create your first post to start building history."
        />
      )
    }

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Post</TableCell>
              <TableCell>Platforms</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Reactions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((post) => {
              const {
                id,
                caption,
                mediaUrl,
                platforms,
                publishedAt,
                status: postStatus,
                canFetchFacebookEngagement = false,
                canFetchInstagramEngagement = false,
              } = post

              const canOpenFacebook =
                canFetchFacebookEngagement && Boolean(onViewFacebookEngagement)
              const canOpenInstagram =
                canFetchInstagramEngagement &&
                Boolean(onViewInstagramEngagement)
              const isClickable = canOpenFacebook || canOpenInstagram

              const openPrimaryEngagement = () => {
                if (canOpenFacebook && !canOpenInstagram) {
                  onViewFacebookEngagement?.(id)
                  return
                }
                if (canOpenInstagram && !canOpenFacebook) {
                  onViewInstagramEngagement?.(id)
                }
              }

              return (
                <TableRow
                  key={id}
                  hover={isClickable}
                  onClick={
                    canOpenFacebook !== canOpenInstagram
                      ? openPrimaryEngagement
                      : undefined
                  }
                  sx={{
                    cursor:
                      canOpenFacebook !== canOpenInstagram
                        ? 'pointer'
                        : 'default',
                  }}
                >
                  <TableCell sx={{ maxWidth: 360 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      {mediaUrl ? (
                        <Box
                          component="img"
                          src={mediaUrl}
                          alt=""
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            objectFit: 'cover',
                            border: '1px solid',
                            borderColor: 'divider',
                            flexShrink: 0,
                            bgcolor: 'action.hover',
                          }}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 1,
                            border: '1px dashed',
                            borderColor: 'divider',
                            flexShrink: 0,
                            bgcolor: 'action.hover',
                          }}
                        />
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {caption}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {platforms.map((platform) => {
                        const Icon = getPlatformIcon(platform)
                        return (
                          <Chip
                            key={platform}
                            size="small"
                            icon={<Icon size={12} />}
                            label={getPlatformLabel(platform)}
                            variant="outlined"
                          />
                        )
                      })}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dayjs(publishedAt).format('MMM D, YYYY h:mm A')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={
                        postStatus === 'published' ? 'Published' : 'Failed'
                      }
                      color={postStatus === 'published' ? 'success' : 'error'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {isClickable ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {canOpenFacebook ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LuChartNoAxesColumn size={14} />}
                            onClick={() => onViewFacebookEngagement?.(id)}
                          >
                            Facebook
                          </Button>
                        ) : null}
                        {canOpenInstagram ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<LuChartNoAxesColumn size={14} />}
                            onClick={() => onViewInstagramEngagement?.(id)}
                          >
                            Instagram
                          </Button>
                        ) : null}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    )
  }

  return renderContent()
=======
  onViewFacebookEngagement,
  onViewInstagramEngagement,
}: PostHistoryTableProps) {
  if (status === 'pending') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Alert severity="error">
        Unable to load post history. Please try again.
      </Alert>
    )
  }

  if (data.length === 0) {
    return (
      <Alert severity="info">
        No posts published yet. Create your first post to get started.
      </Alert>
    )
  }

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Post</TableCell>
            <TableCell>Platforms</TableCell>
            <TableCell>Published</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Reactions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((post) => {
            const {
              id,
              caption,
              mediaUrl,
              platforms,
              publishedAt,
              status: postStatus,
              canFetchFacebookEngagement = false,
              canFetchInstagramEngagement = false,
            } = post

            const canOpenFacebook =
              canFetchFacebookEngagement && Boolean(onViewFacebookEngagement)
            const canOpenInstagram =
              canFetchInstagramEngagement && Boolean(onViewInstagramEngagement)
            const isClickable = canOpenFacebook || canOpenInstagram

            const openPrimaryEngagement = () => {
              if (canOpenFacebook && !canOpenInstagram) {
                onViewFacebookEngagement?.(id)
                return
              }
              if (canOpenInstagram && !canOpenFacebook) {
                onViewInstagramEngagement?.(id)
              }
            }

            return (
              <TableRow
                key={id}
                hover={isClickable}
                onClick={
                  canOpenFacebook !== canOpenInstagram
                    ? openPrimaryEngagement
                    : undefined
                }
                sx={{
                  cursor:
                    canOpenFacebook !== canOpenInstagram
                      ? 'pointer'
                      : 'default',
                }}
              >
                <TableCell sx={{ maxWidth: 360 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    {mediaUrl ? (
                      <Box
                        component="img"
                        src={mediaUrl}
                        alt=""
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 1,
                          objectFit: 'cover',
                          border: '1px solid',
                          borderColor: 'divider',
                          flexShrink: 0,
                          bgcolor: 'action.hover',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 1,
                          border: '1px dashed',
                          borderColor: 'divider',
                          flexShrink: 0,
                          bgcolor: 'action.hover',
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {caption}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={0.5}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    {platforms.map((platform) => {
                      const Icon = getPlatformIcon(platform)
                      return (
                        <Chip
                          key={platform}
                          size="small"
                          icon={<Icon size={12} />}
                          label={getPlatformLabel(platform)}
                          variant="outlined"
                        />
                      )
                    })}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {dayjs(publishedAt).format('MMM D, YYYY h:mm A')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={postStatus === 'published' ? 'Published' : 'Failed'}
                    color={postStatus === 'published' ? 'success' : 'error'}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right" onClick={(event) => event.stopPropagation()}>
                  {isClickable ? (
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {canOpenFacebook ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LuChartNoAxesColumn size={14} />}
                          onClick={() => onViewFacebookEngagement?.(id)}
                        >
                          Facebook
                        </Button>
                      ) : null}
                      {canOpenInstagram ? (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LuChartNoAxesColumn size={14} />}
                          onClick={() => onViewInstagramEngagement?.(id)}
                        >
                          Instagram
                        </Button>
                      ) : null}
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      —
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
>>>>>>> origin/main
}
