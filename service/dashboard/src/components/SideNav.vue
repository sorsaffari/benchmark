<template>
  <el-aside>
    <el-menu default-active="overview" class="el-menu-vertical-demo" :router="true">
      <div class="logo">
        <img src="assets/grakn-logo.png">
      </div>
      <el-menu-item index="/overview">
        <i class="el-icon-menu"/>
        <span slot="title">
          <span>Overview</span>
        </span>
      </el-menu-item>
      <el-menu-item index="/executions">
        <i class="el-icon-document"/>
        <span slot="title">
          <span>Executions</span>
        </span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>

<style scoped lang="scss">
@import "./src/assets/css/variables";

.el-aside {
  background-color: $color-default-bg;
  width: $width-sideNav !important;
}

.logo {
  box-sizing: border-box;
  border-bottom: 1px solid $color-light-border;
  display: flex;
  align-items: center;

  height: $height-sideNav-logo;
  padding-left: $padding-default;

  img {
    width: 130px;
  }
}
.el-menu {
  height: 100vh;
}
.el-menu-item:focus {
  background-color: transparent;
}
</style>
