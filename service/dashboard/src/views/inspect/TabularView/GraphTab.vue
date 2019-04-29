<template>
  <div>
    <el-row
      type="flex"
      justify="end"
    >
      <scale-selector
        :scales="scales"
        :current-scale="currentScale"
        @selected-scale="(scale)=>{currentScale=scale}"
      />
    </el-row>
    <queries-table
      v-for="scale in scales"
      v-show="scale==currentScale"
      :key="scale"
      :current-scale="scale"
      :execution-spans="executionSpans"
      :overview-query="overviewQuery"
    />
  </div>
</template>
<script>

import QueriesTable from './QueriesTable.vue';
import ScaleSelector from '@/components/ScaleSelector.vue';

export default {
  name: 'GraphTab',
  components: { ScaleSelector, QueriesTable },
  props: {
    graph: String,
    executionSpans: Array,
    overviewScale: Number,
    overviewQuery: String,
  },
  data() {
    return {
      scales: [],
      currentScale: null,
    };
  },
  created() {
    this.scales = [...new Set(this.executionSpans.map(span => span.tags.graphScale))];
    this.scales.sort((a, b) => a - b);
    this.currentScale = (this.overviewScale) ? this.overviewScale : this.scales[0];
  },
};

</script>
