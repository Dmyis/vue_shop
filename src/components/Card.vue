<template>
  <el-card class="box-card">
    <slot></slot>
  </el-card>
</template>

<script>
export default {
  name: 'Card'
}
</script>

<style>
  .el-card{
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.15) !important;
  }
</style>