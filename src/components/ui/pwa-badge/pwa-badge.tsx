import { Button, Card, Stack, Typography } from '@mui/material'
import { MdNotificationsActive } from 'react-icons/md'
import { useRegisterSW } from 'virtual:pwa-register/react'

function PWABadge() {
  // periodic sync is disabled, change the value to enable it, the period is in milliseconds
  // You can remove onRegisteredSW callback and registerPeriodicSync function
  const period = 0

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e) => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r)
        })
      }
    },
  })

  function close() {
    setNeedRefresh(false)
  }

  return (
    <>
      {needRefresh && (
        <Card
          sx={{
            m: 2,
            p: 2,
            right: 0,
            bottom: 0,
            position: 'absolute',
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <MdNotificationsActive style={{ transform: 'rotate(330deg)' }} />
              <Typography variant="body2">
                New content available, click on reload button to update.
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                onClick={() => updateServiceWorker(true)}
                color="secondary"
              >
                Reload
              </Button>
              <Button
                variant="outlined"
                onClick={() => close()}
                sx={{ color: 'text.primary', borderColor: 'border.default' }}
              >
                Close
              </Button>
            </Stack>
          </Stack>
        </Card>
      )}
    </>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) await r.update()
  }, period)
}
