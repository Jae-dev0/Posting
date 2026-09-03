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
import {
  ConnectedAccountsList,
  FacebookPagesPanel,
  InstagramAccountsPanel,
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

export function ConnectedAccountsPage() {
  const { showSuccess, showError } = useSnackbar()
  const confirm = useConfirm()
  const [searchParams, setSearchParams] = useSearchParams()
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
