import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker, TimePicker } from '@mui/x-date-pickers'
import dayjs, { Dayjs } from 'dayjs'
import { ChangeEvent, DragEvent, useRef } from 'react'
import {
  LuCalendar,
  LuClock,
  LuImage,
  LuPlus,
  LuSend,
  LuTrash2,
  LuX,
} from 'react-icons/lu'
import { Link as RouterLink } from 'react-router'

import { paths } from '@/config/paths'

import {
  CAPTION_MAX_LENGTH,
  MEDIA_ACCEPTED_TYPES,
  MEDIA_MAX_IMAGES,
  MEDIA_MAX_SIZE_MB,
} from '../../constants'
import type { ConnectedAccount, PostDraft } from '../../types'
import { PlatformAccountCard } from '../platform-account-card'

export type CreatePostFormProps = {
  draft: PostDraft
  accounts: ConnectedAccount[]
  isBusy?: boolean
  onCaptionChange: (caption: string) => void
  onAddMedia: (files: File[]) => void
  onRemoveMediaAt: (index: number) => void
  onClearMedia: () => void
  onToggleAccount: (accountId: number, enabled: boolean) => void
  onPublishModeChange: (mode: PostDraft['publishMode']) => void
  onScheduledAtChange: (value: Dayjs | null) => void
  onSaveDraft: () => void
  onPublish: () => void
}

export function CreatePostForm({
  draft,
  accounts,
  isBusy = false,
  onCaptionChange,
  onAddMedia,
  onRemoveMediaAt,
  onClearMedia,
  onToggleAccount,
  onPublishModeChange,
  onScheduledAtChange,
  onSaveDraft,
  onPublish,
}: CreatePostFormProps) {
  const { caption, mediaUrls, publishMode, scheduledAt, selectedAccountIds } =
    draft
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scheduledDate = scheduledAt
    ? dayjs(scheduledAt)
    : dayjs().hour(10).minute(0)
  const selectedCount = selectedAccountIds.length
  const canAddMore = mediaUrls.length < MEDIA_MAX_IMAGES

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    onAddMedia(files)
    event.target.value = ''
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files ?? [])
    onAddMedia(files)
  }

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                1. Media
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {mediaUrls.length} / {MEDIA_MAX_IMAGES} images
              </Typography>
            </Stack>

            {mediaUrls.length > 0 ? (
              <Stack spacing={1.5}>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      sm: 'repeat(3, minmax(0, 1fr))',
                    },
                  }}
                >
                  {mediaUrls.map((url, index) => (
                    <Box
                      key={`${url}-${index}`}
                      sx={{
                        position: 'relative',
                        borderRadius: 1,
                        overflow: 'hidden',
                        border: '1px solid',
                        borderColor: 'divider',
                        aspectRatio: '4 / 3',
                      }}
                    >
                      <Box
                        component="img"
                        src={url}
                        alt={`Upload ${index + 1}`}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <IconButton
                        size="small"
                        aria-label={`Remove image ${index + 1}`}
                        onClick={() => onRemoveMediaAt(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'rgba(0,0,0,0.55)',
                          color: 'common.white',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                        }}
                      >
                        <LuX size={14} />
                      </IconButton>
                    </Box>
                  ))}
                  {canAddMore ? (
                    <Box
                      onClick={() => fileInputRef.current?.click()}
                      sx={{
                        border: '2px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        aspectRatio: '4 / 3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        bgcolor: 'background.default',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Stack spacing={0.5} alignItems="center">
                        <LuPlus size={20} />
                        <Typography variant="caption">Add</Typography>
                      </Stack>
                    </Box>
                  ) : null}
                </Box>
                <Button
                  size="small"
                  color="error"
                  startIcon={<LuTrash2 size={14} />}
                  onClick={onClearMedia}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Remove all
                </Button>
              </Stack>
            ) : (
              <Box
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 1,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: 'background.default',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Stack spacing={1} alignItems="center">
                  <LuImage size={24} />
                  <Typography variant="body2" fontWeight={600}>
                    Drag & drop images here or browse (JPEG, PNG, GIF, WebP)
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Up to {MEDIA_MAX_IMAGES} images · {MEDIA_MAX_SIZE_MB} MB
                    each
                  </Typography>
                </Stack>
              </Box>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept={MEDIA_ACCEPTED_TYPES}
              multiple
              hidden
              onChange={handleFileSelect}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              2. Caption
            </Typography>
            <TextField
              multiline
              minRows={4}
              fullWidth
              value={caption}
              onChange={(event) =>
                onCaptionChange(event.target.value.slice(0, CAPTION_MAX_LENGTH))
              }
              placeholder="Write your caption..."
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}
            >
              {caption.length} / {CAPTION_MAX_LENGTH}
            </Typography>
          </Box>

          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                3. Publish to
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCount === 0
                  ? 'Select one or more accounts'
                  : `${selectedCount} selected`}
              </Typography>
            </Stack>
            {accounts.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No connected Facebook or Instagram accounts yet.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                }}
              >
                {accounts.map((account) => (
                  <PlatformAccountCard
                    key={account.id}
                    account={account}
                    enabled={selectedAccountIds.includes(account.id)}
                    onToggle={(enabled) => onToggleAccount(account.id, enabled)}
                  />
                ))}
              </Box>
            )}
            <Button
              variant="text"
              size="small"
              component={RouterLink}
              to={paths.posting.accounts.getHref()}
              sx={{ mt: 1 }}
            >
              + Connect another account
            </Button>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              4. Publishing
            </Typography>
            <RadioGroup
              row
              value={publishMode}
              onChange={(event) =>
                onPublishModeChange(
                  event.target.value as PostDraft['publishMode'],
                )
              }
            >
              <FormControlLabel
                value="now"
                control={<Radio />}
                label="Publish now"
              />
              <FormControlLabel
                value="schedule"
                control={<Radio />}
                label="Schedule"
              />
            </RadioGroup>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 1 }}
            >
              <DatePicker
                label="Date"
                value={scheduledDate}
                disabled={publishMode !== 'schedule'}
                onChange={(value) => {
                  if (!value) return
                  const next = scheduledDate
                    .year(value.year())
                    .month(value.month())
                    .date(value.date())
                  onScheduledAtChange(next)
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    InputProps: {
                      startAdornment: <LuCalendar style={{ marginRight: 8 }} />,
                    },
                  },
                }}
              />
              <TimePicker
                label="Time"
                value={scheduledDate}
                disabled={publishMode !== 'schedule'}
                onChange={(value) => {
                  if (!value) return
                  const next = scheduledDate
                    .hour(value.hour())
                    .minute(value.minute())
                  onScheduledAtChange(next)
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    InputProps: {
                      startAdornment: <LuClock style={{ marginRight: 8 }} />,
                    },
                  },
                }}
              />
            </Stack>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onSaveDraft}
              disabled={isBusy}
            >
              Save Draft
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<LuSend size={16} />}
              onClick={onPublish}
              disabled={isBusy || selectedCount === 0}
            >
              {isBusy
                ? publishMode === 'schedule'
                  ? 'Scheduling…'
                  : 'Publishing…'
                : selectedCount > 1
                  ? `Publish to ${selectedCount} accounts`
                  : 'Publish Everywhere'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}
