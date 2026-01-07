/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BOTTOM_ONLINE_BACKEND_URL: string
  readonly VITE_TEST: Number
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
