<template>
  <el-card class="box-card" v-loading="loading">
    <div slot="header" class="clearfix">
      <span>{{ graphName | formatTitle }}</span>
      <div class="actions">
        <selector-scale :scales="scales" :graphName="graphName"/>
      </div>
    </div>
    <e-chart :autoresize="true" :options="chartOoptions" @click="redirectToInspect"/>
  </el-card>
</template>

<script>
import BenchmarkClient from '@/util/BenchmarkClient'
import QueriesUtil from './QueriesUtil'
import EChart from 'vue-echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/legendScroll'
import SelectorScale from '@/components/SelectorScale.vue'

export default {
  components: { EChart, SelectorScale },

  props: {
    graphName: {
      type: String,
      required: true
    },

    executions: {
      type: Array,
      required: true
    },

    executionSpans: {
      type: Array,
      required: true
    }
  },

  filters: {
    formatTitle (graphName) {
      const presentableName = graphName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      return presentableName.join(' ')
    }
  },

  data () {
    return {
      scales: [],
      legendsMap: [],
      chartOoptions: {}
    }
  },

  watch: {
    selectedScale (val, previous) {
      if (val === previous) return
      this.drawChart()
    }
  },

  computed: {
    selectedScale () {
      return this.$store.getters.selectedScale(this.graphName)
    },
    loading () {
      return this.$store.getters.loading(`graphs.${this.graphName}.chart`)
    }
  },

  methods: {
    redirectToInspect (args) {
      const currentQuery = Object.keys(this.legendsMap).filter(
        x => this.legendsMap[x] === args.seriesName
      )[0]

      this.$store.commit('setInspectedGraph', {
        inspectedGraph: this.graphName
      })
      this.$store.commit('setSelectedScale', {
        graphName: this.graphName,
        selectedScale: this.selectedScale
      })
      this.$store.commit('setSelectedQuery', {
        graphName: this.graphName,
        selectedQuery: currentQuery
      })

      this.$router.push({
        path: `inspect/${args.data.executionId}`
      })
    },

    async drawChart () {
      // Compute array of unique queries that have been executed on this graph
      const querySpans = await fetchQuerySpans(this.executionSpans)
      const queries = uniqueQueriesSortedArray(querySpans)

      const dataAndSeries = QueriesUtil.buildQueriesTimes(
        queries,
        querySpans,
        this.executions,
        this.selectedScale
      )

      this.legendsMap = QueriesUtil.buildQueriesMap(queries)

      const series = dataAndSeries.map(data => ({
        name: this.legendsMap[data.query],
        type: 'line',
        data: data.times.map(x => ({
          value: Number(x.avgTime).toFixed(3),
          symbolSize: Math.min(x.stdDeviation / 10, 45) + 5,
          symbol: 'circle',
          stdDeviation: x.stdDeviation,
          repetitions: x.repetitions,
          executionId: x.executionId
        })),
        smooth: true,
        emphasis: { label: { show: false }, itemStyle: { color: 'yellow' } },
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
      }))

      const xData = dataAndSeries[0].times.map(x => ({
        value: x.commit.substring(0, 15),
        commit: x.commit
      }))

      this.chartOoptions = {
        tooltip: {
          show: true,
          trigger: 'item'
        },
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          left: 10,
          bottom: 0,
          data: Object.values(this.legendsMap).sort(),
          tooltip: {
            show: true,
            showDelay: 500,
            triggerOn: 'mousemove',
            formatter: args => Object.keys(this.legendsMap).filter(
              x => this.legendsMap[x] === args.name
            )
          }
        },
        calculable: true,
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: xData,
            triggerEvent: true
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} ms'
            }
          }
        ],
        series,
        dataZoom: [
          {
            type: 'inside',
            zoomOnMouseWheel: 'ctrl',
            filterMode: 'none',
            orient: 'vertical'
          }
        ],
        grid: {
          left: 70,
          top: 20,
          right: 70,
          bottom: 70
        }
      }

      this.$store.commit('setLoading', {
        stringPath: `graphs.${this.graphName}.chart`,
        isLoading: false
      })
    }
  },

  async created () {
    this.scales = [
      ...new Set(this.executionSpans.map(span => span.tags.graphScale))
    ].sort((a, b) => a - b)

    this.$store.commit('setSelectedScale', {
      graphName: this.graphName,
      selectedScale: this.scales[0]
    })

    this.$store.commit('setLoading', {
      stringPath: `graphs.${this.graphName}.chart`,
      isLoading: true
    })
  },

  mounted () {
    this.drawChart()
  }
}

/**
 * Helper functions
 */
function getQuerySpansRequest (id) {
  return BenchmarkClient.getSpans(
    `{ querySpans( parentId: "${id}" limit: 500){ id name duration tags { query type repetition repetitions }} }`
  )
}

function uniqueQueriesSortedArray (querySpans) {
  return [...new Set(querySpans.map(span => span.tags.query))].sort()
}

async function fetchQuerySpans (executionSpans) {
  // eslint-disable-next-line
  const querySpanPromises = executionSpans.map(executionSpan => getQuerySpansRequest(executionSpan.id).then(resp => resp.data.querySpans.map(qs => Object.assign(
    {
      executionName: executionSpan.tags.executionName,
      scale: executionSpan.tags.graphScale
    },
    qs
  ))))
  const responses = await Promise.all(querySpanPromises)
  return responses.reduce((acc, resp) => acc.concat(resp), [])
}
</script>

<style lang="scss" scoped>
.actions {
  float: right;
}

.echarts {
  width: 100%;
  height: 500px;
}
</style>
