import { useEffect, useState } from "react"
import { assetUrl } from "@/api/client"
import { galleryService } from "@/services/modules.service"
import type { GalleryImage } from "@/types/modules"

const API_BASE = import.meta.env.VITE_API_URL ?? ""

export function useGallery() {
  const [items, setItems] = useState<GalleryImage[] | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      galleryService.list().then(
        result => !cancelled && setItems(result.items.map(item => ({ ...item, src: assetUrl(item.src) }))),
        () => !cancelled && setItems(current => current ?? []),
      )

    void load()
    const stream = new EventSource(`${API_BASE}/api/gallery/stream`)
    stream.addEventListener("gallery-changed", () => void load())
    return () => {
      cancelled = true
      stream.close()
    }
  }, [])

  return items
}
