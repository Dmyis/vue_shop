import Vue from 'vue'
import App from './App.vue'
import router from './router/router';
import './plugins/element.js'

//导入全局样式
import './assets/css/global.css'
//导入第三方图标库
import icon from './assets/icon/menuList_icon/iconfont.css';

//导入axios进行网络请求
import axios from 'axios';
// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

axios.interceptors.request.use(config=>{
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

//加入到Vue原型上
Vue.prototype.$http = axios;



Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
