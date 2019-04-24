<template>
  <section v-loading="loading" class="el-container is-vertical page-container">
      <!-- <el-row>
        <el-popover
          v-model="popoverVisible"
          placement="right-start"
          title="Create Execution"
          width="200"
          trigger="manual"
        >
          <el-row>
            Repo URL: <el-input v-model="newExecution.repoUrl" />
          </el-row>
          <el-row>
            Commit: <el-input v-model="newExecution.commit" />
          </el-row>
          <div style="text-align: right; margin: 0">
            <el-button
              size="mini"
              type="text"
              @click="popoverVisible = false"
            >
              cancel
            </el-button>
            <el-button
              type="primary"
              size="mini"
              @click="triggerExecution"
            >
              send
            </el-button>
          </div>
          <el-button
            slot="reference"
            type="success"
            circle
            icon="el-icon-plus"
            @click="popoverVisible = !popoverVisible"
          />
        </el-popover>
        <el-button type="success" circle icon="el-icon-plus"></el-button>
      </el-row>-->
      <execution-card v-for="exec in executions" :key="exec.id" :execution="exec"/>
  </section>
</template>

<script>
import ExecutionCard from "./ExecutionCard.vue";
import BenchmarkClient from "@/util/BenchmarkClient";
import { Loading } from 'element-ui';

export default {
  name: "ExecutionsPage",
  components: { ExecutionCard },
  data() {
    return {
      pageTitle: 'Benchmark Executions',
      loading: true,
      popoverVisible: false,
      executions: [],
      newExecution: {
        commit: undefined,
        repoUrl: undefined
      }
    };
  },
  created() {
    this.$store.commit('setPageTitle', this.pageTitle);
    BenchmarkClient.getExecutions(
	  `{ executions
	  		{
          		id
          		prMergedAt
          		prNumber
          		prUrl
          		commit
          		status
          		executionInitialisedAt
          		executionStartedAt
          		executionCompletedAt
			  	vmName
			  }
		  }`
    ).then(execs => {
      this.executions = execs.data.executions;
      this.loading = false;
    });
  },
  methods: {
    // triggerExecution() {
    //   BenchmarkClient.triggerExecution(this.newExecution)
    //     .then(() => {
    //       this.$notify({
    //         title: "Success",
    //         message: "New Execution triggered successfully!",
    //         type: "success"
    //       });
    //     })
    //     .catch(() => {
    //       this.$notify.error({
    //         title: "Error",
    //         message: "It was not possible to trigger new Execution."
    //       });
    //     });
    //   this.newExecution.commit = undefined;
    // }
  }
};
</script>

<style scoped>

section {
  min-height: 100%;
}

.cards-row {
  margin-bottom: 20px;
}
</style>