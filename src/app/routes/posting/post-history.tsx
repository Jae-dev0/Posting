import { useMemo, useState } from 'react'

import {
  EntityListPage,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
import {
  FacebookEngagementDialog,
  InstagramEngagementDialog,
  PostHistoryTable,
  useFacebookPosts,
  useInstagramPosts,
  type PublishedPost,
  type SocialPlatform,
} from '@/features/posting'
import { paginate } from '@/utils'

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

    const toBrowserMediaUrl = (url: string | null) => {
      if (!url) return null
      try {
        const parsed = new URL(url)
        // Old publishes stored API-port URLs; serve via same-origin nginx proxy.
        if (
          (parsed.hostname === 'localhost' ||
            parsed.hostname === '127.0.0.1') &&
          parsed.pathname.startsWith('/api/media/')
        ) {
          return parsed.pathname
        }
      } catch {
        // keep original
      }
      return url
    }

    for (const post of [
      ...(facebookQuery.data ?? []),
      ...(instagramQuery.data ?? []),
    ]) {
      const existing = byId.get(post.id)
      if (!existing) {
        byId.set(post.id, {
          id: post.id,
          caption: post.caption,
          mediaUrl: toBrowserMediaUrl(post.mediaUrl),
          platforms: [...post.platforms],
          publishedAt: post.publishedAt,
          createdAt: post.createdAt,
          status: post.status,
        })
        continue
      }
      byId.set(post.id, {
        ...existing,
        mediaUrl: existing.mediaUrl ?? toBrowserMediaUrl(post.mediaUrl),
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
  }, [
    facebookEngagementIds,
    facebookQuery.data,
    instagramEngagementIds,
    instagramQuery.data,
  ])

  const facebookError =
    facebookQuery.error instanceof Error
      ? facebookQuery.error.message
      : undefined
  const instagramError =
    instagramQuery.error instanceof Error
      ? instagramQuery.error.message
      : undefined
  const historyError = facebookError ?? instagramError

  const status =
    facebookQuery.status === 'pending' || instagramQuery.status === 'pending'
      ? 'pending'
      : facebookQuery.status === 'error' && instagramQuery.status === 'error'
        ? 'error'
        : 'success'

  const [pagination, setPagination] = useState({ page: 1, perPage: 10 })
  const { data, total, currentPage } = paginate(
    publishedPosts,
    pagination.page,
    pagination.perPage,
  )

  const handleCloseFacebookEngagement = () => setFacebookEngagementPostId(null)
  const handleCloseInstagramEngagement = () =>
    setInstagramEngagementPostId(null)

  return (
    <EntityListPage
      layoutTitle="Post History"
      toolbarTitle="Post History"
      toolbarDescription={
        <ListPageShowingCount count={status === 'success' ? total : 0}>
          published posts with live engagement.
        </ListPageShowingCount>
      }
      pagedTable={
        <PagedTableCard
          count={status === 'success' ? total : 0}
          page={currentPage - 1}
          rowsPerPage={pagination.perPage}
          onPageChange={(_, page) =>
            setPagination((prev) => ({ ...prev, page: page + 1 }))
          }
          onRowsPerPageChange={(event) => {
            setPagination({
              page: 1,
              perPage: parseInt(event.target.value, 10),
            })
          }}
        >
          <PostHistoryTable
            data={status === 'success' ? data : []}
            status={status}
            errorMessage={historyError}
            onViewFacebookEngagement={setFacebookEngagementPostId}
            onViewInstagramEngagement={setInstagramEngagementPostId}
          />
        </PagedTableCard>
      }
      footer={
        <>
          <FacebookEngagementDialog
            open={facebookEngagementPostId !== null}
            postId={facebookEngagementPostId}
            onClose={handleCloseFacebookEngagement}
          />
          <InstagramEngagementDialog
            open={instagramEngagementPostId !== null}
            postId={instagramEngagementPostId}
            onClose={handleCloseInstagramEngagement}
          />
        </>
      }
    />
  )
}
