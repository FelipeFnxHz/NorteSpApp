import { check, type DownloadEvent, type Update } from "@tauri-apps/plugin-updater"
import { relaunch } from "@tauri-apps/plugin-process"

export const UPDATE_CHECK_DELAY_MS = 5_000
export const UPDATE_CHECK_INTERVAL_MS = 30 * 60_000

export async function checkForUpdate(): Promise<Update | null> {
  try {
    const update = await check()
    console.log("[updater] Resultado do check():", update)
    return update
  } catch (err) {
    console.error("[updater] check() falhou com erro:", err)
    alert("Erro no Updater: " + JSON.stringify(err, Object.getOwnPropertyNames(err)))
    throw err
  }
}

export async function installUpdate(update: Update, onProgress: (percent: number | null) => void) {
  let total = 0
  let received = 0

  await update.downloadAndInstall((event: DownloadEvent) => {
    if (event.event === "Started") {
      total = event.data.contentLength ?? 0
      onProgress(total ? 0 : null)
    } else if (event.event === "Progress") {
      received += event.data.chunkLength
      if (total) onProgress(Math.min(100, Math.round((received / total) * 100)))
    } else {
      onProgress(100)
    }
  })

  await relaunch()
}