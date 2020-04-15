<template>
  <div>
    <!-- 面包屑导航 -->
    <CrumbsNav />
    <!-- 卡片区域 -->
    <card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="性名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态" prop="mg_state">
          <template v-slot="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template v-slot="scopes">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scopes.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scopes.row.id)"
            ></el-button>
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="primary" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 4, 6, 10]"
        :page-size="this.queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="this.total"
      ></el-pagination>

      <!-- 添加用户对话框 -->
      <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
        <el-form :model="addForm" :rules="addFormRules" ref="addFromRef" label-width="70px">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="addForm.password" type="password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input v-model="addForm.phone"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addUser">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 修改用户的对话框 -->
      <el-dialog
        title="修改用户"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed"
      >
        <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
          <el-form-item label="用户名">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="手机" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editUserInfo">确 定</el-button>
        </span>
      </el-dialog>
    </card>
  </div>
</template>

<script>
import CrumbsNav from '../../../components/CrumbsNav'
import Card from '../../../components/Card'

export default {
  name: 'Users',
  components: {
    CrumbsNav,
    Card
  },
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      //验证邮箱
      const regEmail = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/

      if (regEmail.test(value)) {
        //合法邮箱
        return cb()
      }
      cb(new Error('请输入合法的邮箱'))
    }
    //验证手机号的规则
    var checkPhone = (rule, value, cb) => {
      const regPhone = /^[1][3,4,5,7,8][0-9]{9}$/

      if (regPhone.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }

    return {
      //获取用户列表的参数数据
      queryInfo: {
        query: '',
        //当前页数
        pagenum: 1,
        //当前每页显示多少行数据
        pagesize: 2
      },
      userList: [],
      //数据条数
      total: 0,
      //是否显示添加用户提示框
      addDialogVisible: false,
      //添加用户表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        phone: ''
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名！', trigger: 'blur' },
          {
            require: true,
            min: 3,
            max: 10,
            message: '长度在 3 到 10 个字符',
            trigger: 'blur'
          }
        ],
        password: [
          { required: true, message: '请输入密码！', trigger: 'blur' },
          {
            require: true,
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱！', trigger: 'blur' },
          //自定义验证规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          //自定义验证规则
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      //控制修改用户对话框的显示和隐藏
      editDialogVisible: false,
      //查询到的用户信息
      editForm: {},
      //修改用户信息的校验规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    //获取用户列表
    this.getUserList()
  },
  methods: {
    //获取用户列表
    getUserList() {
      this.$http.get('users', { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        }
        this.userList = res.data.data.users
        this.total = res.data.data.total
      })
    },
    //监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 更改用户状态
    userStateChanged(userInfo) {
      this.$http
        .put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        .then(res => {
          if (res.data.meta.status !== 200) {
            //如果失败就不改变
            userInfo.mg_state = !userInfo.mg_state
            return this.$message.error('更新状态失败')
          }
          this.$message.success('更新用户状态成功')
        })
    },
    //监听添加用户对话框的关闭事件
    addDialogClose() {
      this.$refs.addFromRef.resetFields()
    },
    //添加用户点击确定按钮预校验
    addUser() {
      this.$refs.addFromRef.validate(valid => {
        if (!valid) return
        //发起添加用户的网络请求
        this.$http.post('users', this.addForm).then(res => {
          console.log(res)
          if (res.data.meta.status != 201) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          //隐藏添加用户对话框
          this.addDialogVisible = false
          //重新渲染用户列表
          this.getUserList()
        })
      })
    },
    //展示编辑用户的对话框
    showEditDialog(id) {
      //得到用户数据
      this.$http.get(`users/${id}`).then(res => {
        if (res.data.meta.status != 200) {
          return this.$message.error('查询用户信息失败！')
        }
        //存入data数据中
        this.editForm = res.data.data
      })
      this.editDialogVisible = true
    },
    //关闭 修改对话框 重置表单内容
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(valid => {
        if (!valid) return

        //修改数据
        this.$http
          .put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('修改信息失败')
            }
            //关闭对话框
            this.editDialogVisible = false
            //更新数据
            this.getUserList()
            //提示用户修改成功
            this.$message.success('更新数据成功')
          })
      })
    },
    //根据id删除对应的用户
    removeUserById(id) {
      //弹框询问是否删除数据
       this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(res=>{ 
          //删除用户信息
          this.$http.delete('users/'+ id).then(res=>{
            if(res.data.meta.status !=200){
              return this.$message.error('删除用户失败')
            }
            this.$message.success('删除用户成功')
            this.getUserList();
          })
        }).catch(() =>{
          this.$message.info('用户取消了删除')
        })
    }
  }
}
</script>

<style scoped>
.el-table {
  margin-top: 20px;
  font-size: 12px;
}
.el-pagination {
  margin-top: 15px;
}
</style>