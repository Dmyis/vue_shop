import Vue from 'vue'
import Router from 'vue-router'
const Login = () => import ('../components/login')
const Home = () => import ('../components/Home')
Vue.use(Router);

// 2.创建router
const routes = [
  {
    path:'/',
    redirect: '/login'
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component: Home
  }

]
const router = new Router({
  routes,
  mode: 'history'
})

//挂载路由导航守卫
  //作用：有些页面必须是要携带token才能进入的，如果没有token就不能访问
  router.beforeEach((to, from, next) => {
    //to 将要访问的路径
    //from 代表从哪个路径跳转而来
    //next() 放行   next('/login')强制跳转路径
    if(to.path == '/login') return next()
    const token = window.sessionStorage.getItem('token')
    if(!token) return next('./login')
    next()
  })


export default router;