// Company branding, injected at build time from VITE_COMPANY_* env variables.
// Values are baked into the bundle, so never put secrets here.
export const company = {
  name: import.meta.env.VITE_COMPANY_NAME ?? "",
  tagline: import.meta.env.VITE_COMPANY_TAGLINE ?? "",
  address: import.meta.env.VITE_COMPANY_ADDRESS ?? "",
  contact: import.meta.env.VITE_COMPANY_CONTACT ?? "",
  // Served from /public, so it is loadable by URL (also by @react-pdf/renderer).
  logo: import.meta.env.VITE_COMPANY_LOGO ?? "/company-logo.png",
};
