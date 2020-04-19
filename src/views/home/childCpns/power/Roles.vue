<template>
  <div>
    <!-- 面包屑导航 -->
    <CrumbsNav>
      <template v-slot:no1>权限管理</template>
      <template v-slot:no2>角色列表</template>
    </CrumbsNav>

    <!-- 卡片区域 -->
    <card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialog = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <!-- 列表展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级三级权限 -->
              <el-col :span="19">
                <!-- 二级 -->
                <el-row
                  :class="['vcenter',i2===0?'':'bdtop']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级  -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 列表序列号 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="editRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </card>

    <!-- 添加角色对话框 -->
    <el-dialog title="添加角色" :visible.sync="addDialog" width="50%" @close="addRolesClosed">
      <el-form :model="addRolesForm" :rules="addRolesRules" ref="addRolesRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName" label-width="80px">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" label-width="80px">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialog" width="50%">
      <el-form :model="editRolesForm" :rules="addRolesRules" ref="editRolesRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName" label-width="80px">
          <el-input v-model="editRolesForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" label-width="80px">
          <el-input v-model="editRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="editRolesCommit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import CrumbsNav from '../../../../components/CrumbsNav'
import Card from '../../../../components/Card'

export default {
  name: 'Roles',
  components: {
    CrumbsNav,
    Card
  },
  data() {
    return {
      //角色列表
      rolesList: [],
      //添加角色是否显示弹出框
      addDialog: false,
      //添加角色对话框表单数据
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      //校验添加角色表单数据
      addRolesRules: {
        roleName: [
          { required: true, message: '请输入角色名称！', trigger: 'blur' },
          {
            require: true,
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      //编辑表单的显示隐藏
      editDialog: false,
      //编辑角数据存放
      editRolesForm: {},
      //检验编辑角色表示数据
      // editRolesRules: {
      //   roleName: [
      //     { required: true, message: '请输入角色名称！', trigger: 'blur' },
      //     {
      //       require: true,
      //       min: 2,
      //       max: 10,
      //       message: '长度在 2 到 10 个字符',
      //       trigger: 'blur'
      //     }
      //   ]
      // },
      //分配权限对话框展示和隐藏
      setRightDialogVisible: false,
      //所有权限数据
      rightsList: [],
      //树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      //分配权限默认选中的节点id数组
      defKeys: [],
      //当前即将分配权限的id
      roleId: ''
    }
  },
  created() {
    //获取角色列表
    this.getRolesList()
  },
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    //关闭添加角色对话框并清空文本
    addRolesClosed() {
      this.$refs.addRolesRef.resetFields()
    },
    //添加角色对话框点击确定添加
    addRoles() {
      this.$refs.addRolesRef.validate(valid => {
        if (!valid) return
        //发起添加角色的网络请求
        this.$http.post('roles', this.addRolesForm).then(res => {
          if (res.data.meta.status !== 201) {
            return this.$message.error('创建角色失败！')
          }
          //提示用户创建成功
          this.$message.success('创建角色成功')
          //关闭对话框
          this.addDialog = false
          //重新渲染列表
          this.getRolesList()
        })
      })
    },
    //编辑修改角色
    editRoles(id) {
      //得到角色数据
      this.$http.get(`roles/${id}`).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error('获取角色信息失败')
        }
        //保存角色数据
        this.editRolesForm = res.data.data
      })
      this.editDialog = true
    },
    //提交修改后的数据
    editRolesCommit() {
      //预校验
      this.$refs.editRolesRef.validate(validata => {
        if (!validata) return
        //提交数据
        this.$http
          .put('roles/' + this.editRolesForm.roleId, {
            roleName: this.editRolesForm.roleName,
            roleDesc: this.editRolesForm.roleDesc
          })
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('修改用户失败')
            }
            //关闭对话框
            this.editDialog = false
            //更新数据
            this.getRolesList()
            //提示用户修改成功
            this.$message.success('更新数据成功')
          })
      })
    },
    //删除角色
    removeRolesById(id) {
      //弹框询问是否删除数据
      this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          //删除角色
          this.$http.delete(`roles/${id}`).then(res => {
            if (res.data.meta.status != 200) {
              return this.$message.error('删除角色失败')
            }
            this.$message.success('删除角色成功')
            this.getRolesList()
          })
        })
        .catch(() => {
          this.$message.info('用户取消了删除')
        })
    },
    //根据id删除权限
    removeRightById(role, rightId) {
      //弹框提示用户是否删除
      this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          //删除权限
          this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('删除权限失败')
            }
            //删除成功 ，因为重新获取权限会自动关闭表格
            role.children = res.data.data
          })
        })
        .catch(orr => {
          this.$message.error('用户取消了删除')
        })
    },
    //展示分配权限对话框
    async showSetRightDialog(role) {
      //获取到角色的id
      this.roleId = role.id
      //获取所有权限的数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      //把数据保存到data中
      this.rightsList = res.data
      //递归获取三级权限的id
      this.getLeafKeys(role, this.defKeys)
      //打开分配权限对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的方式。回去角色下的所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      //如果不包含children属性就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    //分配权限对话框关闭，清空defKeys数组
    setDialogClosed() {
      this.defKeys = []
    },
    //点击角色分配权限
    allotRights() {
      //得到二级和三级权限的id
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')

      //发起网络请求
      this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      }).then(res=>{
        console.log(res)
        if (res.data.meta.status !== 200) {
          return this.$message.error('更新权限失败')
        }
        this.$message.success('更新权限成功')
        this.setRightDialogVisible = false
        this.getRolesList()
    
      })
    }
  }
}
</script>

<style scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>