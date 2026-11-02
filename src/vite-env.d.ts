/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COMPANY_NAME?: string;
  readonly VITE_COMPANY_TAGLINE?: string;
  readonly VITE_COMPANY_ADDRESS?: string;
  readonly VITE_COMPANY_CONTACT?: string;
  readonly VITE_COMPANY_LOGO?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
