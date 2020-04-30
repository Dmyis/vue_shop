import Vue from 'vue'
import Router from 'vue-router'
const Login = () => import('../views/login/login')
const Home = () => import('../views/home/Home')
const Welcome = () => import('../views/home/childCpns/Welcome')
const Users = () => import('../views/home/childCpns/Users')
const Rights = () => import('../views/home/childCpns/power/Rights')
const Roles = () => import('../views/home/childCpns/power/Roles');
const Cate = () => import('../views/home/childCpns/goods/Cate')
const Params = () => import('../views/home/childCpns/goods/Params');
const List = () => import('../views/home/childCpns/goods/List')
const Add = () => import('../views/home/childCpns/goods/Add');
const Order = () => import('../views/home/childCpns/order/Order');
const Report = () => import('../views/home/childCpns/report/Report');

Vue.use(Router);

// 2.创建router
const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        component: Welcome
      },
      {
        path: '/users',
        component: Users
      },
      {
        path: '/rights',
        component: Rights
      },
      {
        path: '/roles',
        component: Roles
      },
      {
        path: '/categories',
        component: Cate
      },
      {
        path: '/params',
        component: Params
      },
      {
        path: '/goods',
        component: List
      },
      {
        path: '/goods/add',
        component: Add
      },
      {
        path: '/orders',
        component: Order
      },{
        path: '/reports',
        component: Report
      }
    ]
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
  if (to.path == '/login') return next()
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('./login')
  next()
})


export default router;