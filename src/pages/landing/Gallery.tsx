import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { SectionHeading } from "./SectionHeading"

export interface GalleryImage {
  src: string
  alt: string
}

export function Gallery({ images }: { images: GalleryImage[] }) {
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    if (active === null) return
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setActive(null)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [active])

  return (
    <section id="galeria" className="border-border/70 border-t py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Galeria"
          title="A cidade em imagens."
          description="Um pouco do que acontece todos os dias na NorteSp Roleplay."
        />

        <div className="mt-12 sm:mt-16 grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.src + index}
              onClick={() => setActive(index)}
              className={`border-border group bg-secondary relative overflow-hidden rounded-2xl border ${index === 0 ? "md:col-span-2 md:row-span-2" : ""} aspect-[4/3]`}
            >
              <img
                src={image.src}
                alt={image.alt}
                loading="lazy"
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {active !== null && images[active] && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] grid place-items-center bg-black/90 p-4 backdrop-blur-sm sm:p-6"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="border-border bg-secondary absolute top-[max(1rem,env(safe-area-inset-top))] right-4 grid size-11 sm:top-6 sm:right-6 place-items-center rounded-full border"
          >
            <X className="size-5" />
          </button>
          <img
            src={images[active].src}
            alt={images[active].alt}
            onClick={event => event.stopPropagation()}
            className="max-h-[85dvh] max-w-full rounded-2xl object-contain sm:max-w-4xl"
          />
        </div>
      )}
    </section>
  )
}
