<template>
  <div>
    <!-- 面包屑导航 -->
    <crumbs-nav>
      <template v-slot:no1>商品管理</template>
      <template v-slot:no2>商品分类</template>
    </crumbs-nav>

    <!-- 卡片区域 -->
    <card>
      <!-- 添加分类 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="cateList" border row-key="cat_id" lazy :tree-props="{children: 'children'}">
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="cat_name" label="分类名称"></el-table-column>
        <el-table-column label="是否有效" v-slot="scoped">
          <i class="el-icon-success" v-if="!scoped.row.cat_deteled" style="color:lightgreen;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </el-table-column>
        <el-table-column label="排序" v-slot="scoped">
          <el-tag size="mini" v-if="scoped.row.cat_level===0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scoped.row.cat_level===1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="scoped">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scoped.row.cat_id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scoped.row.cat_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 7, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed">
      <el-form :model="addCateForm" :rules="addCateRules" ref="addCateRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 
            options: 数据源
          -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible"
     width="50%" @close="editCateDialogClosed">
      <el-form :model="editCateForm" :rules="addCateRules" ref="editCateRef" label-width="100px">
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate()">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
import CrumbsNav from '../../../../components/CrumbsNav'
import Card from '../../../../components/Card'

export default {
  name: 'Cate',
  components: {
    CrumbsNav,
    Card
  },
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //商品分类的数据列表，默认为空
      cateList: [],
      //总数据条数
      total: 0,
      //添加分类对话框的显示隐藏
      addCateDialogVisible: false,
      //添加分类表单对象
      addCateForm: {
        //将要添加的分类名称
        cat_name: '',
        //父级分类的id
        cat_pid: 0,
        //父类的等级，默认为1级分类
        cat_level: 0
      },
      //添加分类验证对象
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
          {
            require: true,
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur'
          }
        ]
      },
      //父级分类数据
      parentCateList: [],
      //指定级联选择器的配置对象
      cascaderProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        checkStrictly: true
      },
      //选中的父级分类的Id数组
      selectedKeys: [],
      //分类编辑对话框的显示和隐藏
      editCateDialogVisible: false,
      //编辑分类的表单数据
      editCateForm: {
        cat_name: '',
        cat_id:''
      }
    }
  },
  created() {
    //获取分类数据
    this.getCateList()
  },
  methods: {
    //获取分类数据
    getCateList() {
      this.$http
        .get('categories', {
          params: this.queryInfo
        })
        .then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('获取商品分类失败！')
          }
          //把数据列表赋值给cateList
          this.cateList = res.data.data.result
          //为总数据条数赋值
          this.total = res.data.data.total
        })
    },
    //监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    //监听pagenum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    //点击添加分类显示对话框
    showAddCateDialog() {
      //获取父级分类数据
      this.getParentCateList()
      //展示出对话框
      this.addCateDialogVisible = true
    },
    //获取父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    //监听父级分类数据发生改变
    handleChange() {
      //如果选择了父级分类
      if (this.selectedKeys.length > 0) {
        //父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        //当前分类的等级
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    //点击按钮添加新的分类
    addCate() {
      //先进行预校验
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        //通过发送请求
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        //重新获取分类数据
        this.getCateList()
        //提示用户
        this.$message.success('添加分类成功')
        //关闭对话框
        this.addCateDialogVisible = false
      })
    },
    //监听添加分类对话框的关闭，重置表单
    addCateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      //清空级联选择器的数据
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    //监听编辑对话框的关闭，重置表单
    editCateDialogClosed(){
      this.$refs.editCateRef.resetFields()
      this.editCateForm.cat_name = ''
    },
    //分类编辑对话框
    async showEditCateDialog(id) {
      //先根据id获取分类数据
     const {data: res} = await this.$http.get(`categories/${id}`)
     if(res.meta.status !==200){
       return this.$message.error('获取分类数据失败！')
     }
     this.editCateForm.cat_name = res.data.cat_name
     this.editCateForm.cat_id = res.data.cat_id
     this.editCateDialogVisible = true
    },
    //监听分类编辑对话框确定按钮
    editCate(){
      //预校验
      this.$refs.editCateRef.validate(async valid =>{
        if(!valid) return
        //通过,再通过id发送网络请求进行修改
        const {data: res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`,{
          cat_name:this.editCateForm.cat_name
        })
        if(res.meta.status !==200){
          return this.$message.error('修改分类失败！')
        }
        //重新渲染页面
        this.getCateList();
        //提示用户
        this.$message.success('修改分类成功！')
        //关闭对话框
        this.editCateDialogVisible = false
        
      })
    },
    //删除分类
    deleteCate(id){
      //弹框提示用户
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //删除
        this.$http.delete(`categories/${id}`).then(res=>{
          if(res.data.meta.status !== 200){
            return this.$message.error('删除分类失败！')
          }
          //提示用户
          this.$message.success('删除分类成功')
          //重新渲染界面
          this.getCateList();
        })
      })
    }
  }
}
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>