<template>
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item><slot name="no1"></slot></el-breadcrumb-item>
    <el-breadcrumb-item><slot name="no2"></slot></el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'CrumbsNav'
}
</script>

<style scoped>
  
</style>