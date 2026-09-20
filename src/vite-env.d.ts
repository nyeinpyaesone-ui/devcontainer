/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_VERSION: string
  readonly VITE_GHCR_REGISTRY: string
  readonly VITE_GHCR_NAMESPACE: string
  readonly VITE_GHCR_TOKEN: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_COLLABORATION: string
  readonly MODE: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly SSR: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
