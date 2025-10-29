/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SATIM_TEST_MODE: string
  readonly VITE_API_URL?: string
  readonly VITE_SOCKET_URL?: string
  readonly VITE_STABILITY_API_KEY?: string
  readonly VITE_FRONTEND_URL?: string
  readonly MODE: string
  readonly BASE_URL: string
  readonly PROD: boolean
  readonly DEV: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
