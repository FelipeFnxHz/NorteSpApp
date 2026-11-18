import { openUrl } from "@tauri-apps/plugin-opener"

export const isTauri = () => "__TAURI_INTERNALS__" in window

/**
 * No app nativo, links externos (target="_blank" ou outra origem) abrem no navegador padrão.
 * Links com `data-in-app` (ex.: login OAuth) navegam dentro da própria janela.
 */
export function installExternalLinkHandler() {
  if (!isTauri()) return

  document.addEventListener("click", event => {
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>("a[href]")
    if (!anchor || event.defaultPrevented || anchor.hasAttribute("data-in-app")) return

    const url = new URL(anchor.href, window.location.href)
    const external = /^(https?:|mailto:|tel:)$/.test(url.protocol) && url.origin !== window.location.origin
    if (!external) return

    event.preventDefault()
    void openUrl(url.href)
  })
}
