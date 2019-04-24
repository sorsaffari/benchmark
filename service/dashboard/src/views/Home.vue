<template>
  <el-container style="height: 100%;">
    <side-nav/>

    <el-container class="is-vertical">
      <top-bar/>

      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// @ is an alias to /src
import SideNav from "@/components/SideNav.vue";
import TopBar from "@/components/TopBar.vue";

export default {
  name: "Home",
  components: { SideNav, TopBar }
};
</script>

<style>
.main-super {
  height: 100%;
}
</style>
