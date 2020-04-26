import Vue from 'vue'
import App from './App.vue'
import router from './router/router';
import './plugins/element.js'

//导入全局样式
import './assets/css/global.css'
//导入第三方图标库
import icon from './assets/icon/menuList_icon/iconfont.css';

// 挂载富文本框编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本框编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'



//导入axios进行网络请求
import axios from 'axios';
// axios.defaults.baseURL = 'http://timemeetyou.com:8889/api/private/v1/'
axios.defaults.baseURL = 'https://www.liulongbin.top:8888/api/private/v1/'

axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

//加入到Vue原型上
Vue.prototype.$http = axios;

// .将时间戳转换为Date对象
Vue.filter('formatDate', function(originVal){
  const dt = new Date(originVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})


Vue.config.productionTip = false

//将富文本编辑器，注册为全局可用组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
