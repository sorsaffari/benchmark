<template>
  <!--<e-chart :options="options"/>-->
  <div>
    {{xData}}
    <br/>
    {{series}}
    <br/>
    {{legends}}
  </div>
</template>

<style>
/**
 * The default size is 600px×400px, for responsive charts
 * you may need to set percentage values as follows (also
 * don't forget to provide a size for the container).
 */
.echarts {
  width: 100%;
  height: 400px;
}
</style>

<script>
import EChart from "vue-echarts";
import "echarts/lib/chart/line";
import "echarts/lib/component/tooltip";

export default {
  props: ["dataAndSeries", "legends"],
  components: { EChart },
  data() {
    return {
      options: {
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
              Object.keys(legends).filter(x => legends[x] === args.name)
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
    };
  },
  created() {
    console.log("dataAndSeries", this.dataAndSeries);
  },
  computed: {
    series() {
      // console.log(this.dataAndSeries.map(data => data.times));

      return this.dataAndSeries.map(data => ({
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
    },
    xData() {
      // console.log(this.dataAndSeries, "");
      return this.dataAndSeries[0].times.map(x => ({
        value: x.commit.substring(0, 15),
        commit: x.commit
      }));
    }
  }
};
</script>