import "./assets/tailwind.css";
import { createApp } from "vue";
import { createPinia } from "pinia"; // Add this import
import App from "./App.vue";
import router from "./router";
import { auth } from "./firebase-config";
import { registerSW } from "./registerServiceWorker";

// Create pinia instance
const pinia = createPinia();

let app;

auth.onAuthStateChanged(() => {
  if (!app) {
    app = createApp(App).use(pinia).use(router).mount("#app");
  }
});

// Register service worker for downloadable capability
registerSW();
