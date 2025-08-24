import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', // 默认路由
    redirect: '/login' // 重定向到index页面
  },
  {
    path:'/login',
    name:'Login',
    component: () => import('@/views/Login')
  },
  {
    path:'/register',
    name:'Register',
    component: () => import('@/views/Register')
  },
  {
    path:'/personal/:id',
    name:'Personal',
    component: () => import('@/views/Personal')
  }
]

const router = new VueRouter({
  routes
})

export default router
