import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/api/client"
import { prepareImage } from "@/lib/image"
import { cn } from "@/lib/utils"
import { storeService } from "@/services/store.service"
import { ProductImage } from "./ProductCard"

export function ImageUploader({ value, onChange }: { value: string; onChange: (path: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handle(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try {
      const blob = await prepareImage(file)
      const { path } = await storeService.uploadImage(blob)
      onChange(path)
    } catch (err) {
      setError(err instanceof ApiError || err instanceof Error ? err.message : "Falha ao enviar a imagem.")
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold">Imagem do produto</p>

      <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={event => handle(event.target.files?.[0])} aria-label="Selecionar imagem" />

      {value ? (
        <div className="border-border flex flex-col gap-3 rounded-xl border bg-white/[0.02] p-3 sm:flex-row sm:items-center">
          <ProductImage src={value} alt="Pré-visualização" className="aspect-[16/10] w-full shrink-0 rounded-lg sm:w-44" />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? <Loader2 className="animate-spin" /> : <ImagePlus />} {busy ? "Enviando..." : "Trocar imagem"}
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => onChange("")}>
              <Trash2 className="text-destructive" /> Remover
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          onDragOver={event => {
            event.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={event => {
            event.preventDefault()
            setDragging(false)
            handle(event.dataTransfer.files?.[0])
          }}
          className={cn(
            "flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-7 text-center transition-colors outline-none focus-visible:ring-primary/20 focus-visible:ring-4",
            dragging ? "border-primary/60 bg-primary/[0.07]" : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]",
          )}
        >
          {busy ? <Loader2 className="text-primary size-6 animate-spin" /> : <UploadCloud className="text-muted-foreground size-6" />}
          <span className="text-sm font-medium">{busy ? "Enviando imagem..." : "Clique para escolher ou arraste uma imagem"}</span>
          <span className="text-muted-foreground text-xs">PNG, JPG, WebP ou GIF · até 2 MB (otimizada automaticamente)</span>
        </button>
      )}

      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
    </div>
  )
}
