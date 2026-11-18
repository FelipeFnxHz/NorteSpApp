export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024
const MAX_SIDE = 1280
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/gif"]

/**
 * Valida e otimiza a imagem antes do upload: reduz para no máx. 1280 px e converte para WebP,
 * o que deixa a vitrine mais leve. GIFs (animados) são enviados como estão.
 */
export async function prepareImage(file: File): Promise<Blob> {
  if (!ACCEPTED.includes(file.type)) throw new Error("Use uma imagem PNG, JPEG, WebP ou GIF.")

  let result: Blob = file
  if (file.type !== "image/gif") {
    try {
      const bitmap = await createImageBitmap(file)
      const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(bitmap.width * scale)
      canvas.height = Math.round(bitmap.height * scale)
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
      bitmap.close()
      const webp = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.86))
      if (webp && webp.type === "image/webp" && webp.size < file.size) result = webp
    } catch {
      /* não conseguiu decodificar/otimizar: segue com o original e deixa o servidor validar */
    }
  }

  if (result.size > MAX_UPLOAD_BYTES) throw new Error("A imagem é grande demais (máx. 2 MB mesmo após otimização).")
  return result
}
