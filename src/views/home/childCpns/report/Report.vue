<template>
  <div>
    <!-- 面包屑导航 -->
    <crumbs-nav>
      <template v-slot:no1>数据统计</template>
      <template v-slot:no2>数据报表</template>
    </crumbs-nav>

    <!-- 卡片区域 -->
    <card>
      <!-- 2.为ECharts准备一个具备大小（宽高）的Dom -->
      <div id="main" style="width: 700px;height:400px;"></div>
    </card>
  </div>
</template>

<script>
import CrumbsNav from '@/components/CrumbsNav'
import Card from '@/components/Card'

// 1.导入Echarts
import Echarts from 'echarts'
import _ from 'lodash'

export default {
  name: 'Report',
  components: {
    CrumbsNav,
    Card
  },
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  async mounted() {
    // 3.基于准备好的dom，初始化echarts实例
    var myChart = Echarts.init(document.getElementById('main'))

    const { data: res } = await this.$http.get(`reports/type/1`)

    if (res.meta.status !== 200) {
      return this.$message.error('获取折线图数据失败！')
    }
    // 4.准备数据和配置项
    const result = _.merge(res.data, this.options)

    //5.展示数据
    myChart.setOption(result)
  }
}
</script>

<style scoped></style>
