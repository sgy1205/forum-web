import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/', // 默认路由
    redirect: '/index' // 重定向到index页面
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
  },
  {
    path: '/editmine/:id',
    name: 'EditMine',
    component: () => import('@/views/EditMine')
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('@/views/Index')
  },
  {
    path: '/publish/:id',
    name: 'Publish',
    component: () => import('@/views/Publish')
  }
]

const router = new VueRouter({
  routes
})

export default router
