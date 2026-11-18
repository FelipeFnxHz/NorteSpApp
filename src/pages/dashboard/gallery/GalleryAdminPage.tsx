import { useRef, useState } from "react"
import { ImagePlus, ImageOff, Loader2, Trash2 } from "lucide-react"
import { ApiError, assetUrl } from "@/api/client"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { formatBytes, formatDateTime } from "@/lib/modules"
import { galleryService } from "@/services/modules.service"
import type { GalleryManageImage } from "@/types/modules"

export function GalleryAdminPage() {
  const { data, loading, error, refetch } = useApi(() => galleryService.manage(), [])
  useLiveRefresh(refetch, ["gallery-changed"], 120_000)

  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<GalleryManageImage | null>(null)

  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const items = (data?.items ?? []).filter(item => !hidden.has(item.id))
  const limit = data?.limit ?? 24

  async function send(files: FileList | File[]) {
    setActionError(null)
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        setActionError(`“${file.name}” não é uma imagem.`)
        continue
      }
      setUploading(count => count + 1)
      try {
        await galleryService.upload(file)
        refetch()
      } catch (err) {
        setActionError(err instanceof ApiError ? err.message : `Falha ao enviar “${file.name}”.`)
      } finally {
        setUploading(count => count - 1)
      }
    }
  }

  async function confirmRemove() {
    if (!removing) return
    const target = removing
    await galleryService.remove(target.id)
    setHidden(current => new Set(current).add(target.id))
    setRemoving(null)
    refetch()
  }

  return (
    <DashboardLayout
      title="Galeria da Landing Page"
      description="As imagens enviadas aparecem na hora na galeria pública do site — sem novo deploy."
      actions={
        <Button onClick={() => inputRef.current?.click()} disabled={items.length >= limit}>
          <ImagePlus className="size-4" /> Enviar imagens
        </Button>
      }
    >
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden onChange={event => { if (event.target.files) void send(event.target.files); event.target.value = "" }} />

      <div
        onDragOver={event => { event.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={event => { event.preventDefault(); setDragging(false); void send(event.dataTransfer.files) }}
        className={`flex flex-col items-center justify-center gap-1 rounded-2xl border border-dashed px-6 py-8 text-center transition-colors ${dragging ? "border-primary bg-primary/10" : "border-border/80"}`}
      >
        {uploading > 0 ? <Loader2 className="text-primary size-5 animate-spin" /> : <ImagePlus className="text-muted-foreground size-5" />}
        <p className="text-sm font-medium">{uploading > 0 ? `Enviando ${uploading} imagem(ns)...` : "Arraste imagens aqui ou use “Enviar imagens”"}</p>
        <p className="text-muted-foreground text-xs">PNG, JPEG, WebP ou GIF • até 5 MB cada • {items.length}/{limit} na galeria</p>
      </div>

      {actionError && <Alert variant="destructive"><AlertDescription>{actionError}</AlertDescription></Alert>}

      {loading && !data && <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />)}</div>}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}
      {data && items.length === 0 && <EmptyState icon={<ImagePlus className="size-5" />} title="Nenhuma imagem enviada" description="Enquanto estiver vazia, a landing mostra imagens de exemplo." />}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {items.map(item => (
          <Card key={item.id} className="group gap-0 overflow-hidden p-0">
            <div className="bg-secondary relative aspect-[4/3] overflow-hidden">
              {item.available ? (
                <img src={assetUrl(item.src)} alt={item.alt} loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
              ) : (
                <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-1.5 text-xs"><ImageOff className="size-6" /> Arquivo ausente no servidor</div>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate text-xs font-medium">{item.fileName}</span>
                <span className="text-muted-foreground truncate text-[11px]">{item.uploadedByName} • {formatBytes(item.size)} • {formatDateTime(item.createdAt)}</span>
              </div>
              <Button variant="outline" size="sm" aria-label={`Remover ${item.fileName}`} onClick={() => setRemoving(item)} className="hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive shrink-0 transition-colors">
                <Trash2 className="size-3.5" /> <span className="hidden sm:inline">Remover</span>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <ConfirmDialog open={!!removing} onOpenChange={open => !open && setRemoving(null)} title="Remover imagem da galeria?" description={`“${removing?.fileName ?? ""}” sai imediatamente da página inicial e a remoção é registrada nos logs do Discord.`} confirmLabel="Remover" variant="destructive" onConfirm={confirmRemove} />
    </DashboardLayout>
  )
}
