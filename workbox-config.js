module.exports = {
  globDirectory: "dist/",
  globPatterns: ["**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}"],
  swDest: "dist/service-worker.js",
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "firebase-storage-cache",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        },
      },
    },
    {
      urlPattern: /^https:\/\/firestore\.googleapis\.com/,
      handler: "NetworkFirst",
      options: {
        cacheName: "firestore-data-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        },
      },
    },
  ],
};
