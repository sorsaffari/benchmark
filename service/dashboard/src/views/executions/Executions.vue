<template>
  <el-table
    v-loading="loading"
    :data="executions"
    stripe
    height="100%;"
    style="width: 100%">
    <el-table-column
      prop="status"
      label="Status"
      width="120">
      <template slot-scope="scope">
        <div v-html="labeliseStatus(scope.row.status)"></div>
      </template>
    </el-table-column>
    <el-table-column
      prop="id"
      label="Execution"
      width="450">
      <template scope="scope">
        <router-link :to="'inspect/'+scope.row.id">
          <a>{{scope.row.id}}</a>
        </router-link>
      </template>
    </el-table-column>
    <el-table-column
      prop="executionStartedAt"
      label="Started">
      <template slot-scope="scope">
        {{ scope.row.executionStartedAt | parseDate }}
      </template>
    </el-table-column>
    <el-table-column
      prop="executionCompletedAt"
      label="Completed">
      <template slot-scope="scope">
        {{ scope.row.executionCompletedAt | parseDate }}
      </template>
    </el-table-column>
    <el-table-column
      prop="actions"
      label="Actions"
      width="100">
      <template slot-scope="scope">
        <el-button
          v-if="isInProgress(scope.row.status)"
          @click.native="copyToClipboard(`gcloud compute ssh ubuntu@${execution.vmName} --zone=us-east1-b`)"
          type="text">
          <el-tooltip class="item" effect="dark" content="Copy GCloud Command" placement="top">
            <font-awesome-icon icon="copy" />
          </el-tooltip>
        </el-button>
        <el-button
          v-if="isInProgress(scope.row.status)"
          @click.native.prevent="stopExecution({id: scope.row.id})"
          type="text">
          <el-tooltip class="item" effect="dark" content="Stop" placement="top">
            <font-awesome-icon icon="stop-circle" />
          </el-tooltip>
        </el-button>
        <el-button
          @click.native="deleteExecution({id: scope.row.id})"
          type="text">
          <el-tooltip class="item" effect="dark" content="Delete" placement="top">
            <font-awesome-icon icon="trash-alt" />
          </el-tooltip>
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import BenchmarkClient from '@/util/BenchmarkClient';
import { Loading } from 'element-ui';
import { copyToClipboard } from '@/util/mixins';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faTrashAlt, faStopCircle, faCopy } from '@fortawesome/free-solid-svg-icons';
library.add(faTrashAlt, faStopCircle, faCopy);

export default {
  mixins: [copyToClipboard],
  data() {
    return {
      executions: this.executions,
      loading: false
    };
  },
  created() {
    this.loading = true;
    BenchmarkClient.getExecutions(
      `{
          executions {
            id
            status
            executionStartedAt
            executionCompletedAt
          }
        }`,
    ).then((execs) => {
      this.executions = execs.data.executions;
      this.loading = false;
    });
  },
  methods: {
    labeliseStatus(status) {
      return `<div class=status-${status.toLowerCase()}>${status}</div>`
    },
    isInProgress(status) { return (status === 'INITIALISING' || status === 'RUNNING') },
    deleteExecution(execution) {
      this.$confirm("Are you sure you want to delete this execution?")
        .then(_ => {
          BenchmarkClient.deleteExecution(execution)
            .then(() => {
              console.log('execution deleted.');
              this.$message({ showClose: true, message: 'The execution was deleted successfully.', type: 'success' });
            })
            .catch((e) => {
              console.log(e);
              this.$message({ showClose: true, message: 'Deleting the execution failed. Check the console logs to find out why.', type: 'error' });
            } );
        })
        .catch(_ => {});
    },
    stopExecution(execution) {
      this.$confirm("Are you sure you want to stop this execution?")
        .then(_ => {
          BenchmarkClient.stopExecution(execution)
            .then(() => {
              console.log('execution stopped.');
              this.$message({ showClose: true, message: 'The execution was stopped successfully.', type: 'success' });
            })
            .catch((e) => {
              console.log(e);
              this.$message({ showClose: true, message: 'Stoping the execution failed. Check the console logs to find out why.', type: 'error' });
            })
        })
        .catch(_ => {});
    },
  },
};
</script>

<style lang="scss" scroped>
  td:last-child, th:last-child { text-align: right; }
  .el-table__body-wrapper::-webkit-scrollbar { display: none; }
  [class^="status-"] {
    height: 20px;
    width: fit-content;
    border-radius: 10px;
    font-size: 12px;
    padding: 3px 8px;
    line-height: 14px;
    color: #fff;
  }

  .status-initialising { background-color: #f39c12; }
  .status-running { background-color: #2980b9; }
  .status-completed { background-color: #27ae60; }
  .status-stopped { background-color: #2c3e50; }
  .status-failed { background-color: #c0392b; }
</style>