export function MainErrorFallback() {
  return (
    <div>
      <h1>Error</h1>
      <p>An unexpected error has occurred.</p>
      <button onClick={() => window.location.assign(window.location.origin)}>
        Refresh
      </button>
    </div>
  )
}
