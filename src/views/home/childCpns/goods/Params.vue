<template>
  <div>
    <!-- 面包屑导航 -->
    <crumbs-nav>
      <template v-slot:no1>商品管理</template>
      <template v-slot:no2>参数列表</template>
    </crumbs-nav>

    <!-- 卡片区域 -->
    <card>
      <!-- 头部警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" type="warning" show-icon :closable="false"></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类:</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="cateSelectKeys"
            :options="cateList"
            :props="cateProps"
            @change="cateHandleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddParmas"
          >添加参数</el-button>
          <!-- 动态参数 -->
          <el-table :data="manyTabData">
            <!-- 参数展开行 -->
            <el-table-column type="expand">
              <template v-slot="scoped">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scoped.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scoped.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scoped.row.inputVisible"
                  v-model="scoped.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scoped.row)"
                  @blur="handleInputConfirm(scoped.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scoped.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scoped">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditDialog(cateId, scoped.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="warning"
                  size="mini"
                  @click="deleteParams(cateId, scoped.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddParmas"
          >添加属性</el-button>
          <!-- 静态属性 -->
          <el-table :data="onlyTabData">
            <el-table-column type="expand">
              <template v-slot="scoped">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, index) in scoped.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scoped.row)"
                >{{item}}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scoped.row.inputVisible"
                  v-model="scoped.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scoped.row)"
                  @blur="handleInputConfirm(scoped.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scoped.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scoped">
                <el-button
                  type="primary"
                  size="mini"
                  @click="showEditDialog(cateId, scoped.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="warning"
                  size="mini"
                  @click="deleteParams(cateId, scoped.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + addParamsTitle"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addRules" ref="addRef" label-width="100px">
        <el-form-item :label="addParamsTitle+':'" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数对话框 -->
    <el-dialog
      :title="'修改' + addParamsTitle"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="addRules" ref="editRef" label-width="100px">
        <el-form-item :label="addParamsTitle+':'" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import CrumbsNav from '../../../../components/CrumbsNav'
import Card from '../../../../components/Card'

export default {
  name: 'Params',
  components: {
    CrumbsNav,
    Card
  },
  data() {
    return {
      //商品分类数据
      cateList: [],
      //级联选择框的配置属性
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //级联选择框选择的数据
      cateSelectKeys: [],
      //被激活的页签的名字
      activeName: 'many',
      //表格名字
      AttrName: ['参数', '属性'],
      //动态数据
      manyTabData: [],
      //静态数据
      onlyTabData: [],
      //添加参数对话框的打开隐藏
      addParamsDialogVisible: false,
      //添加参数表单对象
      addForm: {
        attr_name: ''
      },
      //添加参数表单验证对象
      addRules: {
        attr_name: [
          { required: true, message: `请输入名称`, trigger: 'blur' },
          {
            require: true,
            min: 2,
            max: 6,
            message: '长度在 2 到 6 个字符',
            trigger: 'blur'
          }
        ]
      },
      //修改参数对话框的显示隐藏
      editParamsDialogVisible: false,
      //修改参数对话框表单
      editForm: {
        attr_name: '',
        attr_id: null
      }
    }
  },
  created() {
    //获取选择商品分类级联选择器分类数据
    this.getCateList()
  },
  methods: {
    //获取分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
    },
    //监听级联选择框发生改变
    cateHandleChange() {
      //设置只能选择三级分类
      if (this.cateSelectKeys.length !== 3) {
        this.cateSelectKeys = []
        this.manyTabData = []
        this.onlyTabData = []
        return
      }
      //选择过后获取数据
      this.getParamsData()
    },
    //tab 页签点击事件的处理函数
    handleTabClick() {
      //切换标签也获取数据
      this.getParamsData()
    },
    //获取参数数据
    async getParamsData() {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      //参数展开行数据
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        //控制文本框的显示和隐藏
        item.inputVisible = false
        //文本框输入的值
        item.inputValue = ''
      })
      //判断数据存放
      if (this.activeName === 'many') {
        this.manyTabData = res.data
      } else {
        this.onlyTabData = res.data
      }
    },
    //监听添加按钮的点击
    showAddParmas() {
      this.addParamsDialogVisible = true
    },
    //关闭添加对话框后重置表单
    addDialogClosed() {
      this.$refs.addRef.resetFields()
    },
    //点击按钮添加参数
    addParams() {
      this.$refs.addRef.validate(valid => {
        if (!valid) return

        this.$http
          .post(`categories/${this.cateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          })
          .then(res => {
            if (res.data.meta.status !== 201) {
              return this.$message.error(`添加${this.addParamsTitle}失败`)
            }
            //提示用户
            this.$message.success('添加成功')
            //重新渲染表格
            this.getParamsData()
            //关闭对话框
            this.addParamsDialogVisible = false
          })
      })
    },
    //关闭编辑对话框重置表单
    editDialogClosed() {
      this.$refs.editRef.resetFields()
    },
    //监听点击编辑按钮
    showEditDialog(id, attrId) {
      //获取数据
      this.$http
        .get(`categories/${id}/attributes/${attrId}`, {
          params: {
            attr_sel: this.activeName
          }
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('获取参数失败！')
          }
          this.editForm.attr_name = res.data.data.attr_name
          this.editForm.attr_id = res.data.data.attr_id
        })
      this.editParamsDialogVisible = true
    },
    //点击确认修改参数
    editParams() {
      this.$refs.editRef.validate(valid => {
        if (!valid) return

        //提交数据
        this.$http
          .put(
            `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {
              attr_name: this.editForm.attr_name,
              attr_sel: this.activeName
            }
          )
          .then(res => {
            if (res.data.meta.status !== 200) {
              return this.$message.error('修改数据失败！')
            }
            //提示用户
            this.$message.success('修改参数成功')
            //重新渲染界面
            this.getParamsData()
            //关闭对话框
            this.editParamsDialogVisible = false
          })
      })
    },
    //删除参数
    deleteParams(id, attrId) {
      this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(res => {
          this.$http
            .delete(`categories/${id}/attributes/${attrId}`)
            .then(res => {
              //提示用户
              this.$message.success('删除成功')
              //重绘
              this.getParamsData()
            })
        })
        .catch(err => {
          this.$message.error('您取消了删除')
        })
    },
    //文本框失去焦点，或摁下Enter键触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 没有return说明用户输入了内容
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false

      //发起网络请求保存数据
      this.saveAttrVals(row)
    },
    //点击按钮展示文本框
    showInput(row) {
      row.inputVisible = true
      //点击按钮过后自动获取焦点
      //this.$nextTick 方法作用，就是当页面上的元素被重新渲染之后、
      // 才会指定回调函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    //将对attr_vals 的操作 保存到数据库
    saveAttrVals(row) {
      this.$http
        .put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('添加参数失败')
          }
        })
    },
    //删除对应的参数可选项
    handleClose(index, row) {
      row.attr_vals.splice(index, 1)
      //保存到数据库
      this.saveAttrVals(row)
    }
  },
  computed: {
    //只有选择了分类才能使用按钮
    isBtnDisabled() {
      return this.cateSelectKeys.length !== 3
    },
    //获取当前选择的三级分类的id
    cateId() {
      return this.cateSelectKeys[2] || null
    },
    //添加参数的标题
    addParamsTitle() {
      return this.activeName === 'many' ? '动态参数' : '静态属性'
    }
  }
}
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}
.cat_opt span {
  margin-right: 15px;
}
.input-new-tag {
  width: 100px;
}
.el-tag {
  margin: 5px 10px;
}
.button-new-tag,
.input-new-tag {
  margin-left: 10px;
}
</style>