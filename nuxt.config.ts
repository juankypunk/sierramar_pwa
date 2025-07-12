/*
MIT License

Copyright (c) 2025 Juan Carlos Moral - juanky@juancarlosmoral.es

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

2. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
     prerender: {
    //   crawlLinks: false,
       routes: ['/'],
     },
   },
  modules: [
    '@vite-pwa/nuxt',
    '@formkit/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    "@nuxtjs/leaflet"
  ], 
  experimental: {
    payloadExtraction: false,
  }, 
  app: {
    head: {
        link: [
            { rel: 'icon', type: 'image/png', href: '/favicon.png' },
            { rel: 'manifest', href: '/manifest.webmanifest' },
        ],
    }
  },
  pwa:{
    registerType: 'autoUpdate',
    manifest: {
      name: "Sierramar",
      short_name: "Sierramar",
      description: "Sierramar PWA",
      theme_color: "#ffffff",
      start_url: "/",
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
          src: "icons/icon_64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "icons/icon_144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "icons/icon_192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/icon_512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      screenshots: [
        {
          "src": "screenshots/pozoSM1.webp",
          "sizes": "720x960",
          "type": "image/webp",
          "form_factor": "narrow",
        },
        {
          "src": "screenshots/pozoSM2.webp",
          "sizes": "1280x720",
          "type": "image/webp",
          "form_factor": "wide",
        },
      ],    
    },
    workbox: {
      navigateFallback: "/",
      navigateFallbackAllowlist: [/^\/$/],
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      runtimeCaching: [
        {
          urlPattern: '/',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'app-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 86400,
            },
          },
        },
      ],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: "module",
    },
  },
  runtimeConfig: {
    public: {
      api: process.env.API_BASE_URL,
      company: process.env.COMPANY_NAME,
      sifEmail: process.env.SIF_EMAIL || "",
      sifPassword: process.env.SIF_PASSWORD || "",
    }
  },
  
  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath:  ["~/assets/css/main.css", { injectPosition: "first" }],
    configPath: '~/tailwind.config.js',
    exposeConfig: false,
    config: {},
    viewer: true,
  },

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  colorMode: {
    preference: 'system', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
    classSuffix: '',
  },

  image: {
    // Options
  },

  ssr: false,

  devtools: {
    enabled: true,
  },

  plugins: ["plugins/ChartJsPlugin.ts"],
  compatibilityDate: "2025-03-08"
})
