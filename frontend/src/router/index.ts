import { createRouter, createWebHistory } from 'vue-router'
// import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      // component: HomeView
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/register',
      name: 'RegisterView',
      // component: RegisterView
      component: () => import('@/components/beforLogin/RegisterView.vue')
    },
    {
      path: '/login',
      name: 'LoginView',
      // component: LoginView
      component: () => import('@/components/beforLogin/LoginView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('@/views/AboutView.vue')
    },
    {
      path: '/404',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    },
    {
      path: '/:(.*catchAll)',
      redirect: '/404'
    }
  ]
})

export default router
