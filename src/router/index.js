import { createRouter, createWebHistory } from "vue-router";
import Login from "@/pages/LoginPage.vue";

const routes = [
  {
    path: "/login",
    name: "LoginPage",
    component: Login,
  },
  {
    path: "/overview",
    name: "Overview",
    component: () => import("@/pages/Overview.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/students",
    name: "Students",
    component: () => import("@/pages/Students.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/appointments",
    name: "Appointments",
    component: () => import("@/pages/Appointments.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/records",
    name: "Records",
    component: () => import("@/pages/Records.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/medications",
    name: "Medications",
    component: () => import("@/pages/Medications.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/alerts",
    name: "Alerts",
    component: () => import("@/pages/Alerts.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/sops",
    name: "SOPs",
    component: () => import("@/pages/SOPs.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/analytics",
    name: "Analytics",
    component: () => import("@/pages/Analytics.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/security",
    name: "Security",
    component: () => import("@/pages/Security.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/pages/Settings.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("currentAdmin");

  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
  } else {
    next();
  }
});

export default router;
