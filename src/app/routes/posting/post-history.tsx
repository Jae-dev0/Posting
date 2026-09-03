import { Card, CardContent, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

import { ContentLayout } from '@/components/layout'
import {
  FacebookEngagementDialog,
  InstagramEngagementDialog,
  PostHistoryTable,
  useFacebookPosts,
  useInstagramPosts,
  type PublishedPost,
  type SocialPlatform,
} from '@/features/posting'

export function PostHistoryPage() {
  const facebookQuery = useFacebookPosts()
  const instagramQuery = useInstagramPosts()
  const [facebookEngagementPostId, setFacebookEngagementPostId] = useState<
    number | null
  >(null)
  const [instagramEngagementPostId, setInstagramEngagementPostId] = useState<
    number | null
  >(null)

  const facebookEngagementIds = useMemo(() => {
    const ids = new Set<number>()
    for (const post of facebookQuery.data ?? []) {
      if (
        post.externalPostId &&
        post.status === 'published' &&
        post.platforms.includes('facebook')
      ) {
        ids.add(post.id)
      }
    }
    return ids
  }, [facebookQuery.data])

  const instagramEngagementIds = useMemo(() => {
    const ids = new Set<number>()
    for (const post of instagramQuery.data ?? []) {
      if (post.externalPostId && post.status === 'published') {
        ids.add(post.id)
      }
    }
    return ids
  }, [instagramQuery.data])

  const publishedPosts = useMemo((): PublishedPost[] => {
    const byId = new Map<
      number,
      {
        id: number
        caption: string
        mediaUrl: string | null
        platforms: string[]
        publishedAt: string | null
        createdAt: string
        status: string
      }
    >()

    for (const post of [
      ...(facebookQuery.data ?? []),
      ...(instagramQuery.data ?? []),
    ]) {
      const existing = byId.get(post.id)
      if (!existing) {
        byId.set(post.id, {
          id: post.id,
          caption: post.caption,
          mediaUrl: post.mediaUrl,
          platforms: [...post.platforms],
          publishedAt: post.publishedAt,
          createdAt: post.createdAt,
          status: post.status,
        })
        continue
      }
      byId.set(post.id, {
        ...existing,
        platforms: [...new Set([...existing.platforms, ...post.platforms])],
      })
    }

    return [...byId.values()]
      .filter((post) => post.status === 'published' || post.status === 'failed')
      .sort((a, b) =>
        (b.publishedAt ?? b.createdAt).localeCompare(
          a.publishedAt ?? a.createdAt,
        ),
      )
      .map((post) => ({
        id: post.id,
        caption: post.caption,
        mediaUrl: post.mediaUrl,
        platforms: post.platforms.filter(
          (platform): platform is SocialPlatform =>
            platform === 'facebook' ||
            platform === 'instagram' ||
            platform === 'tiktok',
        ),
        publishedAt: post.publishedAt ?? post.createdAt,
        status: post.status === 'failed' ? 'failed' : 'published',
        canFetchFacebookEngagement: facebookEngagementIds.has(post.id),
        canFetchInstagramEngagement: instagramEngagementIds.has(post.id),
      }))
  }, [facebookEngagementIds, facebookQuery.data, instagramEngagementIds, instagramQuery.data])

  const status =
    facebookQuery.status === 'pending' || instagramQuery.status === 'pending'
      ? 'pending'
      : facebookQuery.status === 'error' && instagramQuery.status === 'error'
        ? 'error'
        : 'success'

  return (
    <ContentLayout title="Post History">
      <Card
        elevation={0}
        sx={{ m: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Post History
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Browse what you published (thumbnail + caption). Open Reactions to
            load live Facebook reactions or Instagram likes from Meta.
          </Typography>

          <PostHistoryTable
            data={publishedPosts}
            status={status}
            onViewFacebookEngagement={setFacebookEngagementPostId}
            onViewInstagramEngagement={setInstagramEngagementPostId}
          />
        </CardContent>
      </Card>

      <FacebookEngagementDialog
        open={facebookEngagementPostId !== null}
        postId={facebookEngagementPostId}
        onClose={() => setFacebookEngagementPostId(null)}
      />
      <InstagramEngagementDialog
        open={instagramEngagementPostId !== null}
        postId={instagramEngagementPostId}
        onClose={() => setInstagramEngagementPostId(null)}
      />
    </ContentLayout>
  )
}
