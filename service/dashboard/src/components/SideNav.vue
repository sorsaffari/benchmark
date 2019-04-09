<template>
  <aside class="el-aside">
    <el-menu
      default-active="overview"
      class="el-menu-vertical-demo"
      :router="true"
    >
      <div class="logo">
        <img src="assets/grakn-logo.png">
      </div>
      <el-menu-item index="/overview">
        <i class="el-icon-menu" /> <span slot="title">
          <span>Overview</span>
        </span>
      </el-menu-item>
      <el-menu-item index="/executions">
        <i class="el-icon-document" /> <span slot="title">
          <span>Executions</span>
        </span>
      </el-menu-item>
    </el-menu>
  </aside>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {},
};
</script>

<style scoped>
.el-aside { background-color: white; }
img { width: 130px; }
.logo {
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 47px;
  padding: 0 20px;
}
.el-menu { height: 100vh; }
.el-menu-item:focus { background-color: transparent; }
</style>
