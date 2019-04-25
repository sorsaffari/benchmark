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
    <!--<commit-chart :dataAndSeries="dataAndSeries" :legends="legends"/>-->
    <e-chart :options="chartOoptions"/>
  </el-card>
</template>

<script>
import EChart from "vue-echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";
import "echarts/lib/component/legend";
import "echarts/lib/component/legendScroll";

import BenchmarkClient from "@/util/BenchmarkClient";
// import InspectStore from "@/util/InspectSharedStore";
// import ChartFactory from "./ChartFactory";
import QueriesUtil from "./QueriesUtil";
import CommitChart from "./CommitChart";

export default {
  props: ["name", "executions", "executionSpans"],
  components: { EChart },
  data() {
    return {
      // dataAndSeries: [],
      // legends: [],
      scales: null,
      currentScale: null,
      // queries: null,
      // queriesLegend: null,
      // chart: null,
      xData: [],
      series: [],
      legends: [],
      chartOoptions: {}
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
    // window.onresize = () => {
    //   this.chart.resize();
    // };

    this.scales = [
      ...new Set(this.executionSpans.map(span => span.tags.graphScale))
    ].sort((a, b) => a - b);
    this.currentScale = this.scales[0];

    this.$nextTick(() => {
      this.drawChart();
      // this.chart.on("click", args => this.redirectToInspect(args));
    });
  },
  methods: {
    // redirectToInspect(args) {
    //   const currentQuery = Object.keys(this.queriesLegend).filter(
    //     x => this.queriesLegend[x] === args.seriesName
    //   )[0];
    //   InspectStore.setGraph(this.name);
    //   InspectStore.setScale(this.currentScale);
    //   InspectStore.setQuery(currentQuery);
    //   this.$router.push({
    //     path: `inspect/${args.data.executionId}`
    //   });
    // },
    async drawChart() {
      // Compute array of unique queries that have been executed on this graph
      const querySpans = await fetchQuerySpans(this.executionSpans);
      const queries = uniqueQueriesSortedArray(querySpans);

      const dataAndSeries = QueriesUtil.buildQueriesTimes(
        queries,
        querySpans,
        this.executions,
        this.currentScale
      );

      this.series = dataAndSeries.map(data => ({
        name: this.legends[data.query],
        type: "line",
        data: data.times.map(x => ({
          value: Number(x.avgTime).toFixed(3),
          symbolSize: Math.min(x.stdDeviation / 10, 45) + 5,
          symbol: "circle",
          stdDeviation: x.stdDeviation,
          repetitions: x.repetitions,
          executionId: x.executionId
        })),
        smooth: true,
        emphasis: { label: { show: false }, itemStyle: { color: "yellow" } },
        showAllSymbol: true,
        tooltip: {
          formatter: args => `
                    query: ${args.seriesName}
                    <br> avgTime: ${Number(args.data.value).toFixed(3)} ms
                    <br> stdDeviation: ${Number(args.data.stdDeviation).toFixed(
                      3
                    )} ms
                    <br> repetitions: ${args.data.repetitions}`
        }
      }));

      this.xData = dataAndSeries[0].times.map(x => ({
        value: x.commit.substring(0, 15),
        commit: x.commit
      }));

      this.legends = Object.values(QueriesUtil.buildQueriesMap(queries)).sort();

      this.chartOoptions = {
        tooltip: {
          show: true,
          trigger: "item"
        },
        legend: {
          type: "scroll",
          orient: "horizontal",
          left: 10,
          // top: 20,
          bottom: 0,
          data: this.legends,
          tooltip: {
            show: true,
            showDelay: 500,
            triggerOn: "mousemove",
            formatter: args =>
              Object.keys(this.legends).filter(x => legends[x] === args.name)
          }
        },
        calculable: true,
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: this.xData,
            triggerEvent: true
          }
        ],
        yAxis: [
          {
            type: "value",
            axisLabel: {
              formatter: "{value} ms"
            }
          }
        ],
        series: this.series,
        dataZoom: [
          {
            type: "inside",
            zoomOnMouseWheel: "ctrl",
            filterMode: "none",
            orient: "vertical"
          }
        ],
        grid: {
          left: 70,
          top: 20,
          right: 70,
          bottom: 70
        }
      }
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
