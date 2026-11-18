import { useLayoutEffect, type RefObject } from "react"

const STORAGE_KEY = "nsp:sidebar-scroll"

let memo: number | null = null

function read(): number | null {
  if (memo !== null) return memo
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    return stored === null ? null : Number(stored)
  } catch {
    return null
  }
}

function write(value: number) {
  memo = value
  try {
    sessionStorage.setItem(STORAGE_KEY, String(value))
  } catch {}
}

export function useRetainedScroll(ref: RefObject<HTMLElement | null>, deps: unknown[]) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const saved = read()
    if (saved !== null) el.scrollTop = saved

    const active = el.querySelector<HTMLElement>('[aria-current="page"]')
    if (active) {
      const box = el.getBoundingClientRect()
      const item = active.getBoundingClientRect()
      if (item.top < box.top || item.bottom > box.bottom) {
        el.scrollTop += item.top - box.top - (box.height - item.height) / 2
      }
    }

    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => write(el.scrollTop))
    }
    el.addEventListener("scroll", onScroll, { passive: true })
    write(el.scrollTop)

    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener("scroll", onScroll)
    }
  }, deps)
}
