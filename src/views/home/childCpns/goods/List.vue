<template>
  <div>
    <!-- 面包屑导航 -->
    <crumbs-nav>
      <template v-slot:no1>商品管理</template>
      <template v-slot:no2>参数列表</template>
    </crumbs-nav>

    <!-- 卡片内容 -->
    <card>
      <!-- 搜索和添加商品 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            @input="getGoosList"
            clearable
            @clear="getGoosList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getGoosList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表 -->
      <el-table :data="goodsList" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="95px"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="70px"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template v-slot="scope">{{scope.row.add_time | formatDate}}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template v-slot="scoped">
            <el-button type="primary" size="mini">编辑</el-button>
            <el-button type="warning" size="mini" @click="deleteGoods(scoped.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 页码 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </card>
  </div>
</template>

<script>
import CrumbsNav from '@/components/CrumbsNav'
import Card from '@/components/Card'

export default {
  name: 'List',
  components: {
    CrumbsNav,
    Card
  },
  data() {
    return {
      //查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      //商品列表
      goodsList: [],
      //总数居条数
      total: 0
    }
  },
  created() {
    //得到商品数据
    this.getGoosList()
  },
  methods: {
    //根据分页获取商品列表
    async getGoosList() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品失败')
      }
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    //分页发生变化重新渲染
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoosList()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoosList()
    },
    //删除商品
    deleteGoods(row) {
      this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(_ => {
        this.$http.delete(`goods/${row.goods_id}`).then(res => {
          if (res.data.meta.status !== 200) {
            return this.$message.error('删除商品失败！')
          }
          //提示用户
          this.$message.success('删除商品成功')
          //重新渲染
          this.getGoosList()
        })
      }).catch(o=>{
        this.$message.info('用户取消了删除')
      })
    },
    //添加商品
    addGoods(){
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scoped>
</style>