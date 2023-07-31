import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/forgot',
      name: 'forgot',
      component: () => import('@/components/beforeLogin/ForgotView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/beforeLogin/LoginView.vue')
    },
    {
      path: '/recover',
      name: 'recover',
      component: () => import('@/components/beforeLogin/RecoverView.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/components/beforeLogin/RegisterView.vue')
    },


    {
      path: '/discover',
      name: 'discover',
      component: () => import('@/components/afterLogin/DiscoverView.vue')
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/components/afterLogin/MessengerView.vue')
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('@/components/afterLogin/NotificationsView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/components/afterLogin/SearchView.vue'),
      props: route => ({
        data: {
          gender: route.query.gender,
          location: route.query.location,
          min: route.query.min,
          max: route.query.max
        }
      })
    },
    {
      path: '/settings',
      name: '',
      component: () => import('@/components/afterLogin/SettingsView.vue')
    },
    {
      path: '/user/:id',
      name: 'userprofile',
      component: () => import('@/components/afterLogin/UserProfile.vue')
    },
    {
      path: '/',
      name: 'users',
      component: () => import('@/components/afterLogin/UsersView.vue')
    },


    {
      path: '/404',
      name: '404',
      component: () => import('@/views/NotFound.vue')
    },
    {
      path: '/:catchAll(.*)',
      redirect: '/404'
    }
  ]
})

export default router
