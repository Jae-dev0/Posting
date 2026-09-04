import {
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'

import { ContentLayout } from '@/components/layout'
import {
  ConnectedAccountsList,
  FacebookPagesPanel,
  InstagramAccountsPanel,
  accountKeys,
  facebookKeys,
  instagramKeys,
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
}

function clearOAuthParams(params: URLSearchParams) {
  const next = new URLSearchParams(params)
  next.delete('facebook')
  next.delete('instagram')
  next.delete('pages')
  next.delete('accounts')
  next.delete('reason')
  return next
}

export function ConnectedAccountsPage() {
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const handledOAuthKey = useRef<string | null>(null)

  const accountsQuery = useConnectedAccounts()
  const facebookPagesQuery = useFacebookPages()
  const instagramAccountsQuery = useInstagramAccounts()

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

  const facebookStatus = searchParams.get('facebook')
  const instagramStatus = searchParams.get('instagram')
  const pageCount = searchParams.get('pages') ?? '0'
  const accountCount = searchParams.get('accounts') ?? '0'
  const failureReason = searchParams.get('reason') ?? 'unknown'

  useEffect(() => {
    if (!facebookStatus && !instagramStatus) return

    const oauthKey = `${facebookStatus ?? ''}|${instagramStatus ?? ''}|${pageCount}|${accountCount}|${failureReason}`
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
  ])

  // Meta appends `#_=_` after OAuth; strip it so the hash does not linger.
  useEffect(() => {
    if (window.location.hash === '#_=_') {
      const { pathname, search } = window.location
      window.history.replaceState(null, '', `${pathname}${search}`)
    }
  }, [])

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
  )
}
