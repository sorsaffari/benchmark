import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

// eslint-disable-next-line import/prefer-default-export
export const store = new Vuex.Store({
  state: {
    pageTitle: '',
    inspectCurrentGraph: '',
    inspectCurrentScale: 0,
    inspectCurrentQuery: '',
  },
  mutations: {
    setPageTitle(state, pageTitle) {
      state.pageTitle = pageTitle;
    },
    setInspectCurrentGraph(state, inspectCurrentGraph) {
      state.inspectCurrentGraph = inspectCurrentGraph;
    },
    setInspectCurrentScale(state, inspectCurrentScale) {
      state.inspectCurrentScale = inspectCurrentScale;
    },
    setInspectCurrentQuery(state, inspectCurrentQuery) {
      state.inspectCurrentQuery = inspectCurrentQuery;
    },
  },
  getters: {
    pageTitle: state => state.pageTitle,
    inspectCurrentGraph: state => state.inspectCurrentGraph,
    inspectCurrentScale: state => state.inspectCurrentScale,
    inspectCurrentQuery: state => state.inspectCurrentQuery,
  },
});
