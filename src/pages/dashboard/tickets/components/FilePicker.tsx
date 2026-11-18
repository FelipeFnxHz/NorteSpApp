import { useRef } from "react"
import { FileText, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PickedFile } from "@/hooks/useFileUploads"

interface FilePickerProps {
  files: PickedFile[]
  error: string | null
  onAdd: (files: FileList) => void
  onRemove: (index: number) => void
  label?: string
  disabled?: boolean
}

export function FilePicker({ files, error, onAdd, onRemove, label = "Anexar arquivos", disabled }: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        accept="image/*,video/*,.pdf,.txt,.log,.zip,.7z,.rar"
        onChange={event => {
          if (event.target.files?.length) onAdd(event.target.files)
          event.target.value = ""
        }}
      />
      <div>
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
          <Paperclip className="size-3.5" />
          {label}
        </Button>
      </div>

      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex max-w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-1 pr-1 pl-2.5 text-xs"
            >
              <FileText className="text-muted-foreground size-3.5 shrink-0" />
              <span className="max-w-[160px] truncate">{file.name}</span>
              <span className="text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
              <button
                type="button"
                aria-label={`Remover ${file.name}`}
                onClick={() => onRemove(index)}
                className="text-muted-foreground hover:text-foreground grid size-5 place-items-center rounded-md hover:bg-white/10"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}
