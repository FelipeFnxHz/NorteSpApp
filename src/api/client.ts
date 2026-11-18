const API_BASE = import.meta.env.VITE_API_URL ?? ''

export class ApiError extends Error {
  status: number
  data?: Record<string, unknown>

  constructor(message: string, status: number, data?: Record<string, unknown>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    let message = `Erro ${response.status}`
    let payload: Record<string, unknown> | undefined
    try {
      payload = await response.json()
      if (typeof payload?.message === 'string') message = payload.message
    } catch {}
    // Saiu do servidor do Discord: a sessão foi encerrada no servidor, então levamos direto à página de aviso.
    if (response.status === 403 && payload?.code === 'not_in_guild' && window.location.pathname !== '/acesso-negado') {
      window.location.replace('/acesso-negado')
    }
    throw new ApiError(message, response.status, payload)
  }

  if (response.status === 204) return undefined as T

  return response.json() as Promise<T>
}

/** Envia um arquivo binário (corpo bruto, sem JSON). Usado no upload de imagens. */
async function upload<T>(path: string, file: Blob, extraHeaders: Record<string, string> = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': file.type, ...extraHeaders },
    body: file,
  })
  const payload = await response.json().catch(() => undefined)
  if (!response.ok) throw new ApiError(typeof payload?.message === 'string' ? payload.message : `Erro ${response.status}`, response.status, payload)
  return payload as T
}

/** URLs absolutas passam direto; caminhos da API (ex.: imagens enviadas) ganham o host do backend. */
/** Origem da API (no app nativo a origem da janela não é a da API). */
export const apiOrigin = () => API_BASE || window.location.origin

export const assetUrl = (src: string) => (src.startsWith('/api/') ? `${API_BASE}${src}` : src)

export const http = {
  upload,
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string, body?: unknown) => request<T>(path, { method: 'DELETE', body }),
}

export function realtimeStreamUrl(): string {
  return `${API_BASE}/api/realtime/stream`
}

/** O backend devolve o usuário para `return` (origem do app) ao fim do OAuth. */
export function discordLoginUrl(): string {
  return `${API_BASE}/auth/discord?return=${encodeURIComponent(window.location.origin)}`
}