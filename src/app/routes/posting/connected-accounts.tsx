<<<<<<< HEAD
import { Divider, Stack, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'

import {
  EntityListPage,
  ListPageShowingCount,
  PagedTableCard,
} from '@/components/layout'
=======
import {
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { isAxiosError } from 'axios'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router'

import { ContentLayout } from '@/components/layout'
>>>>>>> origin/main
import {
  ConnectedAccountsList,
  FacebookPagesPanel,
  InstagramAccountsPanel,
<<<<<<< HEAD
  TikTokAccountsPanel,
  accountKeys,
  facebookKeys,
  instagramKeys,
  tiktokKeys,
  useConnectFacebook,
  useConnectInstagram,
  useConnectTikTok,
  useConnectedAccounts,
  useDisconnectFacebookPage,
  useDisconnectInstagramAccount,
  useDisconnectTikTokAccount,
  useFacebookPages,
  useInstagramAccounts,
  useTikTokAccounts,
  type FacebookPage,
  type InstagramAccount,
  type TikTokAccount,
} from '@/features/posting'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'
import { getErrorMessage } from '@/utils'

function clearOAuthParams(params: URLSearchParams) {
  const next = new URLSearchParams(params)
  next.delete('facebook')
  next.delete('instagram')
  next.delete('tiktok')
  next.delete('pages')
  next.delete('accounts')
  next.delete('reason')
  return next
=======
  useConnectFacebook,
  useConnectInstagram,
  useConnectedAccounts,
  useDisconnectFacebookPage,
  useDisconnectInstagramAccount,
  useFacebookPages,
  useInstagramAccounts,
  type FacebookPage,
  type InstagramAccount,
} from '@/features/posting'
import { useConfirm } from '@/lib/mui/confirm-hooks'
import { useSnackbar } from '@/lib/mui/snackbar-hooks'

function getErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
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
  if (error instanceof Error) return error.message
  return fallback
>>>>>>> origin/main
}

export function ConnectedAccountsPage() {
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
<<<<<<< HEAD
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const handledOAuthKey = useRef<string | null>(null)

  const accountsQuery = useConnectedAccounts()
  const facebookPagesQuery = useFacebookPages()
  const instagramAccountsQuery = useInstagramAccounts()
  const tiktokAccountsQuery = useTikTokAccounts()
=======
  const [searchParams, setSearchParams] = useSearchParams()
  const accountsQuery = useConnectedAccounts()
  const facebookPagesQuery = useFacebookPages()
  const instagramAccountsQuery = useInstagramAccounts()
>>>>>>> origin/main

  const { mutate: connectFacebook, isPending: isConnectingFacebook } =
    useConnectFacebook({
      onSuccess: ({ authUrl }) => {
        window.location.assign(authUrl)
      },
      onError: (error) => {
        showError(getErrorMessage(error, 'Could not start Facebook Login.'))
      },
    })

  const { mutate: connectInstagram, isPending: isConnectingInstagram } =
    useConnectInstagram({
      onSuccess: ({ authUrl }) => {
        window.location.assign(authUrl)
      },
      onError: (error) => {
        showError(getErrorMessage(error, 'Could not start Instagram Login.'))
      },
    })

<<<<<<< HEAD
  const { mutate: connectTikTok, isPending: isConnectingTikTok } =
    useConnectTikTok({
      onSuccess: ({ authUrl }) => window.location.assign(authUrl),
      onError: (error) => {
        showError(getErrorMessage(error, 'Could not start TikTok Login.'))
      },
    })

=======
>>>>>>> origin/main
  const { mutate: disconnectPage } = useDisconnectFacebookPage({
    onSuccess: () => {
      showSuccess('Facebook Page disconnected.')
    },
    onError: (error) => {
      showError(getErrorMessage(error, 'Could not disconnect Facebook Page.'))
    },
  })

  const { mutate: disconnectInstagram } = useDisconnectInstagramAccount({
    onSuccess: () => {
      showSuccess('Instagram account disconnected.')
    },
    onError: (error) => {
      showError(
        getErrorMessage(error, 'Could not disconnect Instagram account.'),
      )
    },
  })

<<<<<<< HEAD
  const { mutate: disconnectTikTok } = useDisconnectTikTokAccount({
    onSuccess: () => showSuccess('TikTok account disconnected.'),
    onError: (error) => {
      showError(getErrorMessage(error, 'Could not disconnect TikTok account.'))
    },
  })

  const facebookStatus = searchParams.get('facebook')
  const instagramStatus = searchParams.get('instagram')
  const tiktokStatus = searchParams.get('tiktok')
  const pageCount = searchParams.get('pages') ?? '0'
  const accountCount = searchParams.get('accounts') ?? '0'
  const failureReason = searchParams.get('reason') ?? 'unknown'

  useEffect(() => {
    if (!facebookStatus && !instagramStatus && !tiktokStatus) return

    const oauthKey = `${facebookStatus ?? ''}|${instagramStatus ?? ''}|${tiktokStatus ?? ''}|${pageCount}|${accountCount}|${failureReason}`
    if (handledOAuthKey.current === oauthKey) return
    handledOAuthKey.current = oauthKey

    // Clear OAuth query params immediately so this effect cannot re-fire in a loop.
    setSearchParams((current) => clearOAuthParams(current), { replace: true })

    if (facebookStatus === 'connected') {
      showSuccess(`Facebook connected. ${pageCount} Page(s) saved.`)
      void queryClient.invalidateQueries({ queryKey: facebookKeys.pages() })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    } else if (facebookStatus === 'error') {
      showError(`Facebook connection failed (${failureReason}).`)
    }

    if (instagramStatus === 'connected') {
      showSuccess(`Instagram connected. ${accountCount} account(s) saved.`)
      void queryClient.invalidateQueries({ queryKey: instagramKeys.accounts() })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    } else if (instagramStatus === 'error') {
      showError(`Instagram connection failed (${failureReason}).`)
    }

    if (tiktokStatus === 'connected') {
      showSuccess('TikTok account connected.')
      void queryClient.invalidateQueries({ queryKey: tiktokKeys.accounts() })
      void queryClient.invalidateQueries({ queryKey: accountKeys.all })
    } else if (tiktokStatus === 'error') {
      showError(`TikTok connection failed (${failureReason}).`)
    }
  }, [
    accountCount,
    facebookStatus,
    failureReason,
    instagramStatus,
    pageCount,
    queryClient,
    setSearchParams,
    showError,
    showSuccess,
    tiktokStatus,
  ])

  // Meta appends `#_=_` after OAuth; strip it so the hash does not linger.
  useEffect(() => {
    if (window.location.hash === '#_=_') {
      const { pathname, search } = window.location
      window.history.replaceState(null, '', `${pathname}${search}`)
    }
  }, [])

=======
  useEffect(() => {
    const facebook = searchParams.get('facebook')
    const instagram = searchParams.get('instagram')
    if (!facebook && !instagram) return

    if (facebook === 'connected') {
      const pageCount = searchParams.get('pages') ?? '0'
      showSuccess(`Facebook connected. ${pageCount} Page(s) saved.`)
      void facebookPagesQuery.refetch()
      void accountsQuery.refetch()
    } else if (facebook === 'error') {
      const reason = searchParams.get('reason') ?? 'unknown'
      showError(`Facebook connection failed (${reason}).`)
    }

    if (instagram === 'connected') {
      const accountCount = searchParams.get('accounts') ?? '0'
      showSuccess(`Instagram connected. ${accountCount} account(s) saved.`)
      void instagramAccountsQuery.refetch()
      void accountsQuery.refetch()
    } else if (instagram === 'error') {
      const reason = searchParams.get('reason') ?? 'unknown'
      showError(`Instagram connection failed (${reason}).`)
    }

    const next = new URLSearchParams(searchParams)
    next.delete('facebook')
    next.delete('instagram')
    next.delete('pages')
    next.delete('accounts')
    next.delete('reason')
    setSearchParams(next, { replace: true })
  }, [
    accountsQuery,
    facebookPagesQuery,
    instagramAccountsQuery,
    searchParams,
    setSearchParams,
    showError,
    showSuccess,
  ])

>>>>>>> origin/main
  const handleDisconnectFacebook = async (page: FacebookPage) => {
    try {
      await confirm({
        title: 'Disconnect Facebook Page?',
        description: `Remove ${page.pageName} from this company? Publishing to this Page will stop until you reconnect.`,
        confirmationText: 'Disconnect',
        cancellationText: 'Cancel',
      })
      disconnectPage(page.id)
    } catch {
      // cancelled
    }
  }

  const handleDisconnectInstagram = async (account: InstagramAccount) => {
    try {
      await confirm({
        title: 'Disconnect Instagram?',
        description: `Remove ${account.pageName} from this company? Publishing to this account will stop until you reconnect.`,
        confirmationText: 'Disconnect',
        cancellationText: 'Cancel',
      })
      disconnectInstagram(account.id)
    } catch {
      // cancelled
    }
  }

<<<<<<< HEAD
  const handleDisconnectTikTok = async (account: TikTokAccount) => {
    try {
      await confirm({
        title: 'Disconnect TikTok?',
        description: `Remove ${account.displayName} from this company? TikTok publishing will stop until you reconnect.`,
        confirmationText: 'Disconnect',
        cancellationText: 'Cancel',
      })
      disconnectTikTok(account.id)
    } catch {
      // cancelled
    }
  }

  const otherAccounts = (accountsQuery.data ?? []).filter(
    (account) =>
      account.platform !== 'facebook' &&
      account.platform !== 'instagram' &&
      account.platform !== 'tiktok',
  )
  const facebookError =
    facebookPagesQuery.error instanceof Error
      ? facebookPagesQuery.error.message
      : undefined
  const instagramError =
    instagramAccountsQuery.error instanceof Error
      ? instagramAccountsQuery.error.message
      : undefined
  const otherAccountsError =
    accountsQuery.error instanceof Error
      ? accountsQuery.error.message
      : undefined
  const tiktokError =
    tiktokAccountsQuery.error instanceof Error
      ? tiktokAccountsQuery.error.message
      : undefined
  const connectedCount =
    (facebookPagesQuery.data ?? []).length +
    (instagramAccountsQuery.data ?? []).length +
    (tiktokAccountsQuery.data ?? []).length +
    otherAccounts.length

  const renderContent = () => (
    <Stack spacing={2}>
      <FacebookPagesPanel
        pages={facebookPagesQuery.data ?? []}
        status={facebookPagesQuery.status}
        errorMessage={facebookError}
        isConnecting={isConnectingFacebook}
        onConnect={() => connectFacebook()}
        onDisconnect={(page) => {
          void handleDisconnectFacebook(page)
        }}
      />

      <Divider sx={{ my: 3 }} />

      <TikTokAccountsPanel
        accounts={tiktokAccountsQuery.data ?? []}
        status={tiktokAccountsQuery.status}
        errorMessage={tiktokError}
        isConnecting={isConnectingTikTok}
        onConnect={() => connectTikTok()}
        onDisconnect={(account) => {
          void handleDisconnectTikTok(account)
        }}
      />

      <Divider sx={{ my: 3 }} />

      <InstagramAccountsPanel
        accounts={instagramAccountsQuery.data ?? []}
        status={instagramAccountsQuery.status}
        errorMessage={instagramError}
        isConnecting={isConnectingInstagram}
        onConnect={() => connectInstagram()}
        onDisconnect={(account) => {
          void handleDisconnectInstagram(account)
        }}
      />

      <Divider sx={{ my: 3 }} />

      <Stack spacing={1} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Other platforms
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Accounts from additional platforms appear here.
        </Typography>
      </Stack>

      <ConnectedAccountsList
        data={otherAccounts}
        status={accountsQuery.status}
        errorMessage={otherAccountsError}
      />
    </Stack>
  )

  return (
    <EntityListPage
      layoutTitle="Connected Accounts"
      toolbarTitle="Connected Accounts"
      toolbarDescription={
        <ListPageShowingCount count={connectedCount}>
          connected accounts.
        </ListPageShowingCount>
      }
      pagedTable={
        <PagedTableCard
          count={connectedCount}
          page={0}
          rowsPerPage={connectedCount || 10}
          onPageChange={() => undefined}
          onRowsPerPageChange={() => undefined}
        >
          {renderContent()}
        </PagedTableCard>
      }
    />
=======
  const otherAccounts = (accountsQuery.data ?? []).filter(
    (account) =>
      account.platform !== 'facebook' && account.platform !== 'instagram',
  )

  return (
    <ContentLayout title="Connected Accounts">
      <Card
        elevation={0}
        sx={{ m: 3, border: '1px solid', borderColor: 'divider' }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Connected Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect Facebook Pages and Instagram Business accounts via Meta
            Login. Tokens are encrypted and scoped to your company.
          </Typography>

          <FacebookPagesPanel
            pages={facebookPagesQuery.data ?? []}
            status={facebookPagesQuery.status}
            isConnecting={isConnectingFacebook}
            onConnect={() => connectFacebook()}
            onDisconnect={(page) => {
              void handleDisconnectFacebook(page)
            }}
          />

          <Divider sx={{ my: 3 }} />

          <InstagramAccountsPanel
            accounts={instagramAccountsQuery.data ?? []}
            status={instagramAccountsQuery.status}
            isConnecting={isConnectingInstagram}
            onConnect={() => connectInstagram()}
            onDisconnect={(account) => {
              void handleDisconnectInstagram(account)
            }}
          />

          <Divider sx={{ my: 3 }} />

          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Other platforms
            </Typography>
            <Typography variant="body2" color="text.secondary">
              TikTok remains available as a CMS placeholder until its
              integration is added.
            </Typography>
          </Stack>

          {otherAccounts.length === 0 && accountsQuery.status === 'success' ? (
            <Alert severity="info">No other platform accounts yet.</Alert>
          ) : (
            <ConnectedAccountsList
              data={otherAccounts}
              status={accountsQuery.status}
            />
          )}
        </CardContent>
      </Card>
    </ContentLayout>
>>>>>>> origin/main
  )
}
