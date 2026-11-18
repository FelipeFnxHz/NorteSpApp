# NorteSp — App desktop (Tauri)

Dashboard React + Tailwind dentro de uma janela nativa do Tauri 2.

```bash
npm install
npm run tauri dev     # desenvolvimento (Vite na porta 1420 + janela nativa)
npm run tauri build   # instalador de produção
```

- **Dev:** as chamadas à API usam caminhos relativos (`/api`, `/auth`) e o proxy do Vite encaminha para `API_PROXY_TARGET` (padrão `https://nortesp.discloud.dev`; veja `.env.development`).
- **Produção:** o app usa `VITE_API_URL` do `.env`.
