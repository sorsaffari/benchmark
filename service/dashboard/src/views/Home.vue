<template>
  <el-container style="height: 100%;">
    <the-side-nav />

    <el-container class="is-vertical">
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
// @ is an alias to /src
import TheSideNav from '@/components/TheSideNav.vue';

export default {
  name: 'Home',
  components: { TheSideNav },
};
</script>

<style>
.main-super {
  height: 100%;
}
</style>
