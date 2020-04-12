<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avater_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="el-icon-lock" type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name:'login',
    data() {
      return {
        //这里是登录表单的数据绑定对象
        loginForm:{
          username: 'admin',
          password: '123456'
        },
        //这里是表单的验证规则对象
        loginFormRules:{
          //1.验证用户名是否合法
          username:[
            {required: true, message:'请输入登录名称', trigger: 'blur'},
            {require: true, min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          //2.验证密码是否合法
          password:[
            {required: true, message:'请输入登录密码', trigger: 'blur'},
            {require: true, min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        }
      }
    },
    methods: {
      //点击重置按钮，重置表单
      resetLoginForm() {
        this.$refs.loginFormRef.resetFields();
      },
      //判断表单预验证
      login() {
        //如果通过验证vaild等于true
        this.$refs.loginFormRef.validate(vaild =>{
          if(!vaild) return;
          this.$http.post('login',this.loginForm).then(res =>{
            //如果登录失败就弹框
            if(res.data.meta.status !=200) return this.$message.error('登录失败！')
            this.$message.success('登录成功');
            //1.将登录成功后的token，保存到客户端的 sessionStorage 中
              //1.1项目中除了登录之外的API接口，必须在登录之后才能访问
              //1.2token只应在当前网址打开期间生效，所以将token保存在sessionStorage中
            window.sessionStorage.setItem('token',res.data.data.token);
            //2.通过编程式导航跳转到后台主页，路由时是 /home
            this.$router.push('/home')
          })
        })
      }
    }
  }
</script>

<style scoped>
  .login_container{
    height: 100%;
    background-color: #2b4b6b;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .login_box{
    position: relative;
    background-color: #fff;
    height: 300px;
    width: 450px;
    border-radius: 3px;
  }
  .avater_box{
    height: 130px;
    width: 130px;
    border-radius: 50%;
    border: 1px solid #eee;
    padding: 10px;
    background-color: #fff;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .avater_box img{
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
  .login_form{
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }
  .btns{
    display: flex;
    justify-content: flex-end;
  }
</style>>
