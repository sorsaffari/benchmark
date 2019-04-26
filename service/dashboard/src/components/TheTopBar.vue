<template>
  <el-header>
    <h2>{{ $store.getters.pageTitle }}</h2>
  </el-header>
</template>

<script>
export default {
  data () {
    return {}
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
@import "./src/assets/css/variables";

.el-header {
  background-color: $color-default-bg;
  border-bottom: 1px solid $color-light-border;
  line-height: $height-topBar;
}
</style>
