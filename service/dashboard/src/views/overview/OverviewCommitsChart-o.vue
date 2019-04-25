<template>
  <el-card class="box-card">
    <div slot="header" class="clearfix">
      <span>{{name | formatTitle}}</span>
      <el-dropdown style="float: right">
        <span class="el-dropdown-link">
          Scale
          <span>: {{this.currentScale}}</span>
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown" trigger="hover">
          <el-dropdown-item
            v-for="scale in scales"
            :key="scale"
            @click.native="currentScale=scale"
          >{{ scale }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <!--<div ref="chart" class="chart-wrapper"/>-->
    <commit-chart />
    <v-chart :options="polar"/>
  </el-card>
</template>

<script>
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';

import BenchmarkClient from "@/util/BenchmarkClient";
import InspectStore from "@/util/InspectSharedStore";
import ChartFactory from "./ChartFactory";
import QueriesUtil from "./QueriesUtil";

export default {
  props: ["name", "executions", "executionSpans"],
  data() {
    return {
      scales: null,
      currentScale: null,
      queries: null,
      queriesLegend: null,
      chart: null,
    };
  },
  filters: {
    formatTitle(name) {
      const presentableName = name
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1));
      return presentableName.join(" ");
    }
  },
  watch: {
    currentScale(val, previous) {
      if (val === previous) return;
      this.drawChart();
    }
  },
  async created() {
    window.onresize = () => {
      this.chart.resize();
    };
    // Compute array of unique queries that have been executed on this graph
    this.querySpans = await fetchQuerySpans(this.executionSpans);
    this.queries = uniqueQueriesSortedArray(this.querySpans);

    // queriesLegend will map each full query to a legend identifier, e.g. { "match $x isa person; get;": "matchQuery1", ... }
    this.queriesLegend = QueriesUtil.buildQueriesMap(this.queries);

    this.scales = [
      ...new Set(this.executionSpans.map(span => span.tags.graphScale))
    ].sort((a, b) => a - b);
    this.currentScale = this.scales[0];

    this.$nextTick(() => {
      this.drawChart();
      this.chart.on("click", (args) => this.redirectToInspect(args));
    });
  },
  methods: {
    redirectToInspect(args) {
      const currentQuery = Object.keys(this.queriesLegend).filter(
        x => this.queriesLegend[x] === args.seriesName
      )[0];

      InspectStore.setGraph(this.name);
      InspectStore.setScale(this.currentScale);
      InspectStore.setQuery(currentQuery);
      this.$router.push({
        path: `inspect/${args.data.executionId}`
      });
    },
    drawChart() {
      const chartComponent = this.$refs.chart;
      // queriesTimes will map a query legend identifier to its avgTime per commit
      const queriesTimes = QueriesUtil.buildQueriesTimes(
        this.queries,
        this.querySpans,
        this.executions,
        this.currentScale
      );

      this.chart = ChartFactory.createChart(
        chartComponent,
        queriesTimes,
        this.queriesLegend
      );
    }
  }
};

/**
 * Helper functions
 */
function getQuerySpansRequest(id) {
  return BenchmarkClient.getSpans(
    `{ querySpans( parentId: "${id}" limit: 500){ id name duration tags { query type repetition repetitions }} }`
  );
}
function uniqueQueriesSortedArray(querySpans) {
  return [...new Set(querySpans.map(span => span.tags.query))].sort();
}
async function fetchQuerySpans(executionSpans) {
  const querySpanPromises = executionSpans.map(executionSpan =>
    getQuerySpansRequest(executionSpan.id).then(resp =>
      resp.data.querySpans.map(qs =>
        Object.assign(
          {
            executionName: executionSpan.tags.executionName,
            scale: executionSpan.tags.graphScale
          },
          qs
        )
      )
    )
  );
  const responses = await Promise.all(querySpanPromises);
  return responses.reduce((acc, resp) => acc.concat(resp), []);
}
</script>
<style scoped>
.chart-wrapper {
  height: 500px;
}
</style>
