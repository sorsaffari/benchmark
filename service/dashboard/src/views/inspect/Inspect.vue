<template>
  <el-container>
    <el-main>
      <el-card
        :body-style="{ padding: '15px', border: '1px solid #e2e2e2' }"
        shadow="never"
      >
        <el-row style="margin-bottom: 5px; font-weight: bold; text-align:center;">
          <el-col :span="3">
            STATUS
          </el-col>
          <el-col :span="4">
            REPOSITORY
          </el-col>
          <el-col :span="7">
            COMMIT
          </el-col>
          <el-col :span="2">
            PR
          </el-col>
          <el-col :span="4">
            STARTED AT
          </el-col>
          <el-col :span="4">
            COMPLETED AT
          </el-col>
        </el-row>
        <el-row
          type="flex"
          align="middle"
          style="text-align:center;"
        >
          <el-col :span="3">
            <el-tag
              size="mini"
              :type="execution.status == 'COMPLETED' ? 'success' : 'danger'"
            >
              {{ execution.status }}
            </el-tag>
          </el-col>
          <el-col :span="4">
            <a :href="execution.repoUrl">{{ execution.repoUrl | substringRepo }}</a>
          </el-col>
          <el-col :span="7">
            <a :href="execution.repoUrl + '/commit/' + execution.commit">{{ execution.commit }}</a>
          </el-col>
          <el-col :span="2">
            <a :href="execution.prUrl">#{{ execution.prNumber }}</a>
          </el-col>
          <el-col :span="4">
            {{ execution.executionStartedAt }}
          </el-col>
          <el-col :span="4">
            {{ execution.executionCompletedAt }}
          </el-col>
        </el-row>
      </el-card>
      <tabular-view
        :graphs="graphs"
        :execution-spans="executionSpans"
        :current-graph="currentGraph"
        :current-scale="currentScale"
        :current-query="currentQuery"
      />
    </el-main>
  </el-container>
</template>

<script>
import BenchmarkClient from '@/util/BenchmarkClient';
import TabularView from './TabularView/TabularView.vue';

export default {
  components: { TabularView },

  filters: {
    substringRepo(repoUrl) {
      if (!repoUrl) return '';
      return repoUrl.substring(19);
    },
  },

  data() {
    return {
      executionId: this.$route.params.executionId,
      currentGraph: this.$route.query.graph,
      currentScale: parseInt(this.$route.query.scale),
      currentQuery: this.$route.query.query,
      execution: {},
      executionSpans: [],
      graphs: [],
    };
  },

  created() {
    this.fetchExecutionDetails();
    this.fetchExecutionSpans();
  },

  methods: {
    fetchExecutionDetails() {
      BenchmarkClient.getExecutions(
        `{ executionById(id: "${
          this.executionId
        }"){ prMergedAt prNumber prUrl commit status executionStartedAt executionCompletedAt repoUrl} }`,
      ).then((resp) => {
        this.execution = resp.data.executionById;
      });
    },
    fetchExecutionSpans() {
      BenchmarkClient.getSpans(
        `{ executionSpans( executionName: "${
          this.executionId
        }"){ id name duration tags { graphType executionName graphScale }} }`,
      ).then((resp) => {
        this.executionSpans = resp.data.executionSpans;
        // Extract Graph types from execution spans
        this.graphs = Array.from(
          new Set(this.executionSpans.map(span => span.tags.graphType)),
        );
      });
    },
  },
};
</script>
<style scoped>
.el-container {
  background-color: #f4f3ef;
}
h2 {
  margin-bottom: 10px;
}
.query-select {
  min-width: 400px;
}
.scale-select {
  max-width: 100px;
}
</style>
