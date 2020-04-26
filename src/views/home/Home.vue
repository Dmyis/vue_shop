<template>
  <el-container class="home-container">
    <!-- 首页头部 -->
    <el-header>
      <div>
        <img src="../../assets/logo.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 首页侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏折叠 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 一级菜单 -->
        <el-menu background-color="#333744" text-color="#fff" active-text-color="#409bff" unique-opened
                 :collapse="isCollapse" :collapse-transition='false' router  :default-active="activePath">
          <!-- 循环左侧数据渲染 -->
          <el-submenu :index="item.id+ ''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="menuIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id"
                          @click="saveNavState('/'+subItem.path)">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 首页主要内容 -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

export default {
  name: 'Home',
  data() {
    return {
      //左侧菜单数据
      menuList: [],
      menuIcon: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpingouwudai2',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      //是否折叠
      isCollapse: false,
      //被激活的地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList();
    //设置激活的左侧菜单高亮
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      //清空token
      window.sessionStorage.clear()
      //跳转到登录页面
      this.$router.push('/login')
    },
    //获取左侧菜单数据
    getMenuList() {
      this.$http.get('menus').then(res =>{
        if(res.data.meta.status !== 200) return this.$message.error(res.data.meta.msg)
        this.menuList = res.data.data
      })
    },
    //点击折叠或者不折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  color: #fff;
  padding-left: 0;
  align-items: center;
  font-size: 20px;
}
.el-header div {
  display: flex;
  align-items: center;
}
.el-header img {
  width: 50px;
  height: 50px;
  padding-right: 20px;
}
.el-aside {
  background-color: #333744;
}
.el-aside .el-menu{
  border-right: none;
}
.toggle-button{
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  text-align: center;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
  margin-right: 10px;
}
</style>