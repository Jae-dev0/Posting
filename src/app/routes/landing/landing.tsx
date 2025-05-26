import { useState } from 'react'

import appLogo from '/favicon.svg'

import reactLogo from '@/assets/react.svg'
import PWABadge from '@/pwa-badge.tsx'
import './landing.css'

export function LandingRoute() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img
            src={appLogo}
            className="logo"
            alt="react-ts-vite-template logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>react-ts-vite-template</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/app/routes/landing/landing.tsx</code> and save to test
          HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <PWABadge />
    </>
  )
}
