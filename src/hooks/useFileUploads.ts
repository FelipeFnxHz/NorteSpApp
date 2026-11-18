import { useCallback, useState } from "react"
import type { UploadPayload } from "@/types"

const MAX_FILE_BYTES = 8 * 1024 * 1024

export interface PickedFile extends UploadPayload {
  size: number
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."))
    reader.readAsDataURL(file)
  })
}

/** Seleciona arquivos e já os converte para base64 (limites iguais aos do servidor). */
export function useFileUploads(maxFiles: number) {
  const [files, setFiles] = useState<PickedFile[]>([])
  const [error, setError] = useState<string | null>(null)

  const add = useCallback(
    async (list: FileList | File[]) => {
      setError(null)
      const incoming = Array.from(list)
      if (files.length + incoming.length > maxFiles) {
        setError(`Envie no máximo ${maxFiles} arquivos.`)
        return
      }
      const tooBig = incoming.find(file => file.size > MAX_FILE_BYTES)
      if (tooBig) {
        setError(`"${tooBig.name}" excede 8 MB.`)
        return
      }
      try {
        const read = await Promise.all(
          incoming.map(async file => ({ name: file.name, data: await readAsDataUrl(file), size: file.size })),
        )
        setFiles(current => [...current, ...read])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Falha ao ler arquivos.")
      }
    },
    [files.length, maxFiles],
  )

  const remove = useCallback((index: number) => setFiles(current => current.filter((_, i) => i !== index)), [])
  const clear = useCallback(() => {
    setFiles([])
    setError(null)
  }, [])

  return { files, error, add, remove, clear }
}
