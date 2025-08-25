import axios from 'axios'
import router from '@/router' // 确保引入路由实例
import { Message } from 'element-ui'

const request = axios.create({
  baseURL: 'http://127.0.0.1:12050',
  timeout: 10000,
  withCredentials: true // 必须与后端 allowCredentials(true) 配对
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token') || ''
    // const token ='eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJleHAiOjE3NTY4MjAwMTAsInVzZXJJZCI6MX0.EZ0Xb1Ck6QLQiogzNNzi1uSbZIK-VML3Xav5Km0kbnw'// 硬编码仅用于测试
    if (token != '') {
      config.headers['token'] = `${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  res => {
    if (res.data.code == 401) {
      // 如果响应状态码为401，表示未授权，重定向到登录页面
      router.replace('/login')
      Message.error('未登录，请先登录')
    }else if (res.data.code == 500) {
      // 如果响应状态码不是200，表示请求失败，显示错误信息
      Message.error(res.data.msg || '请求失败，请稍后再试')
      return Promise.reject(res.data);
    }else if(res.data.code == 200){
      return res.data
    }else{
      return Promise.reject(res.data);
    }
  }
)

export default request