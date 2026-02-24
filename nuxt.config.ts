// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@vite-pwa/nuxt',
    '@nuxtjs/tailwindcss',
    '@formkit/nuxt',
    '@nuxt/image',
    '@nuxtjs/color-mode',
    '@vueuse/nuxt',
    "@nuxtjs/leaflet"
  ],
  
  css: ['~/assets/css/main.css'],
  
  app: {
    head: {
        link: [
            { rel: 'icon', type: 'image/png', href: '/favicon.png' },
            { rel: 'manifest', href: '/manifest.webmanifest' },
        ],
    }
  },
  
  pwa: {
    strategies: 'injectManifest',
    registerType: 'autoUpdate',
    manifest: {
      name: "Sierramar",
      short_name: "Sierramar",
      description: "Sierramar PWA",
      theme_color: "#ffffff",
      start_url: "/app",
      display: "standalone",
      background_color: "#ffffff",
      lang: "es",
      id: "/v1",
      launch_handler: {
        client_mode: "auto"
      },
      handle_links: "preferred",
      icons: [
        {
          src: "/icons/icon_64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "/icons/icon_144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "/icons/icon_192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/icons/icon_512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          src: "/screenshots/pozoSM1.webp",
          sizes: "720x960",
          type: "image/webp",
          form_factor: "narrow",
        },
        {
          src: "/screenshots/pozoSM2.webp",
          sizes: "1280x720",
          type: "image/webp",
          form_factor: "wide",
        },
      ],    
    },
    workbox: {
      navigateFallback: "/",
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 31536000,
            },
          },
        },
      ],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: "classic",
    },
  },
  runtimeConfig: {
    public: {
      api: process.env.API_BASE_URL,
      company: process.env.COMPANY_NAME,
      sifEmail: process.env.SIF_EMAIL || "",
      sifPassword: process.env.SIF_PASSWORD || "",
      sifUrl: process.env.SIF_URL || "",
      vapidKey: process.env.NUXT_PUBLIC_VAPID_KEY || "",
    }
  },
  image: {
    // Options
  },
  colorMode: {
    preference: 'system', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
    classSuffix: '',
  },
  plugins: ["~/plugins/ChartJsPlugin.client.ts"],

  ssr: false
})