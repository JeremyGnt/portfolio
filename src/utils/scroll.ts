export function scrollWindowToTopInstantly() {
  const root = document.documentElement
  const body = document.body
  const previousRootScrollBehavior = root.style.scrollBehavior
  const previousBodyScrollBehavior = body.style.scrollBehavior

  root.style.scrollBehavior = 'auto'
  body.style.scrollBehavior = 'auto'
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

  requestAnimationFrame(() => {
    root.style.scrollBehavior = previousRootScrollBehavior
    body.style.scrollBehavior = previousBodyScrollBehavior
  })
}

export function waitForNextAnimationFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}
