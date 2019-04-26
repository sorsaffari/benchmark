<template>
  <el-dropdown>
    <span class="el-dropdown-link">
      Scale
      <span>: {{currentScale}}</span>
      <i class="el-icon-arrow-down el-icon--right"></i>
    </span>
    <el-dropdown-menu slot="dropdown" trigger="hover">
      <el-dropdown-item
        v-for="scale in scales"
        :key="scale"
        @click.native="updateScale(graphName, scale)"
      >{{ scale }}</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  props: {
    graphName: {
      type: String,
      required: true
    },

    scales: {
      type: Array,
      required: true
    }
  },

  computed: {
    currentScale () {
      return this.$store.getters.selectedScale(this.graphName)
    }
  },

  methods: {
    updateScale (graphName, selectedScale) {
      this.$store.commit('setSelectedScale', {
        graphName,
        selectedScale
      })

      this.$store.commit('setLoading', {
        stringPath: `graphs.${this.graphName}.chart`,
        isLoading: true
      })
    }
  }
}
</script>
