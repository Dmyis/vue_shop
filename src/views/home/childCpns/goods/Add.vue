<template>
  <div>
    <!-- 面包屑导航 -->
    <crumbs-nav>
      <template v-slot:no1>商品管理</template>
      <template v-slot:no2>添加商品</template>
    </crumbs-nav>

    <!-- 卡片区域 -->
    <card>
      <!-- 警告 -->
      <el-alert title="添加商品信息" type="info" center show-icon></el-alert>
      <!-- 进度条 -->
      <el-steps :active="active - 0" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!--  整体大表单 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tab栏 -->
        <el-tabs
          :tab-position="'left'"
          v-model="active"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProps"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 设置动态参数 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- 
              action：表示图片要上传到 的后台api地址
            -->
            <el-upload
              :action="upLoadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="addGoods" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </card>

    <!-- 预览图片的对话框 -->
    <el-dialog title="图片预览" :visible.sync="PreviewDialogVisible" width="50%" >
      <img :src="previewPath" class="previewImage" />
    </el-dialog>
  </div>
</template>

<script>
import CrumbsNav from '@/components/CrumbsNav'
import Card from '@/components/Card'

import _ from 'lodash';

export default {
  name: 'Add',
  components: {
    CrumbsNav,
    Card
  },
  data() {
    return {
      //进度条的位置
      active: '0',
      //打表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_number: 0,
        goods_weight: 0,
        //商品所属的分类数组
        goods_cat: [],
        //存放图片路径的数组
        pics: [],
        //商品的详情介绍
        goods_introduce:'',
        attrs: []
      },
      //大表单验证对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入数量', trigger: 'blur' }
        ],
        goods_cat: [{ required: true, message: '请选择分类', trigger: 'blur' }]
      },
      //商品分类数据
      cateList: [],
      //级联选择器对象
      cateProps: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      //动态参数数据
      manyTableData: [],
      //静态属性数据
      onlyTabData: [],
      //上传图片的url地址
      upLoadURL: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      //图片上传组件的headers请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      //图片预览对话框显示隐藏
      PreviewDialogVisible: false,
      //预览图片的路径
      previewPath:''
    }
  },
  created() {
    //获取商品分类
    this.getCateList()
  },
  methods: {
    //获取商品分类
    getCateList() {
      this.$http.get('categories').then(res => {
        if (res.data.meta.status !== 200) {
          this.$message.error('获取分类失败！')
        }
        this.cateList = res.data.data
      })
    },
    //修改级联选择器的时候触发
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    //阻止切换tab标签
    beforeTabLeave(activeName, oldActiveName) {
      //如果没有选择分类就不允许切换tab
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请选择分类')
        return false
      }
    },
    //切换tab标签页触发
    async tabClicked() {
      //证明访问的是动态参数面板
      if (this.active === '1' || this.active === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: {
              sel: this.active === '1' ? 'many' : 'only'
            }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取参数失败！')
        }

        if (this.active === '1') {
          //把字符串转换为数组
          res.data.forEach(item => {
            item.attr_vals =
              item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
          })
          this.manyTableData = res.data
        } else {
          this.onlyTabData = res.data
        }
      }
    },
    //处理图片预览事件
    handlePreview(file) {
      this.previewPath = file.url
      this.PreviewDialogVisible = true
    },
    //处理移除图片的事件
    handleRemove(file) {
      //获取要删除的图片临时路径
      const filePath = file.response.data.tmp_path
      //从数组中找到对应的索引值
      const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      //调用数组的splice方法，吧图片信息移除
      this.addForm.pics.splice(i, 1)
    },
    //监听图片上传成功
    handleSuccess(response) {
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    add(){
      //校验表单
      this.$refs.addFormRef.validate(valid =>{
        if(!valid){
          return this.$message.error('请填写必要的表单项目')
        }
        //把分类转换为字符串
          //深拷贝对象
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTableData.forEach(item=>{
          const newInfo = {
            attr_id:item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        //处理静态属性
        this.onlyTabData.forEach(item=>{
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs;
        console.log(form);

        //发起请求添加商品
        //商品的名称，必须是一致的
        this.$http.post('goods',form).then(res=>{
          if(res.data.meta.status !== 201){
            return this.$message.error('添加商品失败！')
          }

          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        })
      })
    }
  },
  computed: {
    //获取分类id
    cateId() {
      if (this.addForm.goods_cat.length == 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style scoped>
.el-checkbox {
  margin: 0 7px 0 0 !important;
}
.previewImage{
  width: 100%;
}
.addGoods{
  margin-top: 20px;
}
</style>