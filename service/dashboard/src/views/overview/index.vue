<template>
  <el-container class="is-vertical overview-section">
    <el-row
      v-for="graphType in graphTypes"
      :key="graphType"
      class="panel"
    >
      <commits-chart
        :graph-name="graphType"
        :executions="completedExecutions"
        :execution-spans="filterSpans(graphType)"
      />
    </el-row>
  </el-container>
</template>

<script>
import BenchmarkClient from '@/util/BenchmarkClient';
import CommitsChart from './ChartCommits.vue';

export default {
  name: 'OverviewPage',
  components: { CommitsChart },
  data() {
    return {
      pageTitle: 'Benchmark Overview',
      numberOfCompletedExecutions: 8,
      completedExecutions: null,
      graphTypes: [],
      executionSpans: null,
    };
  },
  async created() {
    this.$store.commit('setPageTitle', { pageTitle: this.pageTitle });
    // Get the last N completed executions
    // Note: we need to reverse the array because in the chart we want to show the most recent execution not as first but as last (rightmost)
    this.completedExecutions = (await BenchmarkClient.getLatestCompletedExecutions(
      this.numberOfCompletedExecutions,
    )).reverse();
    // Get all the execution spans relative to those executions
    this.executionSpans = await BenchmarkClient.getExecutionsSpans(this.completedExecutions);
    // Compute graph names from spans, for each graph name we draw a chart
    this.graphTypes = [...new Set(this.executionSpans.map(span => span.tags.graphType))];
  },
  methods: {
    filterSpans(name) {
      return this.executionSpans.filter(span => span.tags.graphType === name);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./src/assets/css/variables.scss";
.panel {
  margin-bottom: $margin-default;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
